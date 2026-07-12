"use client";

import { useState } from "react";

export default function MobileSearchToggle() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Search Icon */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white"
        type="button"
        aria-label="Toggle Search"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </button>

      {/* Expandable Search Bar underneath Navbar */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full p-3 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-lg md:hidden z-40 animate-in slide-in-from-top-2">
          <div className="relative">
            <input
              type="text"
              autoFocus
              placeholder="Search Keyframe..."
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}
    </>
  );
}
