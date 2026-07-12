export default function RightSidebar() {
  const topCreators = [
    { name: "Sarah VFX", role: "Compositor", points: "12.4k", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    { name: "Mike Nodes", role: "Colorist", points: "9.2k", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" },
    { name: "PixelPete", role: "Motion Designer", points: "8.1k", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pete" },
  ];

  const activeBounties = [
    { title: "Need help tracking this difficult low-light shot in Mocha", bounty: "+500", tags: ["Tracking", "Mocha Pro"] },
    { title: "Expression to loop animation with slight random variation?", bounty: "+250", tags: ["After Effects", "Expressions"] },
  ];

  return (
    <aside className="w-80 fixed right-0 top-16 bottom-0 overflow-y-auto border-l border-border p-6 hidden xl:block bg-background">
      <div className="space-y-8">
        
        {/* Weekly Challenge */}
        <div className="glass-card rounded-xl p-5 border border-indigo-500/30 relative overflow-hidden group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Weekly Challenge
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
              2d left
            </span>
          </div>
          <h4 className="font-semibold text-zinc-900 dark:text-white mb-2 relative z-10 text-sm">
            Cyberpunk Neon Edit
          </h4>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3 relative z-10">
            Color grade our provided raw footage into a moody, neon-lit cyberpunk scene.
          </p>
          <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors relative z-10 shadow-[0_0_10px_rgba(79,70,229,0.3)]">
            Join Challenge
          </button>
        </div>

        {/* Top Creators */}
        <div>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
            Top Creators this Week
          </h3>
          <ul className="space-y-4">
            {topCreators.map((creator, i) => (
              <li key={creator.name} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden border border-zinc-300 dark:border-zinc-700">
                      <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
                    </div>
                    {i === 0 && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-400 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {creator.name}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{creator.role}</div>
                  </div>
                </div>
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-md">
                  {creator.points}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Active Bounties */}
        <div>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            Active Bounties
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path></svg>
          </h3>
          <div className="space-y-3">
            {activeBounties.map((bounty, i) => (
              <div key={i} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20 px-2 py-0.5 rounded-sm">
                    {bounty.bounty} PTS
                  </span>
                </div>
                <h4 className="text-xs font-medium text-zinc-800 dark:text-zinc-200 mb-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {bounty.title}
                </h4>
                <div className="flex gap-1 flex-wrap">
                  {bounty.tags.map(tag => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Links */}
        <div className="pt-4 border-t border-border flex flex-wrap gap-x-3 gap-y-2 text-[11px] text-zinc-500 dark:text-zinc-500">
          <a href="#" className="hover:text-zinc-800 dark:hover:text-zinc-300">About</a>
          <a href="#" className="hover:text-zinc-800 dark:hover:text-zinc-300">Rules</a>
          <a href="#" className="hover:text-zinc-800 dark:hover:text-zinc-300">Privacy</a>
          <a href="#" className="hover:text-zinc-800 dark:hover:text-zinc-300">Terms</a>
          <span className="w-full mt-1">© 2026 Keyframe</span>
        </div>

      </div>
    </aside>
  );
}
