import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Maximize2, Minimize2, ImageOff, Loader2 } from "lucide-react";
import SpatialScene from "./ParallaxEngine/SpatialScene";
import { fetchPosts, POSTS_QUERY_KEY, type Post } from "@/lib/postsApi";

interface UserUploadsProps {
  darkMode: boolean;
}

const PAGE_SIZE = 12;

const formatDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "";

export default function UserUploads({ darkMode }: UserUploadsProps) {
  const { data: posts, isPending, isError, refetch } = useQuery({
    queryKey: POSTS_QUERY_KEY,
    queryFn: fetchPosts,
  });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [active, setActive] = useState<Post | null>(null);

  useEffect(() => {
    if (!active) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  const muted = darkMode ? "text-zinc-400" : "text-zinc-500";

  if (isPending) {
    return (
      <div className={`flex items-center justify-center gap-2 py-24 text-xs ${muted}`}>
        <Loader2 className="w-4 h-4 animate-spin" /> Loading uploads...
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`flex flex-col items-center gap-3 py-24 text-xs ${muted}`}>
        <p>Couldn't load uploads right now.</p>
        <button onClick={() => refetch()} className="font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400 cursor-pointer">
          Try again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`flex flex-col items-center gap-3 py-24 text-center ${muted}`}>
        <ImageOff className="w-6 h-6" />
        <p className="text-sm">No uploads yet.</p>
        <p className="text-xs">Upload an image above, then hit Post to share its spatial scene here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="columns-1 sm:columns-2 gap-6">
        {posts.slice(0, visibleCount).map((post) => (
          <motion.figure
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="break-inside-avoid mb-6"
          >
            <button
              onClick={() => setActive(post)}
              className={`relative group block w-full rounded-2xl overflow-hidden border cursor-pointer ${
                darkMode ? "border-white/10 bg-zinc-900" : "border-zinc-200 bg-zinc-100"
              }`}
              style={{ aspectRatio: post.aspect }}
            >
              <img
                src={post.imageUrl}
                alt={post.title || "User upload"}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/80 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider border border-white/10">
                  <Maximize2 className="w-4 h-4" /> Expand Spatial View
                </span>
              </div>
            </button>
            <figcaption className="flex items-baseline justify-between gap-3 pt-2.5 px-1">
              <span className={`text-sm truncate ${darkMode ? "text-zinc-200" : "text-zinc-800"}`}>
                {post.title || "Untitled"}
              </span>
              <span className={`shrink-0 text-[10px] font-mono uppercase tracking-wider ${muted}`}>
                {formatDate(post.createdAt)}
              </span>
            </figcaption>
          </motion.figure>
        ))}
      </div>

      {visibleCount < posts.length && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            className={`text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-md border-2 border-zinc-950 cursor-pointer transition-colors ${
              darkMode
                ? "bg-zinc-900 text-zinc-100 hover:bg-zinc-800 shadow-[3px_3px_0px_0px_rgba(228,228,231,0.9)]"
                : "bg-white text-zinc-950 hover:bg-zinc-50 shadow-[3px_3px_0px_0px_rgba(9,9,11,1)]"
            }`}
          >
            Load more
          </button>
        </div>
      )}

      {/* Portaled to <body>: animated (transformed) ancestors would otherwise trap the fixed overlay. */}
      {createPortal(
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex flex-col bg-zinc-950/90 text-white p-6"
          >
            <div className="flex items-center justify-between w-full mb-4">
              <div className="space-y-0.5 text-left min-w-0">
                <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold font-mono">
                  User Upload {formatDate(active.createdAt) && `/ ${formatDate(active.createdAt)}`}
                </p>
                <p className="text-sm text-zinc-300 font-medium truncate">{active.title || "Untitled"}</p>
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-lg"
              >
                <Minimize2 className="w-4 h-4" /> Exit Fullscreen
              </button>
            </div>

            <div className="flex-1 w-full flex items-center justify-center relative">
              <div className="w-full max-w-[90vw] flex items-center justify-center">
                <SpatialScene imageSrc={active.imageUrl} depthSrc={active.depthUrl} isFullscreen fitToImage />
              </div>
              <div className="hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none bg-black/85 backdrop-blur-lg px-4 py-2.5 rounded-xl text-xs text-white/90 border border-white/10 shadow-xl text-center">
                Move your cursor to drift the scene. Press{" "}
                <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] border border-zinc-700">ESC</kbd> to exit
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </>
  );
}
