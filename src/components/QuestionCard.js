import Link from "next/link";

export default function QuestionCard({ id, title, excerpt, tags, author, upvotes, answers, timeAgo, imagePreview }) {
  return (
    <article className="p-4 md:p-5 border-b border-border hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors bg-background">
      <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
        {/* Stats (Top/Horizontal on mobile, Left/Vertical on desktop) */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0 sm:min-w-[4rem] sm:pt-1 order-2 sm:order-1 text-xs sm:text-sm">
          {/* Upvotes */}
          <div className="flex sm:flex-col items-center gap-1 text-zinc-900 dark:text-zinc-100 font-medium">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
            </svg>
            <span>{upvotes} <span className="sm:hidden">votes</span></span>
          </div>
          
          {/* Answers */}
          <div className="flex sm:flex-col items-center gap-1 text-zinc-500 dark:text-zinc-400">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <span>{answers} <span className="sm:hidden">answers</span></span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 order-1 sm:order-2">
          <div className="flex items-center gap-2 text-xs text-muted mb-2">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{author}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>

          <Link href={`/question/${id || 1}`}>
            <h2 className="text-lg font-semibold text-blue-600 dark:text-foreground mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer break-words">
              {title}
            </h2>
          </Link>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2 break-words">
            {excerpt}
          </p>

          {imagePreview && (
            <div className="mb-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              <span>{answers} Answers</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
