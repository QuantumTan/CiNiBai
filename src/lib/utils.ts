// Utility functions for CineBai

/**
 * Format a date string to a readable format
 * e.g. "2024-03-15" -> "Mar 15, 2024"
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Unknown';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Unknown';
  }
}

/**
 * Extract the year from a date string
 * e.g. "2024-03-15" -> "2024"
 */
export function getYear(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return dateStr.split('-')[0] || '';
}

/**
 * Format runtime in minutes to hours and minutes
 * e.g. 142 -> "2h 22m"
 */
export function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes) return '';
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
  if (rating === null || rating === undefined) return 'N/A';
  return rating.toFixed(1);
}

/**
 * Truncate a string to a maximum length, adding ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '...';
}

/**
 * Get the title from a media item (handles both movie and TV)
 */
export function getMediaTitle(item: { title?: string; name?: string }): string {
  return item.title || item.name || 'Untitled';
}

/**
 * Get the release date from a media item (handles both movie and TV)
 */
export function getMediaDate(item: { release_date?: string; first_air_date?: string }): string {
  return item.release_date || item.first_air_date || '';
}

/**
 * Determine if a media item is a movie or TV show
 */
export function getMediaType(item: { media_type?: string; title?: string; name?: string }): 'movie' | 'tv' {
  if (item.media_type === 'tv') return 'tv';
  if (item.media_type === 'movie') return 'movie';
  // Heuristic: movies have 'title', TV shows have 'name'
  return 'title' in item && item.title ? 'movie' : 'tv';
}

/**
 * Build a class string from conditional classes
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
