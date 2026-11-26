import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import SpatialScene from "./ParallaxEngine/SpatialScene";

interface HomeDetailsProps {
  imageSrc: string;
  depthSrc: string;
  fileName: string;
  onBack: () => void;
  darkMode: boolean;
}

interface ShowcaseItem {
  id: number;
  imageSrc: string;
  depthSrc: string;
  title: string;
}

const showcaseItems: ShowcaseItem[] = [
  { id: 0, title: "Upload & Synthesize", imageSrc: "/example.jpg", depthSrc: "/example1.jpg" },
  { id: 1, title: "Dimensional Depth Mapping", imageSrc: "/ghana.jpg", depthSrc: "/ghanaDepth.jpg" },
  { id: 2, title: "Interactive Parallax Projection", imageSrc: "/weeknd.jpg", depthSrc: "/weekndDepth.jpg" },
  { id: 3, title: "Underwater Volumetric Displacements", imageSrc: "/Nirvana-Nevermind.webp", depthSrc: "/Nirvana-Nevermind.jpg" },
  { id: 4, title: "Synthesizing Intimate Realism", imageSrc: "/sitting.jpg", depthSrc: "/sittingDepth.jpg" },
  { id: 5, title: "Synthesizing Intimate Realism", imageSrc: "/Yeat.webp", depthSrc: "/Yeat.jpg" },
  { id: 6, title: "Synthesizing Intimate Realism", imageSrc: "/tinubu.jpg", depthSrc: "/tinubu.webp" },
];

const duplicatedItems = [...showcaseItems, ...showcaseItems];

export default function HomeDetails({ imageSrc, depthSrc, fileName, onBack, darkMode }: HomeDetailsProps) {
  // Track specific image/depth state for the active fullscreen view (null when closed)
  // fitToImage is true only for the user's upload; built-in examples keep their fixed framing.
  const [fullscreenData, setFullscreenData] = useState<{
    imageSrc: string;
    depthSrc: string;
    fitToImage?: boolean;
  } | null>(null);
  const openUploadFullscreen = () => setFullscreenData({ imageSrc, depthSrc, fitToImage: true });
  const isFullscreen = fullscreenData !== null;

  // Lock body scroll when in fullscreen mode
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  // Press ESC to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setFullscreenData(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  return (
    <>
      <motion.div 
        key="data-state"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6 w-full text-left"
      >
        {/* HEADER NAV */}
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Upload Another Image
          </button>

          {/* Fullscreen Trigger (Main Uploaded Image) */}
          <button
            onClick={openUploadFullscreen}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              darkMode 
                ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800" 
                : "bg-white border-zinc-200 text-zinc-700 hover:text-black hover:bg-zinc-50"
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" /> View Fullscreen
          </button>
        </div>

        {/* INLINE THREE.JS WORKSPACE */}
        <div className="w-full">
          {!isFullscreen && (
            <SpatialScene
              imageSrc={imageSrc}
              depthSrc={depthSrc}
              isFullscreen={false}
              fitToImage
              overlay={
                <button
                  onClick={openUploadFullscreen}
                  className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                  title="Expand to Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              }
            />
          )}
        </div>

        {/* METRICS & DETAILS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-1">
            <h4 className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Input File</h4>
            <p className={`text-sm font-mono tracking-tight truncate ${darkMode ? "text-zinc-200" : "text-zinc-800"}`}>
              {fileName}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Depth Map</h4>
            <p className={`text-sm font-mono tracking-tight ${darkMode ? "text-zinc-200" : "text-zinc-800"}`}>
              Depth Anything V2 (grayscale, white = near)
            </p>
          </div>
        </div>

        {/* Auto-scrolling example carousel */}
        <div className="pt-4 space-y-3">
          <h4 className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
            Reference Database Carousel (Click to preview)
          </h4>
          
          <div className={`relative w-full overflow-hidden py-3 rounded-xl border ${
            darkMode ? "bg-zinc-950/40 border-zinc-900" : "bg-zinc-50 border-zinc-100"
          }`}>
            {/* Fade Out Edges */}
            <div className={`absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-r ${
              darkMode ? "from-zinc-950 via-zinc-950/40 to-transparent" : "from-zinc-50 via-zinc-50/40 to-transparent"
            }`} />
            <div className={`absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-l ${
              darkMode ? "from-zinc-950 via-zinc-950/40 to-transparent" : "from-zinc-50 via-zinc-50/40 to-transparent"
            }`} />

            {/* Scrolling Track Container */}
            <div className="flex w-full">
              <motion.div 
                className="flex gap-4 shrink-0 pr-4 hover:[animation-play-state:paused]"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  ease: "linear",
                  duration: 24,
                  repeat: Infinity,
                }}
              >
                {duplicatedItems.map((item, idx) => (
                  <button 
                    key={`${item.id}-${idx}`}
                    onClick={() => setFullscreenData({ imageSrc: item.imageSrc, depthSrc: item.depthSrc })}
                    className={`relative w-32 h-20 rounded-lg overflow-hidden shrink-0 border text-left transition-all duration-300 group/carousel cursor-pointer focus:outline-none ${
                      darkMode ? "border-zinc-800 bg-zinc-900 hover:border-emerald-500/50" : "border-zinc-200 bg-white hover:border-emerald-500/50"
                    }`}
                  >
                    <img 
                      src={item.imageSrc} 
                      alt={item.title} 
                      className="w-full h-full object-cover grayscale opacity-75 group-hover/carousel:grayscale-0 group-hover/carousel:scale-105 group-hover/carousel:opacity-100 transition-all duration-300" 
                    />
                    
                    {/* Compact Hover Expansion Indicator */}
                    <div className="absolute top-1.5 right-1.5 p-1 rounded bg-black/70 backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200">
                      <Maximize2 className="w-2.5 h-2.5 text-[#3DDC84]" />
                    </div>

                    {/* Compact Label Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <p className="text-[8px] font-mono font-bold tracking-tight text-white/90 truncate w-full">
                        {item.title}
                      </p>
                    </div>
                  </button>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* FULLSCREEN PLAYER OVERLAY */}
      <AnimatePresence>
        {isFullscreen && fullscreenData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex flex-col justify-between bg-zinc-950/90 text-white p-6 pointer-events-none"
          >
            {/* Top Bar Controls */}
            <div className="relative z-[100] flex items-center justify-between w-full mb-4 pointer-events-auto">
              <div className="space-y-0.5 text-left">
                <p className="text-xs uppercase tracking-wider text-[#3DDC84] font-bold font-mono">Spatial Mode (Active)</p>
                <p className="text-sm text-zinc-300 font-medium">Interactive Parallax Render</p>
              </div>

              <button
                type="button"
                onClick={() => setFullscreenData(null)}
                className="relative z-101 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-lg"
              >
                <Minimize2 className="w-4 h-4" /> Exit Fullscreen
              </button>
            </div>

            {/* Expansive Centered Canvas Container */}
            <div className="flex-1 w-full flex items-center justify-center rounded-2xl overflow-hidden relative z-10 pointer-events-auto">
              <div
                className={`w-full h-full max-h-[80vh] max-w-[90vw] ${
                  fullscreenData.fitToImage ? "flex items-center justify-center" : ""
                }`}
              >
                <SpatialScene
                  imageSrc={fullscreenData.imageSrc}
                  depthSrc={fullscreenData.depthSrc}
                  isFullscreen={true}
                  fitToImage={fullscreenData.fitToImage}
                />
              </div>

              {/* Toast info on the canvas overlay */}
              <div className=" absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none bg-black/85 backdrop-blur-lg px-4 py-2.5 rounded-xl text-xs text-white/90 border border-white/10 font-sans shadow-xl text-center">
                Move your cursor to drift the scene. Press <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] border border-zinc-700">ESC</kbd> to exit
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}