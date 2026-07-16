import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutletContext } from "react-router";
import HomeLanding from "./HomeLanding";
import HomeDetails from "./HomeDetails";
import Showcase from "./Showcase";

interface LayoutContextType {
  darkMode: boolean;
}

function Home() {
  const [story, setStory] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { darkMode } = useOutletContext<LayoutContextType>();

  const [imageAsset] = useState("/weeknd.jpg"); 
  const [depthAsset] = useState("/weekndDepth.jpg");

  const handleImageUpload = (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsProcessing(false);
      setStory(true); 
    }, 2000);
  };

  // Dynamic shadow classes based on the active theme
  const shadowClass = darkMode 
    ? "shadow-[4px_4px_0px_0px_rgba(228,228,231,0.9)]" // Whitish-gray shadow (zinc-200) for Dark Mode
    : "shadow-[4px_4px_0px_0px_rgba(9,9,11,1)]";       // Solid black shadow (zinc-950) for Light Mode

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[70vh] relative">
      <div 
        className="fixed inset-0 pointer-events-none transition-opacity duration-500 z-0" 
        style={{ 
          backgroundImage: darkMode 
            ? 'radial-gradient(rgba(255,255,255,0.08) 1.2px, transparent 1.2px)' 
            : 'radial-gradient(rgba(0,0,0,0.08) 1.2px, transparent 1.2px)', 
          backgroundSize: '28px 28px' 
        }} 
      />

      <div className="w-full max-w-3xl px-8 py-12 z-10">
        <AnimatePresence mode="wait">
          {!story && !isProcessing ? (
           <>
            <HomeLanding 
              handleImageUpload={handleImageUpload}
              isProcessing={isProcessing}
              errorMessage={errorMessage}
              darkMode={darkMode}
            />
            
            {/* ─── SHOWCASE WRAPPER WITH BOLD VINYL MARGIN STICKERS ─── */}
            <div className="relative w-full mt-16">
              
              {/* STICKER 1: Left Middle (Warning Yellow & Black) */}
              <motion.div 
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: -8 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                whileHover={{ scale: 1.08, rotate: -3, y: -5 }}
                className="hidden lg:flex absolute -left-48 top-1/4 flex-col items-center select-none cursor-grab active:cursor-grabbing pointer-events-auto z-30"
              >
                <div className={`bg-[#FFCC00] text-zinc-950 font-black tracking-widest text-xs md:text-sm px-5 py-3 rounded-md border-2 border-zinc-950 transition-shadow duration-300 ${shadowClass}`}>
                  DEPTH_PRO // v1.0
                </div>
              </motion.div>

              {/* STICKER 2: Left Bottom (High-Contrast White & Black) */}
              <motion.div 
                initial={{ scale: 0, rotate: 15 }}
                animate={{ scale: 1, rotate: 6 }}
                transition={{ type: "spring", stiffness: 120, delay: 0.4 }}
                whileHover={{ scale: 1.08, rotate: 12, y: -5 }}
                className="hidden lg:flex absolute -left-40 bottom-12 flex-col items-center select-none cursor-grab active:cursor-grabbing pointer-events-auto z-30"
              >
                <div className={`bg-white text-zinc-950 font-black tracking-widest text-xs px-4 py-2.5 rounded-md border-2 border-zinc-950 transition-shadow duration-300 ${shadowClass}`}>
                  METRIC_ESTIMATION
                </div>
              </motion.div>

              {/* STICKER 3: Right Top (Acid Lime & Black) */}
              <motion.div 
                initial={{ scale: 0, rotate: 20 }}
                animate={{ scale: 1, rotate: 10 }}
                transition={{ type: "spring", stiffness: 90, delay: 0.3 }}
                whileHover={{ scale: 1.08, rotate: 2, y: -5 }}
                className="hidden lg:flex absolute -right-48 top-10 flex-col items-center select-none cursor-grab active:cursor-grabbing pointer-events-auto z-30"
              >
                <div className={`bg-[#3DDC84] text-zinc-950 font-black tracking-widest text-xs md:text-sm px-5 py-3 rounded-md border-2 border-zinc-950 transition-shadow duration-300 ${shadowClass}`}>
                  WEBGL_3D_MESH
                </div>
              </motion.div>

              {/* STICKER 4: Right Bottom (Toxic Purple & Black) */}
              <motion.div 
                initial={{ scale: 0, rotate: -25 }}
                animate={{ scale: 1, rotate: -10 }}
                transition={{ type: "spring", stiffness: 110, delay: 0.5 }}
                whileHover={{ scale: 1.08, rotate: -4, y: -5 }}
                className="hidden lg:flex absolute -right-44 bottom-24 flex-col items-center select-none cursor-grab active:cursor-grabbing pointer-events-auto z-30"
              >
                <div className={`bg-[#a855f7] text-white font-black tracking-widest text-xs px-4.5 py-2.5 rounded-md border-2 border-zinc-950 transition-shadow duration-300 ${shadowClass}`}>
                  16-BIT_EXPORT
                </div>
              </motion.div>

              <Showcase darkMode={darkMode} />
            </div>
           </>
          ) : isProcessing ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <span className={`w-2 h-2 rounded-full animate-bounce delay-75 ${darkMode ? "bg-white" : "bg-black"}`} />
              <p className="text-xs text-zinc-500 font-medium">Bootstrapping WebGL Canvas...</p>
            </div>
          ) : (
            <HomeDetails 
              imageSrc={imageAsset}
              depthSrc={depthAsset}
              setStory={setStory}
              darkMode={darkMode}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Home;