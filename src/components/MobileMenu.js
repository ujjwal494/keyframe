"use client";

import { useState } from "react";
import Link from "next/link";
import { TOOLS, TOPICS } from "@/lib/constants";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white"
        type="button"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Slide-out Drawer */}
          <div className="relative w-[85vw] max-w-sm h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <span className="font-bold text-lg text-zinc-900 dark:text-white">Keyframe</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 -mr-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-6">
              <div className="flex flex-col gap-3">
                <Link href="/" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setIsOpen(false)}>Explore</Link>
                <Link href="/" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setIsOpen(false)}>Communities</Link>
              </div>

              <div>
                <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3">Popular Software</h3>
                <div className="flex flex-col gap-3">
                  {TOOLS.map((tool) => (
                    <a href="#" key={tool.name} className="flex items-center gap-3 text-sm text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setIsOpen(false)}>
                      <img src={tool.src} alt={tool.name} className="w-4 h-4 rounded-sm" />
                      <span className="font-medium">{tool.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3">Trending Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((topic) => (
                    <a href="#" key={topic} className="py-1 px-2 rounded bg-zinc-100 dark:bg-zinc-800/80 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700" onClick={() => setIsOpen(false)}>
                      #{topic}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
              <Link href="/ask" className="block text-center w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors" onClick={() => setIsOpen(false)}>
                Ask Question
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
