import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  getTrending,
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getPopularTVShows,
  getTopRatedTVShows,
  getMovieDetails,
  getTVDetails,
  getTVSeasonDetails,
  getWatchProviders,
  searchMulti,
  getMovieGenres,
  getTVGenres,
  discoverMovies,
  discoverTVShows,
  ANIME_GENRE_ID,
  JAPANESE_LANG,
  WATCH_REGION,
  WATCH_PROVIDER_IDS,
} from '../api/tmdb';
import type { DiscoverParams } from '../api/tmdb';
import { STALE_TIMES } from '../lib/constants';
import { useDebounce } from './useDebounce';

// --- Trending ---
export function useTrending(
  mediaType: 'all' | 'movie' | 'tv' = 'all',
  timeWindow: 'day' | 'week' = 'week',
  enabled = true,
) {
  return useQuery({
    queryKey: ['trending', mediaType, timeWindow],
    queryFn: () => getTrending(mediaType, timeWindow),
    staleTime: STALE_TIMES.trending,
    enabled,
  });
}

// --- Movies ---
export function usePopularMovies(enabled = true) {
  return useQuery({
    queryKey: ['movies', 'popular'],
    queryFn: () => getPopularMovies(),
    staleTime: STALE_TIMES.popular,
    enabled,
  });
}

export function useTopRatedMovies(enabled = true) {
  return useQuery({
    queryKey: ['movies', 'topRated'],
    queryFn: () => getTopRatedMovies(),
    staleTime: STALE_TIMES.popular,
    enabled,
  });
}

export function useNowPlayingMovies(enabled = true) {
  return useQuery({
    queryKey: ['movies', 'nowPlaying'],
    queryFn: () => getNowPlayingMovies(),
    staleTime: STALE_TIMES.popular,
    enabled,
  });
}

export function useTrendingToday(enabled = true) {
  return useQuery({
    queryKey: ['trending', 'all', 'day'],
    queryFn: () => getTrending('all', 'day'),
    staleTime: STALE_TIMES.trending,
    enabled,
  });
}

// Get the date 1 year ago to filter out ancient shows
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
const recentDateStr = oneYearAgo.toISOString().split('T')[0];

export function useNetflixOriginals(enabled = true) {
  return useQuery({
    queryKey: ['tv', 'netflix', 'recent'],
    queryFn: () => discoverTVShows({ with_watch_providers: WATCH_PROVIDER_IDS.NETFLIX, watch_region: WATCH_REGION, sort_by: 'popularity.desc', 'first_air_date.gte': recentDateStr }),
    staleTime: STALE_TIMES.popular,
    enabled,
  });
}

export function usePrimeOriginals(enabled = true) {
  return useQuery({
    queryKey: ['tv', 'prime', 'recent'],
    queryFn: () => discoverTVShows({ with_watch_providers: WATCH_PROVIDER_IDS.PRIME_VIDEO, watch_region: WATCH_REGION, sort_by: 'popularity.desc', 'first_air_date.gte': recentDateStr }),
    staleTime: STALE_TIMES.popular,
    enabled,
  });
}

export function useDisneyOriginals(enabled = true) {
  return useQuery({
    queryKey: ['tv', 'disney', 'recent'],
    queryFn: () => discoverTVShows({ with_watch_providers: WATCH_PROVIDER_IDS.DISNEY_PLUS, watch_region: WATCH_REGION, sort_by: 'popularity.desc', 'first_air_date.gte': recentDateStr }),
    staleTime: STALE_TIMES.popular,
    enabled,
  });
}

export function useHuluOriginals(enabled = true) {
  return useQuery({
    queryKey: ['tv', 'hulu', 'recent'],
    queryFn: () => discoverTVShows({ with_watch_providers: WATCH_PROVIDER_IDS.HULU, watch_region: WATCH_REGION, sort_by: 'popularity.desc', 'first_air_date.gte': recentDateStr }),
    staleTime: STALE_TIMES.popular,
    enabled,
  });
}

export function useAppleTVOriginals(enabled = true) {
  return useQuery({
    queryKey: ['tv', 'apple', 'recent'],
    queryFn: () => discoverTVShows({ with_watch_providers: WATCH_PROVIDER_IDS.APPLE_TV, watch_region: WATCH_REGION, sort_by: 'popularity.desc', 'first_air_date.gte': recentDateStr }),
    staleTime: STALE_TIMES.popular,
    enabled,
  });
}

export function useHBOMaxOriginals(enabled = true) {
  return useQuery({
    queryKey: ['tv', 'hbo', 'recent'],
    queryFn: () => discoverTVShows({ with_watch_providers: WATCH_PROVIDER_IDS.HBO_MAX, watch_region: WATCH_REGION, sort_by: 'popularity.desc', 'first_air_date.gte': recentDateStr }),
    staleTime: STALE_TIMES.popular,
    enabled,
  });
}

export function useAnime(enabled = true) {
  return useQuery({
    queryKey: ['tv', 'anime'],
    queryFn: () => discoverTVShows({ 
      with_genres: ANIME_GENRE_ID, 
      with_original_language: JAPANESE_LANG,
      sort_by: 'popularity.desc' 
    }),
    staleTime: STALE_TIMES.popular,
    enabled,
  });
}

export function useMovieDetails(movieId: number) {
  return useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => getMovieDetails(movieId),
    staleTime: STALE_TIMES.details,
    enabled: !!movieId,
  });
}

// --- TV Shows ---
export function usePopularTVShows() {
  return useQuery({
    queryKey: ['tv', 'popular'],
    queryFn: () => getPopularTVShows(),
    staleTime: STALE_TIMES.popular,
  });
}

export function useTopRatedTVShows() {
  return useQuery({
    queryKey: ['tv', 'topRated'],
    queryFn: () => getTopRatedTVShows(),
    staleTime: STALE_TIMES.popular,
  });
}

export function useTVDetails(tvId: number) {
  return useQuery({
    queryKey: ['tv', tvId],
    queryFn: () => getTVDetails(tvId),
    staleTime: STALE_TIMES.details,
    enabled: !!tvId,
  });
}

export function useTVSeasonDetails(tvId: number, seasonNumber: number) {
  return useQuery({
    queryKey: ['tv', tvId, 'season', seasonNumber],
    queryFn: () => getTVSeasonDetails(tvId, seasonNumber),
    staleTime: STALE_TIMES.season,
    enabled: !!tvId && seasonNumber >= 0,
  });
}

export function useWatchProviders(mediaType: 'movie' | 'tv', id: number) {
  return useQuery({
    queryKey: ['watchProviders', mediaType, id],
    queryFn: () => getWatchProviders(mediaType, id),
    staleTime: STALE_TIMES.details,
    enabled: id > 0,
  });
}

// --- Search ---
export function useInfiniteSearchMulti(query: string, delay: number = 300) {
  const trimmed = query.trim();
  const debounced = useDebounce(trimmed, delay);

  return useInfiniteQuery({
    queryKey: ['search', 'infinite', debounced],
    queryFn: ({ pageParam = 1 }) => searchMulti(debounced, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < Math.min(lastPage.total_pages, 500)) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: STALE_TIMES.search,
    enabled: debounced.length >= 2,
  });
}

// --- Genres ---
export function useMovieGenres(enabled: boolean = true) {
  return useQuery({
    queryKey: ['genres', 'movie'],
    queryFn: getMovieGenres,
    staleTime: STALE_TIMES.genres,
    enabled,
  });
}

export function useTVGenres(enabled: boolean = true) {
  return useQuery({
    queryKey: ['genres', 'tv'],
    queryFn: getTVGenres,
    staleTime: STALE_TIMES.genres,
    enabled,
  });
}

// --- Discover (infinite scroll for browse pages) ---
export function useDiscoverMovies(params: DiscoverParams = {}, enabled: boolean = true) {
  return useInfiniteQuery({
    queryKey: ['discover', 'movies', params],
    queryFn: ({ pageParam = 1 }) => discoverMovies({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < Math.min(lastPage.total_pages, 500)) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: STALE_TIMES.popular,
    enabled,
  });
}

export function useDiscoverTVShows(params: DiscoverParams = {}, enabled: boolean = true) {
  return useInfiniteQuery({
    queryKey: ['discover', 'tv', params],
    queryFn: ({ pageParam = 1 }) => discoverTVShows({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < Math.min(lastPage.total_pages, 500)) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: STALE_TIMES.popular,
    enabled,
  });
}
