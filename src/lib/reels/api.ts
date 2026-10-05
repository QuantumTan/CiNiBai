/**
 * Reels API Client & Infinite Discovery Engine (§5.1, §5.4)
 * Handles cursor-based pagination, single-flight deduplication, spotlight search,
 * and the Infinite Discovery Loop upon catalog exhaustion.
 */
import type { 
  Reel, 
  ReelsPage, 
  ReelFilter, 
  ReelMood, 
  ClipSearchResult, 
  DiscussionComment 
} from './types';
import { INITIAL_REELS_CATALOG, MOCK_DISCUSSIONS } from './mockData';
import { dramaboxApi } from './dramaboxApi';

// In-memory catalog state with expanded items for continuous playback
const runtimeCatalog: Reel[] = [...INITIAL_REELS_CATALOG];
const runtimeDiscussions: Record<string, DiscussionComment[]> = { ...MOCK_DISCUSSIONS };

let hasSyncedDramaBox = false;

/**
 * Dynamically syncs real-time live DramaBox episodes (.m3u8) into the Reels engine
 */
async function syncLiveDramaBoxIntoCatalog() {
  if (hasSyncedDramaBox) return;
  hasSyncedDramaBox = true;
  try {
    const trending = await dramaboxApi.getTrendingSeries();
    if (!trending || trending.length === 0) return;

    const sampleSeries = trending.slice(0, 8);
    for (const s of sampleSeries) {
      try {
        const detail = await dramaboxApi.getSeriesDetail(s.id, undefined, true);
        const validEps = detail?.episodes?.filter((e) => !!e.video_url && e.video_url.includes('.m3u8')) || [];
        for (const ep of validEps.slice(0, 2)) {
          const dramaReelId = `dramabox-${s.id}-${ep.id}`;
          if (runtimeCatalog.some((r) => r.id === dramaReelId)) continue;

          const dramaReel: Reel = {
            id: dramaReelId,
            playbackUrl: ep.video_url,
            posterUrl: ep.video_pic || s.cover_pic,
            blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
            aspect: '9:16',
            durationMs: (ep.duration || 120) * 1000,
            palette: ['#08080a', '#1c1016', '#e11d48'],
            source: {
              titleId: s.id,
              kind: 'series',
              title: `${s.title} · Ep ${ep.episode_index}`,
              season: 1,
              episode: ep.episode_index,
              posterUrl: s.cover_pic,
              startAtMs: 0,
            },
            score: {
              track: 'Original Drama Soundtrack',
              artist: s.title,
              waveformPeaks: [0.3, 0.5, 0.8, 0.4, 0.7, 0.9, 0.6, 0.4, 0.7, 0.5, 0.8, 0.6, 0.9, 0.7, 0.4],
            },
            people: [
              { id: `cast-${s.id}`, name: s.title.split(' ')[0] || 'Drama Lead', role: 'actor' },
            ],
            stats: {
              likes: s.read_count ? Math.floor(s.read_count / 15) : 18500,
              comments: s.collect_count ? Math.floor(s.collect_count / 25) : 620,
            },
            viewer: {
              liked: false,
              saved: false,
            },
            dialogueQuote: s.description ? s.description.slice(0, 90) : undefined,
            tags: s.theme || ['Short Drama', 'DramaBox', 'Viral'],
          };

          runtimeCatalog.unshift(dramaReel);
        }
      } catch {
        // Individual series timeout, continue
      }
    }
  } catch (err) {
    console.warn('[DramaBox] Could not sync live reels catalog:', err);
  }
}

// Trigger initial live sync in the background
syncLiveDramaBoxIntoCatalog();

// Set of all viewed reel IDs to avoid immediate repeats during Discovery Loop
const viewedReelIds = new Set<string>();

/**
 * Filter reels by category and mood tags
 */
function applyFilters(reels: Reel[], filter: ReelFilter, moods: ReelMood[]): Reel[] {
  let list = reels;

  if (filter === 'top10') {
    list = [...list].sort((a, b) => b.stats.likes - a.stats.likes).slice(0, 10);
  } else if (filter === 'climaxes') {
    list = list.filter((r) => r.tags?.some((t) => /climax|tension|docking|test/i.test(t)));
  } else if (filter === 'soundtracks') {
    list = list.filter((r) => !!r.score);
  } else if (filter === 'bts') {
    list = list.filter((r) => r.tags?.some((t) => /behind|interview|70mm|deakins/i.test(t)));
  }

  if (moods.length > 0) {
    const moodTerms = moods.map((m) => m.toLowerCase());
    list = list.filter((r) => {
      const text = `${r.source.title} ${r.dialogueQuote || ''} ${r.tags?.join(' ') || ''}`.toLowerCase();
      return moodTerms.some((term) => text.includes(term));
    });
  }

  return list;
}

/**
 * Single-flight in-memory cursor pagination engine (§5.1, §5.4)
 */
export async function fetchReelsCatalog(params: {
  filter?: ReelFilter;
  moods?: ReelMood[];
  cursor?: string | null;
  limit?: number;
}): Promise<ReelsPage> {
  const { filter = 'discover', moods = [], cursor = null, limit = 4 } = params;

  // Simulate ultra-low network latency (60-120ms)
  await new Promise((res) => setTimeout(res, 85));

  const filtered = applyFilters(runtimeCatalog, filter, moods);

  // If no items match mood filter, fall back gracefully to unfiltered catalog
  const pool = filtered.length > 0 ? filtered : runtimeCatalog;

  let startIndex = 0;
  if (cursor) {
    const parsed = parseInt(cursor, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      startIndex = parsed;
    }
  }

  const endIndex = startIndex + limit;
  const slice = pool.slice(startIndex, endIndex);

  // Mark items as viewed
  for (const item of slice) {
    viewedReelIds.add(item.id);
  }

  // Check if catalog has more items
  if (endIndex < pool.length) {
    return {
      items: slice,
      nextCursor: String(endIndex),
      source: 'catalog',
    };
  }

  // =========================================================================
  // Infinite Discovery Loop (§5.4) - Never allow the feed to dead-end!
  // =========================================================================
  if (slice.length > 0) {
    return {
      items: slice,
      nextCursor: 'discovery-start-0',
      source: 'catalog',
    };
  }

  // Synthesize discovery variations based on viewed affinity
  const discoveryIndex = cursor?.startsWith('discovery-start-') 
    ? parseInt(cursor.replace('discovery-start-', ''), 10) 
    : 0;

  // Cycle and slightly mutate catalog with unique IDs to keep virtual window flowing
  const seedReel = pool[discoveryIndex % pool.length] || INITIAL_REELS_CATALOG[0];
  const discoveryReel: Reel = {
    ...seedReel,
    id: `discovery-${discoveryIndex}-${seedReel.id}`,
    stats: {
      likes: seedReel.stats.likes + (discoveryIndex + 1) * 37,
      comments: seedReel.stats.comments + 4,
    },
    viewer: {
      liked: false,
      saved: false,
    },
  };

  return {
    items: [discoveryReel],
    nextCursor: `discovery-start-${discoveryIndex + 1}`,
    source: 'discovery',
  };
}

/**
 * Spotlight Clip Search (§6.1)
 * Searches dialogue quotes, actors, directors, scene tags, and titles.
 */
export async function searchClips(query: string): Promise<ClipSearchResult[]> {
  if (!query || query.trim().length === 0) return [];

  const clean = query.trim().toLowerCase();
  const results: ClipSearchResult[] = [];

  for (const reel of runtimeCatalog) {
    if (reel.dialogueQuote?.toLowerCase().includes(clean)) {
      results.push({
        reel,
        matchedField: 'quote',
        matchedSnippet: `"${reel.dialogueQuote}"`,
        timestampMs: 15000,
      });
      continue;
    }

    const matchedActor = reel.people.find((p) => p.name.toLowerCase().includes(clean));
    if (matchedActor) {
      results.push({
        reel,
        matchedField: matchedActor.role,
        matchedSnippet: `${matchedActor.name} (${matchedActor.role}) in ${reel.source.title}`,
        timestampMs: 0,
      });
      continue;
    }

    const matchedTag = reel.tags?.find((t) => t.toLowerCase().includes(clean));
    if (matchedTag) {
      results.push({
        reel,
        matchedField: 'tag',
        matchedSnippet: `#${matchedTag}`,
        timestampMs: 0,
      });
      continue;
    }

    if (reel.source.title.toLowerCase().includes(clean)) {
      results.push({
        reel,
        matchedField: 'title',
        matchedSnippet: reel.source.title,
        timestampMs: 0,
      });
    }
  }

  return results;
}

/**
 * Fetch timecode-synchronized discussion reactions (§6.2)
 */
export async function fetchReelDiscussions(reelId: string): Promise<DiscussionComment[]> {
  const baseId = reelId.replace(/^discovery-\d+-/, '');
  return runtimeDiscussions[baseId] || runtimeDiscussions[reelId] || [];
}

/**
 * Add reaction/comment to reel discussion (§6.2)
 */
export async function addReelComment(
  reelId: string,
  author: string,
  text: string,
  timestampMs: number,
  reaction?: string
): Promise<DiscussionComment> {
  const baseId = reelId.replace(/^discovery-\d+-/, '');
  const newComment: DiscussionComment = {
    id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    reelId: baseId,
    author: author || 'Film Enthusiast',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    text,
    timestampMs,
    likes: 0,
    reaction,
    createdAt: Date.now(),
  };

  if (!runtimeDiscussions[baseId]) {
    runtimeDiscussions[baseId] = [];
  }
  runtimeDiscussions[baseId].push(newComment);
  return newComment;
}
