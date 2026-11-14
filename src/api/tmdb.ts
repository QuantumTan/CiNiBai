import type {
  TMDBPaginatedResponse,
  TMDBMovie,
  TMDBTVShow,
  TMDBMovieDetails,
  TMDBTVDetails,
  TMDBSeasonDetails,
  TMDBGenreList,
  TMDBMultiSearchResult,
  TMDBWatchProvidersResponse,
  DiscoverParams,
} from './tmdb.types';
import { REGION, ANIME_GENRE_ID, ANIME_ORIGINAL_LANGUAGE, WATCH_PROVIDER_IDS } from '../lib/constants';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Named constants for anime curation and catalog queries (re-exported from constants)
export { ANIME_GENRE_ID, ANIME_ORIGINAL_LANGUAGE };
export const JAPANESE_LANG = ANIME_ORIGINAL_LANGUAGE;

// Default region for streaming providers (re-exported from constants)
export const WATCH_REGION = REGION;

// TMDB Watch Provider IDs (re-exported from constants)
export { WATCH_PROVIDER_IDS };

export function getTMDBErrorMessage(error: unknown): string {
  if (!error) return 'TMDB request failed';
  let msg = '';
  if (error instanceof Error) {
    msg = error.message;
  } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
    msg = (error as { message: string }).message;
  } else {
    msg = String(error);
  }
  msg = msg.trim();
  if (!msg) return 'TMDB request failed';

  if (msg.includes('Missing TMDB token')) {
    return 'Missing TMDB token';
  }
  if (msg.toLowerCase() === 'rate limited') {
    return 'Rate limited';
  }
  if (msg.toLowerCase().includes('rate limit')) {
    return `Rate limited: ${msg}`;
  }
  if (msg.startsWith('TMDB request failed')) {
    return msg;
  }
  return `TMDB request failed: ${msg}`;
}

function getTMDBToken(): string | undefined {
  if (typeof window !== 'undefined' && (window as unknown as { __TMDB_TOKEN__?: string }).__TMDB_TOKEN__) {
    return (window as unknown as { __TMDB_TOKEN__?: string }).__TMDB_TOKEN__;
  }
  return import.meta.env.VITE_TMDB_ACCESS_TOKEN;
}

const getHeaders = (token: string): HeadersInit => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/json',
});

async function tmdbFetch<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  const rawToken = getTMDBToken();
  if (!rawToken || rawToken === 'undefined' || rawToken === 'null' || rawToken.trim() === '') {
    throw new Error('Missing TMDB token');
  }
  const token = rawToken.trim();

  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, val]) => url.searchParams.append(key, String(val)));

  let res: Response;
  try {
    res = await fetch(url.toString(), { headers: getHeaders(token) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    throw new Error(`TMDB request failed: ${message}`);
  }

  if (!res.ok) {
    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After') || '1';
      throw new Error(`Rate limit exceeded. Retry after ${retryAfter}s`);
    }
    const statusText = res.statusText || (res.status === 404 ? 'Not Found' : res.status === 500 ? 'Internal Server Error' : res.status === 401 ? 'Unauthorized' : '');
    const detail = statusText ? `${res.status} ${statusText}` : `${res.status}`;
    throw new Error(`TMDB request failed: ${detail}`.trim());
  }

  try {
    return await res.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid JSON';
    throw new Error(`TMDB request failed: ${message}`);
  }
}

// --- Image URL helpers ---

export type PosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';
export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original';
export type ProfileSize = 'w45' | 'w185' | 'h632' | 'original';
export type LogoSize = 'w45' | 'w92' | 'w154' | 'w185' | 'w300' | 'w500' | 'original';

export function getPosterUrl(path: string | null | undefined, size: PosterSize = 'w342'): string {
  if (!path || typeof path !== 'string' || path === 'undefined' || path.includes('undefined')) return '';
  return `${IMAGE_BASE_URL}/${size}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getBackdropUrl(path: string | null | undefined, size: BackdropSize = 'w1280'): string {
  if (!path || typeof path !== 'string' || path === 'undefined' || path.includes('undefined')) return '';
  return `${IMAGE_BASE_URL}/${size}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getProfileUrl(path: string | null | undefined, size: ProfileSize = 'w185'): string {
  if (!path || typeof path !== 'string' || path === 'undefined' || path.includes('undefined')) return '';
  return `${IMAGE_BASE_URL}/${size}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getLogoUrl(path: string | null | undefined, size: LogoSize = 'w92'): string {
  if (!path || typeof path !== 'string' || path === 'undefined' || path.includes('undefined')) return '';
  return `${IMAGE_BASE_URL}/${size}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Responsive srcset helper for posters
 * Sizes guidance: (max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw
 */
export function getPosterSrcSet(path: string | null | undefined): string {
  if (!path || typeof path !== 'string' || path.includes('undefined')) return '';
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${IMAGE_BASE_URL}/w185${clean} 185w, ${IMAGE_BASE_URL}/w342${clean} 342w, ${IMAGE_BASE_URL}/w500${clean} 500w, ${IMAGE_BASE_URL}/w780${clean} 780w`;
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
    append_to_response: 'credits,videos,similar,recommendations,external_ids',
  });
}

export function getWatchProviders(mediaType: 'movie' | 'tv', id: number) {
  return tmdbFetch<TMDBWatchProvidersResponse>(`/${mediaType}/${id}/watch/providers`);
}

export type {
  TMDBWatchProvider,
  TMDBWatchProviderRegion,
  TMDBWatchProvidersResponse,
  DiscoverParams,
} from './tmdb.types';

// --- TV Shows ---

export function getPopularTVShows(page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBTVShow>>('/tv/popular', { page });
}

export function getTopRatedTVShows(page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBTVShow>>('/tv/top_rated', { page });
}

export function getTVDetails(tvId: number) {
  return tmdbFetch<TMDBTVDetails>(`/tv/${tvId}`, {
    append_to_response: 'credits,videos,similar,recommendations,external_ids',
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

export function discoverMovies(params: DiscoverParams = {}) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>('/discover/movie', params as Record<string, string | number>);
}

export function discoverTVShows(params: DiscoverParams = {}) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBTVShow>>('/discover/tv', params as Record<string, string | number>);
}
