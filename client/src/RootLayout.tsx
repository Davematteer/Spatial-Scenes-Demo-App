import React, { useState, useEffect } from "react";
import { Outlet } from "react-router";
import { Sun, Moon } from "lucide-react";
import { Toaster } from "sonner";

export function RootLayout() {
  const [darkMode, setDarkMode] = useState(false);

  // Sync class token on document base for nested elements
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased transition-colors duration-500 ease-in-out selection:bg-[#00ff66]/10
      ${darkMode ? "bg-[#0A0A0A] text-[#E5E5E5]" : "bg-[#FAFAFA] text-[#1A1A1A]"}`}
    >
      {/* Dot grid background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500" 
        style={{ 
          backgroundImage: darkMode 
            ? 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)' 
            : 'radial-gradient(rgba(0,0,0,0.07) 1px, transparent 1px)', 
          backgroundSize: '28px 28px' 
        }} 
      />
      
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="flex-1 flex flex-col w-full z-10 relative">
        <Outlet context={{ darkMode }} />
      </main>
      <Footer />
      <Toaster position="bottom-center" theme={darkMode ? "dark" : "light"} richColors closeButton />
    </div>
  );
}

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Navbar({ darkMode, setDarkMode }: NavbarProps) {
  return (
    <header className="w-full z-50 relative">
      <div className="max-w-6xl mx-auto px-8 py-8 flex items-center justify-between gap-4">
        
        <div />

        <div className="flex items-center gap-6 shrink-0">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full transition-all duration-300 transform active:scale-95
              ${darkMode ? "text-amber-400 hover:bg-white/5" : "text-zinc-500 hover:bg-black/5"}`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </header>
  );
}

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full relative mt-auto overflow-hidden z-10 border-t border-zinc-800/40">
      
      {/* Faint diamond lattice background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.05]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="diamond-grid" width="80" height="140" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 80 70 L 40 140 L 0 70 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diamond-grid)" />
        </svg>
      </div>

      {/* Ornament divider */}
      <div className="flex items-center justify-between w-full px-4 md:px-8 text-zinc-400 dark:text-zinc-650">
        <div className="flex-grow h-[1px] bg-gradient-to-r from-transparent to-current" />
        
        <div className="flex items-center gap-2 px-6 py-4 opacity-60">
          <span className="w-1 h-1 rotate-45 bg-current" />
          <span className="w-1.5 h-1.5 rotate-45 bg-current" />
          <span className="w-1 h-1 rotate-45 bg-current" />
        </div>
        <div className="flex-grow h-[1px] bg-gradient-to-l from-transparent to-current" />
      </div>

      {/* Footer content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 flex flex-col items-center justify-center relative">
        
        {/* Vertical back-to-top button (desktop only) */}
        <button
          onClick={scrollToTop}
          className="absolute right-4 md:right-8 bottom-16 hidden sm:flex flex-col items-center gap-4 group cursor-pointer"
        >
          <span className="text-[9px] uppercase tracking-[0.35em] font-mono [writing-mode:vertical-lr] text-zinc-500 group-hover:text-emerald-500 transition-colors duration-300">
            Back To Top
          </span>
          <div className="w-[1px] h-12 bg-zinc-800/60 group-hover:bg-emerald-500 transition-colors duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-emerald-500 -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out" />
          </div>
        </button>

        {/* Creator credit */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <a 
            href="https://github.com/DaveMatteer" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 cursor-pointer"
          >
            <div className="relative w-14 h-14 rounded-full p-[2px] bg-zinc-800/40 group-hover:bg-emerald-500/50 transition-colors duration-500 ease-out shadow-lg">
              <div className="w-full h-full rounded-full overflow-hidden bg-zinc-950">
                <img 
                  src="https://avatars.githubusercontent.com/u/168668156?v=4" 
                  alt="Dave Matteer" 
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 ease-out"
                />
              </div>
            </div>
            
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-zinc-500 group-hover:text-zinc-300 transition-colors duration-300">
              Built by <span className="font-bold text-zinc-400 group-hover:text-emerald-400 transition-colors duration-300">Dave Matteer</span>
            </p>
          </a>
        </div>

        {/* Wordmark */}
        <div className="text-center select-none">
          <h2 className="font-serif text-5xl md:text-6xl tracking-[0.18em] font-normal text-zinc-800 dark:text-zinc-100 ml-[0.18em]">
            SPATIAL
          </h2>
          <p className="font-mono text-[10px] tracking-[0.45em] text-zinc-400 dark:text-zinc-500 uppercase mt-2 ml-[0.45em]">
            Scenes
          </p>
        </div>

      </div>
    </footer>
  );
}