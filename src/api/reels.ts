import { DRAMABOX_DRAMAS } from '../data/dramaboxData';

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
  isUnlocked?: boolean;
}

export interface ReelDrama {
  id: string;
  bookId?: string;
  chapterId?: string;
  slug?: string;
  title: string;
  tagline: string;
  synopsis: string;
  coverImage: string;
  verticalPoster: string;
  totalEpisodes: number;
  tags: string[];
  categories?: string[];
  shelves?: string[];
  platform: 'DramaBox' | 'ReelShort' | 'ShortMax';
  rating: number;
  views: string;
  readCount?: number;
  collectCount?: number;
  embedUrl?: string;
  m3u8Url?: string;
  episodes: ReelEpisode[];
}

export const REEL_CATEGORIES = [
  'All',
  'Trending',
  'Billionaire',
  'Werewolf',
  'Revenge',
  'Romance',
  'Mafia',
  'Fantasy',
  'CEO',
] as const;

export type ReelCategory = (typeof REEL_CATEGORIES)[number];

// Primary full catalog of authentic real-time DramaBox short dramas
export const CURATED_REELS: ReelDrama[] = DRAMABOX_DRAMAS;

/**
 * Filter dramas by category or shelf
 */
export function filterReelsByCategory(dramas: ReelDrama[], category: string): ReelDrama[] {
  if (!category || category === 'All') return dramas;
  const target = category.toLowerCase();

  return dramas.filter((d) => {
    if (d.categories && d.categories.some((c) => c.toLowerCase() === target)) return true;
    if (d.tags && d.tags.some((t) => t.toLowerCase().includes(target))) return true;
    if (d.title.toLowerCase().includes(target) || d.synopsis.toLowerCase().includes(target)) return true;
    if (d.shelves && d.shelves.some((s) => s.toLowerCase().includes(target))) return true;
    return false;
  });
}

/**
 * Format duration helper
 */
export function formatDuration(msOrSec?: number): string {
  if (!msOrSec || msOrSec <= 0) return '1:30';
  const totalSec = msOrSec > 1000 ? Math.round(msOrSec / 1000) : Math.round(msOrSec);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

/**
 * Format views helper
 */
export function formatViews(count?: number): string {
  if (!count) return '1.2M';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
}

// Memory caches to prevent duplicate network calls
let cachedTrending: ReelDrama[] | null = null;
let cachedNewReleases: ReelDrama[] | null = null;
let cachedAllMovies: ReelDrama[] | null = null;
const cachedEpisodes: Record<string, ReelEpisode[]> = {};

/**
 * Transform 7xm API series format into standard ReelDrama
 */
export function transform7xmSeries(item: any, defaultCategory: string = 'Trending'): ReelDrama {
  const chapterCount = Number(item.chapter_count) || 40;
  const readCount = Number(item.read_count) || 500000;
  const collectCount = Number(item.collect_count) || 12000;
  const themes = Array.isArray(item.theme)
    ? item.theme
    : item.theme
      ? [String(item.theme)]
      : [defaultCategory];

  const initialEpisodes: ReelEpisode[] = [];
  const epLimit = Math.min(chapterCount, 60);
  for (let i = 1; i <= epLimit; i++) {
    initialEpisodes.push({
      id: `${item.id}-${i}`,
      episodeNumber: i,
      title: `Episode ${i}`,
      duration: '1:30',
      videoUrl: '',
      videoType: 'hls',
      thumbnail: item.cover_pic || '',
      likes: Math.floor(collectCount / 2 + i * 150),
      commentsCount: Math.floor(i * 12 + 45),
      isUnlocked: true,
    });
  }

  return {
    id: String(item.id),
    bookId: String(item.id),
    chapterId: '1',
    slug: (item.title || 'drama').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title: item.title || 'Trending Drama',
    tagline: themes.join(' • ') || 'Trending Short Series',
    synopsis: item.description || 'Watch full episodes in HD on DramaBox.',
    coverImage: item.cover_pic || '',
    verticalPoster: item.cover_pic || '',
    totalEpisodes: chapterCount,
    tags: Array.from(new Set([...themes, 'DramaBox', defaultCategory])),
    categories: ['All', defaultCategory, ...themes],
    shelves: [defaultCategory, ...themes],
    platform: 'DramaBox',
    rating: 9.6,
    views: formatViews(readCount),
    readCount,
    collectCount,
    episodes: initialEpisodes,
  };
}

/**
 * Fetch Trending series from https://apireel.7xm.dev/api/series/trending.php
 */
export async function fetchLiveTrendingSeries(): Promise<ReelDrama[]> {
  if (cachedTrending && cachedTrending.length > 0) {
    return cachedTrending;
  }

  try {
    const res = await fetch('https://apireel.7xm.dev/api/series/trending.php', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      const rawList = json.data;
      if (Array.isArray(rawList) && rawList.length > 0) {
        const transformed = rawList.map((item: any) => transform7xmSeries(item, 'Trending'));
        const map = new Map<string, ReelDrama>();
        for (const d of transformed) {
          map.set(d.id, d);
        }
        for (const d of DRAMABOX_DRAMAS) {
          if (!map.has(d.id)) {
            map.set(d.id, d);
          }
        }
        cachedTrending = Array.from(map.values());
        return cachedTrending;
      }
    }
  } catch {
    // Graceful fallback to curated catalog
  }

  cachedTrending = DRAMABOX_DRAMAS;
  return cachedTrending;
}

/**
 * Fetch New Releases from https://apireel.7xm.dev/api/series/new-release.php
 */
export async function fetchLiveNewReleases(page: number = 1): Promise<ReelDrama[]> {
  if (cachedNewReleases && page === 1) {
    return cachedNewReleases;
  }

  try {
    const res = await fetch(`https://apireel.7xm.dev/api/series/new-release.php?page=${page}`, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      const rawList = json.items || json.data;
      if (Array.isArray(rawList) && rawList.length > 0) {
        const transformed = rawList.map((item: any) => transform7xmSeries(item, 'New Releases'));
        if (page === 1) {
          cachedNewReleases = transformed;
        }
        return transformed;
      }
    }
  } catch {
    // Fallback
  }

  const fallback = DRAMABOX_DRAMAS.slice(10, 30);
  cachedNewReleases = fallback;
  return fallback;
}

/**
 * Fetch All Movies / Catalog from https://apireel.7xm.dev/api/series/all-movies.php
 */
export async function fetchLiveAllMovies(page: number = 1): Promise<ReelDrama[]> {
  if (cachedAllMovies && page === 1) {
    return cachedAllMovies;
  }

  try {
    const res = await fetch(`https://apireel.7xm.dev/api/series/all-movies.php?page=${page}`, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      const rawList = json.items || json.data;
      if (Array.isArray(rawList) && rawList.length > 0) {
        const transformed = rawList.map((item: any) => transform7xmSeries(item, 'All'));
        if (page === 1) {
          const map = new Map<string, ReelDrama>();
          for (const d of transformed) map.set(d.id, d);
          for (const d of DRAMABOX_DRAMAS) {
            if (!map.has(d.id)) map.set(d.id, d);
          }
          cachedAllMovies = Array.from(map.values());
          return cachedAllMovies;
        }
        return transformed;
      }
    }
  } catch {
    // Fallback
  }

  cachedAllMovies = DRAMABOX_DRAMAS;
  return cachedAllMovies;
}

/**
 * Fetch full series details and episodes with real-time video stream URLs
 */
export async function fetchSeriesDetailWithEpisodes(
  seriesId: string,
  dramaFallback?: ReelDrama
): Promise<{ drama: ReelDrama; episodes: ReelEpisode[] }> {
  if (cachedEpisodes[seriesId] && cachedEpisodes[seriesId].length > 0 && dramaFallback) {
    return { drama: dramaFallback, episodes: cachedEpisodes[seriesId] };
  }

  const cleanId = seriesId.replace(/^db-/, '');
  const existingDrama =
    dramaFallback ||
    DRAMABOX_DRAMAS.find((d) => d.id === seriesId || d.id === `db-${seriesId}` || d.bookId === cleanId);

  try {
    const detailUrl = `https://apireel.7xm.dev/api/series/detail.php?id=${encodeURIComponent(cleanId)}&refresh_stream=1`;
    const res = await fetch(detailUrl, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const json = await res.json();
      if (json.series && Array.isArray(json.episodes) && json.episodes.length > 0) {
        const s = json.series;
        const mappedEpisodes: ReelEpisode[] = json.episodes.map((ep: any, idx: number) => {
          const epNum = ep.episode_index || idx + 1;
          const hasStream = !!ep.video_url && ep.video_url.trim().length > 0;
          const isHls = hasStream && ep.video_url.includes('.m3u8');

          return {
            id: String(ep.id || `${cleanId}-${epNum}`),
            episodeNumber: epNum,
            title: ep.title || `Episode ${epNum}`,
            duration: formatDuration(ep.duration),
            videoUrl: hasStream ? ep.video_url : '',
            m3u8Url: isHls ? ep.video_url : undefined,
            videoType: isHls ? 'hls' : 'mp4',
            thumbnail: ep.video_pic || s.cover_pic || '',
            likes: Math.floor(1000 + Math.random() * 5000),
            commentsCount: Math.floor(50 + Math.random() * 300),
            isUnlocked: true,
          };
        });

        cachedEpisodes[seriesId] = mappedEpisodes;
        const transformedDrama = transform7xmSeries(s);
        transformedDrama.episodes = mappedEpisodes;
        return { drama: transformedDrama, episodes: mappedEpisodes };
      }
    }
  } catch {
    // Continue to fallback
  }

  if (existingDrama && existingDrama.episodes && existingDrama.episodes.length > 0) {
    cachedEpisodes[seriesId] = existingDrama.episodes;
    return { drama: existingDrama, episodes: existingDrama.episodes };
  }

  const fallbackCount = existingDrama?.totalEpisodes || 40;
  const genEpisodes: ReelEpisode[] = [];
  for (let i = 1; i <= fallbackCount; i++) {
    genEpisodes.push({
      id: `${cleanId}-${i}`,
      episodeNumber: i,
      title: `Episode ${i}`,
      duration: '1:30',
      videoUrl: '',
      videoType: 'hls',
      thumbnail: existingDrama?.coverImage || '',
      likes: 1200 + i * 20,
      commentsCount: 80 + i * 3,
      isUnlocked: true,
    });
  }

  const finalDrama: ReelDrama = existingDrama || {
    id: seriesId,
    bookId: cleanId,
    chapterId: '1',
    slug: 'drama',
    title: 'Short Drama Series',
    tagline: 'Exclusive DramaBox Short Series',
    synopsis: 'Watch full episodes in HD on DramaBox.',
    coverImage: '',
    verticalPoster: '',
    totalEpisodes: fallbackCount,
    tags: ['Trending', 'DramaBox'],
    platform: 'DramaBox',
    rating: 9.6,
    views: '1.2M',
    episodes: genEpisodes,
  };

  cachedEpisodes[seriesId] = genEpisodes;
  return { drama: finalDrama, episodes: genEpisodes };
}

/**
 * Fetch live drama catalog by category from apireel.7xm.dev
 */
export async function fetchLiveDramaBoxCatalog(category: ReelCategory = 'All'): Promise<ReelDrama[]> {
  const trending = await fetchLiveTrendingSeries();
  return filterReelsByCategory(trending, category);
}

/**
 * Fetch live episode details
 */
export async function fetchLiveDramaEpisodes(bookId: string): Promise<ReelEpisode[] | null> {
  const cleanId = bookId.replace(/^db-/, '');
  const { episodes } = await fetchSeriesDetailWithEpisodes(cleanId);
  return episodes.length > 0 ? episodes : null;
}
