/**
 * No Results State Component (§3.1 #16, §6.1)
 * Specific editorial copy with single actionable suggestion.
 */
import { Search } from 'lucide-react';

interface NoResultsStateProps {
  query: string;
  onSelectSuggestion: (term: string) => void;
}

export function NoResultsState({ query, onSelectSuggestion }: NoResultsStateProps) {
  return (
    <div className="py-12 px-6 text-center space-y-3">
      <div className="h-10 w-10 mx-auto rounded-full bg-white/[0.04] flex items-center justify-center text-white/48">
        <Search size={18} strokeWidth={1.5} />
      </div>

      <div className="space-y-1">
        <p className="type-label text-white/90">No clips matching "{query}"</p>
        <p className="type-meta text-white/48 max-w-sm mx-auto">
          Try searching by dialogue quote, actor name, or cinematographic style.
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={() => onSelectSuggestion('Nolan')}
          className="apple-glass-thin type-meta px-3 py-1.5 rounded-full text-white/72 hover:text-white transition-colors cursor-pointer"
        >
          Suggested: "Nolan"
        </button>
      </div>
    </div>
  );
}
