import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MovieCard } from '../components/cards/MovieCard';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { useDiscoverTVShows, useDiscoverMovies } from '../hooks/useTMDB';

const NETWORKS: Record<string, { name: string; id: string; color: string; bgHover: string }> = {
  netflix: { name: 'Netflix', id: '8', color: 'text-[#E50914]', bgHover: 'hover:border-[#E50914]/50' },
  prime: { name: 'Amazon Prime', id: '9|119', color: 'text-[#00A8E1]', bgHover: 'hover:border-[#00A8E1]/50' },
  disney: { name: 'Disney+', id: '337', color: 'text-[#3070F7]', bgHover: 'hover:border-[#3070F7]/50' },
  apple: { name: 'Apple TV+', id: '350', color: 'text-[#D1D5DB]', bgHover: 'hover:border-white/50' },
  hulu: { name: 'Hulu', id: '15', color: 'text-[#1CE783]', bgHover: 'hover:border-[#1CE783]/50' },
  hbo: { name: 'HBO Max', id: '1899|384', color: 'text-[#9900FF]', bgHover: 'hover:border-[#9900FF]/50' },
  max: { name: 'Max', id: '1899|384', color: 'text-[#002BE7]', bgHover: 'hover:border-[#002BE7]/50' },
};

// Date calculation for latest releases (last 18 months)
const recentDate = new Date();
recentDate.setMonth(recentDate.getMonth() - 18);
const defaultRecentDateStr = recentDate.toISOString().split('T')[0];

export function NetworkPage() {
  const { network } = useParams<{ network: string }>();
  const networkData = network ? NETWORKS[network.toLowerCase()] : null;

  const [mediaType, setMediaType] = useState<'tv' | 'movie'>('tv');
  const [sortOption, setSortOption] = useState<'latest_popular' | 'newest' | 'top_rated' | 'all_time'>('latest_popular');

  // Compute query params based on selected filters
  const getQueryParams = () => {
    const baseParams: Record<string, any> = {
      with_watch_providers: networkData?.id,
      watch_region: 'US',
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
        baseParams['vote_count.gte'] = 5; // filter out unreleased / junk items
      } else {
        baseParams.sort_by = 'primary_release_date.desc';
        baseParams['vote_count.gte'] = 10;
      }
    } else if (sortOption === 'top_rated') {
      baseParams.sort_by = 'vote_average.desc';
      baseParams['vote_count.gte'] = 100;
    } else {
      // all time
      baseParams.sort_by = 'popularity.desc';
    }

    return baseParams;
  };

  const queryParams = getQueryParams();

  const tvQuery = useDiscoverTVShows(mediaType === 'tv' ? queryParams : { page: -1 });
  const movieQuery = useDiscoverMovies(mediaType === 'movie' ? queryParams : { page: -1 });

  const activeQuery = mediaType === 'tv' ? tvQuery : movieQuery;
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = activeQuery;

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
      <div className="pt-32 text-center text-white">
        <h2 className="text-2xl font-bold">Platform Not Found</h2>
        <p className="mt-2 text-text-muted">Please select a valid streaming provider.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-16 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className={`text-4xl font-black tracking-tight ${networkData.color}`}>
              {networkData.name}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold">
              Latest & Trending
            </span>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            Browse the newest releases and top trending titles available on {networkData.name}
          </p>
        </div>

        {/* Media Type Tabs */}
        <div className="flex items-center gap-2 rounded-xl bg-white/5 p-1 ring-1 ring-white/10">
          <button
            onClick={() => setMediaType('tv')}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              mediaType === 'tv'
                ? 'bg-gold text-black shadow-md'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            TV Series
          </button>
          <button
            onClick={() => setMediaType('movie')}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              mediaType === 'movie'
                ? 'bg-gold text-black shadow-md'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            Movies
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Sort By:</span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'latest_popular', label: 'Latest Hits' },
              { id: 'newest', label: 'Newest Released' },
              { id: 'top_rated', label: 'Top Rated' },
              { id: 'all_time', label: 'All-Time Popular' },
            ].map((sort) => (
              <button
                key={sort.id}
                onClick={() => setSortOption(sort.id as any)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  sortOption === sort.id
                    ? 'bg-white/20 text-gold ring-1 ring-gold/40'
                    : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-primary ring-1 ring-white/5'
                }`}
              >
                {sort.label}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-text-muted">
          Showing {allItems.length} titles
        </span>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="flex flex-col">
              <Skeleton className="aspect-[2/3] w-full rounded-xl" />
              <Skeleton className="mt-2 h-4 w-3/4" />
              <Skeleton className="mt-1 h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-text-secondary">No titles found for this filter combination.</p>
          <button
            onClick={() => setSortOption('all_time')}
            className="mt-4 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-black"
          >
            Show All-Time Titles
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {allItems.map((item) => (
              <MovieCard
                key={item.id}
                item={{ ...item, media_type: mediaType } as any}
                size="md"
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="mt-12 flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-8"
              >
                {isFetchingNextPage ? 'Loading more...' : 'Load More Titles'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
