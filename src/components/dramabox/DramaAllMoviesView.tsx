/**
 * DramaBox All Dramas / All Movies View
 * 1-to-1 match with https://reels.7xmtools.com/all-movies/
 */

import { useState, useEffect } from 'react';
import { Film, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { dramaboxApi } from '../../lib/reels/dramaboxApi';
import type { DramaSeries } from '../../lib/reels/dramaboxTypes';
import { DramaCard } from './DramaCard';

export function DramaAllMoviesView() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<DramaSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = async (targetPage: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await dramaboxApi.getAllMovies(targetPage);
      if (res.items.length > 0) {
        setItems(res.items);
        setPage(targetPage);
      } else {
        // If all-movies is temporarily down, fallback to trending for smooth catalog
        const fallback = await dramaboxApi.getTrendingSeries();
        if (fallback.length > 0) {
          setItems(fallback.slice((targetPage - 1) * 24, targetPage * 24));
        } else {
          setError('Failed to fetch movies catalogue. Upstream service might be busy.');
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6 mb-8">
        <div>
          <span className="type-meta text-xs uppercase tracking-wider text-rose-400 font-semibold mb-1 block">
            Complete Catalogue
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Film className="w-7 h-7 text-rose-500" strokeWidth={1.5} />
            All Short Dramas
          </h1>
        </div>

        {/* Pagination Top Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={page <= 1 || isLoading}
            onClick={() => fetchMovies(page - 1)}
            className="px-3.5 py-1.5 rounded-full apple-glass-thin border border-white/10 text-xs font-medium text-white/80 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="type-meta text-xs text-white/60 tabular-nums">
            Page {page}
          </span>
          <button
            type="button"
            disabled={isLoading || items.length === 0}
            onClick={() => fetchMovies(page + 1)}
            className="px-3.5 py-1.5 rounded-full apple-glass-thin border border-white/10 text-xs font-medium text-white/80 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="w-full py-16 flex flex-col items-center justify-center text-center p-6 apple-glass-regular rounded-3xl border border-white/10 max-w-md mx-auto">
          <p className="type-meta text-white/72 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => fetchMovies(page)}
            className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {items.map((series) => (
            <div key={series.id} className="flex justify-center">
              <DramaCard series={series} />
            </div>
          ))}
        </div>
      )}

      {/* Bottom Pagination */}
      {!isLoading && !error && items.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-white/[0.08]">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              fetchMovies(page - 1);
            }}
            className="px-5 py-2.5 rounded-full apple-glass-regular border border-white/10 text-xs font-semibold text-white hover:border-white/30 disabled:opacity-30"
          >
            Previous Page
          </button>
          <span className="type-meta text-xs text-white/60">Page {page}</span>
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              fetchMovies(page + 1);
            }}
            className="px-5 py-2.5 rounded-full apple-glass-regular border border-white/10 text-xs font-semibold text-white hover:border-white/30"
          >
            Next Page
          </button>
        </div>
      )}
    </div>
  );
}
