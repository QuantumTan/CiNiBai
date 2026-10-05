import { create } from 'zustand';

export interface Chapter {
  time: number;
  title: string;
}

interface PlayerState {
  currentTrack: {
    id: string | number;
    title: string;
    subtitle?: string;
    poster?: string;
    src?: string;
  } | null;
  isPlaying: boolean;
  isMiniPlayer: boolean;
  currentTime: number;
  duration: number;
  bufferedTime: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isPiP: boolean;
  subtitlesEnabled: boolean;
  selectedSubtitle: string;
  activeChapter: string;
  chapters: Chapter[];
  setTrack: (track: PlayerState['currentTrack']) => void;
  setPlaying: (playing: boolean) => void;
  setMiniPlayer: (mini: boolean) => void;
  setTime: (currentTime: number, duration?: number) => void;
  setBuffered: (bufferedTime: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (isMuted: boolean) => void;
  setFullscreen: (isFullscreen: boolean) => void;
  setPiP: (isPiP: boolean) => void;
  setSubtitlesEnabled: (enabled: boolean) => void;
  setSelectedSubtitle: (lang: string) => void;
  setChapters: (chapters: Chapter[]) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  isMiniPlayer: false,
  currentTime: 0,
  duration: 0,
  bufferedTime: 0,
  volume: 1,
  isMuted: false,
  isFullscreen: false,
  isPiP: false,
  subtitlesEnabled: true,
  selectedSubtitle: 'en',
  activeChapter: 'Prologue',
  chapters: [
    { time: 0, title: 'Prologue' },
    { time: 240, title: 'The Encounter' },
    { time: 820, title: 'Ascension' },
  ],
  setTrack: (track) => set({ currentTrack: track }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setMiniPlayer: (isMiniPlayer) => set({ isMiniPlayer }),
  setTime: (currentTime, duration) =>
    set((state) => {
      const d = duration !== undefined ? duration : state.duration;
      const chapter =
        state.chapters
          .slice()
          .reverse()
          .find((c) => currentTime >= c.time)?.title || state.activeChapter;
      return { currentTime, duration: d, activeChapter: chapter };
    }),
  setBuffered: (bufferedTime) => set({ bufferedTime }),
  setVolume: (volume) => set({ volume }),
  setMuted: (isMuted) => set({ isMuted }),
  setFullscreen: (isFullscreen) => set({ isFullscreen }),
  setPiP: (isPiP) => set({ isPiP }),
  setSubtitlesEnabled: (subtitlesEnabled) => set({ subtitlesEnabled }),
  setSelectedSubtitle: (selectedSubtitle) => set({ selectedSubtitle }),
  setChapters: (chapters) => set({ chapters }),
}));
