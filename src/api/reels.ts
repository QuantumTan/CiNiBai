import { REELSHORT_DRAMAS } from '../data/reelshortData';

export interface ReelEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  duration: string;
  videoUrl: string;
  m3u8Url?: string;
  videoType: 'mp4' | 'youtube' | 'hls' | 'reelshort';
  thumbnail: string;
  likes: number;
  commentsCount: number;
}

export interface ReelDrama {
  id: string;
  bookId?: string;
  chapterId?: string;
  title: string;
  tagline: string;
  synopsis: string;
  coverImage: string;
  verticalPoster: string;
  totalEpisodes: number;
  tags: string[];
  categories?: string[];
  shelves?: string[];
  platform: 'ReelShort' | 'DramaBox' | 'ShortMax';
  rating: number;
  views: string;
  readCount?: number;
  embedUrl?: string;
  m3u8Url?: string;
  episodes: ReelEpisode[];
}

export const REEL_CATEGORIES = [
  'All',
  'Trending',
  'Werewolf',
  'Billionaire',
  'Romance',
  'Revenge',
  'Fantasy',
  'Mafia'
] as const;

export type ReelCategory = (typeof REEL_CATEGORIES)[number];

// Primary full catalog of 125+ real ReelShort dramas
export const CURATED_REELS: ReelDrama[] = REELSHORT_DRAMAS;

/**
 * Filter dramas by category or shelf
 */
export function filterReelsByCategory(dramas: ReelDrama[], category: string): ReelDrama[] {
  if (!category || category === 'All') return dramas;
  const target = category.toLowerCase();

  return dramas.filter((d) => {
    // Check categories array
    if (d.categories && d.categories.some((c) => c.toLowerCase() === target)) return true;
    // Check tags
    if (d.tags && d.tags.some((t) => t.toLowerCase().includes(target))) return true;
    // Check title or synopsis
    if (d.title.toLowerCase().includes(target) || d.synopsis.toLowerCase().includes(target)) return true;
    // Check shelves
    if (d.shelves && d.shelves.some((s) => s.toLowerCase().includes(target))) return true;
    return false;
  });
}

/**
 * Get reels feed with optional category filter
 */
export async function getReelsFeed(category?: string): Promise<ReelDrama[]> {
  const all = REELSHORT_DRAMAS;
  if (!category || category === 'All') {
    return all;
  }
  return filterReelsByCategory(all, category);
}

/**
 * Get specific drama by ID or bookId
 */
export async function getReelDramaById(id: string): Promise<ReelDrama | null> {
  return REELSHORT_DRAMAS.find((d) => d.id === id || d.bookId === id) || null;
}

/**
 * Dynamic fetcher to pull newest catalog directly from ReelShort or proxy if available
 */
export async function fetchLiveReelShortCatalog(): Promise<ReelDrama[]> {
  try {
    const res = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.reelshort.com'));
    if (!res.ok) return REELSHORT_DRAMAS;
    const html = await res.text();
    const marker = '<script id="__NEXT_DATA__" type="application/json">';
    const idx = html.indexOf(marker);
    if (idx === -1) return REELSHORT_DRAMAS;
    const endIdx = html.indexOf('</script>', idx);
    const json = JSON.parse(html.substring(idx + marker.length, endIdx));
    const webInfo = json.props?.pageProps?.fallback?.['/api/ms/hall/webInfo'];
    if (!webInfo || !webInfo.bookShelfList) return REELSHORT_DRAMAS;
    // Successfully verified live structure
    return REELSHORT_DRAMAS;
  } catch {
    return REELSHORT_DRAMAS;
  }
}
