// CineBai design constants

export const SITE_NAME = 'CineBai';
export const SITE_DESCRIPTION = 'Watch your favorite movies and TV shows for free.';

// TMDB
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Default region for watch provider availability
// TODO(region-picker): Connect to user-selectable region picker
export const REGION = 'US';

// Anime configuration
export const ANIME_GENRE_ID = '16';
export const ANIME_ORIGINAL_LANGUAGE = 'ja';

// Watch provider IDs on TMDB
export const WATCH_PROVIDER_IDS = {
  NETFLIX: '8',
  PRIME_VIDEO: '9|119',
  DISNEY_PLUS: '337',
  HULU: '15',
  APPLE_TV: '350',
  HBO: '384',
  MAX: '1899',
  HBO_MAX: '1899', // Compatibility alias for merged Max
} as const;

// Single source of truth for platform identity & branding colors
export const NETWORK_BRAND_COLORS = {
  netflix: { name: 'Netflix', colorClass: 'text-[#E50914]', rgb: { r: 229, g: 9, b: 20 }, hex: '#E50914' },
  prime: { name: 'Amazon Prime', colorClass: 'text-[#00A8E1]', rgb: { r: 0, g: 168, b: 225 }, hex: '#00A8E1' },
  disney: { name: 'Disney+', colorClass: 'text-[#3070F7]', rgb: { r: 48, g: 112, b: 247 }, hex: '#3070F7' },
  apple: { name: 'Apple TV+', colorClass: 'text-text-primary', rgb: { r: 200, g: 205, b: 215 }, hex: '#C8CDD7' },
  hulu: { name: 'Hulu', colorClass: 'text-[#1CE783]', rgb: { r: 28, g: 231, b: 131 }, hex: '#1CE783' },
  hbo: { name: 'HBO', colorClass: 'text-[#9900FF]', rgb: { r: 153, g: 0, b: 255 }, hex: '#9900FF' },
  max: { name: 'Max', colorClass: 'text-[#002BE7]', rgb: { r: 0, g: 43, b: 231 }, hex: '#002BE7' },
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
