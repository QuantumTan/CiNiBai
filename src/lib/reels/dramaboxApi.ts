import type {
  DramaSeries,
  DramaSeriesDetailResponse,
  DramaAuthResponse,
  DramaUser,
} from './dramaboxTypes';
import { DRAMABOX_DRAMAS } from '../../data/dramaboxData';
import { INITIAL_REELS_CATALOG } from './mockData';

const API_BASE = 'https://apireel.7xm.dev';

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

function getAuthHeader(token?: string | null): Record<string, string> {
  const t = token || (typeof window !== 'undefined' ? localStorage.getItem('dramabox_token') : null);
  if (!t) return {};
  return { Authorization: `Bearer ${t}` };
}

export const dramaboxApi = {
  /**
   * Fetch live trending mini-series (fallback to local curated catalog if offline)
   */
  async getTrendingSeries(): Promise<DramaSeries[]> {
    try {
      const res = await fetch(`${API_BASE}/api/series/trending.php`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.data) && data.data.length > 0) {
          return data.data;
        }
      }
    } catch {
      // API unreachable; fallback smoothly
    }
    return fallbackSeriesList.slice(0, 30);
  },

  /**
   * Fetch full catalog / All Movies with pagination
   */
  async getAllMovies(page = 1): Promise<{ items: DramaSeries[]; page: number }> {
    try {
      const res = await fetch(`${API_BASE}/api/series/all-movies.php?page=${Math.max(1, page)}`);
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data?.data) ? data.data : [];
        if (items.length > 0) return { items, page };
      }
    } catch {
      // API unreachable; fallback
    }
    const safePage = Math.max(1, page);
    const pageSize = 24;
    const start = (safePage - 1) * pageSize;
    return {
      items: fallbackSeriesList.slice(start, start + pageSize),
      page: safePage,
    };
  },

  /**
   * Fetch new releases / Fresh drops
   */
  async getNewReleases(page = 1): Promise<{ items: DramaSeries[]; page: number; total?: number }> {
    try {
      const res = await fetch(`${API_BASE}/api/series/new-release.php?page=${Math.max(1, page)}`);
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data?.data) ? data.data : [];
        if (items.length > 0) return { items, page, total: data?.total };
      }
    } catch {
      // API unreachable; fallback
    }
    const safePage = Math.max(1, page);
    const pageSize = 24;
    const start = (safePage - 1) * pageSize;
    return {
      items: fallbackSeriesList.slice(start + 10, start + 10 + pageSize),
      page: safePage,
      total: fallbackSeriesList.length,
    };
  },

  /**
   * Search titles, billionaires, alphas, keywords
   */
  async searchSeries(keywords: string): Promise<DramaSeries[]> {
    const trimmed = keywords.trim().toLowerCase();
    if (!trimmed) return [];
    try {
      const res = await fetch(`${API_BASE}/api/series/search.php?keywords=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.data) && data.data.length > 0) return data.data;
      }
    } catch {
      // API unreachable; search local
    }
    return fallbackSeriesList.filter(
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
    episodeId?: string,
    refreshStream = true,
    token?: string | null
  ): Promise<DramaSeriesDetailResponse | null> {
    const workingFallbackStream =
      INITIAL_REELS_CATALOG[0]?.playbackUrl ||
      'https://v-mps.crazymaplestudios.com/vod-112094/7031615d8c0271f180ae4077c0c30102/fa8bf853155e4793960c7288df728286-86bc1d6add827ea1a61d67c2de34a7c4-sd.m3u8';

    try {
      const params = new URLSearchParams({ id });
      if (episodeId) params.set('episode_id', episodeId);
      if (refreshStream) params.set('refresh_stream', '1');

      const res = await fetch(`${API_BASE}/api/series/detail.php?${params.toString()}`, {
        headers: getAuthHeader(token),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.series) {
          const episodes = (Array.isArray(data.episodes) ? data.episodes : []).map((ep: any) => ({
            ...ep,
            is_unlocked: true,
            is_paid: false,
            coin_cost: 0,
            video_url: ep.video_url || workingFallbackStream,
          }));
          return {
            series: data.series,
            episodes,
            history: data.history || null,
          };
        }
      }
    } catch {
      // API unreachable; build from curated catalog
    }

    const localDrama = DRAMABOX_DRAMAS.find((d) => d.id === id || d.bookId === id) || DRAMABOX_DRAMAS[0];
    const series = toDramaSeries(localDrama);
    const episodes = (localDrama.episodes || []).map((ep, idx) => ({
      id: ep.id || `${series.id}-${idx + 1}`,
      series_id: series.id,
      episode_index: ep.episodeNumber || idx + 1,
      title: ep.title || `Episode ${idx + 1}`,
      duration: 90,
      video_url: ep.videoUrl || ep.m3u8Url || workingFallbackStream,
      video_pic: ep.thumbnail || series.cover_pic,
      is_unlocked: true,
      is_paid: false,
      coin_cost: 0,
    }));

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
   * Register a new user account (awards initial free coins)
   */
  async register(username: string, password: string): Promise<DramaAuthResponse> {
    const res = await fetch(`${API_BASE}/api/auth/register.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  /**
   * Login with existing credentials
   */
  async login(username: string, password: string): Promise<DramaAuthResponse> {
    const res = await fetch(`${API_BASE}/api/auth/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  /**
   * Fetch authenticated user profile & cloud watch history
   */
  async getUserProfile(token?: string | null): Promise<{ user: DramaUser; watch_history: any[] } | null> {
    try {
      const res = await fetch(`${API_BASE}/api/user/profile.php`, {
        headers: getAuthHeader(token),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error('[DramaBox] Error fetching profile:', err);
      return null;
    }
  },

  /**
   * Save playback progress heartbeat (called every 5s)
   */
  async saveWatchHistory(
    seriesId: string,
    episodeId: string,
    episodeIndex: number,
    progressSeconds: number,
    token?: string | null
  ): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/user/history.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(token),
        },
        body: JSON.stringify({
          series_id: seriesId,
          episode_id: episodeId,
          episode_index: episodeIndex,
          progress_seconds: Math.floor(progressSeconds),
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
