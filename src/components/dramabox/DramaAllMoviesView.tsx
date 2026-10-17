/**
 * DramaBox All Dramas / Complete Catalogue View
 * Fully responsive, multi-page catalog (155+ short drama series) with:
 * - Direct numbered pagination (Pages 1 to 7+)
 * - Instant genre/category filter pills (Romance, Billionaire, Werewolf, Revenge, CEO, Mafia)
 * - In-view instant search filter
 * - Optical visionOS liquid glass styling matching CineBai
 */

import { useState, useEffect, useMemo } from 'react';
import { Film, ChevronLeft, ChevronRight, RefreshCw, Search, Sparkles, Filter } from 'lucide-react';
import { dramaboxApi } from '../../lib/reels/dramaboxApi';
import type { DramaSeries } from '../../lib/reels/dramaboxTypes';
import { DramaCard } from './DramaCard';

const CATEGORIES = [
  'All',
  'Trending',
  'Romance',
  'Billionaire',
  'Werewolf & Alpha',
  'Revenge & Rebirth',
  'CEO & Contract',
  'Mafia & Action',
] as const;

export function DramaAllMoviesView() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<DramaSeries[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // In-view filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMovies = async (targetPage: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await dramaboxApi.getAllMovies(targetPage, 24);
      if (res && res.items.length > 0) {
        setItems(res.items);
        setPage(res.page);
        setTotalPages(res.totalPages || Math.ceil(res.total / 24));
        setTotalItems(res.total);
      } else {
        // Fallback
        const fallback = await dramaboxApi.getTrendingSeries();
        if (fallback.length > 0) {
          setItems(fallback.slice((targetPage - 1) * 24, targetPage * 24));
          setTotalPages(Math.max(1, Math.ceil(fallback.length / 24)));
          setTotalItems(fallback.length);
        } else {
          setError('Failed to fetch movies catalogue.');
        }
      }
    } catch {
      setError('Connection interrupted while loading dramas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(page);
  }, [page]);

  // Client-side filtering when user searches or clicks a category on current loaded items or switches page
  const filteredItems = useMemo(() => {
    let result = items;

    if (selectedCategory !== 'All') {
      const catLower = selectedCategory.toLowerCase();
      result = result.filter((item) => {
        const themeMatch = item.theme?.some((t) => t.toLowerCase().includes(catLower));
        const titleMatch = item.title.toLowerCase().includes(catLower);
        const descMatch = item.description?.toLowerCase().includes(catLower);

        if (catLower.includes('werewolf') || catLower.includes('alpha')) {
          return (
            themeMatch ||
            /werewolf|alpha|luna|wolf|vampire/i.test(item.title) ||
            /werewolf|alpha|luna|wolf/i.test(item.description || '')
          );
        }
        if (catLower.includes('billionaire')) {
          return (
            themeMatch ||
            /billionaire|billion|rich|heiress/i.test(item.title) ||
            /billionaire|rich|heiress/i.test(item.description || '')
          );
        }
        if (catLower.includes('revenge')) {
          return (
            themeMatch ||
            /revenge|rebirth|reborn|regret/i.test(item.title) ||
            /revenge|rebirth/i.test(item.description || '')
          );
        }
        if (catLower.includes('ceo')) {
          return (
            themeMatch ||
            /ceo|boss|contract|marriage/i.test(item.title) ||
            /ceo|contract/i.test(item.description || '')
          );
        }
        return themeMatch || titleMatch || descMatch;
      });
    }

    if (searchQuery.trim()) {
      const queryLower = searchQuery.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(queryLower) ||
          item.description?.toLowerCase().includes(queryLower) ||
          item.theme?.some((t) => t.toLowerCase().includes(queryLower))
      );
    }

    return result;
  }, [items, selectedCategory, searchQuery]);

  // Generate numbered pagination buttons
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 7;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, page - 3);
      let end = Math.min(totalPages, start + maxVisible - 1);
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  }, [page, totalPages]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 sm:pb-28 animate-fade-in">
      {/* Header & Meta */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="type-meta text-xs uppercase tracking-wider text-amber-400 font-bold">
                Complete Catalogue
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="text-xs text-white/50">
                {totalItems > 0 ? `${totalItems} Series Available` : '155+ Series'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Film className="w-7 h-7 text-amber-400" strokeWidth={1.5} />
              All Short Dramas
            </h1>
          </div>

          {/* Quick Search inside catalog */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title..."
              className="w-full pl-9 pr-4 py-2 rounded-full apple-glass-thin border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills (Reflow scrollable on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 hide-scrollbar">
          <Filter className="w-4 h-4 text-white/40 shrink-0 mr-1 hidden sm:block" />
          {CATEGORIES.map((cat) => {
            const isCatActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  isCatActive
                    ? 'bg-amber-400 text-black shadow-lg shadow-amber-900/30 font-bold'
                    : 'apple-glass-thin border border-white/10 text-white/70 hover:text-white hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] w-full rounded-2xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="w-full py-16 flex flex-col items-center justify-center text-center p-6 apple-glass-regular rounded-3xl border border-white/10 max-w-md mx-auto">
          <p className="type-meta text-white/72 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => fetchMovies(page)}
            className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="w-full py-20 flex flex-col items-center justify-center text-center p-6 apple-glass-regular rounded-3xl border border-white/10 max-w-md mx-auto">
          <Sparkles className="w-8 h-8 text-amber-400/60 mb-3" />
          <p className="text-white font-semibold mb-1">No dramas found</p>
          <p className="type-meta text-white/50 text-xs mb-4">
            Try adjusting your search query or selecting "All" categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-full apple-glass-thin border border-white/10 text-xs text-white hover:text-amber-300"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
          {filteredItems.map((series) => (
            <DramaCard key={series.id} series={series} />
          ))}
        </div>
      )}

      {/* Robust Pagination Controls (Numbered + Previous/Next) */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-white/[0.08]">
          <span className="type-meta text-xs text-white/50 order-2 sm:order-1">
            Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({totalItems} series)
          </span>

          <div className="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
            {/* Previous Page Button */}
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setPage((p) => Math.max(1, p - 1));
              }}
              className="px-3 py-1.5 rounded-full apple-glass-thin border border-white/10 text-xs font-medium text-white/80 hover:text-white disabled:opacity-20 disabled:pointer-events-none flex items-center gap-1"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Direct Numbered Page Buttons */}
            {pageNumbers.map((p) => {
              const isCurrent = p === page;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setPage(p);
                  }}
                  className={`min-w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-900/30'
                      : 'apple-glass-thin text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            {/* Next Page Button */}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setPage((p) => Math.min(totalPages, p + 1));
              }}
              className="px-3 py-1.5 rounded-full apple-glass-thin border border-white/10 text-xs font-medium text-white/80 hover:text-white disabled:opacity-20 disabled:pointer-events-none flex items-center gap-1"
              aria-label="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
