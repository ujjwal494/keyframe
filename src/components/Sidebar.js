import { TOOLS, TOPICS } from "@/lib/constants";

export default function Sidebar() {
  return (
    <aside className="w-64 fixed left-0 top-16 bottom-0 overflow-y-auto border-r border-border p-6 hidden lg:block">
      <div className="space-y-8">
        <div>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
            Popular Software
          </h3>
          <ul className="space-y-3">
            {TOOLS.map((tool) => (
              <li key={tool.name}>
                <a href="#" className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white group transition-colors">
                  <div className="w-5 h-5 flex items-center justify-center relative">
                    <img 
                      src={tool.src} 
                      alt={tool.name} 
                      className="w-4 h-4 opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-300" 
                    />
                  </div>
                  {tool.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
            Trending Topics
          </h3>
          <ul className="space-y-2">
            {TOPICS.map((topic) => (
              <li key={topic}>
                <a href="#" className="block py-1.5 px-3 -mx-3 rounded-md text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-black dark:hover:text-white transition-colors">
                  # {topic}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
