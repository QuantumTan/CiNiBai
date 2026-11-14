import { describe, it, expect, beforeEach } from 'vitest';
import { useRecentSearchesStore, MAX_RECENT_SEARCHES } from './recentSearchesStore';

describe('src/stores/recentSearchesStore.ts', () => {
  beforeEach(() => {
    useRecentSearchesStore.getState().clearSearches();
    localStorage.clear();
  });

  it('adds a trimmed search term and ignores blank strings', () => {
    useRecentSearchesStore.getState().addSearch('   ');
    expect(useRecentSearchesStore.getState().searches).toEqual([]);

    useRecentSearchesStore.getState().addSearch('  Dune  ');
    expect(useRecentSearchesStore.getState().searches).toEqual(['Dune']);
  });

  it('deduplicates case-insensitively and moves the latest query to the front', () => {
    const store = useRecentSearchesStore.getState();
    store.addSearch('Inception');
    store.addSearch('Interstellar');
    store.addSearch('inception');

    expect(useRecentSearchesStore.getState().searches).toEqual([
      'inception',
      'Interstellar',
    ]);
  });

  it('caps recent searches at 10 items, evicting the oldest', () => {
    const store = useRecentSearchesStore.getState();
    for (let i = 1; i <= 12; i++) {
      store.addSearch(`Query ${i}`);
    }

    const searches = useRecentSearchesStore.getState().searches;
    expect(searches).toHaveLength(MAX_RECENT_SEARCHES);
    expect(searches[0]).toBe('Query 12');
    expect(searches[MAX_RECENT_SEARCHES - 1]).toBe('Query 3');
    expect(searches).not.toContain('Query 1');
    expect(searches).not.toContain('Query 2');
  });

  it('removes individual items and clears all searches', () => {
    const store = useRecentSearchesStore.getState();
    store.addSearch('Arcane');
    store.addSearch('Severance');

    store.removeSearch('arcane');
    expect(useRecentSearchesStore.getState().searches).toEqual(['Severance']);

    store.clearSearches();
    expect(useRecentSearchesStore.getState().searches).toEqual([]);
  });

  it('persists searches to localStorage under versioned cinebai-recent-searches key', () => {
    useRecentSearchesStore.getState().addSearch('Spirited Away');

    const raw = localStorage.getItem('cinebai-recent-searches');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveProperty('version', 1);
    expect(parsed.state.searches).toEqual(['Spirited Away']);
  });
});
