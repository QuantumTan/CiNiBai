import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Film, Tv, AlertCircle, RefreshCw, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { MovieCard } from '../components/cards/MovieCard';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/common/SEO';
import { useDiscoverMovies, useDiscoverTVShows, useMovieGenres, useTVGenres } from '../hooks/useTMDB';
import { useAmbientStore } from '../stores/ambient';
import { getPosterUrl, getTMDBErrorMessage } from '../api/tmdb';
import { buildBrowseDiscoverParams } from '../lib/browseFilters';

interface BrowsePageProps {
  mediaType: 'movie' | 'tv';
}

const RATING_OPTIONS = [
  { value: '', label: 'Any Rating' },
  { value: '9', label: '9.0+ Masterpiece' },
  { value: '8', label: '8.0+ Great' },
  { value: '7', label: '7.0+ Good' },
  { value: '6', label: '6.0+ Fair' },
  { value: '5', label: '5.0+ All Notable' },
];

export function BrowsePage({ mediaType }: BrowsePageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAllGenres, setShowAllGenres] = useState(false);
  const setColorsFromImage = useAmbientStore((s) => s.setColorsFromImage);

  const genreParam = searchParams.get('genre');
  const parsedGenre = genreParam ? Number(genreParam) : null;
  const selectedGenre = parsedGenre && Number.isFinite(parsedGenre) && parsedGenre > 0 ? parsedGenre : null;
  const sortBy = searchParams.get('sort') || 'popularity.desc';
  const minRating = searchParams.get('rating') || '';
  const selectedYear = searchParams.get('year') || '';

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const recentYears = Array.from({ length: 10 }, (_, idx) => {
      const y = String(currentYear - idx);
      return { value: y, label: y };
    });
    return [
      { value: '', label: 'Any Year' },
      ...recentYears,
      { value: '2020s', label: '2020s' },
      { value: '2010s', label: '2010s' },
      { value: '2000s', label: '2000s' },
      { value: '1990s', label: '1990s' },
      { value: 'classic', label: 'Before 1990' },
    ];
  }, []);

  const updateFilterParam = (key: string, value: string | null) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (!value) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        return next;
      },
      { replace: true }
    );
  };

  const resetAllFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters =
    selectedGenre !== null || minRating !== '' || selectedYear !== '' || sortBy !== 'popularity.desc';

  const { data: movieGenres } = useMovieGenres();
  const { data: tvGenres } = useTVGenres();
  const genres = mediaType === 'movie' ? movieGenres?.genres : tvGenres?.genres;

  const params = buildBrowseDiscoverParams({
    mediaType,
    sortBy,
    genreId: selectedGenre,
    minRating,
    year: selectedYear,
  });

  // Only call the query required for the active mediaType
  const movieQuery = useDiscoverMovies(params, mediaType === 'movie');
  const tvQuery = useDiscoverTVShows(params, mediaType === 'tv');

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
      ? 'Movies - Discover Premier Films'
      : 'TV Shows - Discover Television Series';
  const pageDesc =
    mediaType === 'movie'
      ? 'Browse and discover trending, top-rated, and newly released films with cast and ratings on CineBai.'
      : 'Explore popular TV series, top-rated shows, and season guides on CineBai.';

  const displayedGenres = useMemo(() => {
    if (!genres) return [];
    if (showAllGenres || genres.length <= 8) return genres;
    const first8 = genres.slice(0, 8);
    if (selectedGenre && !first8.some((g) => g.id === selectedGenre)) {
      const selectedObj = genres.find((g) => g.id === selectedGenre);
      if (selectedObj) return [...first8, selectedObj];
    }
    return first8;
  }, [genres, showAllGenres, selectedGenre]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:pt-12 lg:px-8">
      <SEO
        title={pageTitle}
        description={pageDesc}
        url={`https://cinibai.vercel.app/${mediaType === 'movie' ? 'movies' : 'tv'}`}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: pageTitle,
          description: pageDesc,
          url: `https://cinibai.vercel.app/${mediaType === 'movie' ? 'movies' : 'tv'}`,
        }}
      />

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
            {mediaType === 'movie' ? 'the world’s greatest cinema' : 'critically acclaimed series'}.
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
              onClick={() => updateFilterParam('genre', null)}
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
                  onClick={() => updateFilterParam('genre', isSelected ? null : String(genre.id))}
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

        {/* Sort & Rating / Year Filters */}
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="radiogroup"
            aria-label="Sort catalog by"
            className="flex flex-wrap items-center gap-2"
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
                  onClick={() => updateFilterParam('sort', opt.value === 'popularity.desc' ? null : opt.value)}
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

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <label htmlFor="browse-rating-filter" className="text-xs font-semibold text-text-secondary">
                Rating
              </label>
              <select
                id="browse-rating-filter"
                value={minRating}
                onChange={(e) => updateFilterParam('rating', e.target.value || null)}
                className="min-h-[44px] rounded-lg border border-border-default bg-bg-elevated px-3 text-xs font-semibold text-text-primary cursor-pointer hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {RATING_OPTIONS.map((opt) => (
                  <option key={opt.value || 'any-rating'} value={opt.value} className="bg-bg-elevated text-text-primary">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="browse-year-filter" className="text-xs font-semibold text-text-secondary">
                Year
              </label>
              <select
                id="browse-year-filter"
                value={selectedYear}
                onChange={(e) => updateFilterParam('year', e.target.value || null)}
                className="min-h-[44px] rounded-lg border border-border-default bg-bg-elevated px-3 text-xs font-semibold text-text-primary cursor-pointer hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {yearOptions.map((opt) => (
                  <option key={opt.value || 'any-year'} value={opt.value} className="bg-bg-elevated text-text-primary">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1.5 min-h-[44px] rounded-lg border border-border-default bg-white/5 px-3 text-xs font-semibold text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <RotateCcw size={13} aria-hidden="true" />
                <span>Reset</span>
              </button>
            )}
          </div>
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
            {getTMDBErrorMessage(error)}
          </p>
          <Button
            variant="primary"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
            className="mt-6 inline-flex items-center gap-2 min-h-[44px]"
          >
            <RefreshCw size={16} className={query.isFetching ? 'animate-spin' : ''} aria-hidden="true" />
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
            onClick={resetAllFilters}
            className="mt-4"
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && !isError && allItems.length > 0 && (
        <>
          <div 
            role="region"
            aria-label={`${mediaType === 'movie' ? 'Movies' : 'TV Shows'} catalog results`}
            aria-live="polite"
            aria-busy={isLoading || query.isFetchingNextPage}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          >
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
