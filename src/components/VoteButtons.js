"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";


export default function VoteButtons({ targetId, initialScore = 0, initialUserVote = 0 }) {
  const { data: session } = useSession();

  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [animating, setAnimating] = useState(null); // "up" | "down" | null
  const [error, setError] = useState("");
  const inflightRef = useRef(false);

  // Sync internal state when the parent's fetched data arrives.
  // useState only reads the initial value on first mount, so when
  // user-votes API resolves *after* VoteButtons has already mounted
  // with initialUserVote=0, we need to push the real value in.
  useEffect(() => {
    setUserVote(initialUserVote);
  }, [initialUserVote]);

  useEffect(() => {
    setScore(initialScore);
  }, [initialScore]);

  const castVote = useCallback(async (value) => {
    if (!session?.user?.id) {
      setError("Log in to vote");
      setTimeout(() => setError(""), 2500);
      return;
    }

    if (inflightRef.current) return; // prevent double-clicks
    inflightRef.current = true;

    // ── Compute optimistic state ──
    const prevScore = score;
    const prevVote = userVote;
    let nextScore = score;
    let nextVote = value;

    if (userVote === value) {
      // Toggle off (undo)
      nextScore = score - value;
      nextVote = 0;
    } else if (userVote === 0) {
      // New vote
      nextScore = score + value;
    } else {
      // Switch (e.g. up→down = -2, down→up = +2)
      nextScore = score + value - userVote;
    }

    // Apply optimistic update
    setScore(nextScore);
    setUserVote(nextVote);
    setAnimating(value === 1 ? "up" : "down");
    setTimeout(() => setAnimating(null), 300);

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId,
          targetType: "Answer",
          value,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Vote failed");
      }

      // Reconcile with server-authoritative score
      if (typeof data.newScore === "number") {
        setScore(data.newScore);
      }
    } catch (err) {
      // Rollback
      setScore(prevScore);
      setUserVote(prevVote);
      setError(err.message || "Vote failed");
      setTimeout(() => setError(""), 3000);
    } finally {
      inflightRef.current = false;
    }
  }, [score, userVote, targetId, session]);

  const isUpvoted = userVote === 1;
  const isDownvoted = userVote === -1;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Upvote */}
      <button
        id={`upvote-${targetId}`}
        onClick={() => castVote(1)}
        aria-label="Upvote"
        className={`
          vote-btn w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
          ${isUpvoted
            ? "bg-indigo-500/15 text-indigo-500 border-2 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.25)]"
            : "border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-indigo-500 hover:border-indigo-500/40 hover:bg-indigo-500/5"
          }
          ${animating === "up" ? "scale-125" : "scale-100"}
        `}
      >
        <svg className="w-5 h-5" fill={isUpvoted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Score */}
      <span className={`
        font-bold text-base tabular-nums transition-colors duration-200
        ${isUpvoted ? "text-indigo-500" : isDownvoted ? "text-pink-500" : "text-zinc-700 dark:text-zinc-300"}
      `}>
        {score}
      </span>

      {/* Downvote */}
      <button
        id={`downvote-${targetId}`}
        onClick={() => castVote(-1)}
        aria-label="Downvote"
        className={`
          vote-btn w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
          ${isDownvoted
            ? "bg-pink-500/15 text-pink-500 border-2 border-pink-500/50 shadow-[0_0_10px_rgba(236,72,153,0.25)]"
            : "border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-pink-500 hover:border-pink-500/40 hover:bg-pink-500/5"
          }
          ${animating === "down" ? "scale-125" : "scale-100"}
        `}
      >
        <svg className="w-5 h-5" fill={isDownvoted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Error toast */}
      {error && (
        <div className="absolute left-14 top-0 z-10 whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 animate-in fade-in slide-in-from-left-2">
          {error}
        </div>
      )}
    </div>
  );
}
