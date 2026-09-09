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
  searchMulti,
  getMovieGenres,
  getTVGenres,
  discoverMovies,
  discoverTVShows,
} from '../api/tmdb';
import type { DiscoverParams } from '../api/tmdb';
import { STALE_TIMES } from '../lib/constants';

// --- Trending ---
export function useTrending(mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week') {
  return useQuery({
    queryKey: ['trending', mediaType, timeWindow],
    queryFn: () => getTrending(mediaType, timeWindow),
    staleTime: STALE_TIMES.trending,
  });
}

// --- Movies ---
export function usePopularMovies() {
  return useQuery({
    queryKey: ['movies', 'popular'],
    queryFn: () => getPopularMovies(),
    staleTime: STALE_TIMES.popular,
  });
}

export function useTopRatedMovies() {
  return useQuery({
    queryKey: ['movies', 'topRated'],
    queryFn: () => getTopRatedMovies(),
    staleTime: STALE_TIMES.popular,
  });
}

export function useNowPlayingMovies() {
  return useQuery({
    queryKey: ['movies', 'nowPlaying'],
    queryFn: () => getNowPlayingMovies(),
    staleTime: STALE_TIMES.popular,
  });
}

export function useTrendingToday() {
  return useQuery({
    queryKey: ['trending', 'all', 'day'],
    queryFn: () => getTrending('all', 'day'),
    staleTime: STALE_TIMES.trending,
  });
}

// Get the date 1 year ago to filter out ancient shows
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
const recentDateStr = oneYearAgo.toISOString().split('T')[0];

export function useNetflixOriginals() {
  return useQuery({
    queryKey: ['tv', 'netflix', 'recent'],
    queryFn: () => discoverTVShows({ with_watch_providers: '8', watch_region: 'US', sort_by: 'popularity.desc', 'first_air_date.gte': recentDateStr }),
    staleTime: STALE_TIMES.popular,
  });
}

export function usePrimeOriginals() {
  return useQuery({
    queryKey: ['tv', 'prime', 'recent'],
    queryFn: () => discoverTVShows({ with_watch_providers: '9|119', watch_region: 'US', sort_by: 'popularity.desc', 'first_air_date.gte': recentDateStr }),
    staleTime: STALE_TIMES.popular,
  });
}

export function useDisneyOriginals() {
  return useQuery({
    queryKey: ['tv', 'disney', 'recent'],
    queryFn: () => discoverTVShows({ with_watch_providers: '337', watch_region: 'US', sort_by: 'popularity.desc', 'first_air_date.gte': recentDateStr }),
    staleTime: STALE_TIMES.popular,
  });
}

export function useHuluOriginals() {
  return useQuery({
    queryKey: ['tv', 'hulu', 'recent'],
    queryFn: () => discoverTVShows({ with_watch_providers: '15', watch_region: 'US', sort_by: 'popularity.desc', 'first_air_date.gte': recentDateStr }),
    staleTime: STALE_TIMES.popular,
  });
}

export function useAppleTVOriginals() {
  return useQuery({
    queryKey: ['tv', 'apple', 'recent'],
    queryFn: () => discoverTVShows({ with_watch_providers: '350', watch_region: 'US', sort_by: 'popularity.desc', 'first_air_date.gte': recentDateStr }),
    staleTime: STALE_TIMES.popular,
  });
}

export function useHBOMaxOriginals() {
  return useQuery({
    queryKey: ['tv', 'hbo', 'recent'],
    queryFn: () => discoverTVShows({ with_watch_providers: '1899|384', watch_region: 'US', sort_by: 'popularity.desc', 'first_air_date.gte': recentDateStr }),
    staleTime: STALE_TIMES.popular,
  });
}

export function useAnime() {
  return useQuery({
    queryKey: ['tv', 'anime'],
    queryFn: () => discoverTVShows({ 
      with_genres: '16', 
      with_original_language: 'ja',
      sort_by: 'popularity.desc' 
    }),
    staleTime: STALE_TIMES.popular,
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

// --- Search ---
export function useSearchMulti(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchMulti(query),
    staleTime: STALE_TIMES.search,
    enabled: query.length >= 2,
  });
}

// --- Genres ---
export function useMovieGenres() {
  return useQuery({
    queryKey: ['genres', 'movie'],
    queryFn: getMovieGenres,
    staleTime: STALE_TIMES.genres,
  });
}

export function useTVGenres() {
  return useQuery({
    queryKey: ['genres', 'tv'],
    queryFn: getTVGenres,
    staleTime: STALE_TIMES.genres,
  });
}

// --- Discover (infinite scroll for browse pages) ---
export function useDiscoverMovies(params: DiscoverParams = {}) {
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
  });
}

export function useDiscoverTVShows(params: DiscoverParams = {}) {
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
  });
}
