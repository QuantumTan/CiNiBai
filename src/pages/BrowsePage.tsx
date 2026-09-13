import { useState } from 'react';
import { MovieCard } from '../components/cards/MovieCard';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/common/SEO';
import { useDiscoverMovies, useDiscoverTVShows, useMovieGenres, useTVGenres } from '../hooks/useTMDB';
import type { DiscoverParams } from '../api/tmdb';
import { cn } from '../lib/utils';

interface BrowsePageProps {
  mediaType: 'movie' | 'tv';
}

export function BrowsePage({ mediaType }: BrowsePageProps) {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('popularity.desc');

  const { data: movieGenres } = useMovieGenres();
  const { data: tvGenres } = useTVGenres();
  const genres = mediaType === 'movie' ? movieGenres?.genres : tvGenres?.genres;

  const params: DiscoverParams = {
    sort_by: sortBy,
    ...(selectedGenre ? { with_genres: String(selectedGenre) } : {}),
  };

  const movieQuery = useDiscoverMovies(mediaType === 'movie' ? params : {});
  const tvQuery = useDiscoverTVShows(mediaType === 'tv' ? params : {});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query = mediaType === 'movie' ? movieQuery : tvQuery as any;
  const allItems = (query.data?.pages?.flatMap((page: any) => page.results) || []) as Array<{ id: number; title?: string; name?: string; poster_path: string | null; vote_average: number; release_date?: string; first_air_date?: string; media_type?: string }>;
  const isLoading = query.isLoading;

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'primary_release_date.desc', label: 'Newest' },
    { value: 'primary_release_date.asc', label: 'Oldest' },
  ];

  const pageTitle = mediaType === 'movie' ? 'Movies - Watch HD Movies Online' : 'TV Shows - Watch Full Series Online';
  const pageDesc = mediaType === 'movie'
    ? 'Browse and watch trending, top-rated, and newly released movies in HD for free on CineBai.'
    : 'Discover and stream popular TV series, top-rated shows, and new episodes for free on CineBai.';

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-10 lg:px-8">
      <SEO title={pageTitle} description={pageDesc} />
      {/* Header */}
      <h1 className="text-3xl font-bold text-text-primary mb-2">
        {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
      </h1>
      <p className="text-sm text-text-muted mb-8">
        Browse and discover {mediaType === 'movie' ? 'movies' : 'TV shows'}
      </p>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Genre chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGenre(null)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
              selectedGenre === null
                ? 'bg-gold text-black'
                : 'glass text-text-secondary hover:text-text-primary'
            )}
          >
            All
          </button>
          {genres?.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id === selectedGenre ? null : genre.id)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                genre.id === selectedGenre
                  ? 'bg-gold text-black'
                  : 'glass text-text-secondary hover:text-text-primary'
              )}
            >
              {genre.name}
            </button>
          ))}
        </div>

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
                item={{ ...item, media_type: mediaType } as any}
                size="auto"
              />
            ))}
          </div>

          {/* Load More */}
          {query.hasNextPage && (
            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                onClick={() => query.fetchNextPage()}
                disabled={query.isFetchingNextPage}
              >
                {query.isFetchingNextPage ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
