import type {
  ClipSearchResult,
  DiscussionComment,
  Reel,
  ReelFilter,
  ReelItem,
  ReelMood,
  ReelsPage,
} from './types';

const API_BASE = 'https://apireel.7xm.dev';
const REQUEST_TIMEOUT_MS = 25_000;

interface ReelsFeedParams {
  cursor?: string | null;
  page?: number;
  limit?: number;
  sessionId?: string;
  deviceId?: string;
  signal?: AbortSignal;
}

interface RawSeries {
  id: string;
  title: string;
  cover_pic: string;
  description: string;
  chapter_count: number;
  read_count: number;
  collect_count: number;
  theme: string[];
}

interface RawEpisode {
  id: string;
  series_id: string;
  episode_index: number;
  title: string;
  duration: number;
  video_url: string;
  video_pic: string;
  is_unlocked: boolean;
}

interface RawPage {
  items?: unknown;
  data?: unknown;
  totalPages?: unknown;
  hasMore?: unknown;
}

const runtimeCatalog: Reel[] = [];
const runtimeDiscussions: Record<string, DiscussionComment[]> = {};

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asCount(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function parseSeries(value: unknown): RawSeries | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const id = asText(item.id);
  const title = asText(item.title);
  const cover = asText(item.cover_pic);
  if (!id || !title || !isHttpUrl(cover)) return null;

  return {
    id,
    title,
    cover_pic: cover,
    description: asText(item.description),
    chapter_count: asCount(item.chapter_count),
    read_count: asCount(item.read_count),
    collect_count: asCount(item.collect_count),
    theme: Array.isArray(item.theme)
      ? item.theme.map(asText).filter(Boolean).slice(0, 8)
      : [],
  };
}

function parseEpisode(value: unknown): RawEpisode | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const id = asText(item.id);
  const seriesId = asText(item.series_id);
  const videoUrl = asText(item.video_url);
  if (!id || !seriesId) return null;

  return {
    id,
    series_id: seriesId,
    episode_index: Math.max(1, asCount(item.episode_index)),
    title: asText(item.title) || 'Episode',
    duration: asCount(item.duration),
    video_url: isHttpUrl(videoUrl) ? videoUrl : '',
    video_pic: asText(item.video_pic),
    is_unlocked: item.is_unlocked !== false,
  };
}

async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abortFromParent = () => controller.abort();
  signal?.addEventListener('abort', abortFromParent, { once: true });

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Feed request failed (${response.status})`);
    return await response.json();
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abortFromParent);
  }
}

function parseCursor(cursor: string | null | undefined, fallbackPage = 1) {
  const match = cursor?.match(/^(\d+):(\d+)$/);
  if (!match) return { page: Math.max(1, fallbackPage), offset: 0 };
  return {
    page: Math.max(1, Number(match[1])),
    offset: Math.max(0, Number(match[2])),
  };
}

function appendClientIdentifiers(
  params: URLSearchParams,
  sessionId?: string,
  deviceId?: string
) {
  if (sessionId) params.set('session_id', sessionId);
  if (deviceId) params.set('device_id', deviceId);
}

async function getPlayableEpisode(series: RawSeries, signal?: AbortSignal) {
  const initialParams = new URLSearchParams({ id: series.id, refresh_stream: '1' });
  const initial = (await fetchJson(
    `${API_BASE}/api/series/detail.php?${initialParams.toString()}`,
    signal
  )) as Record<string, unknown>;
  const episodes = Array.isArray(initial.episodes)
    ? initial.episodes.map(parseEpisode).filter((episode): episode is RawEpisode => !!episode)
    : [];
  return episodes.find((episode) => episode.is_unlocked && episode.video_url) || null;
}

function toFeedItem(series: RawSeries, episode: RawEpisode): ReelItem {
  const poster = isHttpUrl(episode.video_pic) ? episode.video_pic : series.cover_pic;
  return {
    id: `${series.id}:${episode.id}:${episode.episode_index}`,
    videoUrl: episode.video_url,
    posterUrl: poster,
    aspectRatio: 9 / 16,
    duration: episode.duration || undefined,
    author: {
      id: 'reelshort',
      username: 'ReelShort',
      isFollowed: false,
    },
    caption: `${series.title}\n${
      series.description || `Episode ${episode.episode_index}`
    }`,
    metrics: {
      likes: series.collect_count,
      comments: 0,
      shares: 0,
      views: series.read_count,
    },
  };
}

export async function fetchReelsFeed({
  cursor,
  page = 1,
  limit = 4,
  sessionId,
  deviceId,
  signal,
}: ReelsFeedParams = {}): Promise<{ items: ReelItem[]; nextCursor: string | null }> {
  const safeLimit = Math.min(10, Math.max(1, Math.floor(limit)));
  const position = parseCursor(cursor, page);
  let payload: RawPage;
  if (position.page === 1) {
    const trendingParams = new URLSearchParams();
    appendClientIdentifiers(trendingParams, sessionId, deviceId);
    const suffix = trendingParams.size ? `?${trendingParams.toString()}` : '';
    payload = (await fetchJson(
      `${API_BASE}/api/series/trending.php${suffix}`,
      signal
    )) as RawPage;
  } else {
    const pageParams = new URLSearchParams({ page: String(position.page - 1) });
    appendClientIdentifiers(pageParams, sessionId, deviceId);
    payload = (await fetchJson(
      `${API_BASE}/api/series/new-release.php?${pageParams.toString()}`,
      signal
    )) as RawPage;
  }

  const rawItems = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload.data)
      ? payload.data
      : [];
  const series = rawItems.map(parseSeries).filter((item): item is RawSeries => !!item);
  const candidates = series.slice(position.offset, position.offset + safeLimit + 2);
  const settled = await Promise.allSettled(
    candidates.map(async (item) => {
      const episode = await getPlayableEpisode(item, signal);
      return episode ? toFeedItem(item, episode) : null;
    })
  );
  const items = settled
    .flatMap((result) => (result.status === 'fulfilled' && result.value ? [result.value] : []))
    .slice(0, safeLimit);

  const nextOffset = position.offset + candidates.length;
  const totalPages = Math.max(position.page, asCount(payload.totalPages) + 1);
  const hasMorePages =
    position.page === 1 || payload.hasMore === true || position.page < totalPages;
  const nextCursor =
    nextOffset < series.length
      ? `${position.page}:${nextOffset}`
      : hasMorePages
        ? `${position.page + 1}:0`
        : null;

  return { items, nextCursor };
}

function toInternalReel(item: ReelItem): Reel {
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
    tags: ['ReelShort'],
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
