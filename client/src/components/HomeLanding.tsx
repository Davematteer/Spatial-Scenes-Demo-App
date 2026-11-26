import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileImage } from "lucide-react";

const loopingWords = ["Depth Map", "3D Scene", "Parallax","Shift"];

interface HomeLandingProps {
  handleImageUpload: (file: File) => void;
  darkMode: boolean;
}

export default function HomeLanding({ handleImageUpload, darkMode }: HomeLandingProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % loopingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const titleSentencePart1 = ["Generate", "Your"];
  const titleSentencePart2 = ["With", "A", "Single", "Image."];

  // Drag-and-drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setSelectedFileName(file.name);
        handleImageUpload(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      handleImageUpload(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div 
      key="landing-state"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="text-center space-y-8 relative flex flex-col items-center min-h-[65vh] justify-center px-4 py-8"
    >
      {/* Floating feature stickers */}
      <div className="absolute inset-0 pointer-events-none select-none z-20">
        
        {/* STICKER 1: Top-Left */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="absolute left-2 top-0 lg:-left-28 xl:-left-40 lg:-top-6 flex items-center gap-1.5"
        >
          <svg className="w-2.5 h-2.5 lg:w-3 h-3 text-blue-500 transform -rotate-45 fill-current" viewBox="0 0 24 24"><path d="M21 3L3 10.53v.98l6.84 2.81L12.65 21h.98L21 3z"/></svg>
          <span className="text-[10px] lg:text-[11px] font-medium tracking-wide px-2 py-0.5 lg:py-1 rounded bg-blue-500 text-white shadow-md font-sans whitespace-nowrap">
            Depth Anything V2
          </span>
        </motion.div>

        {/* STICKER 2: Top-Right */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, x: -10 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="absolute right-2 top-4 lg:-right-28 xl:-right-40 lg:top-4 flex items-center gap-1.5"
        >
          <svg className="w-2.5 h-2.5 lg:w-3 h-3 text-emerald-500 transform rotate-90 fill-current" viewBox="0 0 24 24"><path d="M21 3L3 10.53v.98l6.84 2.81L12.65 21h.98L21 3z"/></svg>
          <span className="text-[10px] lg:text-[11px] font-medium tracking-wide px-2 py-0.5 lg:py-1 rounded bg-emerald-500 text-white shadow-md font-sans whitespace-nowrap">
            Relative Depth
          </span>
        </motion.div>

        {/* STICKER 3: Bottom-Left */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="absolute left-4 bottom-2 lg:-left-24 xl:-left-36 lg:bottom-6 flex items-center gap-1.5"
        >
          <svg className="w-2.5 h-2.5 lg:w-3 h-3 text-purple-500 transform rotate-180 fill-current" viewBox="0 0 24 24"><path d="M21 3L3 10.53v.98l6.84 2.81L12.65 21h.98L21 3z"/></svg>
          <span className="text-[10px] lg:text-[11px] font-medium tracking-wide px-2 py-0.5 lg:py-1 rounded bg-purple-500 text-white shadow-md font-sans whitespace-nowrap">
            WebGL 3D Mesh output
          </span>
        </motion.div>

        {/* STICKER 4: Bottom-Right */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: -5 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="absolute right-4 bottom-0 lg:-right-24 xl:-right-36 lg:-bottom-2 flex items-center gap-1.5"
        >
          <svg className="w-2.5 h-2.5 lg:w-3 h-3 text-amber-500 transform -rotate-90 fill-current" viewBox="0 0 24 24"><path d="M21 3L3 10.53v.98l6.84 2.81L12.65 21h.98L21 3z"/></svg>
          <span className="text-[10px] lg:text-[11px] font-medium tracking-wide px-2 py-0.5 lg:py-1 rounded bg-amber-500 text-white shadow-md font-sans whitespace-nowrap">
            Zero-Shot, Any Image
          </span>
        </motion.div>
      </div>

      {/* CORE TITLE AND HERO HEADER */}
      <div className="space-y-4 w-full pt-8 lg:pt-0">
        <motion.h2 
          variants={{ animate: { transition: { staggerChildren: 0.06 } } }}
          initial="initial"
          animate="animate"
          className={`text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight font-display leading-[1.2] lg:leading-[1.15] transition-colors duration-300 flex flex-wrap justify-center items-center gap-x-2 lg:gap-x-3
            ${darkMode ? "text-white" : "text-[#0A0A0A]"}`}
        >
          {titleSentencePart1.map((word, index) => (
            <span key={`p1-${index}`} className="inline-block overflow-hidden py-1">
              <motion.span variants={{ initial: { y: "100%" }, animate: { y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }} className="inline-block">
                {word}
              </motion.span>
            </span>
          ))}

          <span className="inline-flex relative overflow-hidden h-[1.2em] min-w-[12rem] sm:min-w-[15rem] lg:min-w-[18rem] justify-center items-center py-1 border-b-2 border-emerald-500/30">
            <motion.span
              key={wordIndex}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute text-emerald-600 dark:text-[#3DDC84] font-medium"
            >
              {loopingWords[wordIndex]}
            </motion.span>
          </span>

          {titleSentencePart2.map((word, index) => {
            const isSingle = word.replace(/\W/g, "") === "Single";
            return (
              <span 
                key={`p2-${index}`} 
                className={`inline-block overflow-hidden py-1 ${
                  isSingle ? "bg-[#00ff66]/10 px-2 rounded-md mx-1" : ""
                }`}
              >
                <motion.span 
                  variants={{ 
                    initial: { y: "100%" }, 
                    animate: { y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } 
                  }} 
                  className="inline-block"
                >
                  {word}
                </motion.span>
              </span>
            );
          })}
        </motion.h2>

        <p className="text-zinc-500 max-w-md mx-auto text-xs sm:text-sm lg:text-base px-2">
          Transform flat imagery into immersive 3D scenes instantly using dense zero-shot depth estimation.
        </p>
      </div>

      {/* DRAG AND DROP UPLOAD REGION */}
      <div className="w-full max-w-lg mx-auto pt-4 pb-8 lg:pb-0 z-30">
        <input 
          ref={fileInputRef}
          type="file" 
          id="depth-image-upload" 
          accept="image/*" 
          onChange={handleChange} 
          className="hidden" 
        />
        
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`relative border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-4
            ${dragActive 
              ? "border-emerald-500 bg-emerald-500/5 scale-[1.02]" 
              : darkMode 
                ? "border-zinc-800 hover:border-zinc-600 bg-zinc-950/20 hover:bg-zinc-950/45" 
                : "border-zinc-200 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-50/90"
            }`}
        >
          {selectedFileName ? (
            <div className="flex flex-col items-center space-y-3">
              <FileImage className="w-10 h-10 text-emerald-500" />
              <div className="text-center">
                <p className={`text-sm font-medium truncate max-w-[250px] ${darkMode ? "text-white" : "text-[#1A1A1A]"}`}>
                  {selectedFileName}
                </p>
                <p className="text-xs text-zinc-500">Click or drag to swap image</p>
              </div>
            </div>
          ) : (
            <>
              <div className={`p-3 rounded-full ${darkMode ? "bg-zinc-900 text-zinc-400" : "bg-zinc-100 text-zinc-500"}`}>
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <p className={`text-sm font-medium ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>
                  Drag and drop your image here, or <span className="text-emerald-500 font-semibold underline underline-offset-2">browse</span>
                </p>
                <p className="text-xs text-zinc-500">Supports PNG, JPG, or WEBP formats</p>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}