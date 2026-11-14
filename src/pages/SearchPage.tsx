import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, AlertCircle, RefreshCw, Sparkles, TrendingUp, History, Film, Trash2 } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useInfiniteSearchMulti, useTrendingToday } from '../hooks/useTMDB';
import { useDebounce } from '../hooks/useDebounce';
import { MovieCard } from '../components/cards/MovieCard';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { useAmbientStore } from '../stores/ambient';
import { useRecentSearchesStore } from '../stores/recentSearchesStore';
import { getPosterUrl, getTMDBErrorMessage } from '../api/tmdb';
import {
  trimQuery,
  filterOutPersons,
  formatResultCount,
  getMediaTitle,
  getMediaType,
  getMediaDate,
  getYear,
} from '../lib/utils';

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const trimmedQuery = trimQuery(query);
  const debouncedQuery = useDebounce(trimmedQuery, 300);
  const setColorsFromImage = useAmbientStore((s) => s.setColorsFromImage);
  const recentSearches = useRecentSearchesStore((s) => s.searches);
  const addRecentSearch = useRecentSearchesStore((s) => s.addSearch);
  const clearRecentSearches = useRecentSearchesStore((s) => s.clearSearches);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteSearchMulti(debouncedQuery, 0);

  const {
    data: trendingToday,
    isLoading: trendingLoading,
    isError: trendingTodayError,
    isFetching: trendingTodayFetching,
    error: trendingTodayErr,
    refetch: refetchTrendingToday,
  } = useTrendingToday();

  // Flatten and exclude person results from both count and grid
  const rawResults = data?.pages?.flatMap((page) => page.results) || [];
  const results = filterOutPersons(rawResults);
  const isQueryTooShort = trimmedQuery.length === 1;
  const isDebouncing = trimmedQuery.length >= 2 && trimmedQuery !== debouncedQuery;
  const liveSuggestions = !isDebouncing && trimmedQuery.length >= 2 ? results.slice(0, 6) : [];

  const showLiveDropdown = dropdownOpen && trimmedQuery.length >= 2;
  const showRecentDropdown = dropdownOpen && trimmedQuery.length < 2 && recentSearches.length > 0;
  const isDropdownVisible = showLiveDropdown || showRecentDropdown;
  const navigableCount = showLiveDropdown ? liveSuggestions.length : showRecentDropdown ? recentSearches.length : 0;

  const leadPoster = results[0]?.poster_path || trendingToday?.results?.[0]?.poster_path;

  // Sample ambient color from first search hit or trending lead
  useEffect(() => {
    if (leadPoster) {
      setColorsFromImage(getPosterUrl(leadPoster, 'w500'));
    }
  }, [leadPoster, setColorsFromImage]);

  // Close suggestions dropdown on outside click
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const handleSelectLiveSuggestion = (item: (typeof liveSuggestions)[number]) => {
    const itemTitle = getMediaTitle(item);
    const mediaType = getMediaType(item);
    addRecentSearch(itemTitle);
    setDropdownOpen(false);
    setActiveIndex(-1);
    navigate(`/${mediaType}/${item.id}`);
  };

  const handleSelectRecentSearch = (term: string) => {
    setQuery(term);
    addRecentSearch(term);
    setDropdownOpen(false);
    setActiveIndex(-1);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (isDropdownVisible) {
        e.preventDefault();
        setDropdownOpen(false);
        setActiveIndex(-1);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      if (!dropdownOpen && (trimmedQuery.length >= 2 || recentSearches.length > 0)) {
        e.preventDefault();
        setDropdownOpen(true);
        setActiveIndex(navigableCount > 0 ? 0 : -1);
        return;
      }
      if (isDropdownVisible && navigableCount > 0) {
        e.preventDefault();
        setActiveIndex((prev) => (prev < navigableCount - 1 ? prev + 1 : 0));
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      if (isDropdownVisible && navigableCount > 0) {
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : navigableCount - 1));
      }
      return;
    }

    if (e.key === 'Enter') {
      if (isDropdownVisible && activeIndex >= 0) {
        e.preventDefault();
        if (showLiveDropdown && liveSuggestions[activeIndex]) {
          handleSelectLiveSuggestion(liveSuggestions[activeIndex]);
        } else if (showRecentDropdown && recentSearches[activeIndex]) {
          handleSelectRecentSearch(recentSearches[activeIndex]);
        }
      } else if (trimmedQuery.length >= 2) {
        addRecentSearch(trimmedQuery);
        setDropdownOpen(false);
        setActiveIndex(-1);
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:pt-12 lg:px-8">
      <SEO
        title={
          trimmedQuery
            ? `Search: "${trimmedQuery}" - CineBai`
            : 'Search Movies, Series & Anime - CineBai'
        }
        description="Search for movies, TV series, and anime to find overviews, ratings, and cast details on CineBai."
      />

      <div className="mx-auto max-w-3xl text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-text-primary mb-3">
          Search
        </h1>
        <p className="text-base text-text-secondary">
          Find movies, television series, and anime across the entire library.
        </p>
      </div>

      {/* Accessible Search Combobox + Suggestions Dropdown */}
      <div
        ref={searchContainerRef}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setDropdownOpen(false);
            setActiveIndex(-1);
          }
        }}
        className="relative mx-auto max-w-2xl z-30"
      >
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (trimmedQuery.length >= 2) {
              addRecentSearch(trimmedQuery);
              setDropdownOpen(false);
              setActiveIndex(-1);
            }
          }}
          className="relative flex items-center bg-bg-elevated border border-border-default rounded-lg shadow-md px-4 py-1.5 transition-colors focus-within:ring-2 focus-within:ring-accent"
        >
          <label htmlFor="search" className="sr-only">
            Search movies, television series, and anime
          </label>

          <Search className="text-text-secondary shrink-0 mr-3" size={20} aria-hidden="true" />

          <input
            ref={inputRef}
            id="search"
            type="text"
            inputMode="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isDropdownVisible}
            aria-controls="search-suggestions-listbox"
            aria-activedescendant={
              isDropdownVisible && activeIndex >= 0 ? `search-option-${activeIndex}` : undefined
            }
            enterKeyHint="search"
            autoComplete="off"
            value={query}
            onFocus={() => {
              if (trimmedQuery.length >= 2 || recentSearches.length > 0) {
                setDropdownOpen(true);
              }
            }}
            onChange={(e) => {
              const nextVal = e.target.value;
              setQuery(nextVal);
              setActiveIndex(-1);
              if (nextVal.trim().length >= 2 || recentSearches.length > 0) {
                setDropdownOpen(true);
              } else {
                setDropdownOpen(false);
              }
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search movies, TV series, anime..."
            style={{ outline: 'none' }}
            className="w-full bg-transparent border-none py-2.5 text-base text-text-primary placeholder:text-text-secondary/60"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveIndex(-1);
                setDropdownOpen(recentSearches.length > 0);
                inputRef.current?.focus();
              }}
              className="flex h-11 w-11 items-center justify-center shrink-0 text-text-secondary hover:text-text-primary transition-colors cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Clear search"
              title="Clear search"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </form>

        {/* Live Suggestions / Recent Searches Dropdown */}
        {isDropdownVisible && (
          <div
            id="search-suggestions-listbox"
            role="listbox"
            aria-label={showLiveDropdown ? 'Search suggestions' : 'Recent searches'}
            className="absolute left-0 right-0 mt-2 rounded-xl border border-border-default bg-bg-elevated shadow-2xl overflow-hidden"
          >
            {showLiveDropdown && (
              <>
                {(isDebouncing || isLoading) && liveSuggestions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-text-secondary" role="status">
                    Searching for "{trimmedQuery}"...
                  </div>
                ) : isError ? (
                  <div className="px-4 py-3 text-sm text-error" role="alert">
                    {getTMDBErrorMessage(error)}
                  </div>
                ) : liveSuggestions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-text-secondary">
                    No quick matches for "{trimmedQuery}".
                  </div>
                ) : (
                  <ul className="divide-y divide-border-subtle">
                    {liveSuggestions.map((item, idx) => {
                      const itemTitle = getMediaTitle(item);
                      const mediaType = getMediaType(item);
                      const year = getYear(getMediaDate(item));
                      const posterUrl = getPosterUrl(item.poster_path, 'w92');
                      const isActive = activeIndex === idx;

                      return (
                        <li
                          key={`${mediaType}-${item.id}`}
                          id={`search-option-${idx}`}
                          role="option"
                          aria-selected={isActive}
                          onMouseEnter={() => setActiveIndex(idx)}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelectLiveSuggestion(item)}
                          className={`flex items-center gap-3 px-4 py-2.5 min-h-[44px] cursor-pointer transition-colors ${
                            isActive ? 'bg-accent/20 text-text-primary' : 'hover:bg-white/5 text-text-primary'
                          }`}
                        >
                          <div className="h-12 w-8 shrink-0 overflow-hidden rounded bg-poster-fallback border border-border-subtle flex items-center justify-center">
                            {posterUrl ? (
                              <img src={posterUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <Film size={14} className="text-text-secondary" aria-hidden="true" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-text-primary truncate">{itemTitle}</p>
                            <p className="text-xs text-text-secondary">
                              {mediaType === 'tv' ? 'TV Series' : 'Movie'}
                              {year !== '—' ? ` • ${year}` : ''}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}

            {showRecentDropdown && (
              <div>
                <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle bg-bg-surface/60">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                    <History size={13} className="text-accent" aria-hidden="true" />
                    <span>Recent Searches</span>
                  </span>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      clearRecentSearches();
                      setDropdownOpen(false);
                      setActiveIndex(-1);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-text-primary min-h-[44px] px-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                  >
                    <Trash2 size={12} aria-hidden="true" />
                    <span>Clear recent</span>
                  </button>
                </div>
                <ul className="divide-y divide-border-subtle max-h-80 overflow-y-auto">
                  {recentSearches.map((term, idx) => {
                    const isActive = activeIndex === idx;
                    return (
                      <li
                        key={term}
                        id={`search-option-${idx}`}
                        role="option"
                        aria-selected={isActive}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectRecentSearch(term)}
                        className={`flex items-center gap-3 px-4 py-2.5 min-h-[44px] cursor-pointer transition-colors ${
                          isActive ? 'bg-accent/20 text-text-primary' : 'hover:bg-white/5 text-text-primary'
                        }`}
                      >
                        <History size={15} className="text-text-secondary shrink-0" aria-hidden="true" />
                        <span className="text-sm font-medium truncate">{term}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Container */}
      <div className="mt-10">
        {/* Idle State: Recent Searches + Popular Searches + Trending Now Grid */}
        {!trimmedQuery && (
          <div className="py-6">
            {recentSearches.length > 0 && (
              <section aria-labelledby="recent-searches-heading" className="mx-auto max-w-2xl mb-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-text-secondary font-semibold">
                    <History size={14} className="text-accent" aria-hidden="true" />
                    <h2 id="recent-searches-heading">Recent Searches</h2>
                  </div>
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 min-h-[44px] text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                    <span>Clear recent</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleSelectRecentSearch(term)}
                      className="min-h-[44px] px-4 rounded-full bg-bg-elevated border border-border-default text-xs font-semibold text-text-primary hover:border-border-strong hover:bg-white/10 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </section>
            )}

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
                    onClick={() => {
                      setQuery(suggestion);
                      addRecentSearch(suggestion);
                    }}
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
              ) : trendingTodayError ? (
                <div
                  role="alert"
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-error/30 bg-bg-surface/80 p-5 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error/15 text-error border border-error/20">
                      <AlertCircle size={20} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">Unable to load trending titles</p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {getTMDBErrorMessage(trendingTodayErr)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => refetchTrendingToday()}
                    disabled={trendingTodayFetching}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent text-on-accent text-xs font-semibold hover:bg-accent-light transition-colors min-h-[44px] cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={14} className={trendingTodayFetching ? 'animate-spin' : ''} aria-hidden="true" />
                    <span>Retry</span>
                  </button>
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

        {/* Short Query Hint (1 character) */}
        {isQueryTooShort && (
          <div className="text-center py-12 max-w-md mx-auto">
            <p className="text-sm text-text-secondary">
              Type at least 2 characters to search movies, series, and anime.
            </p>
          </div>
        )}

        {/* Loading Skeleton */}
        {trimmedQuery.length >= 2 && (isDebouncing || isLoading) && (
          <div
            aria-busy="true"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          >
            <span className="sr-only">Searching for "{trimmedQuery}"...</span>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="mt-2 h-4 w-3/4 rounded-md" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {trimmedQuery.length >= 2 && !isDebouncing && isError && (
          <div
            role="alert"
            className="my-12 rounded-lg border border-error/30 bg-bg-surface p-8 text-center shadow-lg max-w-lg mx-auto"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error/20 text-error mb-4">
              <AlertCircle size={24} aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">Couldn't complete search</h2>
            <p className="mt-2 text-sm text-text-secondary">
              {getTMDBErrorMessage(error)}
            </p>
            <Button
              variant="primary"
              onClick={() => refetch()}
              disabled={isFetchingNextPage}
              className="mt-6 inline-flex items-center gap-2 min-h-[44px]"
            >
              <RefreshCw size={16} className={isFetchingNextPage ? 'animate-spin' : ''} aria-hidden="true" />
              <span>Retry Search</span>
            </Button>
          </div>
        )}

        {/* Empty State */}
        {trimmedQuery.length >= 2 && !isDebouncing && !isLoading && !isError && results.length === 0 && (
          <div className="text-center py-16 max-w-md mx-auto">
            <h2 className="text-lg text-text-primary font-semibold">
              No results for "{trimmedQuery}"
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
        {trimmedQuery.length >= 2 && !isDebouncing && !isLoading && !isError && results.length > 0 && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider font-semibold text-text-secondary" aria-live="polite">
                {formatResultCount(results.length)}
              </p>
            </div>

            <div 
              role="region"
              aria-label="Search results"
              aria-live="polite"
              aria-busy={isLoading || isFetchingNextPage}
              onClickCapture={() => {
                if (trimmedQuery.length >= 2) {
                  addRecentSearch(trimmedQuery);
                }
              }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            >
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
