/**
 * Prepares everything in-browser depth estimation needs, so the app serves it from
 * its own origin with no runtime requests to huggingface.co or a CDN (those can be
 * blocked by tracking protection or extensions, or rate limited):
 *
 * - public/models: Depth Anything V2 ONNX files, pinned to a commit. Only q4f16 is
 *   shipped: it is the best variant under Cloudflare's 25 MiB per-asset limit.
 * - public/ort: the ONNX Runtime CPU (WASM) build, copied from node_modules. The
 *   WebGPU-capable build is 25.6 MiB, just over the limit, so it isn't used.
 *
 * Files already present with the expected size are skipped. Runs before `dev` and `build`.
 */
import { copyFile, mkdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";

const publicDir = join(import.meta.dir, "..", "public");

const MODEL_ID = "onnx-community/depth-anything-v2-small";
const REVISION = "4472b7362082ad9968fee890ca0f1e5aca36b93d";
const FILES: Record<string, number> = {
  "config.json": 38,
  "preprocessor_config.json": 461,
  "onnx/model_q4f16.onnx": 19_126_267,
};

const outDir = join(publicDir, "models", MODEL_ID);

for (const [file, size] of Object.entries(FILES)) {
  const dest = join(outDir, file);
  const existing = await stat(dest).catch(() => null);
  if (existing?.size === size) continue;

  const url = `https://huggingface.co/${MODEL_ID}/resolve/${REVISION}/${file}`;
  console.log(`Downloading ${file}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const data = await res.arrayBuffer();
  if (data.byteLength !== size) {
    throw new Error(`${file}: expected ${size} bytes, got ${data.byteLength}`);
  }
  await mkdir(dirname(dest), { recursive: true });
  await Bun.write(dest, data);
}

// Copy from the onnxruntime-web that transformers.js resolves, so versions always match.
const transformersEntry = Bun.resolveSync("@huggingface/transformers", import.meta.dir);
const ortDist = dirname(Bun.resolveSync("onnxruntime-web", dirname(transformersEntry)));
const ortOut = join(publicDir, "ort");
await mkdir(ortOut, { recursive: true });
for (const file of ["ort-wasm-simd-threaded.wasm", "ort-wasm-simd-threaded.mjs"]) {
  await copyFile(join(ortDist, file), join(ortOut, file));
}
