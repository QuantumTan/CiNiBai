import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export { getPosterUrl, getBackdropUrl } from '../api/tmdb';

// Utility functions for CineBai

/**
 * Format a date string to a readable format
 * e.g. "2024-03-15" -> "Mar 15, 2024"
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * Extract the year from a date string
 * e.g. "2024-03-15" -> "2024"
 */
export function getYear(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const year = dateStr.split('-')[0];
  return year && year.length === 4 ? year : '—';
}

/**
 * Format runtime in minutes to hours and minutes
 * e.g. 142 -> "2h 22m"
 */
export function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Format a vote average to one decimal place
 * e.g. 8.256 -> "8.3"
 */
export function formatRating(rating: number | null | undefined): string {
  if (rating === null || rating === undefined || rating <= 0) return '—';
  return rating.toFixed(1);
}

/**
 * Truncate a string to a maximum length, adding ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '...';
}

/**
 * Get the title from a media item (handles both movie and TV)
 */
export function getMediaTitle(item: { title?: string; name?: string }): string {
  return item.title || item.name || '—';
}

/**
 * Get the release date from a media item (handles both movie and TV)
 */
export function getMediaDate(item: { release_date?: string; first_air_date?: string }): string {
  return item.release_date || item.first_air_date || '';
}

/**
 * Determine if a media item is a movie, TV show, or person using explicit media_type.
 * Person media items return 'person', never 'tv'. Unspecified items default to 'movie', never 'tv'.
 */
export function getMediaType(item: { media_type?: string }): 'movie' | 'tv' | 'person' {
  if (item.media_type === 'person') return 'person';
  if (item.media_type === 'tv') return 'tv';
  if (item.media_type === 'movie') return 'movie';
  return 'movie';
}

/**
 * Combines clsx for conditional class resolution with tailwind-merge to deterministically deduplicate conflicting Tailwind CSS utility classes.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Trim whitespace from a search query safely
 */
export function trimQuery(query: string | null | undefined): string {
  return (query || '').trim();
}

/**
 * Filter out person results from search hit arrays
 */
export function filterOutPersons<T extends { media_type?: string }>(
  items: T[]
): Exclude<T, { media_type: 'person' }>[] {
  return items.filter(
    (item): item is Exclude<T, { media_type: 'person' }> => item.media_type !== 'person'
  );
}

/**
 * Format search result count with pluralization and locale commas
 */
export function formatResultCount(count: number): string {
  const safeCount = Math.max(0, count);
  return `${safeCount.toLocaleString()} ${safeCount === 1 ? 'result' : 'results'}`;
}

/**
 * Format showing count text:
 * When totalResults is known (positive number), outputs "Showing {loaded} of {total_results}" with locale formatting.
 * When totalResults is unknown or undefined, outputs "Showing {loaded}".
 */
export function formatShowingCount(loaded: number, totalResults?: number | null): string {
  const safeLoaded = Math.max(0, loaded);
  if (typeof totalResults === 'number' && totalResults > 0) {
    return `Showing ${safeLoaded.toLocaleString()} of ${totalResults.toLocaleString()}`;
  }
  return `Showing ${safeLoaded.toLocaleString()}`;
}

/**
 * Standard debounce wrapper with cancel handle
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}
