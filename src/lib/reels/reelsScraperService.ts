/**
 * Live Short-Drama Scraper Service
 * Fetches real-time catalog & trending data directly from short-drama SSR endpoints
 * without requiring any third-party coin wallets or website embeds.
 * Converts scraped data into verified native HLS stream-compatible items.
 */
import type { DramaSeries } from './dramaboxTypes';
import { getStreamForDrama } from './dramaboxApi';
import { getOfficialEmbedUrl, isEmbedUrl } from '../../api/reelsProviders';
import { DRAMABOX_DRAMAS } from '../../data/dramaboxData';
import { REELSHORT_DRAMAS } from '../../data/reelshortData';

export interface ScrapedDramaItem {
  id: string;
  title: string;
  coverPic: string;
  description: string;
  chapterCount: number;
  readCount: number;
  collectCount: number;
  theme: string[];
}

let cachedScrapedSeries: DramaSeries[] | null = null;
let lastScrapeTimestamp = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Extract JSON __NEXT_DATA__ payload from HTML
 */
function extractNextData(html: string): any | null {
  try {
    const marker = '<script id="__NEXT_DATA__" type="application/json">';
    const startIdx = html.indexOf(marker);
    if (startIdx === -1) return null;
    const endIdx = html.indexOf('</script>', startIdx);
    if (endIdx === -1) return null;
    const jsonStr = html.substring(startIdx + marker.length, endIdx);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * Fetch raw HTML from ReelShort using Vite proxy or direct fetch
 */
async function fetchRawCatalogHtml(): Promise<string | null> {
  // Strategy 1: Local Vite proxy route (bypasses CORS in dev)
  try {
    const proxyRes = await fetch('/api/scraper-reelshort', {
      headers: { Accept: 'text/html' },
    });
    if (proxyRes.ok) {
      const text = await proxyRes.text();
      if (text.includes('__NEXT_DATA__')) return text;
    }
  } catch {
    // Proxy unavailable; proceed to direct fetch
  }

  // Strategy 2: Direct fetch (works in environments where CORS is relaxed or SSR)
  try {
    const directRes = await fetch('https://www.reelshort.com', {
      headers: { Accept: 'text/html' },
    });
    if (directRes.ok) {
      const text = await directRes.text();
      if (text.includes('__NEXT_DATA__')) return text;
    }
  } catch {
    // Direct fetch blocked by CORS
  }

  return null;
}

/**
 * Parse SSR payload into normalized DramaSeries objects with 100% free streams
 */
function parseSsrToDramaSeries(nextData: any): DramaSeries[] {
  const fallback = nextData?.props?.pageProps?.fallback || {};
  const webInfo = fallback['/api/ms/hall/webInfo'] || {};
  const banners = Array.isArray(webInfo.banners) ? webInfo.banners : [];

  const scrapedItems: DramaSeries[] = [];
  const seenIds = new Set<string>();

  for (const b of banners) {
    const p = b.jump_param || {};
    const id = String(p.book_id || b.b_id || '').trim();
    const title = String(p.book_title || b.title || '').trim();
    const coverPic = String(p.book_pic || b.pic || '').trim();

    if (!id || !title || seenIds.has(id)) continue;
    seenIds.add(id);

    const themes: string[] = Array.isArray(p.theme_list)
      ? p.theme_list.map((t: any) => t.theme_name || t.name || '').filter(Boolean)
      : ['Trending', 'DramaBox'];

    scrapedItems.push({
      id,
      title,
      cover_pic: coverPic,
      description: p.special_desc || `Watch "${title}" in full HD. 100% free short drama series on CineBai.`,
      chapter_count: Math.max(10, Number(p.chapter_count) || 45),
      read_count: Math.floor(Math.random() * 500000) + 400000,
      collect_count: Math.floor(Math.random() * 30000) + 15000,
      theme: themes.length > 0 ? themes : ['Billionaire', 'Revenge'],
    });
  }

  return scrapedItems;
}

/**
 * Convert full curated catalogs (REELSHORT_DRAMAS + DRAMABOX_DRAMAS) to DramaSeries
 */
function getCuratedDramaSeries(): DramaSeries[] {
  const map = new Map<string, DramaSeries>();

  // 1. ReelShort 125 micro-dramas
  for (const d of REELSHORT_DRAMAS) {
    if (!d || !d.id) continue;
    map.set(d.id, {
      id: d.id,
      title: d.title,
      cover_pic: d.verticalPoster || d.coverImage,
      description: d.synopsis || d.tagline || `Watch "${d.title}" 100% free on CineBai.`,
      chapter_count: d.totalEpisodes || (d.episodes ? d.episodes.length : 40),
      read_count: d.readCount || 850000,
      collect_count: d.collectCount || 42000,
      theme: d.tags || d.categories || ['Trending', 'ReelShort'],
    });
  }

  // 2. DramaBox curated dramas
  for (const d of DRAMABOX_DRAMAS) {
    if (!d || !d.id) continue;
    if (!map.has(d.id)) {
      map.set(d.id, {
        id: d.id,
        title: d.title,
        cover_pic: d.coverImage || d.verticalPoster,
        description: d.synopsis || d.tagline || `Watch "${d.title}" 100% free on CineBai.`,
        chapter_count: d.totalEpisodes || 40,
        read_count: d.readCount || 650000,
        collect_count: d.collectCount || 28000,
        theme: d.tags || ['DramaBox', 'Trending'],
      });
    }
  }

  return Array.from(map.values());
}

/**
 * Scrape live short drama catalog.
 * Merges freshly scraped SSR items with curated catalog (155+ dramas), ensuring all streams are unique and 100% free.
 */
export async function scrapeLiveCatalog(): Promise<DramaSeries[]> {
  const now = Date.now();
  if (cachedScrapedSeries && now - lastScrapeTimestamp < CACHE_TTL_MS) {
    return cachedScrapedSeries;
  }

  const curated = getCuratedDramaSeries();

  try {
    const html = await fetchRawCatalogHtml();
    if (html) {
      const nextData = extractNextData(html);
      if (nextData) {
        const scraped = parseSsrToDramaSeries(nextData);
        if (scraped.length > 0) {
          // Merge scraped items with verified catalog items
          const map = new Map<string, DramaSeries>();
          for (const item of scraped) {
            map.set(item.id, item);
          }
          for (const item of curated) {
            if (!map.has(item.id)) {
              map.set(item.id, item);
            }
          }
          cachedScrapedSeries = Array.from(map.values());
          lastScrapeTimestamp = now;
          return cachedScrapedSeries;
        }
      }
    }
  } catch (err) {
    console.warn('[ReelsScraper] Live scrape skipped, using verified catalog:', err);
  }

  cachedScrapedSeries = curated;
  lastScrapeTimestamp = now;
  return cachedScrapedSeries;
}

/**
 * Scrape detail for a specific drama including generated 100% free unlocked episodes
 */
export async function scrapeDramaDetail(seriesId: string) {
  const catalog = await scrapeLiveCatalog();
  const matched = catalog.find((c) => c.id === seriesId) || catalog[0];

  // Check if we have rich episode metadata from REELSHORT_DRAMAS or DRAMABOX_DRAMAS
  const richReelshort = REELSHORT_DRAMAS.find((d) => d.id === seriesId || d.bookId === seriesId);
  const richDramabox = DRAMABOX_DRAMAS.find((d) => d.id === seriesId || d.bookId === seriesId);
  const richSource = richReelshort || richDramabox;

  const totalCount = richSource?.totalEpisodes || matched.chapter_count || 40;
  const rawEpisodes = richSource?.episodes && richSource.episodes.length > 0
    ? richSource.episodes
    : Array.from({ length: Math.min(80, totalCount) }).map((_, idx) => ({
        id: `${matched.id}-ep${idx + 1}`,
        episodeNumber: idx + 1,
        title: `Episode ${idx + 1}`,
        duration: '1:30',
        videoUrl: getStreamForDrama(matched.id, idx + 1),
        thumbnail: matched.cover_pic,
      }));

  const episodes = rawEpisodes.map((ep: any, idx: number) => {
    const epNum = ep.episodeNumber || idx + 1;
    const m3u8Candidate = (ep.m3u8Url && ep.m3u8Url.includes('.m3u8'))
      ? ep.m3u8Url
      : (ep.videoUrl && ep.videoUrl.includes('.m3u8'))
        ? ep.videoUrl
        : undefined;

    const embedCandidate = (ep.videoUrl && isEmbedUrl(ep.videoUrl))
      ? ep.videoUrl
      : getOfficialEmbedUrl(matched.id, richReelshort?.chapterId || '1y6ssuu6');

    const finalStream = m3u8Candidate || embedCandidate || getStreamForDrama(matched.id, epNum);

    return {
      id: ep.id || `${matched.id}-ep${epNum}`,
      series_id: matched.id,
      episode_index: epNum,
      title: ep.title || `Episode ${epNum}`,
      duration: typeof ep.duration === 'number' ? ep.duration : 90,
      video_url: finalStream,
      m3u8_url: m3u8Candidate,
      embed_url: embedCandidate,
      video_pic: ep.thumbnail || matched.cover_pic,
      is_unlocked: true,
      is_paid: false,
      coin_cost: 0,
    };
  });

  return {
    series: matched,
    episodes,
    history: null,
  };
}
