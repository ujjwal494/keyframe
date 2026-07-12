import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import QuestionCard from "@/components/QuestionCard";

export default function Home() {
  const sampleQuestions = [
    {
      id: 1,
      title: "How to achieve this specific 'film halation' effect in DaVinci Resolve without plugins?",
      excerpt: "I've been trying to replicate the red halation effect you get on 16mm film around bright highlights. I know Dehancer does it, but can I build a node tree for this?",
      tags: ["DaVinci Resolve", "Color Grading", "Film Look"],
      author: "ColoristPro",
      upvotes: 342,
      answers: 12,
      timeAgo: "2 hours ago",
      imagePreview: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "After Effects is using 100% of my 64GB RAM and crashing on a simple text animation",
      excerpt: "Ever since the 2024 update, rendering a simple motion blur text layer spikes RAM usage to max and freezes my entire system. Anyone else experiencing this?",
      tags: ["After Effects", "Bug", "Hardware"],
      author: "MotionManiac",
      upvotes: 128,
      answers: 45,
      timeAgo: "5 hours ago",
    },
    {
      id: 3,
      title: "Best workflow for exporting from Premiere to Blender for VFX tracking?",
      excerpt: "I have a sequence cut in Premiere, but I need to track a shot in Blender. Should I render out an EXR sequence or just send a high-quality ProRes?",
      tags: ["Premiere Pro", "Blender", "VFX & Compositing", "Workflow"],
      author: "VFX_Wizard",
      upvotes: 89,
      answers: 8,
      timeAgo: "1 day ago",
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex pt-16">
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 xl:mr-80 p-4 md:p-6 lg:p-8 w-full">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Top Questions
            </h1>
            
            <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-900/80 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-x-auto hide-scrollbar snap-x">
              <button className="px-4 py-1.5 text-sm font-medium rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-transparent whitespace-nowrap snap-start shrink-0">
                Interesting
              </button>
              <button className="px-4 py-1.5 text-sm font-medium rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors whitespace-nowrap snap-start shrink-0">
                Bountied
              </button>
              <button className="px-4 py-1.5 text-sm font-medium rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors whitespace-nowrap snap-start shrink-0">
                Hot
              </button>
              <button className="px-4 py-1.5 text-sm font-medium rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors whitespace-nowrap snap-start shrink-0">
                Week
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {sampleQuestions.map((q) => (
              <QuestionCard key={q.id} {...q} />
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <button className="px-6 py-2.5 text-sm font-medium text-zinc-900 dark:text-white bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-full transition-colors">
              Load More Questions
            </button>
          </div>
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
}
