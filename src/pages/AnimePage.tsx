import { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { MovieCard } from '../components/cards/MovieCard';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/common/SEO';
import { useDiscoverTVShows } from '../hooks/useTMDB';
import { useAmbientStore } from '../stores/ambient';
import { getPosterUrl } from '../api/tmdb';

export function AnimePage() {
  const [sortBy, setSortBy] = useState('popularity.desc');
  const setColorsFromImage = useAmbientStore((s) => s.setColorsFromImage);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDiscoverTVShows({
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
    media_type?: string;
  }>;

  const leadPoster = allItems[0]?.poster_path;

  // Dynamically sample dominant palette from top anime release
  useEffect(() => {
    if (leadPoster) {
      setColorsFromImage(getPosterUrl(leadPoster, 'w500'));
    }
  }, [leadPoster, setColorsFromImage]);

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'first_air_date.desc', label: 'Newest' },
    { value: 'first_air_date.asc', label: 'Oldest' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:pt-12 lg:px-8">
      <SEO
        title="Anime - Watch Free Japanese Anime Series & Movies"
        description="Stream popular Japanese anime series, trending releases, and top-rated movies online for free in HD on CineBai."
      />

      {/* Editorial Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 border border-accent/40 px-3.5 py-1 text-xs font-semibold text-accent mb-3 shadow-sm">
          <Sparkles size={13} aria-hidden="true" />
          <span>Curated Japanese Animation</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-text-primary">
          Anime
        </h1>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm md:text-base text-text-secondary max-w-xl">
            Discover top trending releases, seasonal simulcasts, and legendary classics.
          </p>
          {allItems.length > 0 && !isLoading && (
            <span className="text-xs font-medium text-text-muted">
              Showing {allItems.length} titles
            </span>
          )}
        </div>

        {/* Sort Controls */}
        <div
          role="radiogroup"
          aria-label="Sort anime by"
          className="mt-6 flex flex-wrap items-center gap-2"
        >
          <span className="text-xs uppercase tracking-wider text-text-muted font-semibold mr-1">
            Sort:
          </span>
          {sortOptions.map((opt) => {
            const isActive = sortBy === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setSortBy(opt.value)}
                className={`min-h-[44px] px-4 rounded-full text-xs font-semibold cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive
                    ? 'bg-accent text-on-accent shadow-sm'
                    : 'bg-white/5 border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div
          role="alert"
          className="my-12 rounded-lg border border-error/30 bg-bg-surface p-8 text-center shadow-lg max-w-lg mx-auto"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error/20 text-error mb-4">
            <AlertCircle size={24} aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary">Unable to load anime</h2>
          <p className="mt-2 text-sm text-text-secondary">
            {(error as Error)?.message || 'A network error occurred while fetching titles.'}
          </p>
          <Button
            variant="primary"
            onClick={() => refetch()}
            className="mt-6 inline-flex items-center gap-2"
          >
            <RefreshCw size={16} aria-hidden="true" />
            <span>Try Again</span>
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div
          aria-busy="true"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        >
          <span className="sr-only">Loading anime titles...</span>
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <Skeleton className="mt-2 h-4 w-3/4 rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && allItems.length === 0 && (
        <div className="my-16 text-center">
          <p className="text-base text-text-secondary">No anime titles found for this filter.</p>
          <Button
            variant="ghost"
            onClick={() => setSortBy('popularity.desc')}
            className="mt-4"
          >
            Reset Sort
          </Button>
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && !isError && allItems.length > 0 && (
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
                variant="ghost"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="min-h-[44px] px-8 py-3 rounded-md text-sm font-semibold"
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
