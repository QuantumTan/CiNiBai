/**
 * DramaBox & ReelShort Data Types & Contracts
 * Exact match for https://apireel.7xm.dev API responses and https://reels.7xmtools.com UI architecture.
 */

export interface DramaSeries {
  id: string;
  title: string;
  cover_pic: string;
  description: string;
  chapter_count: number;
  read_count: number;
  collect_count: number;
  theme: string[];
}

export interface DramaEpisode {
  id: string;
  series_id: string;
  episode_index: number;
  title: string;
  duration: number; // in seconds
  video_url: string; // Live HLS stream (.m3u8)
  video_pic: string; // Snapshot cover
  is_paid: boolean;
  coin_cost: number;
  is_unlocked: boolean;
}

export interface DramaSeriesDetailResponse {
  series: DramaSeries;
  episodes: DramaEpisode[];
  history?: {
    series_id: string;
    episode_id: string;
    episode_index: number;
    progress_seconds: number;
  } | null;
}

export interface DramaUser {
  id: number;
  username: string;
  coins: number;
}

export interface DramaAuthResponse {
  token: string;
  user: DramaUser;
}

export interface DramaWatchHistoryItem {
  series_id: string;
  series_title?: string;
  cover_pic?: string;
  episode_id: string;
  episode_index: number;
  progress_seconds: number;
  duration: number;
  updated_at: number;
}

export type DramaViewTab = 'home' | 'all-movies' | 'new-release' | 'history' | 'infinite-feed';
