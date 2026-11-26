/// <reference lib="webworker" />
/**
 * Runs Depth Anything V2 Small in the browser, off the main thread, on the CPU (WASM).
 *
 * The weights are 4-bit quantized (q4f16, 19 MB vs 99 MB for fp32, ~2% mean depth
 * error, which the parallax shader's blur and smoothing hide). The weights and the
 * ONNX Runtime binary are served from this site's own origin (prepared at build time
 * by scripts/fetch-model.ts), so nothing depends on huggingface.co or a CDN at runtime.
 * The browser caches them after the first download.
 */
import {
  env,
  pipeline,
  RawImage,
  type DepthEstimationPipeline,
  type ProgressInfo,
} from "@huggingface/transformers";

env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = "/models/";
if (env.backends.onnx.wasm) {
  env.backends.onnx.wasm.wasmPaths = {
    wasm: "/ort/ort-wasm-simd-threaded.wasm",
    mjs: "/ort/ort-wasm-simd-threaded.mjs",
  };
}

const MODEL_ID = "onnx-community/depth-anything-v2-small";
const DTYPE = "q4f16";

export type WorkerRequest = { id: number; image: Blob };

export type WorkerResponse =
  | { id: number; type: "progress"; loaded: number; total: number }
  | { id: number; type: "result"; depth: Blob; device: string }
  | { id: number; type: "error"; message: string };

let pipelinePromise: Promise<{ pipe: DepthEstimationPipeline; device: string }> | null = null;

async function createPipeline(onProgress: (info: ProgressInfo) => void) {
  const pipe = await pipeline("depth-estimation", MODEL_ID, {
    device: "wasm",
    dtype: DTYPE,
    progress_callback: onProgress,
  });
  return { pipe: pipe as DepthEstimationPipeline, device: "wasm" };
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
