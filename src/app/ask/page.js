import Navbar from "@/components/Navbar";

export default function AskQuestion() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Ask a Question</h1>
        <p className="text-muted mb-8 text-sm">
          Get help from the community. Be specific and include software versions, screenshots, or screen recordings if applicable.
        </p>

        <form className="space-y-8">
          <div className="glass-card p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">
              Title
            </label>
            <p className="text-xs text-zinc-500 mb-3">Be specific and imagine you’re asking a question to another creative professional.</p>
            <input 
              type="text" 
              placeholder="e.g. How to export transparent WebM from After Effects for a website?"
              className="w-full bg-white dark:bg-black/50 border border-zinc-300 dark:border-zinc-700 rounded-md px-4 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner dark:shadow-none"
            />
          </div>

          <div className="glass-card p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">
              Details & Context
            </label>
            <p className="text-xs text-zinc-500 mb-3">Introduce the problem, expand on what you've already tried, and upload media.</p>
            
            <div className="border border-zinc-300 dark:border-zinc-700 rounded-md overflow-hidden bg-white dark:bg-black/50 focus-within:border-indigo-500 transition-all shadow-inner dark:shadow-none">
              <div className="bg-zinc-100 dark:bg-zinc-800/80 px-4 py-2.5 flex gap-4 border-b border-zinc-300 dark:border-zinc-700">
                <button type="button" className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white font-bold px-1">B</button>
                <button type="button" className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white italic px-1">I</button>
                <button type="button" className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white font-mono px-1">&lt;&gt;</button>
                <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-700 mx-2 self-center"></div>
                <button type="button" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  Upload Media
                </button>
              </div>
              <textarea 
                className="w-full h-64 bg-transparent p-4 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none resize-y" 
                placeholder="Describe your issue... (Markdown supported)"
              ></textarea>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">
              Tags
            </label>
            <p className="text-xs text-zinc-500 mb-3">Add up to 5 tags to describe what your question is about. Start typing to see suggestions.</p>
            <input 
              type="text" 
              placeholder="e.g. after-effects, rendering, error-code-160"
              className="w-full bg-white dark:bg-black/50 border border-zinc-300 dark:border-zinc-700 rounded-md px-4 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner dark:shadow-none"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" className="px-6 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors">
              Save Draft
            </button>
            <button type="button" className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              Post Your Question
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
