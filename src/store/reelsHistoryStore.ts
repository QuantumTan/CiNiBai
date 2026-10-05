import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReelDrama } from '../api/reels';

export interface ReelHistoryItem {
  id: string;
  bookId?: string;
  title: string;
  coverImage: string;
  totalEpisodes: number;
  lastEpisodeIndex: number;
  lastEpisodeNumber: number;
  lastEpisodeTitle: string;
  watchedAt: number; // timestamp ms
  progressSeconds?: number;
  rating?: number;
  views?: string;
}

interface ReelsHistoryState {
  history: ReelHistoryItem[];
  recordWatch: (
    drama: ReelDrama,
    episodeIndex: number,
    episodeNumber: number,
    episodeTitle?: string,
    progressSeconds?: number
  ) => void;
  removeHistoryItem: (id: string) => void;
  clearHistory: () => void;
  getHistoryItem: (id: string) => ReelHistoryItem | undefined;
}

export const useReelsHistoryStore = create<ReelsHistoryState>()(
  persist(
    (set, get) => ({
      history: [],

      recordWatch: (drama, episodeIndex, episodeNumber, episodeTitle, progressSeconds = 0) => {
        const dramaId = drama.bookId || drama.id;
        const now = Date.now();
        const existingList = get().history.filter(
          (item) => item.id !== dramaId && item.id !== drama.id && item.bookId !== drama.bookId
        );

        const newItem: ReelHistoryItem = {
          id: drama.id,
          bookId: drama.bookId,
          title: drama.title,
          coverImage: drama.coverImage || drama.verticalPoster,
          totalEpisodes: drama.totalEpisodes || (drama.episodes?.length || 40),
          lastEpisodeIndex: episodeIndex,
          lastEpisodeNumber: episodeNumber,
          lastEpisodeTitle: episodeTitle || `Episode ${episodeNumber}`,
          watchedAt: now,
          progressSeconds,
          rating: drama.rating,
          views: drama.views,
        };

        set({
          history: [newItem, ...existingList],
        });
      },

      removeHistoryItem: (id: string) => {
        set((state) => ({
          history: state.history.filter((item) => item.id !== id && item.bookId !== id),
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      getHistoryItem: (id: string) => {
        return get().history.find((item) => item.id === id || item.bookId === id);
      },
    }),
    {
      name: 'cinebai-reels-history',
    }
  )
);
