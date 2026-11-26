/**
 * Depth estimation with Depth Anything V2, tried in this order:
 *
 * 1. Hosted Gradio Spaces on Hugging Face (fast, GPU). Depth Anything V2 is not
 *    served by any Inference Provider, so we call public Spaces directly from the
 *    browser (they allow CORS). Each visitor uses their own anonymous ZeroGPU
 *    quota, which runs out after a handful of images per day.
 * 2. In-browser inference with a quantized ONNX model (see depthWorker.ts). No
 *    quota, but a one-time ~19-27 MB download and slower on weak devices.
 *
 * If every option fails, DepthUnavailableError is thrown.
 */

import type { WorkerRequest, WorkerResponse } from "./depthWorker";

interface DepthProvider {
  name: string;
  baseUrl: string;
  endpoint: string;
  /** Index of the grayscale depth map in the endpoint's output array. */
  depthOutputIndex: number;
}

const PROVIDERS: DepthProvider[] = [
  {
    name: "depth-anything/Depth-Anything-V2",
    baseUrl: "https://depth-anything-depth-anything-v2.hf.space",
    endpoint: "on_submit",
    depthOutputIndex: 1,
  },
  {
    name: "Upsampler/depth-anything-v2",
    baseUrl: "https://upsampler-depth-anything-v2.hf.space",
    endpoint: "on_submit",
    depthOutputIndex: 1,
  },
];

/** Per-provider budget, including queue time and a cold start. */
const PROVIDER_TIMEOUT_MS = 90_000;

/** Longest edge sent to the model. Larger images only slow the upload. */
const MAX_UPLOAD_EDGE = 2048;

/**
 * When every Space fails (usually an exhausted ZeroGPU quota, which is shared across
 * Spaces), skip straight to local inference for a while instead of waiting on them again.
 */
const SKIP_REMOTE_KEY = "depth:skip-remote-until";
const SKIP_REMOTE_MS = 60 * 60 * 1000;

export type DepthStatus =
  | { stage: "remote"; provider: string }
  | { stage: "local-download"; loaded: number; total: number }
  | { stage: "local-inference" };

export interface DepthResult {
  /** Object URL of the (possibly downscaled) image that was processed. */
  imageUrl: string;
  /** Object URL of the grayscale depth map (white = near). */
  depthUrl: string;
  provider: string;
}

export class DepthUnavailableError extends Error {
  constructor(public readonly causes: unknown[]) {
    super("All depth estimation providers failed");
    this.name = "DepthUnavailableError";
  }
}

interface GradioFileData {
  path: string;
  url?: string;
}

async function resizeIfNeeded(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, MAX_UPLOAD_EDGE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob ?? file), "image/jpeg", 0.92),
  );
}

async function expectOk(res: Response, step: string): Promise<Response> {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${step} failed with ${res.status}: ${body.slice(0, 200)}`);
  }
  return res;
}

/** Reads a Gradio SSE result stream and returns the payload of the final event. */
function parseGradioStream(text: string): unknown[] {
  let event = "";
  for (const line of text.split("\n")) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      const data = line.slice(5).trim();
      if (event === "complete") return JSON.parse(data);
      if (event === "error") throw new Error(`Space returned an error: ${data}`);
    }
  }
  throw new Error("Space closed the stream without a result");
}

async function runProvider(
  provider: DepthProvider,
  image: Blob,
  signal: AbortSignal,
): Promise<Blob> {
  const api = `${provider.baseUrl}/gradio_api`;

  const form = new FormData();
  form.append("files", image, "upload.jpg");
  const uploadRes = await expectOk(
    await fetch(`${api}/upload`, { method: "POST", body: form, signal }),
    "Upload",
  );
  const [uploadedPath] = (await uploadRes.json()) as string[];

  const callRes = await expectOk(
    await fetch(`${api}/call/${provider.endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [{ path: uploadedPath, meta: { _type: "gradio.FileData" } }],
      }),
      signal,
    }),
    "Queue",
  );
  const { event_id } = (await callRes.json()) as { event_id: string };

  const streamRes = await expectOk(
    await fetch(`${api}/call/${provider.endpoint}/${event_id}`, { signal }),
    "Result",
  );
  const output = parseGradioStream(await streamRes.text());

  const depthFile = output[provider.depthOutputIndex] as GradioFileData | undefined;
  if (!depthFile?.path) throw new Error("Space response did not include a depth map");

  const depthUrl = depthFile.url ?? `${api}/file=${depthFile.path}`;
  const depthRes = await expectOk(await fetch(depthUrl, { signal }), "Download");
  return depthRes.blob();
}

function shouldSkipRemote(): boolean {
  try {
    return Date.now() < Number(sessionStorage.getItem(SKIP_REMOTE_KEY) ?? 0);
  } catch {
    return false;
  }
}

function markRemoteUnavailable() {
  try {
    sessionStorage.setItem(SKIP_REMOTE_KEY, String(Date.now() + SKIP_REMOTE_MS));
  } catch {
    // Storage can be blocked; we'll just try the Spaces again next time.
  }
}

let worker: Worker | null = null;
let nextRequestId = 0;

function runLocal(image: Blob, onStatus: (status: DepthStatus) => void): Promise<{ depth: Blob; device: string }> {
  worker ??= new Worker(new URL("./depthWorker.ts", import.meta.url), { type: "module" });
  const activeWorker = worker;
  const id = nextRequestId++;

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      activeWorker.removeEventListener("message", onMessage);
      activeWorker.removeEventListener("error", onError);
    };
    const onMessage = ({ data }: MessageEvent<WorkerResponse>) => {
      if (data.id !== id) return;
      if (data.type === "progress") {
        onStatus(
          data.loaded < data.total
            ? { stage: "local-download", loaded: data.loaded, total: data.total }
            : { stage: "local-inference" },
        );
      } else {
        cleanup();
        if (data.type === "result") resolve({ depth: data.depth, device: data.device });
        else reject(new Error(data.message));
      }
    };
    const onError = (event: ErrorEvent) => {
      cleanup();
      worker = null; // a crashed worker can't be reused
      activeWorker.terminate();
      reject(new Error(event.message || "Depth worker crashed"));
    };

    activeWorker.addEventListener("message", onMessage);
    activeWorker.addEventListener("error", onError);
    onStatus({ stage: "local-inference" });
    activeWorker.postMessage({ id, image } satisfies WorkerRequest);
  });
}

export async function estimateDepth(
  file: File,
  onStatus: (status: DepthStatus) => void = () => {},
): Promise<DepthResult> {
  const image = await resizeIfNeeded(file);
  const causes: unknown[] = [];
  const done = (depth: Blob, provider: string): DepthResult => ({
    imageUrl: URL.createObjectURL(image),
    depthUrl: URL.createObjectURL(depth),
    provider,
  });

  if (!shouldSkipRemote()) {
    for (const provider of PROVIDERS) {
      onStatus({ stage: "remote", provider: provider.name });
      try {
        const depth = await runProvider(provider, image, AbortSignal.timeout(PROVIDER_TIMEOUT_MS));
        return done(depth, provider.name);
      } catch (err) {
        console.warn(`Depth provider ${provider.name} failed:`, err);
        causes.push(err);
      }
    }
    markRemoteUnavailable();
  }

  try {
    const { depth, device } = await runLocal(image, onStatus);
    return done(depth, `in-browser (${device})`);
  } catch (err) {
    console.warn("In-browser depth estimation failed:", err);
    causes.push(err);
  }

  throw new DepthUnavailableError(causes);
}
