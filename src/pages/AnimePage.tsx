import { useState } from 'react';
import { MovieCard } from '../components/cards/MovieCard';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/common/SEO';
import { useDiscoverTVShows } from '../hooks/useTMDB';

export function AnimePage() {
  const [sortBy, setSortBy] = useState('popularity.desc');

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useDiscoverTVShows({
    with_genres: '16',
    with_original_language: 'ja',
    sort_by: sortBy,
  });

  const allItems = (data?.pages?.flatMap((page: any) => page.results) || []) as Array<{ id: number; title?: string; name?: string; poster_path: string | null; vote_average: number; release_date?: string; first_air_date?: string; media_type?: string }>;

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'first_air_date.desc', label: 'Newest' },
    { value: 'first_air_date.asc', label: 'Oldest' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-10 lg:px-8">
      <SEO
        title="Anime - Watch Free Japanese Anime Series & Movies"
        description="Stream popular Japanese anime series, trending releases, and top-rated movies online for free in HD on CineBai."
      />
      {/* Header */}
      <h1 className="text-3xl font-bold text-white mb-2">Anime</h1>
      <p className="text-sm text-text-muted mb-8">
        Discover the best Japanese animation
      </p>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Sort */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-white/10 bg-bg-secondary px-3 py-1.5 text-sm text-text-primary focus:border-gold/50 focus:outline-none"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[2/3] w-full rounded-xl" />
              <Skeleton className="mt-2 h-4 w-3/4" />
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
            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
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
