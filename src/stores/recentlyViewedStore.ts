import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const MAX_RECENTLY_VIEWED = 20;

export interface RecentlyViewedItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  releaseDate: string;
  viewedAt: number;
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[];
  recordView: (item: Omit<RecentlyViewedItem, 'viewedAt'>) => void;
  clearHistory: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],

      recordView: (item) => {
        if (!item.id || !item.title) return;
        const filtered = get().items.filter(
          (existing) => !(existing.id === item.id && existing.type === item.type)
        );
        const next = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(
          0,
          MAX_RECENTLY_VIEWED
        );
        set({ items: next });
      },

      clearHistory: () => set({ items: [] }),
    }),
    {
      name: 'cinebai-recently-viewed',
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0 || !persistedState || typeof persistedState !== 'object') {
          return { items: [] };
        }
        const maybe = persistedState as { items?: unknown };
        const items = Array.isArray(maybe.items)
          ? (maybe.items as RecentlyViewedItem[]).slice(0, MAX_RECENTLY_VIEWED)
          : [];
        return { items };
      },
      partialize: (state) => ({ items: state.items }),
    }
  )
);
