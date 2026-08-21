"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
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

export default function QuestionDetail() {
  const params = useParams();
  const id = params.id;
  const { data: session } = useSession();

  // Question state
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Answers state
  const [answers, setAnswers] = useState([]);
  const [answersLoading, setAnswersLoading] = useState(true);

  // Answer form state
  const [answerBody, setAnswerBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Accept-answer state
  const [acceptPopupAnswerId, setAcceptPopupAnswerId] = useState(null);
  const [accepting, setAccepting] = useState(false);

  // Derived: is the current user the question author?
  const isQuestionAuthor =
    session?.user?.id &&
    question?.author?._id &&
    session.user.id === question.author._id.toString();

  // Accept/un-accept answer handler
  const handleAcceptAnswer = async (answerId) => {
    setAccepting(true);
    try {
      const res = await fetch(`/api/questions/${id}/answers/${answerId}/accept`, {
        method: "PATCH",
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to accept answer.");
        return;
      }

      // Re-fetch answers to get the updated order
      const refreshRes = await fetch(`/api/questions/${id}/answers`);
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setAnswers(refreshData.answers || []);
      }

      // Also re-fetch the question to update acceptedAnswer reference
      const qRes = await fetch(`/api/questions/${id}`);
      if (qRes.ok) {
        const qData = await qRes.json();
        setQuestion(qData);
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setAccepting(false);
      setAcceptPopupAnswerId(null);
    }
  };

  // Fetch question
  useEffect(() => {
    async function fetchQuestion() {
      try {
        const res = await fetch(`/api/questions/${id}`);
        if (!res.ok) {
          if (res.status === 404) setError("Question not found.");
          else setError("Failed to load question.");
          return;
        }
        const data = await res.json();
        setQuestion(data);
      } catch (err) {
        console.error(err);
        setError("Network error.");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchQuestion();
  }, [id]);

  // Fetch answers once question is loaded
  useEffect(() => {
    async function fetchAnswers() {
      try {
        const res = await fetch(`/api/questions/${id}/answers`);
        if (res.ok) {
          const data = await res.json();
          setAnswers(data.answers || []);
        }
      } catch (err) {
        console.error("Failed to fetch answers:", err);
      } finally {
        setAnswersLoading(false);
      }
    }

    if (question) fetchAnswers();
  }, [question, id]);

  // Submit answer handler
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/questions/${id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: answerBody }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Failed to post answer.");
        setSubmitting(false);
        return;
      }

      // Success: clear the form, show a success message, and add the new answer to the list
      setSubmitSuccess("Your answer has been posted!");
      setAnswerBody("");

      // Re-fetch answers to get the populated author data
      const refreshRes = await fetch(`/api/questions/${id}/answers`);
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setAnswers(refreshData.answers || []);
      }

      // Update the answer count on the question object locally
      setQuestion(prev => ({ ...prev, answerCount: (prev.answerCount || 0) + 1 }));
    } catch (err) {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 min-w-0 lg:ml-64 xl:mr-80 p-4 md:p-6 lg:p-8 w-full flex justify-center">
          <div className="max-w-4xl w-full">
          {loading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
              <div className="h-48 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400">
              <h2 className="text-xl font-bold mb-2">Error</h2>
              <p>{error}</p>
            </div>
          ) : !question ? null : (
            <>
              {/* Question Header */}
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-4 leading-tight break-words">
                  {question.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted border-b border-border pb-4">
                  <span className="flex items-center gap-2">
                    {question.author?.profilePic ? (
                      <img src={question.author.profilePic} alt="avatar" className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                        {(question.author?.displayName || question.author?.username || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                      {question.author?.displayName || question.author?.username || "Unknown"}
                    </span>
                  </span>
                  <span>Asked {formatTimeAgo(question.createdAt)}</span>
                  <span>Viewed {question.views} times</span>
                </div>
              </div>

              {/* Question Body with Voting */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <button className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                  </button>
                  <span className="font-bold text-xl text-zinc-800 dark:text-zinc-200">{question.voteScore || 0}</span>
                  <button className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                </div>

                <div className="flex-1 min-w-0 space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  <p className="whitespace-pre-wrap break-words">{question.body}</p>
                  
                  {question.media?.map((m, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 my-6">
                      {m.type === "image" ? (
                        <img src={m.url} alt={m.alt || "Question media"} className="w-full" />
                      ) : (
                        <video src={m.url} controls className="w-full" />
                      )}
                    </div>
                  ))}

                  {question.tags?.length > 0 && (
                    <div className="flex gap-2 pt-4 flex-wrap">
                      {question.tags.map(tag => (
                        <span key={tag} className="px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-sm text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ==================== ANSWERS SECTION ==================== */}
              <div className="mt-12">
                <h2 className="text-xl font-bold text-foreground mb-6">{question.answerCount || 0} Answers</h2>
                
                {/* Answers List */}
                {answersLoading ? (
                  <div className="space-y-6">
                    {[1, 2].map(i => (
                      <div key={i} className="animate-pulse flex gap-4">
                        <div className="w-10 h-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
                          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : answers.length > 0 ? (
                  <div className="space-y-8">
                    {answers.map((answer) => (
                      <div key={answer._id} className="flex gap-4 relative">
                        {/* Answer Voting + Accept Button */}
                        <div className="flex flex-col items-center gap-1">
                          <button className="text-zinc-500 hover:text-indigo-400 p-1">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                          </button>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{answer.voteScore || 0}</span>
                          <button className="text-zinc-500 hover:text-pink-400 p-1">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </button>

                          {/* Accept button — only visible to question author */}
                          {isQuestionAuthor && (
                            <button
                              id={`accept-btn-${answer._id}`}
                              onClick={() => setAcceptPopupAnswerId(answer._id)}
                              disabled={accepting}
                              title={answer.isAccepted ? "Un-accept this answer" : "Accept this answer"}
                              className={`mt-2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                                answer.isAccepted
                                  ? "bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                                  : "border border-zinc-300 dark:border-zinc-700 text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-500/5"
                              }`}
                            >
                              <svg className="w-5 h-5" fill={answer.isAccepted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}

                          {/* Non-author: show static green checkmark if accepted */}
                          {!isQuestionAuthor && answer.isAccepted && (
                            <div className="mt-2 w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500">
                              <svg className="w-5 h-5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Answer Content */}
                        <div className={`flex-1 min-w-0 glass-card p-5 rounded-xl border ${answer.isAccepted ? "border-emerald-500/30 bg-emerald-500/[0.03]" : "border-zinc-200 dark:border-zinc-800"}`}>
                          {answer.isAccepted && (
                            <div className="flex justify-between items-start mb-4">
                              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-500">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                                Accepted Answer
                              </span>
                            </div>
                          )}
                          <p className="text-zinc-700 dark:text-zinc-300 mb-4 text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {answer.body}
                          </p>

                          {/* Answer Media */}
                          {answer.media?.map((m, idx) => (
                            <div key={idx} className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 my-4">
                              {m.type === "image" ? (
                                <img src={m.url} alt={m.alt || "Answer media"} className="w-full" />
                              ) : (
                                <video src={m.url} controls className="w-full" />
                              )}
                            </div>
                          ))}

                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/50">
                            {answer.author?.profilePic ? (
                              <img src={answer.author.profilePic} alt="avatar" className="w-6 h-6 rounded-full" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                {(answer.author?.displayName || answer.author?.username || "?").charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                              {answer.author?.displayName || answer.author?.username || "Unknown"}
                            </span>
                            <span className="text-xs text-zinc-500">• {formatTimeAgo(answer.createdAt)}</span>
                          </div>
                        </div>

                        {/* ── "Is this answer useful?" Popup ── */}
                        {acceptPopupAnswerId === answer._id && (
                          <>
                            {/* Backdrop */}
                            <div
                              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                              onClick={() => setAcceptPopupAnswerId(null)}
                            />
                            {/* Modal */}
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in">
                                <div className="text-center">
                                  <div className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${
                                    answer.isAccepted
                                      ? "bg-amber-500/10 text-amber-500"
                                      : "bg-emerald-500/10 text-emerald-500"
                                  }`}>
                                    {answer.isAccepted ? (
                                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    ) : (
                                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                                    {answer.isAccepted ? "Remove accepted status?" : "Is this answer useful?"}
                                  </h3>
                                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                                    {answer.isAccepted
                                      ? "This will un-accept the answer and reverse the reputation awarded."
                                      : "Accepting this answer awards +15 reputation to the author and marks it as the best answer."}
                                  </p>
                                  <div className="flex gap-3">
                                    <button
                                      id={`accept-no-${answer._id}`}
                                      onClick={() => setAcceptPopupAnswerId(null)}
                                      disabled={accepting}
                                      className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                      No
                                    </button>
                                    <button
                                      id={`accept-yes-${answer._id}`}
                                      onClick={() => handleAcceptAnswer(answer._id)}
                                      disabled={accepting}
                                      className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-colors disabled:opacity-50 ${
                                        answer.isAccepted
                                          ? "bg-amber-500 hover:bg-amber-600"
                                          : "bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                      }`}
                                    >
                                      {accepting ? "Processing..." : "Yes"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">No answers yet. Be the first to answer!</p>
                )}
                
                {/* ==================== POST ANSWER FORM ==================== */}
                <div className="mt-12 pt-8 border-t border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4">Your Answer</h3>

                  {!session ? (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      You must be <a href="/login" className="text-indigo-500 hover:underline">logged in</a> to post an answer.
                    </p>
                  ) : (
                    <form onSubmit={handleSubmitAnswer}>
                      {submitError && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                          {submitError}
                        </div>
                      )}
                      {submitSuccess && (
                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg text-sm text-green-600 dark:text-green-400">
                          {submitSuccess}
                        </div>
                      )}

                      <div className="border border-zinc-300 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/50 focus-within:border-indigo-500 transition-colors shadow-sm dark:shadow-none">
                        <div className="bg-zinc-100 dark:bg-zinc-800/50 px-4 py-2 flex gap-4 border-b border-zinc-200 dark:border-zinc-800">
                          <button type="button" className="text-muted hover:text-black dark:hover:text-white text-sm font-bold">B</button>
                          <button type="button" className="text-muted hover:text-black dark:hover:text-white text-sm italic">I</button>
                          <button type="button" className="text-muted hover:text-black dark:hover:text-white text-sm font-mono">&lt;&gt;</button>
                          <button type="button" className="text-muted hover:text-black dark:hover:text-white text-sm">Image/Video</button>
                        </div>
                        <textarea 
                          value={answerBody}
                          onChange={(e) => setAnswerBody(e.target.value)}
                          className="w-full h-48 bg-transparent p-4 text-zinc-800 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none resize-y" 
                          placeholder="Write your answer here... You can drag & drop images or videos."
                          required
                        ></textarea>
                      </div>
                      <button 
                        type="submit" 
                        disabled={submitting}
                        className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                      >
                        {submitting ? "Posting..." : "Post Answer"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </>
          )}
          </div>
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
}
