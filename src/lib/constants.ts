// CineBai design constants -- no emojis

export const SITE_NAME = 'CineBai';
export const SITE_DESCRIPTION = 'Watch your favorite movies and TV shows for free.';

// TMDB
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Colors
export const COLORS = {
  bgPrimary: '#0a0a0a',
  bgSecondary: '#111111',
  gold: '#c9a44c',
  goldLight: '#e0c575',
  goldDark: '#a88832',
  textPrimary: '#f5f5f5',
  textSecondary: '#a0a0a0',
  textMuted: '#666666',
} as const;

// Breakpoints (matching Tailwind defaults)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Stale times for TanStack Query (in ms)
export const STALE_TIMES = {
  genres: 24 * 60 * 60 * 1000,      // 24 hours
  trending: 10 * 60 * 1000,          // 10 minutes
  popular: 10 * 60 * 1000,           // 10 minutes
  details: 60 * 60 * 1000,           // 1 hour
  search: 5 * 60 * 1000,             // 5 minutes
  season: 30 * 60 * 1000,            // 30 minutes
} as const;
