/**
 * API for user-posted spatial scenes, stored in R2. Everything outside /api/* is
 * served straight from static assets (see run_worker_first in wrangler.toml).
 *
 *   GET  /api/posts                  list posts, newest first
 *   POST /api/posts                  multipart: image, depth, title, aspect
 *   GET  /api/posts/:id/image|depth  stream a post's files
 *
 * R2 layout: posts/<id>/depth, then posts/<id>/image. The image carries the post's
 * metadata and is written last, so a post only appears once both files exist.
 * To remove a post, delete its two objects in the Cloudflare dashboard.
 */

interface Env {
  UPLOADS: R2Bucket;
  ASSETS: Fetcher;
  POST_LIMITER?: RateLimit;
}

export interface PostSummary {
  id: string;
  title: string;
  aspect: number;
  createdAt: string;
  imageUrl: string;
  depthUrl: string;
}

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_TITLE_LENGTH = 80;
const MAX_LISTED_POSTS = 200;
const ID_PATTERN = /^[a-z0-9-]{8,40}$/;

const IMAGE_SIGNATURES: Record<string, (b: Uint8Array) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  "image/webp": (b) =>
    String.fromCharCode(...b.subarray(0, 4)) === "RIFF" &&
    String.fromCharCode(...b.subarray(8, 12)) === "WEBP",
  "image/avif": (b) => ["ftypavif", "ftypavis"].includes(String.fromCharCode(...b.subarray(4, 12))),
};

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

const error = (message: string, status: number) => json({ error: message }, status);

/** Returns the file's verified MIME type, or null if it isn't an allowed image. */
async function sniffImage(file: File, allowed: string[]): Promise<string | null> {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  return allowed.find((type) => IMAGE_SIGNATURES[type]?.(head)) ?? null;
}

function toSummary(id: string, meta: Record<string, string>): PostSummary {
  return {
    id,
    title: meta.title ?? "",
    aspect: Number(meta.aspect) || 1,
    createdAt: meta.createdAt ?? "",
    imageUrl: `/api/posts/${id}/image`,
    depthUrl: `/api/posts/${id}/depth`,
  };
}

async function listPosts(env: Env): Promise<Response> {
  const posts: PostSummary[] = [];
  let cursor: string | undefined;
  do {
    const page = await env.UPLOADS.list({ prefix: "posts/", include: ["customMetadata"], cursor });
    for (const obj of page.objects) {
      const [, id = "", kind] = obj.key.split("/");
      if (id && kind === "image") posts.push(toSummary(id, obj.customMetadata ?? {}));
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);

  posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return json(posts.slice(0, MAX_LISTED_POSTS));
}

async function createPost(request: Request, env: Env): Promise<Response> {
  if (env.POST_LIMITER) {
    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const { success } = await env.POST_LIMITER.limit({ key: ip });
    if (!success) return error("Too many posts. Please wait a minute and try again.", 429);
  }

  const length = Number(request.headers.get("Content-Length") ?? 0);
  if (length > MAX_FILE_BYTES * 2 + 64 * 1024) return error("Upload is too large.", 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return error("Expected multipart form data.", 400);
  }

  const image = form.get("image");
  const depth = form.get("depth");
  if (!(image instanceof File) || !(depth instanceof File)) return error("Missing image or depth file.", 400);
  if (image.size > MAX_FILE_BYTES || depth.size > MAX_FILE_BYTES) return error("Files must be under 8 MB.", 413);

  const imageType = await sniffImage(image, ["image/jpeg", "image/png", "image/webp", "image/avif"]);
  const depthType = await sniffImage(depth, ["image/png"]);
  if (!imageType) return error("Image must be a JPEG, PNG, WEBP or AVIF.", 415);
  if (!depthType) return error("Depth map must be a PNG.", 415);

  const aspect = Number(form.get("aspect"));
  if (!Number.isFinite(aspect) || aspect < 0.1 || aspect > 10) return error("Invalid aspect ratio.", 400);

  const title = String(form.get("title") ?? "")
    .replace(/[\p{Cc}\p{Cf}]/gu, "")
    .trim()
    .slice(0, MAX_TITLE_LENGTH);

  const createdAt = new Date().toISOString();
  const id = `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
  const meta = { title, aspect: aspect.toFixed(4), createdAt };

  await env.UPLOADS.put(`posts/${id}/depth`, depth.stream(), { httpMetadata: { contentType: depthType } });
  await env.UPLOADS.put(`posts/${id}/image`, image.stream(), {
    httpMetadata: { contentType: imageType },
    customMetadata: meta,
  });

  return json(toSummary(id, meta), 201);
}

async function getPostFile(env: Env, id: string, kind: string): Promise<Response> {
  const obj = await env.UPLOADS.get(`posts/${id}/${kind}`);
  if (!obj) return error("Not found.", 404);

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("ETag", obj.httpEtag);
  // Post files never change once written.
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(obj.body, { headers });
}

export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/posts") {
      if (request.method === "GET") return listPosts(env);
      if (request.method === "POST") return createPost(request, env);
      return error("Method not allowed.", 405);
    }

    const fileMatch = pathname.match(/^\/api\/posts\/([^/]+)\/(image|depth)$/);
    if (fileMatch && request.method === "GET") {
      const [, id = "", kind = ""] = fileMatch;
      if (!ID_PATTERN.test(id)) return error("Not found.", 404);
      return getPostFile(env, id, kind);
    }

    if (pathname.startsWith("/api/")) return error("Not found.", 404);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
