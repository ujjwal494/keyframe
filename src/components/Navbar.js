import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import MobileMenu from "./MobileMenu";
import MobileSearchToggle from "./MobileSearchToggle";

export default function Navbar() {
  const isLoggedIn = false; // Mock authentication state

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
      
      {/* Center: Search Bar (Hidden on mobile, expands flexibly on desktop) */}
      <div className="hidden md:flex flex-1 justify-center max-w-2xl px-4 lg:px-8 group">
        <div className="relative w-full max-w-[16rem] lg:max-w-xl">
          <input
            type="text"
            placeholder="Search questions, tools, or tags..."
            className="w-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-full py-2 pl-4 pr-10 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-black/80 transition-all"
          />
          {/* Search Icon */}
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
        {isLoggedIn ? (
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 ml-1 md:ml-2 overflow-hidden shrink-0 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User Avatar" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="flex items-center gap-2 md:gap-3 ml-1 md:ml-2">
            <Link href="/login" className="text-xs md:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors hidden sm:block">
              Log in
            </Link>
            <Link href="/login" className="px-3 py-1.5 md:px-4 md:py-2 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs md:text-sm font-medium rounded-full transition-colors whitespace-nowrap shadow-sm">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
