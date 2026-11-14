import { describe, it, expect, beforeEach } from 'vitest';
import { useWatchlistStore } from './watchlistStore';

describe('src/stores/watchlistStore.ts', () => {
  beforeEach(() => {
    // Clear in-memory store and storage before each test
    useWatchlistStore.getState().clearWatchlist();
    useWatchlistStore.getState().clearAnnouncement();
    localStorage.clear();
  });

  describe('addItem and Deduplication', () => {
    it('successfully adds an item to an empty watchlist', () => {
      const added = useWatchlistStore.getState().addItem({
        id: 101,
        type: 'movie',
        title: 'Inception',
        posterPath: '/inception.jpg',
        voteAverage: 8.8,
        releaseDate: '2010-07-16',
      });

      expect(added).toBe(true);
      const items = useWatchlistStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe(101);
      expect(items[0].title).toBe('Inception');
      expect(useWatchlistStore.getState().lastAnnouncement).toBe(
        'Added "Inception" to your watchlist.'
      );
    });

    it('deduplicates identical items silently (same item added twice -> 1 item in store)', () => {
      const item = {
        id: 202,
        type: 'movie' as const,
        title: 'Interstellar',
        posterPath: '/interstellar.jpg',
        voteAverage: 8.7,
        releaseDate: '2014-11-07',
      };

      const firstAdd = useWatchlistStore.getState().addItem(item);
      expect(firstAdd).toBe(true);
      expect(useWatchlistStore.getState().items).toHaveLength(1);

      // Attempt duplicate addition
      const secondAdd = useWatchlistStore.getState().addItem(item);
      expect(secondAdd).toBe(false);

      // Store must still contain exactly 1 item
      const items = useWatchlistStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe(202);

      // Confirm announcement remains from the initial addition (dedup is silent)
      expect(useWatchlistStore.getState().lastAnnouncement).toBe(
        'Added "Interstellar" to your watchlist.'
      );
    });

    it('allows same ID if media_type is different (e.g. movie vs tv show with same id)', () => {
      useWatchlistStore.getState().addItem({
        id: 303,
        type: 'movie',
        title: 'Fargo (Movie)',
        posterPath: null,
        voteAverage: 8.1,
        releaseDate: '1996-03-08',
      });

      useWatchlistStore.getState().addItem({
        id: 303,
        type: 'tv',
        title: 'Fargo (TV Series)',
        posterPath: null,
        voteAverage: 8.9,
        releaseDate: '2014-04-15',
      });

      expect(useWatchlistStore.getState().items).toHaveLength(2);
    });
  });

  describe('removeItem', () => {
    it('removes an item by id and mediaType', () => {
      useWatchlistStore.getState().addItem({
        id: 404,
        type: 'movie',
        title: 'Dune',
        posterPath: '/dune.jpg',
        voteAverage: 8.0,
        releaseDate: '2021-10-22',
      });

      expect(useWatchlistStore.getState().isInWatchlist(404, 'movie')).toBe(true);

      useWatchlistStore.getState().removeItem(404, 'movie');
      expect(useWatchlistStore.getState().items).toHaveLength(0);
      expect(useWatchlistStore.getState().isInWatchlist(404, 'movie')).toBe(false);
      expect(useWatchlistStore.getState().lastAnnouncement).toBe(
        'Removed "Dune" from your watchlist.'
      );
    });
  });

  describe('Capacity limit (500 items max)', () => {
    it('rejects 501st item with exact copy "Watchlist is full (500 titles)"', () => {
      // Pre-fill with 500 items
      for (let i = 1; i <= 500; i++) {
        useWatchlistStore.getState().addItem({
          id: i,
          type: 'movie',
          title: `Movie ${i}`,
          posterPath: null,
          voteAverage: 7.0,
          releaseDate: '2020-01-01',
        });
      }

      expect(useWatchlistStore.getState().items).toHaveLength(500);
      expect(useWatchlistStore.getState().items[0].id).toBe(500);
      expect(useWatchlistStore.getState().items[499].id).toBe(1);

      // Attempt to add 501st item
      const added = useWatchlistStore.getState().addItem({
        id: 501,
        type: 'movie',
        title: 'Movie 501',
        posterPath: null,
        voteAverage: 7.0,
        releaseDate: '2020-01-01',
      });

      // Must be rejected
      expect(added).toBe(false);
      const itemsAfter = useWatchlistStore.getState().items;
      expect(itemsAfter).toHaveLength(500);
      // Movie 1 should NOT be evicted
      expect(useWatchlistStore.getState().isInWatchlist(1, 'movie')).toBe(true);
      // Movie 501 must NOT be added
      expect(useWatchlistStore.getState().isInWatchlist(501, 'movie')).toBe(false);

      // Exact copy requirement
      expect(useWatchlistStore.getState().lastAnnouncement).toBe(
        'Watchlist is full (500 titles)'
      );
    });
  });

  describe('Persist shape', () => {
    it('persists items array to localStorage and omits transient UI announcements', () => {
      useWatchlistStore.getState().addItem({
        id: 777,
        type: 'movie',
        title: 'Blade Runner',
        posterPath: '/br.jpg',
        voteAverage: 8.1,
        releaseDate: '1982-06-25',
      });

      const raw = localStorage.getItem('cinebai-watchlist');
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);

      expect(parsed).toHaveProperty('state');
      expect(parsed).toHaveProperty('version', 1);
      expect(parsed.state).toHaveProperty('items');
      expect(parsed.state.items).toHaveLength(1);
      expect(parsed.state.items[0].title).toBe('Blade Runner');
      // Transient announcement state must NOT be persisted
      expect(parsed.state.lastAnnouncement).toBeUndefined();
    });
  });
});
