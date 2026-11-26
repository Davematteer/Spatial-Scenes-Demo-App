import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2, ArrowRight, ArrowLeft } from "lucide-react";
import SpatialScene from "./ParallaxEngine/SpatialScene";

interface ShowcaseItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  imageSrc: string;
  depthSrc: string;
}

interface ShowcaseProps {
  darkMode: boolean;
}

const ITEMS_PER_PAGE = 3;

export default function Showcase({ darkMode }: ShowcaseProps) {
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const showcaseRef = useRef<HTMLDivElement>(null);

  // Lock scroll when viewing fullscreen
  useEffect(() => {
    if (fullscreenIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullscreenIndex]);

  // Press ESC to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && fullscreenIndex !== null) {
        setFullscreenIndex(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreenIndex]);

  const showcaseItems: ShowcaseItem[] = [
    {
      id: 0,
      subtitle: "STEP ONE",
      title: "Upload & Synthesize",
      description: "Drop in any ordinary 2D anime illustration or photograph. Our pipeline instantly begins analyzing the structural focal points to map out a depth canvas.",
      ctaText: "Begin generation",
      imageSrc: "/example.jpg", 
      depthSrc: "/example1.jpg",
    },
    {
      id: 1,
      subtitle: "STEP TWO",
      title: "Dimensional Depth Mapping",
      description: "A customized depth estimation matrix runs under the hood, predicting the physical distance of every individual pixel. Foreground characters pop while background environments recede naturally.",
      ctaText: "Analyze depth mechanics",
      imageSrc: "/ghana.jpg",
      depthSrc: "/ghanaDepth.jpg",
    },
    {
      id: 2,
      subtitle: "STEP THREE",
      title: "Interactive Parallax Projection",
      description: "Witness your image react dynamically to your pointer. By projecting the 2D texture onto our deformed 3D mesh, we create a living spatial artifact you can feel.",
      ctaText: "Explore spatial physics",
      imageSrc: "/weeknd.jpg",
      depthSrc: "/weekndDepth.jpg",
    },
    {
      id: 3,
      subtitle: "STEP FOUR",
      title: "Underwater Volumetric Displacements",
      description: "Navigate complex spatial scenarios featuring layered underwater refraction. See how the engine maps deep liquid volume, rendering continuous shifting fields behind complex floating foreground elements.",
      ctaText: "Trace fluid geometry",
      imageSrc: "/Nirvana-Nevermind.webp",
      depthSrc: "/Nirvana-Nevermind.jpg",
    },
    {
      id: 4,
      subtitle: "STEP FIVE",
      title: "Synthesizing Intimate Realism",
      description: "Put the AI up against close-quarters realism. Study the isolation of the subject from surrounding domestic details, locking clean, sharp outlines with zero spatial bleeding.",
      ctaText: "Review edge occlusion",
      imageSrc: "/sitting.jpg",
      depthSrc: "/sittingDepth.jpg",
    },
    {
      id: 5,
      subtitle: "STEP SIX",
      title: "Synthesizing Intimate Realism",
      description: "Put the AI up against close-quarters realism. Study the isolation of the subject from surrounding domestic details, locking clean, sharp outlines with zero spatial bleeding.",
      ctaText: "Review edge occlusion",
      imageSrc: "/Yeat.webp",
      depthSrc: "/Yeat.jpg",
    },
    {
      id: 6,
      subtitle: "STEP SEVEN",
      title: "2D MOTION",
      description: "Utilizing apple depth pro to simulate 3D spatial scenes.",
      ctaText: "Review edge occlusion",
      imageSrc: "/tinubu.jpg",
      depthSrc: "/tinubu.webp",
    },
  ];

  // Pagination Math
  const totalPages = Math.ceil(showcaseItems.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = showcaseItems.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (showcaseRef.current) {
      showcaseRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Animation variants for staggered text fade-up
  const textContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const textItemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      } as const,
    },
  };

  return (
    <section ref={showcaseRef} className="w-full max-w-7xl xl:max-w-8xl 2xl:max-w-[1512px] mx-auto px-6 md:px-12 xl:px-16 pb-24 scroll-mt-24">
      {/* Divider */}
      <div className="flex items-center my-16">
        <div className={`flex-grow h-[1px] ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}`}></div>
        <span className="px-8 text-xs uppercase tracking-[0.3em] text-zinc-400 font-bold font-mono">
          Showcase ({currentPage}/{totalPages})
        </span>
        <div className={`flex-grow h-[1px] ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}`}></div>
      </div>

      {/* SHOWCASE SECTIONS */}
      <div className="space-y-36">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-36"
          >
            {currentItems.map((item, index) => {
              const isEven = index % 2 === 0;

              return (
                <div
                  key={item.id}
                  className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-16 xl:gap-28 2xl:gap-36 ${
                    isEven ? "" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* LEFT SIDE: TALL DYNAMIC ROTATING CARD (EXACT RATIO MATCHING REFERENCED IMAGE) */}
                  <motion.div 
                    className="w-full lg:w-3/5 flex justify-center"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-120px" }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/*
                      Tall rectangular container with alternating rotation on hover.
                      Transition transitions rotation instantly (no smooth delay on hover)
                    */}
                    <div 
                      className={`relative group w-[320px] transition-all ease-out h-120 rounded-2xl overflow-hidden shadow-2xl border border-zinc-850/30 dark:border-white/10 bg-zinc-950
                        ${!isEven ? "hover:-rotate-10" : "hover:rotate-10"}`}
                    >
                      {/* 
                        Static image filling the space perfectly.
                        Transitions: Zooms in on hover (scale-110 driven by parent 'group')
                      */}
                      <img
                        src={item.imageSrc}
                        alt={item.title}
                        className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110"
                      />

                      {/* Hover Overlay Button */}
                      <button
                        onClick={() => setFullscreenIndex(item.id)}
                        className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black/80 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider border border-white/10 shadow-2xl">
                          <Maximize2 className="w-4 h-4" /> Expand Spatial View
                        </div>
                      </button>
                    </div>
                  </motion.div>

                  {/* RIGHT SIDE: SOPHISTICATED CALL TO ACTION */}
                  <motion.div 
                    className="w-full lg:w-2/5 text-left space-y-6"
                    variants={textContainerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-120px" }}
                  >
                    <motion.span 
                      variants={textItemVariants}
                      className="text-[10px] font-bold tracking-[0.35em] text-emerald-500 font-mono block"
                    >
                      {item.subtitle}
                    </motion.span>
                    
                    <motion.h3 
                      variants={textItemVariants}
                      className={`font-serif text-3xl lg:text-4xl xl:text-5xl tracking-wide font-normal leading-tight ${
                        darkMode ? "text-zinc-100" : "text-zinc-900"
                      }`}
                    >
                      {item.title}
                    </motion.h3>

                    <motion.p 
                      variants={textItemVariants}
                      className={`text-base leading-relaxed font-light ${
                        darkMode ? "text-zinc-400" : "text-zinc-650"
                      }`}
                    >
                      {item.description}
                    </motion.p>

                    <motion.div variants={textItemVariants} className="pt-2">
                      <button className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors">
                        {item.ctaText}
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                      </button>
                    </motion.div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 mt-28">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 text-xs hover:cursor-pointer font-black tracking-widest uppercase px-5 py-3 rounded-md border-2 border-zinc-950 transition-all duration-300
              ${currentPage === 1 
                ? "opacity-40 cursor-not-allowed bg-zinc-300 text-zinc-500 shadow-none border-zinc-400" 
                : darkMode 
                  ? "bg-zinc-900 text-zinc-100 hover:bg-zinc-800 shadow-[3px_3px_0px_0px_rgba(228,228,231,0.9)]" 
                  : "bg-white text-zinc-950 hover:bg-zinc-50 shadow-[3px_3px_0px_0px_rgba(9,9,11,1)]"
              }`}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <span className={`md:text-xs font-bold font-mono ${darkMode ? "text-zinc-400" : "text-zinc-500"}`}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 text-xs font-black hover:cursor-pointer tracking-widest uppercase px-5 py-3 rounded-md border-2 border-zinc-950 transition-all duration-300
              ${currentPage === totalPages 
                ? "opacity-40 cursor-not-allowed bg-zinc-300 text-zinc-500 shadow-none border-zinc-400" 
                : "bg-[#3DDC84] text-zinc-950 hover:bg-[#34c775] " + (darkMode ? "shadow-[3px_3px_0px_0px_rgba(228,228,231,0.9)]" : "shadow-[3px_3px_0px_0px_rgba(9,9,11,1)]")
              }`}
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FULLSCREEN DIMENSIONAL PORTAL OVERLAY */}
      <AnimatePresence>
        {fullscreenIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex flex-col justify-between bg-zinc-950/90 text-white p-6 pointer-events-none"
          >
            {/* Top Controls Overlay */}
            <div className="relative z-[100] flex items-center justify-between w-full mb-4 pointer-events-auto">
              {(() => {
                const absoluteItem = showcaseItems.find(x => x.id === fullscreenIndex);
                if (!absoluteItem) return null;
                return (
                  <>
                    <div className="space-y-0.5 text-left">
                      <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold font-mono">
                        {absoluteItem.subtitle}
                      </p>
                      <p className="text-sm text-zinc-300 font-medium">
                        {absoluteItem.title}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFullscreenIndex(null)}
                      className="relative z-[101] inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-lg"
                    >
                      <Minimize2 className="w-4 h-4" /> Exit Fullscreen
                    </button>
                  </>
                );
              })()}
            </div>

            {/* Expansive viewport */}
            <div className="flex-1 w-full flex items-center justify-center rounded-2xl overflow-hidden relative z-10 pointer-events-auto">
              <div className="w-full h-full max-h-[90vh] max-w-[95vw]">
                {showcaseItems.find(x => x.id === fullscreenIndex) && (
                  <SpatialScene
                    imageSrc={showcaseItems.find(x => x.id === fullscreenIndex)!.imageSrc}
                    depthSrc={showcaseItems.find(x => x.id === fullscreenIndex)!.depthSrc}
                    isFullscreen={true}
                  />
                )}
              </div>

              {/* Dynamic instruction badge */}
              <div className="hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none bg-black/85 backdrop-blur-lg px-4 py-2.5 rounded-xl text-xs text-white/90 border border-white/10 font-sans shadow-xl text-center">
                Move your cursor to drift the scene. Press <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] border border-zinc-700">ESC</kbd> to exit
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}