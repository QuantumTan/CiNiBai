import { describe, it, expect, vi } from 'vitest';
import { trimQuery, filterOutPersons, formatResultCount, debounce } from './utils';

describe('Search Helpers', () => {
  describe('trimQuery()', () => {
    it('trims leading and trailing whitespace from query strings', () => {
      expect(trimQuery('  Dune: Part Two  ')).toBe('Dune: Part Two');
      expect(trimQuery('\n\tArcane\t ')).toBe('Arcane');
    });

    it('returns empty string for empty or whitespace-only inputs', () => {
      expect(trimQuery('')).toBe('');
      expect(trimQuery('   ')).toBe('');
      expect(trimQuery('\t\n ')).toBe('');
    });

    it('safely handles null or undefined query parameters', () => {
      expect(trimQuery(null)).toBe('');
      expect(trimQuery(undefined)).toBe('');
    });
  });

  describe('filterOutPersons()', () => {
    it('excludes items with media_type="person" from search results', () => {
      const mockResults = [
        { id: 1, title: 'Oppenheimer', media_type: 'movie' },
        { id: 2, name: 'Christopher Nolan', media_type: 'person' },
        { id: 3, name: 'Succession', media_type: 'tv' },
        { id: 4, name: 'Cillian Murphy', media_type: 'person' },
      ];

      const filtered = filterOutPersons(mockResults);

      expect(filtered).toHaveLength(2);
      expect(filtered.map((item) => item.id)).toEqual([1, 3]);
      expect(filtered.some((item) => item.media_type === 'person')).toBe(false);
    });

    it('preserves all items if no person results are in the array', () => {
      const mockResults = [
        { id: 10, title: 'Spirited Away', media_type: 'movie' },
        { id: 20, name: 'Attack on Titan', media_type: 'tv' },
      ];

      expect(filterOutPersons(mockResults)).toHaveLength(2);
    });

    it('returns an empty array if all results are persons', () => {
      const mockResults = [
        { id: 1, name: 'Actor One', media_type: 'person' },
        { id: 2, name: 'Director Two', media_type: 'person' },
      ];

      expect(filterOutPersons(mockResults)).toHaveLength(0);
    });

    it('ensures person results are excluded from both the count and grid data', () => {
      const mixedResults = [
        { id: 101, title: 'Batman Begins', media_type: 'movie' },
        { id: 102, name: 'Christian Bale', media_type: 'person' },
        { id: 103, name: 'The Batman', media_type: 'movie' },
      ];

      const displayResults = filterOutPersons(mixedResults);
      const countHeader = formatResultCount(displayResults.length);

      expect(displayResults).toHaveLength(2);
      expect(countHeader).toBe('2 results');
    });
  });

  describe('formatResultCount()', () => {
    it('formats single result with singular "result"', () => {
      expect(formatResultCount(1)).toBe('1 result');
    });

    it('formats 0 or multiple results with plural "results"', () => {
      expect(formatResultCount(0)).toBe('0 results');
      expect(formatResultCount(2)).toBe('2 results');
      expect(formatResultCount(25)).toBe('25 results');
    });

    it('formats large counts with standard locale thousands separators', () => {
      expect(formatResultCount(1250)).toBe('1,250 results');
      expect(formatResultCount(100000)).toBe('100,000 results');
    });

    it('handles negative inputs safely by clamping to 0', () => {
      expect(formatResultCount(-5)).toBe('0 results');
    });
  });

  describe('debounce() helper', () => {
    it('debounces successive calls and only executes the last one after the delay', () => {
      vi.useFakeTimers();

      const fn = vi.fn();
      const debouncedFn = debounce(fn, 300);

      debouncedFn('a');
      debouncedFn('ab');
      debouncedFn('abc');

      expect(fn).not.toHaveBeenCalled();

      // Fast forward less than delay
      vi.advanceTimersByTime(200);
      expect(fn).not.toHaveBeenCalled();

      // Fast forward past delay
      vi.advanceTimersByTime(150);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('abc');

      vi.useRealTimers();
    });

    it('allows cancelling pending debounced execution', () => {
      vi.useFakeTimers();

      const fn = vi.fn();
      const debouncedFn = debounce(fn, 300);

      debouncedFn('test');
      debouncedFn.cancel();

      vi.advanceTimersByTime(500);
      expect(fn).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
});
