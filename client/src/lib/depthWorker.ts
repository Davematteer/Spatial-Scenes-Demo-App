/// <reference lib="webworker" />
/**
 * Runs Depth Anything V2 Small in the browser, off the main thread.
 *
 * Quantized weights keep the one-time download small (the browser caches it):
 *   WebGPU + shader-f16  -> q4f16  (19 MB)
 *   WebGPU without f16   -> q4     (27 MB)
 *   WASM / CPU           -> uint8  (27 MB)
 * Against the 99 MB fp32 model these differ by roughly 1-2% mean absolute depth error,
 * which the parallax shader's blur and smoothing hide.
 */
import {
  pipeline,
  RawImage,
  type DepthEstimationPipeline,
  type ProgressInfo,
} from "@huggingface/transformers";

const MODEL_ID = "onnx-community/depth-anything-v2-small";

export type WorkerRequest = { id: number; image: Blob };

export type WorkerResponse =
  | { id: number; type: "progress"; loaded: number; total: number }
  | { id: number; type: "result"; depth: Blob; device: string }
  | { id: number; type: "error"; message: string };

type Device = "webgpu" | "wasm";
type DType = "q4f16" | "q4" | "uint8";

let pipelinePromise: Promise<{ pipe: DepthEstimationPipeline; device: Device }> | null = null;

async function pickBackend(): Promise<{ device: Device; dtype: DType }> {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<{ features: Set<string> } | null> } }).gpu;
  const adapter = await gpu?.requestAdapter().catch(() => null);
  if (!adapter) return { device: "wasm", dtype: "uint8" };
  return { device: "webgpu", dtype: adapter.features.has("shader-f16") ? "q4f16" : "q4" };
}

async function createPipeline(onProgress: (info: ProgressInfo) => void) {
  const { device, dtype } = await pickBackend();
  try {
    const pipe = await pipeline("depth-estimation", MODEL_ID, { device, dtype, progress_callback: onProgress });
    return { pipe: pipe as DepthEstimationPipeline, device };
  } catch (err) {
    if (device === "wasm") throw err;
    // WebGPU is present but unusable (driver bugs, blocklists); fall back to the CPU build.
    console.warn("WebGPU depth pipeline failed, falling back to WASM:", err);
    const pipe = await pipeline("depth-estimation", MODEL_ID, {
      device: "wasm",
      dtype: "uint8",
      progress_callback: onProgress,
    });
    return { pipe: pipe as DepthEstimationPipeline, device: "wasm" as const };
  }
}

const post = (msg: WorkerResponse) => self.postMessage(msg);

self.onmessage = async ({ data }: MessageEvent<WorkerRequest>) => {
  const { id, image } = data;
  try {
    pipelinePromise ??= createPipeline((info) => {
      if (info.status === "progress_total") {
        post({ id, type: "progress", loaded: info.loaded, total: info.total });
      }
    });
    const { pipe, device } = await pipelinePromise.catch((err) => {
      pipelinePromise = null; // allow a retry on the next request
      throw err;
    });

    const output = await pipe(await RawImage.fromBlob(image));
    const result = Array.isArray(output) ? output[0] : output;
    const depth = await (result.depth as RawImage).toBlob("image/png");
    post({ id, type: "result", depth, device });
  } catch (err) {
    post({ id, type: "error", message: err instanceof Error ? err.message : String(err) });
  }
};
