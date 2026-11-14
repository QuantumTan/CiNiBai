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
  lastAnnouncement: string | null;
  addItem: (item: Omit<WatchlistItem, 'addedAt'>) => boolean;
  removeItem: (id: number, type: 'movie' | 'tv') => void;
  isInWatchlist: (id: number, type: 'movie' | 'tv') => boolean;
  clearWatchlist: () => void;
  clearAnnouncement: () => void;
}

// Upper bound for saved items to prevent uncontrolled localStorage bloat
const MAX_WATCHLIST_ITEMS = 500;

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      lastAnnouncement: null,

      addItem: (item) => {
        const currentItems = get().items;
        const exists = currentItems.some((i) => i.id === item.id && i.type === item.type);

        if (exists) {
          // Silent dedup for items already present
          return false;
        }

        // Hard cap at 500 items: reject 501st item with exact honest copy
        if (currentItems.length >= MAX_WATCHLIST_ITEMS) {
          set({ lastAnnouncement: 'Watchlist is full (500 titles)' });
          return false;
        }

        set({
          items: [{ ...item, addedAt: Date.now() }, ...currentItems],
          lastAnnouncement: `Added "${item.title}" to your watchlist.`,
        });
        return true;
      },

      removeItem: (id, type) => {
        const itemToRemove = get().items.find((i) => i.id === id && i.type === type);
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && i.type === type)),
          lastAnnouncement: itemToRemove
            ? `Removed "${itemToRemove.title}" from your watchlist.`
            : null,
        }));
      },

      isInWatchlist: (id, type) => {
        return get().items.some((i) => i.id === id && i.type === type);
      },

      clearWatchlist: () => set({ items: [], lastAnnouncement: 'Watchlist cleared.' }),

      clearAnnouncement: () => set({ lastAnnouncement: null }),
    }),
    {
      name: 'cinebai-watchlist',
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0 || !persistedState) {
          return { items: [] };
        }
        return persistedState as { items: WatchlistItem[] };
      },
      // Partialize: persist only the items array, never ephemeral UI state/announcements
      partialize: (state) => ({ items: state.items }),
    }
  )
);
