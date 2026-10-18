import { useState, useEffect } from 'react';
import { Search, X, AlertCircle, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useInfiniteSearchMulti, useTrendingToday } from '../hooks/useTMDB';
import { useDebounce } from '../hooks/useDebounce';
import { MovieCard } from '../components/cards/MovieCard';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { useAmbientStore } from '../stores/ambient';
import { getPosterUrl } from '../api/tmdb';

const SUGGESTIONS = [
  'Interstellar',
  'Breaking Bad',
  'Spirited Away',
  'Dune',
  'Cyberpunk',
  'Arcane',
  'Attack on Titan',
  'Inception',
];

export function SearchPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const setColorsFromImage = useAmbientStore((s) => s.setColorsFromImage);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteSearchMulti(debouncedQuery);

  const { data: trendingToday, isLoading: trendingLoading } = useTrendingToday();

  // Flatten and filter out persons
  const rawResults = data?.pages?.flatMap((page) => page.results) || [];
  const results = rawResults.filter((item) => item.media_type !== 'person');

  const leadPoster = results[0]?.poster_path || trendingToday?.results?.[0]?.poster_path;

  // Sample ambient color from first search hit or trending lead
  useEffect(() => {
    if (leadPoster) {
      setColorsFromImage(getPosterUrl(leadPoster, 'w500'));
    }
  }, [leadPoster, setColorsFromImage]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:pt-12 lg:px-8">
      <SEO
        title={
          debouncedQuery
            ? `Search: "${debouncedQuery}" - CineBai`
            : 'Search Movies, Series & Anime - CineBai'
        }
        description="Search for movies, TV series, and anime to watch online in HD on CineBai."
      />

      <div className="mx-auto max-w-3xl text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-text-primary mb-3">
          Search
        </h1>
        <p className="text-base text-text-secondary">
          Find movies, television series, and anime across the entire library.
        </p>
      </div>

      {/* Accessible Search Form: Single border on wrapper only, borderless inner input */}
      <div className="mx-auto max-w-2xl">
        <form
          role="search"
          onSubmit={(e) => e.preventDefault()}
          className="relative flex items-center bg-bg-elevated border border-border-default rounded-lg shadow-md px-4 py-1.5 transition-colors focus-within:ring-2 focus-within:ring-accent"
        >
          <label htmlFor="search" className="sr-only">
            Search movies, television series, and anime
          </label>

          <Search className="text-text-secondary shrink-0 mr-3" size={20} aria-hidden="true" />

          <input
            id="search"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, TV series, anime..."
            className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 py-2.5 text-base text-text-primary placeholder:text-text-secondary/60"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="flex h-11 w-11 items-center justify-center shrink-0 text-text-secondary hover:text-text-primary transition-colors cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Clear search"
              title="Clear search"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </form>
      </div>

      {/* Results Container */}
      <div className="mt-10">
        {/* Idle State: Popular Searches + Trending Now Grid to eliminate blank gap */}
        {!debouncedQuery && (
          <div className="py-6">
            <div className="mx-auto max-w-xl text-center mb-12">
              <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-text-secondary font-semibold mb-4">
                <Sparkles size={14} className="text-accent" aria-hidden="true" />
                <span>Popular Searches</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setQuery(suggestion)}
                    className="min-h-[44px] px-4 rounded-full bg-white/5 border border-border-default text-xs font-semibold text-text-secondary hover:text-text-primary hover:border-border-strong cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Now Rail of Poster Cards */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-accent" aria-hidden="true" />
                <h2 className="text-lg md:text-xl font-bold font-display tracking-tight text-text-primary">
                  Trending Now
                </h2>
              </div>

              {trendingLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                      <Skeleton className="mt-2 h-4 w-3/4 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {trendingToday?.results?.slice(0, 12).map((item) => (
                    <MovieCard
                      key={`trending-${item.id}`}
                      item={item as any}
                      size="auto"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && debouncedQuery && (
          <div
            aria-busy="true"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          >
            <span className="sr-only">Searching for "{debouncedQuery}"...</span>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="mt-2 h-4 w-3/4 rounded-md" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && debouncedQuery && (
          <div
            role="alert"
            className="my-12 rounded-lg border border-error/30 bg-bg-surface p-8 text-center shadow-lg max-w-lg mx-auto"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error/20 text-error mb-4">
              <AlertCircle size={24} aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">Couldn't complete search</h2>
            <p className="mt-2 text-sm text-text-secondary">
              {(error as Error)?.message || 'A network error occurred while communicating with TMDB.'}
            </p>
            <Button
              variant="primary"
              onClick={() => refetch()}
              className="mt-6 inline-flex items-center gap-2"
            >
              <RefreshCw size={16} aria-hidden="true" />
              <span>Retry Search</span>
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && debouncedQuery && results.length === 0 && (
          <div className="text-center py-16 max-w-md mx-auto">
            <h2 className="text-lg text-text-primary font-semibold">
              No results for "{debouncedQuery}"
            </h2>
            <p className="mt-2 text-base text-text-secondary">
              Check spelling or try searching with another keyword or title.
            </p>
            <Button
              variant="ghost"
              onClick={() => setQuery('')}
              className="mt-6"
            >
              Clear Search
            </Button>
          </div>
        )}

        {/* Populated Results Grid */}
        {!isLoading && !isError && debouncedQuery && results.length > 0 && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider font-semibold text-text-secondary">
                {results.length} matching {results.length === 1 ? 'title' : 'titles'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {results.map((item) => (
                <MovieCard
                  key={`${item.media_type || 'title'}-${item.id}`}
                  item={item as any}
                  size="auto"
                />
              ))}
            </div>

            {/* Pagination Load More */}
            {hasNextPage && (
              <div className="mt-12 flex justify-center">
                <Button
                  variant="ghost"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="min-h-[44px] px-8 py-3 rounded-md text-sm font-semibold"
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load More Results'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
