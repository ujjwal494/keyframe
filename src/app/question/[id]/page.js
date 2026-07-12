import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";

export default function QuestionDetail({ params }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 lg:ml-64 xl:mr-80 p-4 md:p-6 lg:p-8 w-full">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-4 leading-tight">
              How to achieve this specific 'film halation' effect in DaVinci Resolve without plugins?
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted border-b border-border pb-4">
              <span className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">C</div>
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">ColoristPro</span>
              </span>
              <span>Asked 2 hours ago</span>
              <span>Viewed 1.2k times</span>
            </div>
          </div>

          <div className="flex gap-4">
            {/* Voting */}
            <div className="flex flex-col items-center gap-2">
              <button className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
              </button>
              <span className="font-bold text-xl text-zinc-800 dark:text-zinc-200">342</span>
              <button className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
            </div>

            {/* Post Content */}
            <div className="flex-1 space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <p>I've been trying to replicate the red halation effect you get on 16mm film around bright highlights. I know Dehancer does it, but can I build a node tree for this?</p>
              
              <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 my-6">
                <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop" alt="Halation Example" className="w-full" />
              </div>
              
              <p>I've already tried blurring the red channel and using a screen blend mode, but it looks too digital. Any advanced tips?</p>

              <div className="flex gap-2 pt-4">
                <span className="px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-sm text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">DaVinci Resolve</span>
                <span className="px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-sm text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">Color Grading</span>
              </div>
            </div>
          </div>

          {/* Answers Section */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-foreground mb-6">12 Answers</h2>
            
            <div className="space-y-8">
              {/* Sample Answer */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <button className="text-zinc-500 hover:text-indigo-400 p-1"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg></button>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">89</span>
                </div>
                <div className="flex-1 glass-card p-5 rounded-xl border border-indigo-500/30">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-indigo-400">Accepted Answer ✓</span>
                    <span className="text-xs text-muted">Answered 1 hour ago</span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 mb-4 text-sm leading-relaxed">
                    Yes, you can build a node tree! The secret is not just blurring the red channel, but qualifying the highlights *first*, then expanding them, and finally applying a custom curve to the blurred red channel before blending it back.
                  </p>
                  <div className="bg-zinc-50 dark:bg-black/50 rounded p-4 font-mono text-xs text-green-700 dark:text-green-400 border border-zinc-200 dark:border-zinc-800 mb-4">
                    Node 1: Base Grade<br/>
                    Node 2: Luma Qualifier (Highs only)<br/>
                    Node 3 (Parallel): Blur Radius 2.5, Red Channel isolation<br/>
                    Node 4: Layer Mixer (Screen mode)<br/>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-800/50">
                    <div className="w-6 h-6 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">NodeMaster99</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Add Answer */}
            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">Your Answer</h3>
              <div className="border border-zinc-300 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/50 focus-within:border-indigo-500 transition-colors shadow-sm dark:shadow-none">
                <div className="bg-zinc-100 dark:bg-zinc-800/50 px-4 py-2 flex gap-4 border-b border-zinc-200 dark:border-zinc-800">
                  <button className="text-muted hover:text-black dark:hover:text-white text-sm font-bold">B</button>
                  <button className="text-muted hover:text-black dark:hover:text-white text-sm italic">I</button>
                  <button className="text-muted hover:text-black dark:hover:text-white text-sm font-mono">&lt;&gt;</button>
                  <button className="text-muted hover:text-black dark:hover:text-white text-sm">Image/Video</button>
                </div>
                <textarea 
                  className="w-full h-48 bg-transparent p-4 text-zinc-800 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none resize-y" 
                  placeholder="Write your answer here... You can drag & drop images or videos."
                ></textarea>
              </div>
              <button className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                Post Answer
              </button>
            </div>
          </div>
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
}
