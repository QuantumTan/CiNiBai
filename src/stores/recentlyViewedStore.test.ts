import { describe, it, expect, beforeEach } from 'vitest';
import { useRecentlyViewedStore, MAX_RECENTLY_VIEWED } from './recentlyViewedStore';

describe('src/stores/recentlyViewedStore.ts', () => {
  beforeEach(() => {
    useRecentlyViewedStore.getState().clearHistory();
    localStorage.clear();
  });

  it('records viewed items in most-recent-first order', () => {
    const store = useRecentlyViewedStore.getState();
    store.recordView({
      id: 1,
      type: 'movie',
      title: 'First',
      posterPath: '/1.jpg',
      backdropPath: null,
      voteAverage: 7.5,
      releaseDate: '2020-01-01',
    });
    store.recordView({
      id: 2,
      type: 'tv',
      title: 'Second',
      posterPath: '/2.jpg',
      backdropPath: null,
      voteAverage: 8.2,
      releaseDate: '2021-01-01',
    });
    store.recordView({
      id: 3,
      type: 'movie',
      title: 'Third',
      posterPath: '/3.jpg',
      backdropPath: null,
      voteAverage: 8.8,
      releaseDate: '2022-01-01',
    });

    const items = useRecentlyViewedStore.getState().items;
    expect(items.map((i) => i.title)).toEqual(['Third', 'Second', 'First']);
  });

  it('moves re-viewed item to front without duplicating', () => {
    const store = useRecentlyViewedStore.getState();
    store.recordView({
      id: 1,
      type: 'movie',
      title: 'Alpha',
      posterPath: null,
      backdropPath: null,
      voteAverage: 7,
      releaseDate: '2020-01-01',
    });
    store.recordView({
      id: 2,
      type: 'movie',
      title: 'Beta',
      posterPath: null,
      backdropPath: null,
      voteAverage: 8,
      releaseDate: '2021-01-01',
    });
    store.recordView({
      id: 1,
      type: 'movie',
      title: 'Alpha',
      posterPath: null,
      backdropPath: null,
      voteAverage: 7,
      releaseDate: '2020-01-01',
    });

    const items = useRecentlyViewedStore.getState().items;
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.id)).toEqual([1, 2]);
  });

  it('caps history at 20 items, evicting oldest entries', () => {
    const store = useRecentlyViewedStore.getState();
    for (let i = 1; i <= 25; i++) {
      store.recordView({
        id: i,
        type: 'movie',
        title: `Title ${i}`,
        posterPath: null,
        backdropPath: null,
        voteAverage: 7.0,
        releaseDate: '2024-01-01',
      });
    }

    const items = useRecentlyViewedStore.getState().items;
    expect(items).toHaveLength(MAX_RECENTLY_VIEWED);
    expect(items[0].id).toBe(25);
    expect(items[MAX_RECENTLY_VIEWED - 1].id).toBe(6);
    expect(items.some((i) => i.id === 1)).toBe(false);
  });

  it('persists under cinebai-recently-viewed with version 1', () => {
    useRecentlyViewedStore.getState().recordView({
      id: 550,
      type: 'movie',
      title: 'Fight Club',
      posterPath: '/fc.jpg',
      backdropPath: null,
      voteAverage: 8.4,
      releaseDate: '1999-10-15',
    });

    const raw = localStorage.getItem('cinebai-recently-viewed');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveProperty('version', 1);
    expect(parsed.state.items).toHaveLength(1);
    expect(parsed.state.items[0].title).toBe('Fight Club');
  });
});
