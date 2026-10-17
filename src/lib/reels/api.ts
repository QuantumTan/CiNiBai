import type {
  ClipSearchResult,
  DiscussionComment,
  Reel,
  ReelFilter,
  ReelItem,
  ReelMood,
  ReelsPage,
} from './types';
import { INITIAL_REELS_CATALOG } from './mockData';
import { scrapeLiveCatalog } from './reelsScraperService';
import { getStreamForDrama } from './dramaboxApi';

interface ReelsFeedParams {
  cursor?: string | null;
  page?: number;
  limit?: number;
  sessionId?: string;
  deviceId?: string;
  signal?: AbortSignal;
}

const runtimeCatalog: Reel[] = [...INITIAL_REELS_CATALOG];
const runtimeDiscussions: Record<string, DiscussionComment[]> = {};

function parseCursor(cursor: string | null | undefined, fallbackPage = 1) {
  const match = cursor?.match(/^(\d+):(\d+)$/);
  if (!match) return { page: Math.max(1, fallbackPage), offset: 0 };
  return {
    page: Math.max(1, Number(match[1])),
    offset: Math.max(0, Number(match[2])),
  };
}

function initialReelToFeedItem(reel: Reel): ReelItem {
  return (
    reel.feedItem || {
      id: reel.id,
      videoUrl: reel.playbackUrl,
      posterUrl: reel.posterUrl,
      aspectRatio: reel.aspect === '9:16' ? 9 / 16 : 16 / 9,
      duration: Math.round(reel.durationMs / 1000),
      author: {
        id: 'cinebai',
        username: 'CineBai Reels',
        isFollowed: false,
      },
      caption: `${reel.source.title}\n${reel.dialogueQuote || ''}`,
      metrics: {
        likes: reel.stats.likes,
        comments: reel.stats.comments,
        shares: 120,
        views: reel.stats.likes * 4,
      },
    }
  );
}

export async function fetchReelsFeed(
  params: ReelsFeedParams = {}
): Promise<{ items: ReelItem[]; nextCursor: string | null }> {
  const { cursor, page = 1, limit = 4 } = params;
  const safeLimit = Math.min(10, Math.max(1, Math.floor(limit)));
  const position = parseCursor(cursor, page);

  let combinedPool: ReelItem[] = [];

  try {
    const scrapedCatalog = await scrapeLiveCatalog();
    if (Array.isArray(scrapedCatalog) && scrapedCatalog.length > 0) {
      const scrapedFeedItems: ReelItem[] = scrapedCatalog.map((s) => ({
        id: `reel-${s.id}-ep1`,
        videoUrl: getStreamForDrama(s.id, 1),
        posterUrl: s.cover_pic,
        aspectRatio: 9 / 16,
        duration: 90,
        author: {
          id: 'cinebai',
          username: 'CineBai Reels',
          isFollowed: false,
        },
        caption: `${s.title}\n${s.description || '100% Free streaming short drama series.'}`,
        metrics: {
          likes: s.collect_count,
          comments: Math.floor(s.collect_count / 15),
          shares: Math.floor(s.collect_count / 25),
          views: s.read_count,
        },
      }));

      // Combine scraped items with editorial catalog items
      const localItems = INITIAL_REELS_CATALOG.map(initialReelToFeedItem);
      const map = new Map<string, ReelItem>();
      for (const item of scrapedFeedItems) map.set(String(item.id), item);
      for (const item of localItems) {
        if (!map.has(String(item.id))) map.set(String(item.id), item);
      }
      combinedPool = Array.from(map.values());
    }
  } catch {
    // If scraper error, fallback to curated local catalog
  }

  if (combinedPool.length === 0) {
    combinedPool = INITIAL_REELS_CATALOG.map(initialReelToFeedItem);
  }

  const total = combinedPool.length;
  const startIndex = ((position.page - 1) * safeLimit + position.offset) % total;
  const items: ReelItem[] = [];
  for (let i = 0; i < safeLimit; i++) {
    const item = combinedPool[(startIndex + i) % total];
    const cycle = Math.floor(((position.page - 1) * safeLimit + position.offset + i) / total);
    items.push(cycle > 0 ? { ...item, id: `${item.id}-c${cycle}` } : item);
  }

  const nextPos = position.offset + safeLimit;
  const nextCursor = `${position.page + Math.floor(nextPos / safeLimit)}:${nextPos % safeLimit}`;
  return { items, nextCursor };
}

function toInternalReel(item: ReelItem): Reel {
  const baseId = String(item.id).replace(/-c\d+$/, '');
  const existing = INITIAL_REELS_CATALOG.find((r) => r.id === baseId || r.id === item.id);
  if (existing) {
    return {
      ...existing,
      id: String(item.id),
      playbackUrl: item.videoUrl || existing.playbackUrl,
      posterUrl: item.posterUrl || existing.posterUrl,
    };
  }

  const [seriesId, , episodeIndexText] = String(item.id).split(':');
  const episodeIndex = Math.max(1, Number(episodeIndexText) || 1);
  const title = item.caption?.split('\n')[0]?.slice(0, 96) || `Episode ${episodeIndex}`;
  return {
    id: String(item.id),
    playbackUrl: item.videoUrl,
    posterUrl: item.posterUrl || '',
    blurhash: '',
    aspect: '9:16',
    durationMs: (item.duration || 0) * 1000,
    palette: ['#08080a', '#171419', '#e5b869'],
    source: {
      titleId: seriesId,
      kind: 'series',
      title,
      season: 1,
      episode: episodeIndex,
      posterUrl: item.posterUrl || '',
      startAtMs: 0,
    },
    people: [],
    stats: {
      likes: item.metrics.likes,
      comments: item.metrics.comments,
    },
    viewer: { liked: false, saved: false },
    dialogueQuote: item.caption,
    tags: ['Reels', 'Cinema'],
    feedItem: item,
  };
}

function matchesFilters(reel: Reel, filter: ReelFilter, moods: ReelMood[]) {
  const text = `${reel.source.title} ${reel.dialogueQuote || ''}`.toLowerCase();
  if (moods.length && !moods.some((mood) => text.includes(mood.replace('-', ' ')))) return false;
  if (filter === 'soundtracks') return !!reel.score;
  if (filter === 'bts') return /behind|bloop|interview/.test(text);
  if (filter === 'climaxes') return /revenge|secret|forbidden|betray|alpha/.test(text);
  return true;
}

export async function fetchReelsCatalog(params: {
  filter?: ReelFilter;
  moods?: ReelMood[];
  cursor?: string | null;
  limit?: number;
  signal?: AbortSignal;
}): Promise<ReelsPage> {
  const { filter = 'discover', moods = [], cursor, limit = 4, signal } = params;
  const page = await fetchReelsFeed({ cursor, limit, signal });
  const mapped = page.items.map(toInternalReel);
  for (const reel of mapped) {
    const existing = runtimeCatalog.findIndex((item) => item.id === reel.id);
    if (existing >= 0) runtimeCatalog[existing] = reel;
    else runtimeCatalog.push(reel);
  }
  const filtered = mapped.filter((reel) => matchesFilters(reel, filter, moods));
  if (filter === 'top10') filtered.sort((a, b) => b.stats.likes - a.stats.likes);
  return { items: filtered, nextCursor: page.nextCursor, source: 'catalog' };
}

export async function searchClips(query: string): Promise<ClipSearchResult[]> {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];
  return runtimeCatalog
    .filter((reel) => `${reel.source.title} ${reel.dialogueQuote || ''}`.toLowerCase().includes(clean))
    .map((reel) => ({
      reel,
      matchedField: reel.source.title.toLowerCase().includes(clean) ? 'title' : 'quote',
      matchedSnippet: reel.source.title,
      timestampMs: 0,
    }));
}

export async function fetchReelDiscussions(reelId: string): Promise<DiscussionComment[]> {
  return runtimeDiscussions[reelId] || [];
}

export async function addReelComment(
  reelId: string,
  author: string,
  text: string,
  timestampMs: number,
  reaction?: string
): Promise<DiscussionComment> {
  const comment: DiscussionComment = {
    id: `comment-${Date.now()}`,
    reelId,
    author: author || 'Audience member',
    text,
    timestampMs,
    likes: 0,
    reaction,
    createdAt: Date.now(),
  };
  runtimeDiscussions[reelId] = [...(runtimeDiscussions[reelId] || []), comment];
  return comment;
}
