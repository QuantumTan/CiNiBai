import { useState, useEffect } from 'react';
import { Film, Tv, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { MovieCard } from '../components/cards/MovieCard';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/common/SEO';
import { useDiscoverMovies, useDiscoverTVShows, useMovieGenres, useTVGenres } from '../hooks/useTMDB';
import type { DiscoverParams } from '../api/tmdb';
import { useAmbientStore } from '../stores/ambient';
import { getPosterUrl } from '../api/tmdb';

interface BrowsePageProps {
  mediaType: 'movie' | 'tv';
}

export function BrowsePage({ mediaType }: BrowsePageProps) {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [showAllGenres, setShowAllGenres] = useState(false);
  const setColorsFromImage = useAmbientStore((s) => s.setColorsFromImage);

  const { data: movieGenres } = useMovieGenres();
  const { data: tvGenres } = useTVGenres();
  const genres = mediaType === 'movie' ? movieGenres?.genres : tvGenres?.genres;

  const dateSortDesc = mediaType === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc';
  const dateSortAsc = mediaType === 'movie' ? 'primary_release_date.asc' : 'first_air_date.asc';

  const params: DiscoverParams = {
    sort_by: sortBy === 'date.desc' ? dateSortDesc : sortBy === 'date.asc' ? dateSortAsc : sortBy,
    ...(selectedGenre ? { with_genres: String(selectedGenre) } : {}),
  };

  const movieQuery = useDiscoverMovies(mediaType === 'movie' ? params : {});
  const tvQuery = useDiscoverTVShows(mediaType === 'tv' ? params : {});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query = mediaType === 'movie' ? movieQuery : (tvQuery as any);
  const allItems = (query.data?.pages?.flatMap((page: any) => page.results) || []) as Array<{
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
    media_type?: string;
  }>;
  const isLoading = query.isLoading;
  const isError = query.isError;
  const error = query.error;

  const leadPoster = allItems[0]?.poster_path;

  // Sample ambient color from the lead item
  useEffect(() => {
    if (leadPoster) {
      setColorsFromImage(getPosterUrl(leadPoster, 'w500'));
    }
  }, [leadPoster, setColorsFromImage]);

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'date.desc', label: 'Newest' },
    { value: 'date.asc', label: 'Oldest' },
  ];

  const pageTitle =
    mediaType === 'movie'
      ? 'Movies - Watch HD Movies Online'
      : 'TV Shows - Watch Full Series Online';
  const pageDesc =
    mediaType === 'movie'
      ? 'Browse and watch trending, top-rated, and newly released movies in HD for free on CineBai.'
      : 'Discover and stream popular TV series, top-rated shows, and new episodes for free on CineBai.';

  const displayedGenres =
    genres && !showAllGenres && genres.length > 8 ? genres.slice(0, 8) : genres || [];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:pt-12 lg:px-8">
      <SEO title={pageTitle} description={pageDesc} />

      {/* Editorial Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 border border-accent/40 px-3.5 py-1 text-xs font-semibold text-accent mb-3 shadow-sm">
          {mediaType === 'movie' ? (
            <Film size={13} aria-hidden="true" />
          ) : (
            <Tv size={13} aria-hidden="true" />
          )}
          <span>{mediaType === 'movie' ? 'Premier Feature Films' : 'Curated Television Series'}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-text-primary">
          {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
        </h1>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm md:text-base text-text-secondary max-w-xl">
            Browse and discover{' '}
            {mediaType === 'movie' ? 'the world’s greatest cinema' : 'critically acclaimed series'} in
            HD streaming.
          </p>
          {allItems.length > 0 && !isLoading && (
            <span className="text-xs font-medium text-text-secondary">
              Showing {allItems.length} titles
            </span>
          )}
        </div>

        {/* Genre Chips */}
        <fieldset className="mt-6 border-0 p-0 m-0">
          <legend className="sr-only">Filter by Genre</legend>
          <div role="group" aria-label="Genre filters" className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={selectedGenre === null}
              onClick={() => setSelectedGenre(null)}
              className={`min-h-[44px] px-4 rounded-full text-xs font-semibold cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                selectedGenre === null
                  ? 'bg-accent text-on-accent shadow-sm'
                  : 'bg-white/5 border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong'
              }`}
            >
              All Genres
            </button>
            {displayedGenres.map((genre) => {
              const isSelected = genre.id === selectedGenre;
              return (
                <button
                  key={genre.id}
                  type="button"
                  aria-pressed={isSelected}
                  title={isSelected ? 'Tap again to clear' : undefined}
                  onClick={() => setSelectedGenre(isSelected ? null : genre.id)}
                  className={`min-h-[44px] px-4 rounded-full text-xs font-semibold cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isSelected
                      ? 'bg-accent text-on-accent shadow-sm'
                      : 'bg-white/5 border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong'
                  }`}
                >
                  {genre.name}
                </button>
              );
            })}
            {genres && genres.length > 8 && (
              <button
                type="button"
                onClick={() => setShowAllGenres((prev) => !prev)}
                className="min-h-[44px] px-3.5 rounded-full text-xs font-semibold text-text-secondary hover:text-text-primary border border-border-subtle hover:border-border-default flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>{showAllGenres ? 'Collapse' : `+${genres.length - 8} more`}</span>
                {showAllGenres ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </fieldset>

        {/* Sort Controls */}
        <div
          role="radiogroup"
          aria-label="Sort catalog by"
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <span className="text-xs uppercase tracking-wider text-text-secondary font-semibold mr-1">
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
                className={`min-h-[44px] px-3.5 rounded-full text-xs font-semibold cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
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
          <h2 className="text-lg font-semibold text-text-primary">Failed to load content</h2>
          <p className="mt-2 text-sm text-text-secondary">
            {(error as Error)?.message || 'A network error occurred while querying titles.'}
          </p>
          <Button
            variant="primary"
            onClick={() => query.refetch()}
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
          <span className="sr-only">Loading catalog titles...</span>
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
          <p className="text-base text-text-secondary">No titles found for this filter selection.</p>
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedGenre(null);
              setSortBy('popularity.desc');
            }}
            className="mt-4"
          >
            Reset Filters
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
                item={{ ...item, media_type: mediaType } as any}
                size="auto"
              />
            ))}
          </div>

          {/* Load More */}
          {query.hasNextPage && (
            <div className="mt-12 flex justify-center">
              <Button
                variant="ghost"
                onClick={() => query.fetchNextPage()}
                disabled={query.isFetchingNextPage}
                className="min-h-[44px] px-8 py-3 rounded-md text-sm font-semibold"
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
