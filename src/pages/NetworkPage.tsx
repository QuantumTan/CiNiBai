import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { MovieCard } from '../components/cards/MovieCard';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/common/SEO';
import { useDiscoverTVShows, useDiscoverMovies } from '../hooks/useTMDB';
import { useAmbientStore } from '../stores/ambient';
import { WATCH_PROVIDER_IDS, WATCH_REGION, getTMDBErrorMessage } from '../api/tmdb';
import { NETWORK_BRAND_COLORS } from '../lib/constants';
import { formatShowingCount } from '../lib/utils';
import type { RGBColor } from '../lib/color';

interface NetworkConfig {
  name: string;
  id: string;
  colorClass: string;
  rgb: RGBColor;
}

// Single source of truth for platform identity & branding colors
const NETWORKS: Record<string, NetworkConfig> = {
  netflix: { name: 'Netflix', id: WATCH_PROVIDER_IDS.NETFLIX, ...NETWORK_BRAND_COLORS.netflix },
  prime: { name: 'Amazon Prime', id: WATCH_PROVIDER_IDS.PRIME_VIDEO, ...NETWORK_BRAND_COLORS.prime },
  disney: { name: 'Disney+', id: WATCH_PROVIDER_IDS.DISNEY_PLUS, ...NETWORK_BRAND_COLORS.disney },
  apple: { name: 'Apple TV+', id: WATCH_PROVIDER_IDS.APPLE_TV, ...NETWORK_BRAND_COLORS.apple },
  hulu: { name: 'Hulu', id: WATCH_PROVIDER_IDS.HULU, ...NETWORK_BRAND_COLORS.hulu },
  hbo: { name: 'HBO', id: WATCH_PROVIDER_IDS.HBO, ...NETWORK_BRAND_COLORS.hbo },
  max: { name: 'Max', id: WATCH_PROVIDER_IDS.MAX, ...NETWORK_BRAND_COLORS.max },
};

// Date calculation for latest releases (last 18 months)
const recentDate = new Date();
recentDate.setMonth(recentDate.getMonth() - 18);
const defaultRecentDateStr = recentDate.toISOString().split('T')[0];

export function NetworkPage() {
  const { network } = useParams<{ network: string }>();
  const networkData = network ? NETWORKS[network.toLowerCase()] : null;
  const setSingleColor = useAmbientStore((s) => s.setSingleColor);

  const [mediaType, setMediaType] = useState<'tv' | 'movie'>('tv');
  const [sortOption, setSortOption] = useState<'latest_popular' | 'newest' | 'top_rated' | 'all_time'>('latest_popular');

  // Activate network signature atmospheric illumination
  useEffect(() => {
    if (networkData) {
      setSingleColor(networkData.rgb);
    }
  }, [networkData, setSingleColor]);

  // Compute query params based on selected filters
  const getQueryParams = () => {
    const baseParams: Record<string, any> = {
      with_watch_providers: networkData?.id,
      watch_region: WATCH_REGION,
    };

    if (sortOption === 'latest_popular') {
      baseParams.sort_by = 'popularity.desc';
      if (mediaType === 'tv') {
        baseParams['first_air_date.gte'] = defaultRecentDateStr;
      } else {
        baseParams['primary_release_date.gte'] = defaultRecentDateStr;
      }
    } else if (sortOption === 'newest') {
      if (mediaType === 'tv') {
        baseParams.sort_by = 'first_air_date.desc';
        baseParams['vote_count.gte'] = 5;
      } else {
        baseParams.sort_by = 'primary_release_date.desc';
        baseParams['vote_count.gte'] = 10;
      }
    } else if (sortOption === 'top_rated') {
      baseParams.sort_by = 'vote_average.desc';
      baseParams['vote_count.gte'] = 100;
    } else {
      baseParams.sort_by = 'popularity.desc';
    }

    return baseParams;
  };

  const queryParams = getQueryParams();

  // Call only the active discover hook using the enabled flag
  const tvQuery = useDiscoverTVShows(queryParams, mediaType === 'tv' && !!networkData);
  const movieQuery = useDiscoverMovies(queryParams, mediaType === 'movie' && !!networkData);

  const activeQuery = mediaType === 'tv' ? tvQuery : movieQuery;
  const { data, isLoading, isError, isFetching, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = activeQuery;

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

  if (!networkData) {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-16 md:pt-24 text-center">
        <SEO
          title="Network Not Found - CineBai"
          description="The requested studio network catalog could not be found on CineBai."
          url="https://cinibai.vercel.app/networks"
          schema={{
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Network Not Found - CineBai',
            url: 'https://cinibai.vercel.app/networks',
          }}
        />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error/10 text-error mb-4">
          <AlertCircle size={32} aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold font-display text-text-primary">Platform Not Found</h1>
        <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
          We couldn't locate this network. Please select an available studio provider from our catalog.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/">
            <Button variant="primary">Back to Home</Button>
          </Link>
          <Link to="/movies">
            <Button variant="ghost">Browse Movies</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:pt-12 lg:px-8">
      <SEO
        title={`${networkData.name} - Browse Catalog Titles`}
        description={`Explore the newest releases and catalog titles available on ${networkData.name} on CineBai.`}
        url={`https://cinibai.vercel.app/networks/${network}`}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${networkData.name} - Catalog Titles`,
          description: `Explore the newest releases and catalog titles available on ${networkData.name} on CineBai.`,
          url: `https://cinibai.vercel.app/networks/${network}`,
        }}
      />

      {/* Back Link */}
      <div className="mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md py-1 px-1.5"
          aria-label="Back to browse catalog"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Browse</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 border-b border-border-subtle pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className={`text-4xl md:text-5xl font-bold font-display tracking-tight ${networkData.colorClass}`}>
              {networkData.name}
            </h1>
            <span className="rounded-full bg-accent/20 border border-accent/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent shadow-sm">
              Featured Studio
            </span>
          </div>
          <p className="mt-2 text-sm md:text-base text-text-secondary">
            Browse premier releases and catalog titles available on {networkData.name}
          </p>
        </div>

        {/* Media Type Tabs */}
        <div role="tablist" aria-label="Media format" className="flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-border-default">
          <button
            type="button"
            role="tab"
            aria-selected={mediaType === 'tv'}
            onClick={() => setMediaType('tv')}
            className={`min-h-[44px] rounded-full px-4 text-xs font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              mediaType === 'tv'
                ? 'bg-accent text-on-accent shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            TV Series
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mediaType === 'movie'}
            onClick={() => setMediaType('movie')}
            className={`min-h-[44px] rounded-full px-4 text-xs font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              mediaType === 'movie'
                ? 'bg-accent text-on-accent shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Movies
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Sort By:</span>
          <div role="radiogroup" aria-label="Sort titles" className="flex flex-wrap gap-2">
            {[
              { id: 'latest_popular', label: 'Latest Hits' },
              { id: 'newest', label: 'Newest Released' },
              { id: 'top_rated', label: 'Top Rated' },
              { id: 'all_time', label: 'All-Time Popular' },
            ].map((sort) => {
              const isSelected = sortOption === sort.id;
              return (
                <button
                  key={sort.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSortOption(sort.id as any)}
                  className={`min-h-[44px] rounded-full px-3.5 text-xs font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isSelected
                      ? 'bg-accent text-on-accent shadow-sm'
                      : 'bg-white/5 border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong'
                  }`}
                >
                  {sort.label}
                </button>
              );
            })}
          </div>
        </div>

        {allItems.length > 0 && !isLoading && (
          <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider" aria-live="polite">
            {formatShowingCount(allItems.length, data?.pages?.[0]?.total_results)}
          </span>
        )}
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
          <h2 className="text-lg font-semibold text-text-primary">Unable to load studio titles</h2>
          <p className="mt-2 text-sm text-text-secondary">
            {getTMDBErrorMessage(error)}
          </p>
          <Button
            variant="primary"
            onClick={() => refetch()}
            disabled={isFetching}
            className="mt-6 inline-flex items-center gap-2 min-h-[44px]"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} aria-hidden="true" />
            <span>Try Again</span>
          </Button>
        </div>
      )}

      {/* Results Grid */}
      {isLoading ? (
        <div
          aria-busy="true"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        >
          <span className="sr-only">Loading {networkData.name} titles...</span>
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="flex flex-col">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <Skeleton className="mt-2 h-4 w-3/4 rounded-md" />
              <Skeleton className="mt-1 h-3 w-1/2 rounded-md" />
            </div>
          ))}
        </div>
      ) : !isError && allItems.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-base text-text-secondary">No titles found for this filter combination.</p>
          <Button
            variant="ghost"
            onClick={() => setSortOption('all_time')}
            className="mt-4"
          >
            Show All-Time Titles
          </Button>
        </div>
      ) : (
        !isError && (
          <>
            <div 
              role="region"
              aria-label={`${networkData.name} catalog results`}
              aria-live="polite"
              aria-busy={isLoading || isFetchingNextPage}
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

            {/* Load More Button */}
            {hasNextPage && (
              <div className="mt-12 flex justify-center">
                <Button
                  variant="ghost"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="min-h-[44px] px-8 py-3 rounded-md text-sm font-semibold"
                >
                  {isFetchingNextPage ? 'Loading more...' : 'Load More Titles'}
                </Button>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}
