import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface SkeletonProps {
  isFullscreen?: boolean;
  darkMode: boolean;
}

/**
 * Standard Canvas Scene Skeleton
 * Matches the 500px card container layout of the showcase gallery
 */
export function SceneSkeleton({ isFullscreen = false, darkMode }: SkeletonProps) {
  return (
    <div
      className={`relative w-full overflow-hidden flex flex-col items-center justify-center transition-colors duration-300
        ${isFullscreen ? "h-full min-h-[70vh]" : "h-[500px]"}
        ${darkMode ? "bg-zinc-950/40 text-zinc-400" : "bg-zinc-100 text-zinc-500"}
      `}
    >
      {/* Streetwear grid pattern background simulation */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06]" 
        style={{ 
          backgroundImage: 'radial-gradient(rgba(0,0,0,1) 1.2px, transparent 1.2px)', 
          backgroundSize: '20px 20px' 
        }} 
      />

      {/* Shimmer Effect */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          repeat: Infinity,
          duration: 1.6,
          ease: "linear",
        }}
        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 dark:via-white/10 to-transparent skew-x-12 pointer-events-none"
      />

      {/* Center status spinner & loading feedback */}
      <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
        <div className="relative flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <div className="absolute w-12 h-12 rounded-full border border-dashed border-emerald-500/30 animate-spin [animation-duration:8s]" />
        </div>
        
        <div className="space-y-1">
          <p className={`text-[10px] font-black tracking-[0.2em] uppercase ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}>
            Compiling Depth Mesh
          </p>
          <p className={`text-xs font-medium ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>
            Synthesizing spatial fields...
          </p>
        </div>
      </div>

      {/* Technical coordinate corner elements */}
      <div className="absolute top-4 left-4 font-mono text-[9px] opacity-40 uppercase tracking-widest">
        SYS_STATUS // BUFFERING
      </div>
      <div className="absolute bottom-4 right-4 font-mono text-[9px] opacity-40 uppercase tracking-widest">
        RES // STABLE_MAPPING
      </div>
    </div>
  );
}

/**
 * Immersive Fullscreen Portal Skeleton
 * Sits directly behind or within the fullscreen viewport modal
 */
export function FullscreenSceneSkeleton({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="w-full h-full min-h-[70vh] flex flex-col items-center justify-center bg-zinc-950/80 rounded-2xl relative border border-white/5 overflow-hidden">
      {/* Background Matrix Mesh */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.05]" 
        style={{ 
          backgroundImage: 'radial-gradient(rgba(255,255,255,1) 1.2px, transparent 1.2px)', 
          backgroundSize: '24px 24px' 
        }} 
      />

      {/* Shimmer */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
      />

      <div className="flex flex-col items-center gap-5 text-center px-4 relative z-10">
        <Loader2 className="w-12 h-12 text-[#3DDC84] animate-spin" />
        
        <div className="space-y-1.5">
          <p className="text-xs font-black tracking-[0.3em] text-[#3DDC84] uppercase">
            UPDATING VIEWPORT MATRIX
          </p>
          <p className="text-sm text-zinc-400 font-light">
            Deforming 3D dimensional vertex paths...
          </p>
        </div>
      </div>

      {/* Neon/Chunky outer corner indicators */}
      <div className="absolute top-6 left-6 border-l-2 border-t-2 border-[#3DDC84]/40 w-4 h-4" />
      <div className="absolute top-6 right-6 border-r-2 border-t-2 border-[#3DDC84]/40 w-4 h-4" />
      <div className="absolute bottom-6 left-6 border-l-2 border-b-2 border-[#3DDC84]/40 w-4 h-4" />
      <div className="absolute bottom-6 right-6 border-r-2 border-b-2 border-[#3DDC84]/40 w-4 h-4" />
    </div>
  );
}