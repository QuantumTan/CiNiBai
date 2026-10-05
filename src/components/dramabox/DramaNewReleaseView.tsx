/**
 * DramaBox New Releases / Fresh Drops View
 * 1-to-1 match with https://reels.7xmtools.com/new-release/
 */

import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { dramaboxApi } from '../../lib/reels/dramaboxApi';
import type { DramaSeries } from '../../lib/reels/dramaboxTypes';
import { DramaCard } from './DramaCard';

export function DramaNewReleaseView() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<DramaSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadInitial = async () => {
    setIsLoading(true);
    try {
      const res = await dramaboxApi.getNewReleases(1);
      if (res.items.length > 0) {
        setItems(res.items);
      } else {
        const fallback = await dramaboxApi.getTrendingSeries();
        setItems(fallback.slice(0, 24));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await dramaboxApi.getNewReleases(nextPage);
      if (res.items.length > 0) {
        setItems((prev) => [...prev, ...res.items]);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-6 mb-8">
        <span className="type-meta text-xs uppercase tracking-wider text-rose-400 font-semibold mb-1 block">
          Fresh Drops
        </span>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-rose-500" strokeWidth={1.5} />
            New Releases
          </h1>
          <span className="type-meta text-xs text-white/48">
            {items.length} Titles Available
          </span>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl bg-white/[0.04] animate-pulse" />
          ))}
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

      {/* Load More Button */}
      {!isLoading && hasMore && (
        <div className="flex justify-center mt-12">
          <button
            type="button"
            disabled={isLoadingMore}
            onClick={loadMore}
            className="px-8 py-3 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2"
          >
            {isLoadingMore ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
                <span>Loading more...</span>
              </>
            ) : (
              <span>Load More Releases</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
