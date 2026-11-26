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

The in-browser fallback is fully self-hosted: `client/scripts/fetch-model.ts` runs before `dev` and `build`. It downloads the model into `client/public/models` and copies the ONNX Runtime binary into `client/public/ort`, so nothing is fetched from huggingface.co or a CDN at runtime. Both folders are gitignored.

The weights are q4f16, which is 19 MB instead of 99 MB for fp32, with about 2% mean depth error. It's the best variant under Cloudflare's 25 MiB per-file limit. Inference runs on the CPU (WASM), because the WebGPU-capable runtime is 25.6 MiB and doesn't fit.

If all three options fail, the user sees an error toast. Images larger than 2048px are downscaled first.

## User uploads

After rendering an upload, the **Post** button shares the spatial scene publicly in the **User Uploads** tab, next to Showcase. Anyone can post.

- `client/worker/index.ts` is a small Cloudflare Worker API (`/api/posts`). It stores each post's image and depth map in the R2 bucket `spatial-scenes-uploads`. All other paths are served as static files.
- Uploads are checked for real image content (JPEG, PNG, WEBP or AVIF; the depth map must be a PNG), capped at 8 MB per file, and limited to 5 posts per minute per IP.
- To remove a post, delete its two objects (`posts/<id>/image` and `posts/<id>/depth`) in the Cloudflare dashboard under R2.

One-time setup (the deploy fails until the bucket exists):

```sh
cd client
bunx wrangler login
bunx wrangler r2 bucket create spatial-scenes-uploads
```

## Stack

- [React](https://react.dev) + [Vite](https://vite.dev) + [Tailwind CSS](https://tailwindcss.com)
- [Three.js](https://threejs.org) via React Three Fiber for the displaced mesh and parallax shader
- [Bun](https://bun.sh) workspaces with Turborepo
- Deployed on Cloudflare Workers (static assets)

## Development

```sh
bun install
bun run dev:client          # the site, on Vite
cd client && bun run dev:api  # the posts API, with a local simulated R2 (proxied at /api)
```

## Credits

- [Depth Anything V2](https://github.com/DepthAnything/Depth-Anything-V2) by Lihe Yang et al.
- The example depth maps in `client/public` were made with [Apple Depth Pro](https://github.com/apple/ml-depth-pro).
