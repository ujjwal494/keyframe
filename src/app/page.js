import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import QuestionCard from "@/components/QuestionCard";
import QuestionRepository from "@/lib/questionRepository";

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

export default async function Home() {
  // Fetch real questions from MongoDB
  let dbQuestions = [];
  try {
    const result = await QuestionRepository.list({ limit: 10 });
    dbQuestions = result.questions || [];
  } catch (error) {
    console.error("Failed to fetch questions for homepage:", error);
  }

  // Format the real questions to match the UI component's expected props
  const formattedRealQuestions = dbQuestions.map((q) => ({
    id: q.slug || q._id.toString(),
    title: q.title,
    excerpt: q.body,
    tags: q.tags || [],
    author: q.author?.displayName || q.author?.username || "Unknown",
    upvotes: q.voteScore || 0,
    answers: q.answerCount || 0,
    timeAgo: formatTimeAgo(q.createdAt),
    imagePreview: q.media && q.media.length > 0 ? q.media[0].url : null,
  }));

  // Hardcoded dummy questions for design filler
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

  // Combine real and sample questions
  const allQuestions = [...formattedRealQuestions, ...sampleQuestions];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex pt-16">
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 min-w-0 lg:ml-64 xl:mr-80 p-4 md:p-6 lg:p-8 w-full flex justify-center">
          <div className="max-w-4xl w-full">
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
              {allQuestions.map((q) => (
                <QuestionCard key={q.id} {...q} />
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <button className="px-6 py-2.5 text-sm font-medium text-zinc-900 dark:text-white bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-full transition-colors">
                Load More Questions
              </button>
            </div>
          </div>
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
}
