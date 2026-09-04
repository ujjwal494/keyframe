"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatRep(n) {
  if (typeof n !== "number") return "1";
  return n.toLocaleString();
}

/** Returns tier info based on reputation value */
function getRepTier(rep) {
  if (rep >= 1000) return { label: "Gold", color: "from-amber-400 to-yellow-500", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]" };
  if (rep >= 100)  return { label: "Silver", color: "from-zinc-300 to-zinc-400", text: "text-zinc-300", bg: "bg-zinc-400/10", border: "border-zinc-400/30", glow: "shadow-[0_0_20px_rgba(161,161,170,0.3)]" };
  return { label: "Bronze", color: "from-orange-400 to-amber-600", text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", glow: "shadow-[0_0_20px_rgba(251,146,60,0.3)]" };
}

// Gradient palette for avatar fallback
const avatarGradients = [
  "from-indigo-500 to-purple-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-fuchsia-600",
];
function getGradient(name) {
  if (!name) return avatarGradients[0];
  const index = name.charCodeAt(0) % avatarGradients.length;
  return avatarGradients[index];
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/users/${username}`);
        if (!res.ok) {
          if (res.status === 404) setError("User not found.");
          else setError("Failed to load profile.");
          return;
        }
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError("Network error.");
      } finally {
        setLoading(false);
      }
    }

    if (username) fetchProfile();
  }, [username]);

  const user = profile?.user;
  const stats = profile?.stats;
  const tier = user ? getRepTier(user.reputation) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex pt-16">
        <Sidebar />

        <main className="flex-1 min-w-0 lg:ml-64 xl:mr-80 p-4 md:p-6 lg:p-8 w-full flex justify-center">
          <div className="max-w-3xl w-full">
            {loading ? (
              <div className="animate-pulse space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                  <div className="space-y-3 flex-1">
                    <div className="h-7 bg-zinc-200 dark:bg-zinc-800 rounded w-48"></div>
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div>
                  </div>
                </div>
                <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
              </div>
            ) : error ? (
              <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400">
                <h2 className="text-xl font-bold mb-2">Error</h2>
                <p>{error}</p>
              </div>
            ) : user ? (
              <>
                {/* ── Profile Header ── */}
                <div className="glass-card rounded-2xl p-6 md:p-8 mb-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar */}
                    {user.profilePic ? (
                      <div className={`w-24 h-24 rounded-full overflow-hidden border-2 ${tier.border} ${tier.glow} shrink-0`}>
                        <img src={user.profilePic} alt={user.displayName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getGradient(user.displayName)} flex items-center justify-center text-white text-3xl font-bold shrink-0 border-2 ${tier.border} ${tier.glow}`}>
                        {user.displayName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}

                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                        {user.displayName}
                      </h1>
                      <p className="text-sm text-muted mb-3">
                        @{user.username} · Member since {formatDate(user.createdAt)}
                      </p>

                      {/* Reputation Badge */}
                      <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full ${tier.bg} border ${tier.border} ${tier.glow}`}>
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <span className={`text-lg font-bold ${tier.text}`}>{formatRep(user.reputation)}</span>
                        <span className={`text-xs font-medium uppercase tracking-wider ${tier.text} opacity-70`}>{tier.label}</span>
                      </div>

                      {/* Bio */}
                      {user.bio && (
                        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{user.bio}</p>
                      )}

                      {/* Skill Tags */}
                      {user.skillTags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                          {user.skillTags.map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Reputation", value: formatRep(stats.reputation), icon: "★" },
                    { label: "Questions", value: stats.questionCount, icon: "?" },
                    { label: "Answers", value: stats.answerCount, icon: "A" },
                  ].map(s => (
                    <div key={s.label} className="glass-card rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-foreground">{s.value}</div>
                      <div className="text-xs text-muted mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* ── Recent Questions ── */}
                {profile.recentQuestions?.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-bold text-foreground mb-4">Recent Questions</h2>
                    <div className="space-y-3">
                      {profile.recentQuestions.map(q => (
                        <Link
                          key={q._id}
                          href={`/question/${q.slug || q._id}`}
                          className="block glass-card rounded-xl p-4 hover:border-indigo-500/30 transition-all group"
                        >
                          <h3 className="text-sm font-semibold text-foreground group-hover:text-indigo-500 transition-colors line-clamp-2">
                            {q.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                            <span>{q.answerCount || 0} answers</span>
                            <span>•</span>
                            <span>{formatTimeAgo(q.createdAt)}</span>
                            {q.tags?.slice(0, 2).map(t => (
                              <span key={t} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                {t}
                              </span>
                            ))}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Recent Answers ── */}
                {profile.recentAnswers?.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-bold text-foreground mb-4">Recent Answers</h2>
                    <div className="space-y-3">
                      {profile.recentAnswers.map(a => (
                        <Link
                          key={a._id}
                          href={`/question/${a.question?.slug || a.question?._id || ""}`}
                          className={`block glass-card rounded-xl p-4 hover:border-indigo-500/30 transition-all group ${
                            a.isAccepted ? "border-emerald-500/20 bg-emerald-500/[0.02]" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {a.isAccepted && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-500">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                                Accepted
                              </span>
                            )}
                            <span className="text-xs text-muted">
                              on: {a.question?.title || "Deleted question"}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">{a.body}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                            <span>{a.voteScore || 0} votes</span>
                            <span>•</span>
                            <span>{formatTimeAgo(a.createdAt)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state if no activity */}
                {(!profile.recentQuestions?.length && !profile.recentAnswers?.length) && (
                  <div className="text-center py-12 text-muted">
                    <p className="text-lg">No activity yet</p>
                    <p className="text-sm mt-1">This user hasn't posted any questions or answers.</p>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
