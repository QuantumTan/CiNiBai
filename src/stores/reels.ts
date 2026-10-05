/**
 * Reels Engine Global Zustand Store (§5.3, §7)
 * Manages feed position, audio mute state, active filters, viewer engagement,
 * and seamless state restoration when returning from the Full Title Bridge player.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Reel, ReelFilter, ReelMood } from '../lib/reels/types';

interface ReelsState {
  // Navigation & Feed Position
  activeIndex: number;
  scrollOffset: number;
  activeFilter: ReelFilter;
  activeMoods: ReelMood[];
  reelsList: Reel[];
  
  // Audio & Playback Options
  isMuted: boolean;
  captionsEnabled: boolean;
  isPlaying: boolean;

  // Active Overlays
  isDiscussionOpen: boolean;
  isSearchOpen: boolean;
  isHotkeysModalOpen: boolean;

  // Viewer Engagement Maps
  likedMap: Record<string, boolean>;
  savedMap: Record<string, boolean>;

  // Actions
  setActiveIndex: (index: number) => void;
  setScrollOffset: (offset: number) => void;
  setActiveFilter: (filter: ReelFilter) => void;
  toggleMood: (mood: ReelMood) => void;
  clearMoods: () => void;
  setReelsList: (reels: Reel[]) => void;
  appendReels: (newReels: Reel[]) => void;
  insertReelAtActive: (reel: Reel) => void;

  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  toggleCaptions: () => void;
  setIsPlaying: (playing: boolean) => void;

  setDiscussionOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setHotkeysModalOpen: (open: boolean) => void;

  toggleLike: (reelId: string) => void;
  toggleSave: (reelId: string) => void;
  resetFeedState: () => void;
}

export const useReelsStore = create<ReelsState>()(
  persist(
    (set, get) => ({
      activeIndex: 0,
      scrollOffset: 0,
      activeFilter: 'discover',
      activeMoods: [],
      reelsList: [],

      isMuted: true, // Default to muted per autoplay web policy (§5.2)
      captionsEnabled: false,
      isPlaying: true,

      isDiscussionOpen: false,
      isSearchOpen: false,
      isHotkeysModalOpen: false,

      likedMap: {},
      savedMap: {},

      setActiveIndex: (index) => set({ activeIndex: index }),
      setScrollOffset: (offset) => set({ scrollOffset: offset }),

      setActiveFilter: (filter) =>
        set({
          activeFilter: filter,
          activeIndex: 0,
          scrollOffset: 0,
        }),

      toggleMood: (mood) => {
        const current = get().activeMoods;
        const exists = current.includes(mood);
        const next = exists
          ? current.filter((m) => m !== mood)
          : [...current, mood].slice(0, 2); // Max 2 moods multi-select per §6.1
        set({ activeMoods: next, activeIndex: 0, scrollOffset: 0 });
      },

      clearMoods: () => set({ activeMoods: [], activeIndex: 0, scrollOffset: 0 }),

      setReelsList: (reels) => set({ reelsList: reels }),

      appendReels: (newReels) => {
        const current = get().reelsList;
        const existingIds = new Set(current.map((r) => r.id));
        const unique = newReels.filter((r) => !existingIds.has(r.id));
        if (unique.length === 0) return;
        set({ reelsList: [...current, ...unique] });
      },

      insertReelAtActive: (reel) => {
        const { reelsList, activeIndex } = get();
        const existingIdx = reelsList.findIndex((r) => r.id === reel.id);
        if (existingIdx !== -1) {
          // If already in list, jump to it
          set({ activeIndex: existingIdx });
          return;
        }
        // Insert right below active index so it smoothly plays next
        const nextList = [
          ...reelsList.slice(0, activeIndex + 1),
          reel,
          ...reelsList.slice(activeIndex + 1),
        ];
        set({ reelsList: nextList, activeIndex: activeIndex + 1 });
      },

      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      setMuted: (muted) => set({ isMuted: muted }),
      toggleCaptions: () => set((state) => ({ captionsEnabled: !state.captionsEnabled })),
      setIsPlaying: (playing) => set({ isPlaying: playing }),

      setDiscussionOpen: (open) => set({ isDiscussionOpen: open }),
      setSearchOpen: (open) => set({ isSearchOpen: open }),
      setHotkeysModalOpen: (open) => set({ isHotkeysModalOpen: open }),

      toggleLike: (reelId) => {
        const current = !!get().likedMap[reelId];
        set((state) => ({
          likedMap: { ...state.likedMap, [reelId]: !current },
        }));
      },

      toggleSave: (reelId) => {
        const current = !!get().savedMap[reelId];
        set((state) => ({
          savedMap: { ...state.savedMap, [reelId]: !current },
        }));
      },

      resetFeedState: () =>
        set({
          activeIndex: 0,
          scrollOffset: 0,
          reelsList: [],
        }),
    }),
    {
      name: 'cinebai-reels-engine-state',
      partialize: (state) => ({
        isMuted: state.isMuted,
        captionsEnabled: state.captionsEnabled,
        likedMap: state.likedMap,
        savedMap: state.savedMap,
        activeFilter: state.activeFilter,
      }),
    }
  )
);
