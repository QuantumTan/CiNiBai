import { describe, it, expect } from 'vitest';
import {
  cn,
  getMediaType,
  getPosterUrl,
  getBackdropUrl,
  getYear,
  formatRuntime,
  formatRating,
  formatDate,
  formatShowingCount,
} from './utils';

describe('src/lib/utils.ts', () => {
  describe('cn() class merging', () => {
    it('merges multiple class names into a single string', () => {
      expect(cn('px-4', 'py-2', 'bg-black')).toBe('px-4 py-2 bg-black');
    });

    it('resolves conflicting Tailwind utility classes via tailwind-merge', () => {
      expect(cn('p-4', 'px-2')).toBe('p-4 px-2');
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
      expect(cn('text-sm', 'text-lg')).toBe('text-lg');
    });

    it('handles falsy, null, undefined, and conditional values correctly', () => {
      const isVisible = false;
      const isHighlighted = true;
      expect(
        cn('base-class', isVisible && 'hidden', isHighlighted && 'highlighted', null, undefined)
      ).toBe('base-class highlighted');
    });
  });

  describe('getMediaType()', () => {
    it('returns "movie" when media_type is explicitly "movie"', () => {
      expect(getMediaType({ media_type: 'movie' })).toBe('movie');
    });

    it('returns "tv" when media_type is explicitly "tv"', () => {
      expect(getMediaType({ media_type: 'tv' })).toBe('tv');
    });

    it('returns "person" for person results (never "tv")', () => {
      expect(getMediaType({ media_type: 'person' })).toBe('person');
    });

    it('defaults to "movie" when media_type is undefined or empty', () => {
      expect(getMediaType({})).toBe('movie');
      expect(getMediaType({ media_type: undefined })).toBe('movie');
      expect(getMediaType({ media_type: '' })).toBe('movie');
    });
  });

  describe('formatShowingCount()', () => {
    it('formats loaded and total with commas when totalResults is known', () => {
      expect(formatShowingCount(20, 1234)).toBe('Showing 20 of 1,234');
    });

    it('formats only loaded count when totalResults is missing or 0', () => {
      expect(formatShowingCount(20)).toBe('Showing 20');
      expect(formatShowingCount(20, 0)).toBe('Showing 20');
      expect(formatShowingCount(20, null)).toBe('Showing 20');
    });
  });

  describe('getPosterUrl() and getBackdropUrl()', () => {
    it('generates a full TMDB image URL when a valid path is given', () => {
      expect(getPosterUrl('/poster123.jpg', 'w342')).toBe(
        'https://image.tmdb.org/t/p/w342/poster123.jpg'
      );
      expect(getBackdropUrl('/backdrop123.jpg', 'w1280')).toBe(
        'https://image.tmdb.org/t/p/w1280/backdrop123.jpg'
      );
    });

    it('prepends leading slash if missing in path', () => {
      expect(getPosterUrl('poster123.jpg', 'w500')).toBe(
        'https://image.tmdb.org/t/p/w500/poster123.jpg'
      );
    });

    it('returns fallback empty string when path is null or undefined (never .../undefined)', () => {
      expect(getPosterUrl(null)).toBe('');
      expect(getPosterUrl(undefined)).toBe('');
      expect(getBackdropUrl(null)).toBe('');
      expect(getBackdropUrl(undefined)).toBe('');
    });

    it('returns empty string when path is empty or contains "undefined"', () => {
      expect(getPosterUrl('')).toBe('');
      expect(getPosterUrl('undefined')).toBe('');
      expect(getPosterUrl('/path/undefined.jpg')).toBe('');
      expect(getBackdropUrl('')).toBe('');
      expect(getBackdropUrl('undefined')).toBe('');
    });
  });

  describe('Formatting helpers', () => {
    describe('getYear()', () => {
      it('extracts four-digit year from ISO date strings', () => {
        expect(getYear('2024-03-15')).toBe('2024');
        expect(getYear('1999-12-31')).toBe('1999');
      });

      it('returns em-dash "—" for invalid, empty, or null dates', () => {
        expect(getYear(null)).toBe('—');
        expect(getYear(undefined)).toBe('—');
        expect(getYear('')).toBe('—');
        expect(getYear('invalid-date')).toBe('—');
      });
    });

    describe('formatRuntime()', () => {
      it('formats minutes into hours and minutes', () => {
        expect(formatRuntime(142)).toBe('2h 22m');
        expect(formatRuntime(60)).toBe('1h');
        expect(formatRuntime(45)).toBe('45m');
      });

      it('returns em-dash "—" for 0, negative, null, or undefined minutes', () => {
        expect(formatRuntime(0)).toBe('—');
        expect(formatRuntime(-10)).toBe('—');
        expect(formatRuntime(null)).toBe('—');
        expect(formatRuntime(undefined)).toBe('—');
      });
    });

    describe('formatRating()', () => {
      it('formats vote average to single decimal place', () => {
        expect(formatRating(8.256)).toBe('8.3');
        expect(formatRating(7.0)).toBe('7.0');
        expect(formatRating(9)).toBe('9.0');
      });

      it('returns em-dash "—" for 0, negative, null, or undefined ratings', () => {
        expect(formatRating(0)).toBe('—');
        expect(formatRating(-1)).toBe('—');
        expect(formatRating(null)).toBe('—');
        expect(formatRating(undefined)).toBe('—');
      });
    });

    describe('formatDate()', () => {
      it('formats valid date into "MMM D, YYYY" format', () => {
        expect(formatDate('2024-03-15')).toBe('Mar 15, 2024');
      });

      it('returns em-dash "—" for invalid dates or null', () => {
        expect(formatDate(null)).toBe('—');
        expect(formatDate(undefined)).toBe('—');
        expect(formatDate('not-a-date')).toBe('—');
      });
    });
  });
});
