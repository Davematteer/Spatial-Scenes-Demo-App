/** Client for the user-posted spatial scenes API (client/worker/index.ts). */

export interface Post {
  id: string;
  title: string;
  /** Image width / height. */
  aspect: number;
  createdAt: string;
  imageUrl: string;
  depthUrl: string;
}

export const POSTS_QUERY_KEY = ["posts"] as const;

async function readError(res: Response): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? `Request failed (${res.status})`;
}

export async function fetchPosts(): Promise<Post[]> {
  const res = await fetch("/api/posts");
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

async function getAspect(image: Blob): Promise<number> {
  const bitmap = await createImageBitmap(image);
  const aspect = bitmap.width / bitmap.height;
  bitmap.close();
  return aspect;
}

/** Posts a rendered scene, given the object URLs of its image and depth map. */
export async function createPost(input: { imageUrl: string; depthUrl: string; title: string }): Promise<Post> {
  const [image, depth] = await Promise.all(
    [input.imageUrl, input.depthUrl].map((url) => fetch(url).then((r) => r.blob())),
  );

  const form = new FormData();
  form.append("image", image);
  form.append("depth", depth);
  form.append("title", input.title);
  form.append("aspect", String(await getAspect(image)));

  const res = await fetch("/api/posts", { method: "POST", body: form });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}
