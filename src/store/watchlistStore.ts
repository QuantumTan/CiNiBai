import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WatchlistItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  voteAverage: number;
  releaseDate: string;
  addedAt: number; // timestamp
}

interface WatchlistState {
  items: WatchlistItem[];
  addItem: (item: Omit<WatchlistItem, 'addedAt'>) => void;
  removeItem: (id: number, type: 'movie' | 'tv') => void;
  isInWatchlist: (id: number, type: 'movie' | 'tv') => boolean;
  clearWatchlist: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const exists = get().items.some((i) => i.id === item.id && i.type === item.type);
        if (exists) return;
        set((state) => ({
          items: [{ ...item, addedAt: Date.now() }, ...state.items],
        }));
      },

      removeItem: (id, type) => {
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && i.type === type)),
        }));
      },

      isInWatchlist: (id, type) => {
        return get().items.some((i) => i.id === id && i.type === type);
      },

      clearWatchlist: () => set({ items: [] }),
    }),
    {
      name: 'cinebai-watchlist',
    }
  )
);
