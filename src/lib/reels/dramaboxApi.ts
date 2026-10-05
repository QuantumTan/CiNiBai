/**
 * DramaBox & ReelShort Real-time Live API Client
 * Connects directly to https://apireel.7xm.dev powering https://reels.7xmtools.com
 */

import type {
  DramaSeries,
  DramaSeriesDetailResponse,
  DramaAuthResponse,
  DramaUser,
} from './dramaboxTypes';

const API_BASE = 'https://apireel.7xm.dev';

function getAuthHeader(token?: string | null): Record<string, string> {
  const t = token || (typeof window !== 'undefined' ? localStorage.getItem('dramabox_token') : null);
  if (!t) return {};
  return { Authorization: `Bearer ${t}` };
}

export const dramaboxApi = {
  /**
   * Fetch live trending mini-series
   */
  async getTrendingSeries(): Promise<DramaSeries[]> {
    try {
      const res = await fetch(`${API_BASE}/api/series/trending.php`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return Array.isArray(data?.data) ? data.data : [];
    } catch (err) {
      console.error('[DramaBox] Error fetching trending series:', err);
      return [];
    }
  },

  /**
   * Fetch full catalog / All Movies with pagination
   */
  async getAllMovies(page = 1): Promise<{ items: DramaSeries[]; page: number }> {
    try {
      const res = await fetch(`${API_BASE}/api/series/all-movies.php?page=${Math.max(1, page)}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data?.data) ? data.data : [];
      return { items, page };
    } catch (err) {
      console.error('[DramaBox] Error fetching all movies:', err);
      return { items: [], page };
    }
  },

  /**
   * Fetch new releases / Fresh drops
   */
  async getNewReleases(page = 1): Promise<{ items: DramaSeries[]; page: number; total?: number }> {
    try {
      const res = await fetch(`${API_BASE}/api/series/new-release.php?page=${Math.max(1, page)}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data?.data) ? data.data : [];
      return { items, page, total: data?.total };
    } catch (err) {
      console.error('[DramaBox] Error fetching new releases:', err);
      return { items: [], page };
    }
  },

  /**
   * Search titles, billionaires, alphas, keywords
   */
  async searchSeries(keywords: string): Promise<DramaSeries[]> {
    const trimmed = keywords.trim();
    if (!trimmed) return [];
    try {
      const res = await fetch(`${API_BASE}/api/series/search.php?keywords=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return Array.isArray(data?.data) ? data.data : [];
    } catch (err) {
      console.error('[DramaBox] Error searching series:', err);
      return [];
    }
  },

  /**
   * Fetch series metadata, episode playlist, and real-time live HLS stream URLs
   */
  async getSeriesDetail(
    id: string,
    episodeId?: string,
    refreshStream = true,
    token?: string | null
  ): Promise<DramaSeriesDetailResponse | null> {
    try {
      const params = new URLSearchParams({ id });
      if (episodeId) params.set('episode_id', episodeId);
      if (refreshStream) params.set('refresh_stream', '1');

      const res = await fetch(`${API_BASE}/api/series/detail.php?${params.toString()}`, {
        headers: getAuthHeader(token),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return {
        series: data.series,
        episodes: Array.isArray(data.episodes) ? data.episodes : [],
        history: data.history || null,
      };
    } catch (err) {
      console.error(`[DramaBox] Error fetching series detail for ${id}:`, err);
      return null;
    }
  },

  /**
   * Unlock a paid episode with user coin balance
   */
  async unlockEpisode(episodeId: string, token?: string | null): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/series/unlock.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(token),
        },
        body: JSON.stringify({ episode_id: episodeId }),
      });

      const data = await res.json();
      return res.ok && data?.success === true;
    } catch (err) {
      console.error(`[DramaBox] Error unlocking episode ${episodeId}:`, err);
      return false;
    }
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
