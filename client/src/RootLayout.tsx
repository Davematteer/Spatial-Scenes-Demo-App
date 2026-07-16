import React, { useState, useEffect } from "react";
import { Outlet } from "react-router";
import { Sun, Moon } from "lucide-react";

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
      {/* Precision Workspace Dot Matrix Layer */}
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
        {/* Pass down theme information explicitly via context or route outlet if necessary */}
        <Outlet context={{ darkMode }} />
      </main>
      <Footer />
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
        
        {/* BRAND ELEMENT */}
        <div className="flex items-center gap-3 min-w-0">
          {/* <ShieldCheck className={`w-5 h-5 transition-colors duration-300 ${darkMode ? "text-[#3DDC84]" : "text-[#0F7A38]"}`} strokeWidth={2} /> */}
          <div className="flex flex-col min-w-0">
            {/* <h1 className={`font-mono tracking-tighter font-medium text-base  transition-colors duration-300 ${darkMode ? "text-white" : "text-[#0A0A0A]"}`}>
              IT CONSORTIUM
            </h1>
            <p className="text-xs text-[#666666] tracking-normal">
              Transaction Lifecycle Platform
            </p> */}
          </div>
        </div>

        {/* CONTROLS & META STATUS */}
        <div className="flex items-center gap-6 shrink-0">
          {/* <span className="hidden sm:inline-flex items-center gap-2 text-xs font-medium text-[#666666] tracking-tight">
            <span className="relative flex h-1.5 w-1.5">
              <span className={`absolute inset-0 animate-ping rounded-full opacity-70 ${darkMode ? "bg-[#3DDC84]" : "bg-[#0F7A38]"}`} />
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${darkMode ? "bg-[#3DDC84]" : "bg-[#0F7A38]"}`} />
            </span>
            Ledger Link Active
          </span> */}

          {/* Minimalist Borderless Darkmode Switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full transition-all duration-300 transform active:scale-95
              ${darkMode ? "text-amber-400 hover:bg-white/5" : "text-zinc-500 hover:bg-black/5"}`}
            aria-label="Toggle structural theme state"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </header>
  );
}

export function NavbarLink() { return null; }

interface FooterProps {
  darkMode?: boolean;
}

export default function Footer({ darkMode = true }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full relative mt-auto overflow-hidden z-10 border-t border-zinc-800/40">
      
      {/* ─── CLASSY, TALL, FAINT DIAMOND LATTICE ─── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.05]">
        <svg width="100%" height="100%">
          <defs>
            {/* 
              Taller aspect ratio (80x140) makes the diamonds elegant & elongated.
              Extremely thin stroke (0.5) gives it that premium "breathing room" look.
            */}
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

      {/*  ELEGANT EDITORIAL ORNAMENT BORDER  */}
      <div className="flex items-center justify-between w-full px-4 md:px-8 text-zinc-400 dark:text-zinc-650">
        {/* Left Wing Line */}
        <div className="flex-grow h-[1px] bg-gradient-to-r from-transparent to-current" />
        
        {/* Centerpiece Diamond Wing Icon */}
        <div className="flex items-center gap-1.5 px-6 py-4 text-xs font-serif tracking-widest opacity-60">
          <span>✦</span>
          <span className="text-[10px]">♦</span>
          <span>✦</span>
        </div>
        
        {/* Right Wing Line */}
        <div className="flex-grow h-[1px] bg-gradient-to-l from-transparent to-current" />
      </div>

      {/*  MAIN FOOTER CONTENT CONTAINER  */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 flex flex-col items-center justify-center relative">
        
        {/*  VERTICAL "BACK TO TOP" BUTTON (FAR RIGHT ON DESKTOP)  */}
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

        {/* ─── CREATOR CREDIT WITH GITHUB AVATAR ─── */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <a 
            href="https://github.com/DaveMatteer" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 cursor-pointer"
          >
            {/* Elegant Circular Frame */}
            <div className="relative w-14 h-14 rounded-full p-[2px] bg-zinc-800/40 group-hover:bg-emerald-500/50 transition-colors duration-500 ease-out shadow-lg">
              <div className="w-full h-full rounded-full overflow-hidden bg-zinc-950">
                <img 
                  src="https://avatars.githubusercontent.com/u/168668156?v=4" 
                  alt="Dave Matteer" 
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 ease-out"
                />
              </div>
            </div>
            
            {/* Signature Text */}
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-zinc-500 group-hover:text-zinc-300 transition-colors duration-300">
              Built by <span className="font-bold text-zinc-400 group-hover:text-emerald-400 transition-colors duration-300">Dave Matteer</span>
            </p>
          </a>
        </div>

        {/* ─── DRAMATIC LOGO / BRAND TEXT ─── */}
        <div className="text-center select-none">
          <h2 className="font-serif text-5xl md:text-6xl tracking-[0.18em] font-normal text-zinc-800 dark:text-zinc-100 ml-[0.18em]">
            SPATIAL
          </h2>
          <p className="font-mono text-[10px] tracking-[0.45em] text-zinc-400 dark:text-zinc-500 uppercase mt-2 ml-[0.45em]">
            Portal Site
          </p>
        </div>

      </div>
    </footer>
  );
}