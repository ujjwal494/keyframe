"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useAuth } from "@/lib/AuthContext";
import ThemeToggle from "./ThemeToggle";
import MobileMenu from "./MobileMenu";
import MobileSearchToggle from "./MobileSearchToggle";

export default function Navbar() {
  const { user, getInitials } = useAuth();

  // Pick a gradient based on initials for variety
  const avatarGradients = [
    "from-indigo-500 to-purple-600",
    "from-pink-500 to-rose-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-cyan-500 to-blue-600",
    "from-violet-500 to-fuchsia-600",
  ];

  const getGradient = (name) => {
    if (!name) return avatarGradients[0];
    const index = name.charCodeAt(0) % avatarGradients.length;
    return avatarGradients[index];
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-border h-16 flex items-center justify-between px-4 md:px-6 relative">
      {/* Left: Logo & Mobile Menu */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <MobileMenu />
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-pink-500 rotate-45 rounded-sm shadow-[0_0_15px_rgba(99,102,241,0.6)] group-hover:shadow-[0_0_20px_rgba(236,72,153,0.8)] transition-shadow duration-300"></div>
            <div className="absolute inset-1 bg-zinc-950 rotate-45 rounded-[1px]"></div>
            <div className="absolute inset-2 bg-gradient-to-br from-indigo-500 to-pink-500 rotate-45 rounded-[0.5px]"></div>
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground hidden sm:block">
            Keyframe
          </span>
        </Link>
      </div>
      
      {/* Center: Search Bar */}
      <div className="hidden md:flex flex-1 justify-center max-w-2xl px-4 lg:px-8 group">
        <div className="relative w-full max-w-[16rem] lg:max-w-xl">
          <input
            type="text"
            placeholder="Search questions, tools, or tags..."
            className="w-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-full py-2 pl-4 pr-10 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-black/80 transition-all"
          />
          <div className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <MobileSearchToggle />
        <ThemeToggle />

        <button className="text-sm font-medium text-muted hover:text-foreground transition-colors hidden lg:block">
          Explore
        </button>
        <button className="text-sm font-medium text-muted hover:text-foreground transition-colors hidden lg:block">
          Communities
        </button>
        
        <Link href="/ask" className="px-3 md:px-4 py-1.5 md:py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-medium rounded-full transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)] whitespace-nowrap">
          Ask Question
        </Link>

        {user ? (
          <div className="relative group ml-1 md:ml-2">
            {/* Avatar */}
            {user.image ? (
              <div className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-700 overflow-hidden shrink-0 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all">
                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getGradient(user.name)} flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all shadow-md shrink-0`}>
                {getInitials(user.name)}
              </div>
            )}

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  {user.image ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                      <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(user.name)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                      {getInitials(user.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-1.5">
                <button className="w-full text-left px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                  My Profile
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                  My Questions
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                  Settings
                </button>
              </div>
              <div className="p-1.5 border-t border-zinc-100 dark:border-zinc-800">
                <button 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 md:gap-3 ml-1 md:ml-2">
            <Link href="/login" className="text-xs md:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors hidden sm:block">
              Log in
            </Link>
            <Link href="/signup" className="px-3 py-1.5 md:px-4 md:py-2 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs md:text-sm font-medium rounded-full transition-colors whitespace-nowrap shadow-sm">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
