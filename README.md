# Spatial Scenes

An interactive web demo that turns an ordinary 2D photo into a 3D parallax scene, similar to the spatial scenes feature on Apple devices.

Upload an image and the app estimates a depth map with Depth Anything V2. It then displaces a high-resolution Three.js mesh with that map, so the scene shifts in depth as you move your cursor or tilt your phone.

## Video Demo

https://github.com/user-attachments/assets/ab1ddb6d-caa4-4abf-9025-ed51d89608e1

## How depth estimation works

The logic lives in `client/src/lib/depthService.ts` and tries three options in order:

1. [`depth-anything/Depth-Anything-V2`](https://huggingface.co/spaces/depth-anything/Depth-Anything-V2), the official Hugging Face Space (GPU, a few seconds)
2. [`Upsampler/depth-anything-v2`](https://huggingface.co/spaces/Upsampler/depth-anything-v2), a mirror with the same API
3. In-browser inference with [`onnx-community/depth-anything-v2-small`](https://huggingface.co/onnx-community/depth-anything-v2-small) via [Transformers.js](https://huggingface.co/docs/transformers.js), in a Web Worker (`depthWorker.ts`)

Depth Anything V2 isn't served by any Hugging Face Inference Provider, so the Spaces are called through their Gradio HTTP API, straight from the browser. No API key or backend is needed. Each visitor uses their own anonymous ZeroGPU quota, which runs out after a handful of images per day. Once both Spaces fail, the app goes straight to in-browser inference for the next hour.

The in-browser model is quantized to keep the one-time download small, and the browser caches it:

| Backend | Weights | Download | Mean depth error vs fp32 |
| --- | --- | --- | --- |
| WebGPU with `shader-f16` | q4f16 | 19 MB | ~2% |
| WebGPU without f16 | q4 | 27 MB | ~2% |
| WASM (CPU) | uint8 | 27 MB | ~1% |

If all three options fail, the user sees an error toast. Images larger than 2048px are downscaled first.

## Stack

- [React](https://react.dev) + [Vite](https://vite.dev) + [Tailwind CSS](https://tailwindcss.com)
- [Three.js](https://threejs.org) via React Three Fiber for the displaced mesh and parallax shader
- [Bun](https://bun.sh) workspaces with Turborepo
- Deployed on Cloudflare Workers (static assets)

## Development

```sh
bun install
bun run dev:client
```

## Credits

- [Depth Anything V2](https://github.com/DepthAnything/Depth-Anything-V2) by Lihe Yang et al.
- The example depth maps in `client/public` were made with [Apple Depth Pro](https://github.com/apple/ml-depth-pro).
