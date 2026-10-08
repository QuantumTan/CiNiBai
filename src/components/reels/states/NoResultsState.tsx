/**
 * No Results State Component (§3.1 #16, §6.1)
 * Specific editorial copy with single actionable suggestion.
 */
import { Search } from 'lucide-react';

interface NoResultsStateProps {
  query: string;
}

export function NoResultsState({ query }: NoResultsStateProps) {
  return (
    <div className="py-12 px-6 text-center space-y-3">
      <div className="h-10 w-10 mx-auto rounded-full bg-white/[0.04] flex items-center justify-center text-white/48">
        <Search size={18} strokeWidth={1.5} />
      </div>

      <div className="space-y-1">
        <p className="type-label text-white/90">No clips matching "{query}"</p>
        <p className="type-meta text-white/48 max-w-sm mx-auto">
          Try a shorter phrase from a title or caption that is already in the feed.
        </p>
      </div>
    </div>
  );
}
