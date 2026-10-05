import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { MovieCard } from '../components/cards/MovieCard';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/common/SEO';
import { useDiscoverTVShows } from '../hooks/useTMDB';
import { useAmbientCanvas } from '../context/AmbientCanvasContext';
import { getPosterUrl } from '../api/tmdb';

export function AnimePage() {
  const [sortBy, setSortBy] = useState('popularity.desc');
  const { extractAndSetAmbientColor } = useAmbientCanvas();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useDiscoverTVShows({
    with_genres: '16',
    with_original_language: 'ja',
    sort_by: sortBy,
  });

  const allItems = (data?.pages?.flatMap((page: any) => page.results) || []) as Array<{ 
    id: number; 
    title?: string; 
    name?: string; 
    poster_path: string | null; 
    vote_average: number; 
    release_date?: string; 
    first_air_date?: string; 
    media_type?: string 
  }>;

  const leadPoster = allItems[0]?.poster_path;

  // Dynamically sample dominant palette from top anime release
  useEffect(() => {
    if (leadPoster) {
      extractAndSetAmbientColor(getPosterUrl(leadPoster, 'w500'));
    }
  }, [leadPoster, extractAndSetAmbientColor]);

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'first_air_date.desc', label: 'Newest' },
    { value: 'first_air_date.asc', label: 'Oldest' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-16 md:pt-20 pb-36 lg:px-8">
      <SEO
        title="Anime - Watch Free Japanese Anime Series & Movies"
        description="Stream popular Japanese anime series, trending releases, and top-rated movies online for free in HD on CineBai."
      />
      {/* Editorial Header */}
      <div className="mb-8">
        <div className="apple-glass-thin inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold text-amber-300 mb-3 shadow-md">
          <Sparkles size={13} className="text-amber-400" />
          <span>Curated Japanese Animation</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">Anime</h1>
        <p className="mt-2 text-sm md:text-base text-slate-300 max-w-xl">
          Discover top trending releases, seasonal simulcasts, and legendary classics in 4K HDR.
        </p>

        {/* Apple Liquid Glass Sort Controls */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mr-1">Sort:</span>
          {sortOptions.map((opt) => {
            const isActive = sortBy === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'ios-active-lens text-white shadow-md'
                    : 'apple-glass-thin text-slate-300 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
              <Skeleton className="mt-2 h-4 w-3/4 rounded-md" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {allItems.map((item) => (
              <MovieCard
                key={item.id}
                item={{ ...item, media_type: 'tv' } as any}
                size="auto"
              />
            ))}
          </div>

          {/* Load More */}
          {hasNextPage && (
            <div className="mt-12 flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="apple-glass-regular px-8 py-3 rounded-full text-sm font-semibold text-white hover:border-amber-400/50 transition-all"
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
