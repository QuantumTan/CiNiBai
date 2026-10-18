import { describe, it, expect, beforeEach } from 'vitest';
import { usePlayerStore } from './player';

describe('src/stores/player.ts', () => {
  beforeEach(() => {
    // Reset player state to defaults
    usePlayerStore.setState({
      volume: 1,
      chapters: [],
      activeChapter: '',
      currentTime: 0,
      duration: 0,
      isPlaying: false,
    });
  });

  describe('setVolume volume clamping (0 to 1.0)', () => {
    it('sets valid volume values between 0.0 and 1.0 directly', () => {
      usePlayerStore.getState().setVolume(0.5);
      expect(usePlayerStore.getState().volume).toBe(0.5);

      usePlayerStore.getState().setVolume(0);
      expect(usePlayerStore.getState().volume).toBe(0);

      usePlayerStore.getState().setVolume(1);
      expect(usePlayerStore.getState().volume).toBe(1);
    });

    it('clamps volume values above 1.0 down to exactly 1.0', () => {
      usePlayerStore.getState().setVolume(1.5);
      expect(usePlayerStore.getState().volume).toBe(1.0);

      usePlayerStore.getState().setVolume(100);
      expect(usePlayerStore.getState().volume).toBe(1.0);
    });

    it('clamps volume values below 0.0 up to exactly 0.0', () => {
      usePlayerStore.getState().setVolume(-0.5);
      expect(usePlayerStore.getState().volume).toBe(0.0);

      usePlayerStore.getState().setVolume(-100);
      expect(usePlayerStore.getState().volume).toBe(0.0);
    });
  });

  describe('Chapters management (no invented/fake chapters)', () => {
    it('defaults chapters to an empty array without invented chapters', () => {
      const state = usePlayerStore.getState();
      expect(state.chapters).toEqual([]);
      expect(state.activeChapter).toBe('');
    });

    it('does not contain hardcoded chapters (e.g. Prologue, The Encounter, Ascension)', () => {
      const state = usePlayerStore.getState();
      const titles = state.chapters.map((c) => c.title);
      expect(titles).not.toContain('Prologue');
      expect(titles).not.toContain('The Encounter');
      expect(titles).not.toContain('Ascension');
    });

    it('correctly updates activeChapter when authentic media chapters are supplied', () => {
      const authenticChapters = [
        { time: 0, title: 'Opening Scene' },
        { time: 120, title: 'Main Plot' },
        { time: 300, title: 'Closing Credits' },
      ];

      usePlayerStore.getState().setChapters(authenticChapters);
      expect(usePlayerStore.getState().chapters).toHaveLength(3);

      // At time 50s, chapter is Opening Scene
      usePlayerStore.getState().setTime(50, 400);
      expect(usePlayerStore.getState().activeChapter).toBe('Opening Scene');

      // At time 150s, chapter is Main Plot
      usePlayerStore.getState().setTime(150, 400);
      expect(usePlayerStore.getState().activeChapter).toBe('Main Plot');

      // At time 350s, chapter is Closing Credits
      usePlayerStore.getState().setTime(350, 400);
      expect(usePlayerStore.getState().activeChapter).toBe('Closing Credits');
    });
  });
});
