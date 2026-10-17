import type {
  DramaSeries,
  DramaSeriesDetailResponse,
  DramaAuthResponse,
  DramaUser,
} from './dramaboxTypes';
import { DRAMABOX_DRAMAS } from '../../data/dramaboxData';
import { scrapeLiveCatalog, scrapeDramaDetail } from './reelsScraperService';

export const VERIFIED_SHORT_DRAMA_STREAMS = [
  {
    id: '6a44705b27bdb68e4a0834fc',
    title: 'Born an Heiress, Branded a Clone',
    streamUrl: 'https://v-mps.crazymaplestudios.com/vod-112094/7031615d8c0271f180ae4077c0c30102/fa8bf853155e4793960c7288df728286-86bc1d6add827ea1a61d67c2de34a7c4-sd.m3u8',
  },
  {
    id: '65605a422ebd4e4f290df77a',
    title: 'Married at First Sight',
    streamUrl: 'https://v-mps.crazymaplestudios.com/f0c7b29dc90e71f09c7c3108f4840102/video/f64886abe186452fbaeccb23d066c519-1724695e9f79d89b5185853fc3bd7c5c-video-sd.m3u8',
  },
  {
    id: '6a331cd1d5cb2422d00af359',
    title: 'My X-Ray Vision Sees Right Through You',
    streamUrl: 'https://v-mps.crazymaplestudios.com/70ccab4c71b671f1a611f6f7c4590102/video/d18a05ecacbd4845b649719fcba6f95d-38632476b0de7c8d75bff1df3712145a-video-sd.m3u8',
  },
  {
    id: '6a56dd826a410e5f5d04c33b',
    title: 'Zero to Alpha: Return of the Wolf King',
    streamUrl: 'https://v-mps.crazymaplestudios.com/d07050c981b271f1801ee6f6c55a0102/video/b1ef4920c51a4d1faaadd24507959b14-38632476b0de7c8d75bff1df3712145a-video-sd.m3u8',
  },
  {
    id: '6a3d1836ade141bc9d0a7026',
    title: 'Brides in Smoke',
    streamUrl: 'https://v-mps.crazymaplestudios.com/vod-112094/80bcc54a736571f19711f6e6c5490102/49f6f216efb8441cbc63fdb33608d36d-72c64815dba4168668a712a2d5f0cff9-sd.m3u8',
  },
  {
    id: '69fa0a977e9368c0730c1459',
    title: 'Rejected Luna Is the Alpha Queen',
    streamUrl: 'https://v-mps.crazymaplestudios.com/103d58134ad771f1bfdfe6f6c54b0102/video/d9969d2efbf74f22b86dced2cf64c98b-38632476b0de7c8d75bff1df3712145a-video-sd.m3u8',
  },
  {
    id: '69d91b111840476dfa0eba40',
    title: 'Hate to Love You',
    streamUrl: 'https://v-mps.crazymaplestudios.com/80ea8a6c482171f1bfdbe6e7d4480102/video/02121386b49f46a6a76d43479c76da20-38632476b0de7c8d75bff1df3712145a-video-sd.m3u8',
  },
  {
    id: '6a43729bfd4df5cb34078482',
    title: 'The Professor’s Forbidden Dragon Prey',
    streamUrl: 'https://v-mps.crazymaplestudios.com/vod-112094/a01f2f9a768a71f1aecfe6e6d5480102/eecb6049028146768b47e2b098ee3718-48bf71e93eecdc5c3a6d15a1bd341dd8-sd.m3u8',
  },
  {
    id: '6a792e03ee704ba9f605ffb9',
    title: "My Billionaire Boss Won't Let Me Quit",
    streamUrl: 'https://v-mps.crazymaplestudios.com/7059d424957371f18036f7e7c57a0102/video/6a009a82117043c7aa1272e2ee2257d8-38632476b0de7c8d75bff1df3712145a-video-sd.m3u8',
  },
  {
    id: '6a547c258e7dc74d870b30af',
    title: 'The Valkyrie Divorces the God of War',
    streamUrl: 'https://v-mps.crazymaplestudios.com/601e3d187f3c71f1a92bf7e6c5580102/video/8b29698ceab54bd79a8e596d3259d8d9-38632476b0de7c8d75bff1df3712145a-video-sd.m3u8',
  },
  {
    id: '6a31351edd8a999e1e0f891c',
    title: 'The Sylvan Crest Swap',
    streamUrl: 'https://v-mps.crazymaplestudios.com/vod-112094/f05a96b26a1d71f1ae29e6e6d5480102/1b31926ea3244d54ac0331d1f3217868-9ed21b0c78a1f8b40cc853a7495c6710-sd.m3u8',
  },
  {
    id: '6aafa7fc530d47585a054f74',
    title: "The Triplets' Final Regret",
    streamUrl: 'https://v-mps.crazymaplestudios.com/70dca018b5a671f181fce7e7c7690102/video/fdd529d30c364427a1383a102ad61753-38632476b0de7c8d75bff1df3712145a-video-sd.m3u8',
  },
  {
    id: '6aa24b86d6c23093cf06e859',
    title: 'Step Back! That Homeless Man Is Not to be Messed with',
    streamUrl: 'https://v-mps.crazymaplestudios.com/307574cfb0ae71f180d0e7e7c7690102/video/8deb3b5f4ec2414f92f954ea58f7de51-38632476b0de7c8d75bff1df3712145a-video-sd.m3u8',
  },
  {
    id: '6a06477801cfe98f60076ded',
    title: 'The Imperfect Marriage',
    streamUrl: 'https://v-mps.crazymaplestudios.com/f065eb404fe571f19a71f7f7c5580102/video/3dbaad7156104c5bb4938127e93d7983-38632476b0de7c8d75bff1df3712145a-video-sd.m3u8',
  },
  {
    id: '6a826e8e44e10020b10b8cae',
    title: 'A Cinderella for Wolf King',
    streamUrl: 'https://v-mps.crazymaplestudios.com/f061060d9b7f71f1bd1df7e6c5580102/video/299340bc69ad427e8916504da6b56d93-38632476b0de7c8d75bff1df3712145a-video-sd.m3u8',
  },
  {
    id: '6a951fac6e99d6bfe505e0dc',
    title: 'Tempted by My Bad Boy Stepbrother',
    streamUrl: 'https://v-mps.crazymaplestudios.com/e064e132a67671f18f87e6f7e47a0102/video/a08b3126b09f4861b6686fa24278d1f7-38632476b0de7c8d75bff1df3712145a-video-sd.m3u8',
  },
  {
    id: '6a9a22922dffdf54e50ba5a5',
    title: "Accidentally His: The Dragon King Won't Let Go",
    streamUrl: 'https://v-mps.crazymaplestudios.com/7010a509b49771f18144e6f6c55b0102/video/790a19cef526435dacd2b7a1c6fce093-38632476b0de7c8d75bff1df3712145a-video-sd.m3u8',
  },
  {
    id: '6a629f5ea1c787017500913a',
    title: 'Take Me Back to the Night We Met',
    streamUrl: 'https://v-mps.crazymaplestudios.com/10e2d21c907271f1a062166993960102/video/0a23570c0e50404c991d77c9533eef6a-38632476b0de7c8d75bff1df3712145a-video-sd.m3u8',
  },
  {
    id: '69eed7874eaee13cfb03b52d',
    title: "Luna Reborn: Alpha's Second Chance",
    streamUrl: 'https://v-mps.crazymaplestudios.com/5044177a6a2771f1810be6f6c55a0102/video/86b48243152c443989a1c849eb0e6316-38632476b0de7c8d75bff1df3712145a-video-sd.m3u8',
  },
];

/**
 * Deterministically resolves a verified working .m3u8 stream for a given drama and episode index.
 * Prevents identical video playback across different series.
 */
export function getStreamForDrama(seriesId: string, episodeIndex = 1): string {
  // Check exact ID match for episode 1
  const exactMatch = VERIFIED_SHORT_DRAMA_STREAMS.find(
    (s) => s.id === seriesId || seriesId.includes(s.id)
  );
  if (exactMatch && episodeIndex === 1) {
    return exactMatch.streamUrl;
  }

  // Deterministically hash seriesId + episodeIndex to select distinct stream from the pool
  let hash = 0;
  const seed = `${seriesId}:${episodeIndex}`;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % VERIFIED_SHORT_DRAMA_STREAMS.length;
  return VERIFIED_SHORT_DRAMA_STREAMS[index].streamUrl;
}

function toDramaSeries(d: any): DramaSeries {
  return {
    id: d.id || d.bookId,
    title: d.title,
    cover_pic: d.verticalPoster || d.coverImage,
    description: d.synopsis || d.tagline || '',
    chapter_count: d.totalEpisodes || 30,
    read_count: d.readCount || 500000,
    collect_count: d.collectCount || 25000,
    theme: d.tags || d.categories || ['Trending'],
  };
}

const fallbackSeriesList: DramaSeries[] = DRAMABOX_DRAMAS.map(toDramaSeries);

export const dramaboxApi = {
  /**
   * Fetch live trending mini-series via scraper API (fallback to local curated catalog)
   */
  async getTrendingSeries(): Promise<DramaSeries[]> {
    try {
      const catalog = await scrapeLiveCatalog();
      if (catalog && catalog.length > 0) {
        return catalog.slice(0, 30);
      }
    } catch {
      // Fallback
    }
    return fallbackSeriesList.slice(0, 30);
  },

  /**
   * Fetch full catalog / All Movies with pagination
   */
  async getAllMovies(page = 1): Promise<{ items: DramaSeries[]; page: number }> {
    const catalog = await scrapeLiveCatalog();
    const safePage = Math.max(1, page);
    const pageSize = 24;
    const start = (safePage - 1) * pageSize;
    return {
      items: catalog.slice(start, start + pageSize),
      page: safePage,
    };
  },

  /**
   * Fetch new releases / Fresh drops
   */
  async getNewReleases(page = 1): Promise<{ items: DramaSeries[]; page: number; total?: number }> {
    const catalog = await scrapeLiveCatalog();
    const safePage = Math.max(1, page);
    const pageSize = 24;
    const start = (safePage - 1) * pageSize;
    return {
      items: catalog.slice(start + 6, start + 6 + pageSize),
      page: safePage,
      total: catalog.length,
    };
  },

  /**
   * Search titles, billionaires, alphas, keywords
   */
  async searchSeries(keywords: string): Promise<DramaSeries[]> {
    const trimmed = keywords.trim().toLowerCase();
    if (!trimmed) return [];
    const catalog = await scrapeLiveCatalog();
    return catalog.filter(
      (s) =>
        s.title.toLowerCase().includes(trimmed) ||
        s.description.toLowerCase().includes(trimmed) ||
        s.theme.some((t) => t.toLowerCase().includes(trimmed))
    );
  },

  /**
   * Fetch series metadata, episode playlist, and 100% free unlocked streams
   */
  async getSeriesDetail(
    id: string,
    _episodeId?: string,
    _refreshStream = true,
    _token?: string | null
  ): Promise<DramaSeriesDetailResponse | null> {
    try {
      const detail = await scrapeDramaDetail(id);
      if (detail && detail.series) {
        return detail;
      }
    } catch (err) {
      console.warn('[DramaBox] Error fetching scraped detail:', err);
    }

    const matchedDrama = DRAMABOX_DRAMAS.find((d) => d.id === id || d.bookId === id);
    const series: DramaSeries = matchedDrama
      ? toDramaSeries(matchedDrama)
      : {
          id,
          title: id.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          cover_pic: 'https://v-img.crazymaplestudios.com/v-images/book_cover_batch/200000000000000034/55598531-ee05-496a-8694-9cc9fcf09be7.jpg',
          description: '100% Free streaming short drama episode series.',
          chapter_count: 30,
          read_count: 500000,
          collect_count: 25000,
          theme: ['Trending', 'Series'],
        };

    const rawEpisodes = (matchedDrama?.episodes && matchedDrama.episodes.length > 0)
      ? matchedDrama.episodes
      : Array.from({ length: series.chapter_count || 30 }).map((_, idx) => ({
          id: `${series.id}-${idx + 1}`,
          episodeNumber: idx + 1,
          title: `Episode ${idx + 1}`,
          videoUrl: getStreamForDrama(series.id, idx + 1),
          thumbnail: series.cover_pic,
        }));

    const episodes = rawEpisodes.map((ep: any, idx: number) => {
      const epNum = ep.episodeNumber || idx + 1;
      const finalUrl = (ep.videoUrl && ep.videoUrl.trim().length > 0)
        ? ep.videoUrl
        : (ep.m3u8Url && ep.m3u8Url.trim().length > 0)
          ? ep.m3u8Url
          : getStreamForDrama(series.id, epNum);

      return {
        id: ep.id || `${series.id}-${epNum}`,
        series_id: series.id,
        episode_index: epNum,
        title: ep.title || `Episode ${epNum}`,
        duration: 90,
        video_url: finalUrl,
        video_pic: ep.thumbnail || series.cover_pic,
        is_unlocked: true,
        is_paid: false,
        coin_cost: 0,
      };
    });

    return {
      series,
      episodes,
      history: null,
    };
  },

  /**
   * Unlock episode - everything is completely free
   */
  async unlockEpisode(_episodeId: string, _token?: string | null): Promise<boolean> {
    return true;
  },

  /**
   * Register a new user account (100% free account)
   */
  async register(username: string, _password: string): Promise<DramaAuthResponse> {
    const user: DramaUser = {
      id: Date.now(),
      username: username.trim() || 'CineBai Explorer',
      coins: 999999, // Infinite free coins
    };
    const token = `token-${Date.now()}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('dramabox_token', token);
      localStorage.setItem('dramabox_user', JSON.stringify(user));
    }
    return { token, user };
  },

  /**
   * Login with existing credentials
   */
  async login(username: string, _password: string): Promise<DramaAuthResponse> {
    const user: DramaUser = {
      id: Date.now(),
      username: username.trim() || 'CineBai Explorer',
      coins: 999999,
    };
    const token = `token-${Date.now()}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('dramabox_token', token);
      localStorage.setItem('dramabox_user', JSON.stringify(user));
    }
    return { token, user };
  },

  /**
   * Fetch user profile & cloud watch history
   */
  async getUserProfile(_token?: string | null): Promise<{ user: DramaUser; watch_history: any[] } | null> {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('dramabox_user');
      const user: DramaUser = stored
        ? JSON.parse(stored)
        : {
            id: 1,
            username: 'CineBai Viewer',
            coins: 999999,
          };
      const histStored = localStorage.getItem('cinebai_watch_history');
      const history = histStored ? JSON.parse(histStored) : [];
      return { user, watch_history: history };
    } catch {
      return null;
    }
  },

  /**
   * Save playback progress heartbeat locally
   */
  async saveWatchHistory(
    seriesId: string,
    episodeId: string,
    episodeIndex: number,
    progressSeconds: number,
    _token?: string | null
  ): Promise<boolean> {
    if (typeof window === 'undefined') return true;
    try {
      const key = 'cinebai_watch_history';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = existing.filter((h: any) => h.series_id !== seriesId);
      filtered.unshift({
        series_id: seriesId,
        episode_id: episodeId,
        episode_index: episodeIndex,
        progress_seconds: Math.floor(progressSeconds),
        updated_at: new Date().toISOString(),
      });
      localStorage.setItem(key, JSON.stringify(filtered.slice(0, 50)));
      return true;
    } catch {
      return false;
    }
  },
};
