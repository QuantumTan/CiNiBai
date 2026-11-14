import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const MAX_RECENT_SEARCHES = 10;

interface RecentSearchesState {
  searches: string[];
  addSearch: (query: string) => void;
  removeSearch: (query: string) => void;
  clearSearches: () => void;
}

export const useRecentSearchesStore = create<RecentSearchesState>()(
  persist(
    (set, get) => ({
      searches: [],

      addSearch: (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;

        const lower = trimmed.toLowerCase();
        const filtered = get().searches.filter((item) => item.toLowerCase() !== lower);
        const next = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
        set({ searches: next });
      },

      removeSearch: (query) => {
        const lower = query.trim().toLowerCase();
        set((state) => ({
          searches: state.searches.filter((item) => item.toLowerCase() !== lower),
        }));
      },

      clearSearches: () => set({ searches: [] }),
    }),
    {
      name: 'cinebai-recent-searches',
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0 || !persistedState || typeof persistedState !== 'object') {
          return { searches: [] };
        }
        const maybe = persistedState as { searches?: unknown };
        const searches = Array.isArray(maybe.searches)
          ? maybe.searches.filter((item): item is string => typeof item === 'string').slice(0, MAX_RECENT_SEARCHES)
          : [];
        return { searches };
      },
      partialize: (state) => ({ searches: state.searches }),
    }
  )
);
