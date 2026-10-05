/**
 * DramaBox & ReelShort Unified Store
 * Manages user authentication, shelf/watchlist, watch progress, and active modal video state.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DramaSeries, DramaViewTab, DramaWatchHistoryItem, DramaUser } from '../lib/reels/dramaboxTypes';
import { dramaboxApi } from '../lib/reels/dramaboxApi';

interface DramaBoxState {
  // Navigation
  activeTab: DramaViewTab;
  setActiveTab: (tab: DramaViewTab) => void;

  // Modals
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  isSearchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;

  // Player Modal
  activeModalSeries: DramaSeries | null;
  activeModalEpisodeIndex: number;
  openPlayerModal: (series: DramaSeries, episodeIndex?: number) => void;
  closePlayerModal: () => void;
  setActiveEpisodeIndex: (index: number) => void;

  // User & Coins
  user: DramaUser | null;
  token: string | null;
  setUser: (user: DramaUser | null, token: string | null) => void;
  coins: number;
  deductCoins: (amount: number) => boolean;
  addCoins: (amount: number) => void;
  logout: () => void;

  // Shelf (Saved Dramas)
  shelf: DramaSeries[];
  toggleShelf: (series: DramaSeries) => void;
  isInShelf: (seriesId: string) => boolean;

  // Likes
  likedSeriesIds: string[];
  toggleLikeSeries: (seriesId: string) => void;

  // Watch History
  watchHistory: DramaWatchHistoryItem[];
  recordProgress: (item: {
    series_id: string;
    series_title?: string;
    cover_pic?: string;
    episode_id: string;
    episode_index: number;
    progress_seconds: number;
    duration: number;
  }) => void;
  clearHistory: () => void;
}

export const useDramaBoxStore = create<DramaBoxState>()(
  persist(
    (set, get) => ({
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),

      isAuthModalOpen: false,
      setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),

      isSearchModalOpen: false,
      setSearchModalOpen: (open) => set({ isSearchModalOpen: open }),

      activeModalSeries: null,
      activeModalEpisodeIndex: 1,
      openPlayerModal: (series, episodeIndex = 1) =>
        set({ activeModalSeries: series, activeModalEpisodeIndex: episodeIndex }),
      closePlayerModal: () => set({ activeModalSeries: null }),
      setActiveEpisodeIndex: (index) => set({ activeModalEpisodeIndex: index }),

      // Default user has 100 free coins (like 7xmtools registration)
      user: null,
      token: null,
      coins: 100,

      setUser: (user, token) => {
        if (typeof window !== 'undefined' && token) {
          localStorage.setItem('dramabox_token', token);
        }
        set({ user, token, coins: user?.coins ?? get().coins });
      },

      deductCoins: (amount) => {
        const current = get().coins;
        if (current >= amount) {
          set({ coins: current - amount });
          return true;
        }
        return false;
      },

      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('dramabox_token');
        }
        set({ user: null, token: null, coins: 100 });
      },

      shelf: [],
      toggleShelf: (series) => {
        const { shelf } = get();
        const exists = shelf.some((s) => s.id === series.id);
        if (exists) {
          set({ shelf: shelf.filter((s) => s.id !== series.id) });
        } else {
          set({ shelf: [series, ...shelf] });
        }
      },
      isInShelf: (seriesId) => get().shelf.some((s) => s.id === seriesId),

      likedSeriesIds: [],
      toggleLikeSeries: (seriesId) => {
        const { likedSeriesIds } = get();
        if (likedSeriesIds.includes(seriesId)) {
          set({ likedSeriesIds: likedSeriesIds.filter((id) => id !== seriesId) });
        } else {
          set({ likedSeriesIds: [...likedSeriesIds, seriesId] });
        }
      },

      watchHistory: [],
      recordProgress: (item) => {
        const now = Date.now();
        const existing = get().watchHistory.filter((h) => h.series_id !== item.series_id);
        const updatedEntry: DramaWatchHistoryItem = {
          ...item,
          updated_at: now,
        };
        set({ watchHistory: [updatedEntry, ...existing].slice(0, 50) });

        // Trigger remote API heartbeat if token exists
        const { token } = get();
        if (token) {
          dramaboxApi.saveWatchHistory(
            item.series_id,
            item.episode_id,
            item.episode_index,
            item.progress_seconds,
            token
          );
        }
      },

      clearHistory: () => set({ watchHistory: [] }),
    }),
    {
      name: 'cinibai-dramabox-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        coins: state.coins,
        shelf: state.shelf,
        likedSeriesIds: state.likedSeriesIds,
        watchHistory: state.watchHistory,
      }),
    }
  )
);
