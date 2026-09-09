import type {
  TMDBPaginatedResponse,
  TMDBMovie,
  TMDBTVShow,
  TMDBMovieDetails,
  TMDBTVDetails,
  TMDBSeasonDetails,
  TMDBGenreList,
  TMDBMultiSearchResult,
} from './tmdb.types';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const getHeaders = (): HeadersInit => ({
  Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`,
  Accept: 'application/json',
});

async function tmdbFetch<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, val]) => url.searchParams.append(key, String(val)));

  const res = await fetch(url.toString(), { headers: getHeaders() });

  if (!res.ok) {
    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After') || '1';
      throw new Error(`Rate limit exceeded. Retry after ${retryAfter}s`);
    }
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// --- Image URL helpers ---

export type PosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';
export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original';
export type ProfileSize = 'w45' | 'w185' | 'h632' | 'original';

export function getPosterUrl(path: string | null, size: PosterSize = 'w500'): string {
  if (!path) return '/placeholder-poster.svg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size: BackdropSize = 'w1280'): string {
  if (!path) return '/placeholder-backdrop.svg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

export function getProfileUrl(path: string | null, size: ProfileSize = 'w185'): string {
  if (!path) return '/placeholder-profile.svg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

// --- Trending ---

export function getTrending(mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week', page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie | TMDBTVShow>>(`/trending/${mediaType}/${timeWindow}`, { page });
}

// --- Movies ---

export function getPopularMovies(page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>('/movie/popular', { page });
}

export function getTopRatedMovies(page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>('/movie/top_rated', { page });
}

export function getNowPlayingMovies(page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>('/movie/now_playing', { page });
}

export function getUpcomingMovies(page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>('/movie/upcoming', { page });
}

export function getMovieDetails(movieId: number) {
  return tmdbFetch<TMDBMovieDetails>(`/movie/${movieId}`, {
    append_to_response: 'credits,videos,similar,recommendations',
  });
}

// --- TV Shows ---

export function getPopularTVShows(page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBTVShow>>('/tv/popular', { page });
}

export function getTopRatedTVShows(page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBTVShow>>('/tv/top_rated', { page });
}

export function getTVDetails(tvId: number) {
  return tmdbFetch<TMDBTVDetails>(`/tv/${tvId}`, {
    append_to_response: 'credits,videos,similar,recommendations',
  });
}

export function getTVSeasonDetails(tvId: number, seasonNumber: number) {
  return tmdbFetch<TMDBSeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`);
}

// --- Search ---

export function searchMulti(query: string, page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMultiSearchResult>>('/search/multi', { query, page });
}

export function searchMovies(query: string, page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>('/search/movie', { query, page });
}

export function searchTVShows(query: string, page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBTVShow>>('/search/tv', { query, page });
}

// --- Genres ---

export function getMovieGenres() {
  return tmdbFetch<TMDBGenreList>('/genre/movie/list');
}

export function getTVGenres() {
  return tmdbFetch<TMDBGenreList>('/genre/tv/list');
}

// --- Discover (for browse with filters) ---

export interface DiscoverParams {
  page?: number;
  sort_by?: string;
  with_genres?: string;
  'vote_average.gte'?: number;
  'vote_average.lte'?: number;
  'primary_release_date.gte'?: string;
  'primary_release_date.lte'?: string;
  'first_air_date.gte'?: string;
  'first_air_date.lte'?: string;
  'vote_count.gte'?: number;
  with_networks?: string;
  with_watch_providers?: string;
  watch_region?: string;
  with_original_language?: string;
}

export function discoverMovies(params: DiscoverParams = {}) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>('/discover/movie', params as Record<string, string | number>);
}

export function discoverTVShows(params: DiscoverParams = {}) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBTVShow>>('/discover/tv', params as Record<string, string | number>);
}
