/**
 * DramaBox Live Search Modal
 * Searches titles, billionaires, alphas, and themes across the DramaBox catalogue.
 */

import { useState, useEffect } from 'react';
import { Search, X, Layers, Play, RefreshCw } from 'lucide-react';
import { useDramaBoxStore } from '../../stores/dramaboxStore';
import { dramaboxApi } from '../../lib/reels/dramaboxApi';
import type { DramaSeries } from '../../lib/reels/dramaboxTypes';

export function DramaSearchModal() {
  const { isSearchModalOpen, setSearchModalOpen, openPlayerModal } = useDramaBoxStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DramaSeries[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    let isCurrent = true;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await dramaboxApi.searchSeries(trimmed);
        if (isCurrent) {
          setResults(data);
        }
      } finally {
        if (isCurrent) setIsSearching(false);
      }
    }, 200);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Global hotkey ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      } else if (e.key === 'Escape' && isSearchModalOpen) {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, setSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-2xl apple-glass-heavy rounded-3xl border border-white/[0.12] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-white/[0.08]">
          <Search className="w-5 h-5 text-white/48 mr-3 flex-shrink-0" strokeWidth={1.5} />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, billionaires, alphas, revenge..."
            className="flex-1 bg-transparent text-white placeholder-white/30 text-base focus:outline-none"
          />
          {isSearching && (
            <RefreshCw className="w-4 h-4 text-rose-400 animate-spin mr-2 flex-shrink-0" />
          )}
          <button
            type="button"
            onClick={() => setSearchModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {query.trim() && !isSearching && results.length === 0 ? (
            <div className="text-center py-12 type-meta text-white/48">
              No short dramas found matching "{query}".
            </div>
          ) : (
            results.map((series) => (
              <div
                key={series.id}
                onClick={() => {
                  openPlayerModal(series, 1);
                  setSearchModalOpen(false);
                }}
                className="group flex items-center gap-3.5 p-2.5 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/[0.06] transition-all cursor-pointer"
              >
                {/* Poster */}
                <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/10">
                  <img
                    src={series.cover_pic}
                    alt={series.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-5 h-5 fill-white text-white" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors truncate">
                    {series.title}
                  </h4>
                  <div className="flex items-center gap-2 type-meta text-xs text-white/48 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {series.chapter_count} EP
                    </span>
                    {series.theme?.length > 0 && (
                      <>
                        <span>·</span>
                        <span>{series.theme.join(', ')}</span>
                      </>
                    )}
                  </div>
                  {series.description && (
                    <p className="type-body text-xs text-white/40 line-clamp-1 mt-1">
                      {series.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
