/**
 * Reels Engine Data Model & Contract Specifications (§5.1)
 * Standardized contracts for Infinite Reels Engine, Discovery Loop, and Spatial Media Bridge.
 */

export type ReelId = string;

export interface ReelItem {
  id: string | number;
  videoUrl: string;
  posterUrl?: string;
  aspectRatio?: number;
  duration?: number;
  author: {
    id: string | number;
    username: string;
    avatarUrl?: string;
    isFollowed?: boolean;
  };
  caption?: string;
  musicTitle?: string;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
  };
}

export interface ReelSource {
  titleId: string;
  kind: 'movie' | 'series';
  title: string;
  season?: number;
  episode?: number;
  posterUrl: string;
  startAtMs: number; // Timestamp for the "Watch Full Title" bridge
}

export interface ReelScore {
  track: string;
  artist: string;
  waveformPeaks: number[]; // Normalized waveform heights 0.0 - 1.0 (approx 20-30 samples)
}

export interface ReelPerson {
  id: string;
  name: string;
  role: 'actor' | 'director';
}

export interface ReelStats {
  likes: number;
  comments: number;
}

export interface ReelViewerState {
  liked: boolean;
  saved: boolean;
}

export interface Reel {
  id: ReelId;
  playbackUrl: string; // HLS (.m3u8) preferred, MP4 direct stream fallback
  posterUrl: string; // Required poster frame shown until first decoded frame
  blurhash: string;
  aspect: '9:16' | '16:9' | '1:1';
  durationMs: number;
  palette: string[]; // Content-extracted palette (clamped L <= 0.55) for ambient canvas
  captionsUrl?: string; // WebVTT subtitle track
  source: ReelSource;
  score?: ReelScore;
  people: ReelPerson[];
  stats: ReelStats;
  viewer: ReelViewerState;
  // Editorial quotes and dialogue matching for Spotlight Search (§6.1)
  dialogueQuote?: string;
  tags?: string[];
  feedItem?: ReelItem;
}

export interface ReelsPage {
  items: Reel[];
  nextCursor: string | null;
  source: 'catalog' | 'discovery';
}

export type ReelFilter = 'discover' | 'top10' | 'climaxes' | 'bts' | 'soundtracks';

export type ReelMood = 'tense' | 'euphoric' | 'melancholic' | 'mind-bending' | 'feel-good';

export interface DiscussionComment {
  id: string;
  reelId: ReelId;
  author: string;
  avatarUrl?: string;
  text: string;
  timestampMs: number; // Timecode synchronization (§6.2)
  likes: number;
  reaction?: string;
  createdAt: number;
}

export interface ClipSearchResult {
  reel: Reel;
  matchedField: 'quote' | 'actor' | 'director' | 'tag' | 'title';
  matchedSnippet: string;
  timestampMs: number;
}
