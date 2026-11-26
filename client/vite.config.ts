import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

/**
 * onnxruntime-web references its ~27 MB WASM binary via `new URL(..., import.meta.url)`,
 * so Vite copies it into dist. transformers.js loads it from the jsDelivr CDN at runtime
 * instead, so the copy is unused, and it exceeds Cloudflare's 25 MiB per-asset limit.
 */
function dropBundledOrtWasm(): Plugin {
	return {
		name: "drop-bundled-ort-wasm",
		apply: "build",
		generateBundle(_, bundle) {
			for (const file of Object.keys(bundle)) {
				if (/ort-wasm.*\.wasm$/.test(file)) delete bundle[file];
			}
		},
	};
}

export default defineConfig({
	plugins: [react(), tailwindcss()],
	// The in-browser depth worker (transformers.js) needs ES module output to code-split.
	worker: { format: "es", plugins: () => [dropBundledOrtWasm()] },
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Points to Hono runtime
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
