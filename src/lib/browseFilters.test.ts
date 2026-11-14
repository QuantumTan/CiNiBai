import { describe, it, expect } from 'vitest';
import { buildBrowseDiscoverParams, resolveYearRange } from './browseFilters';

describe('src/lib/browseFilters.ts', () => {
  it('resolves exact year and decade ranges', () => {
    expect(resolveYearRange('')).toEqual({});
    expect(resolveYearRange('2024')).toEqual({ gte: '2024-01-01', lte: '2024-12-31' });
    expect(resolveYearRange('2010s')).toEqual({ gte: '2010-01-01', lte: '2019-12-31' });
    expect(resolveYearRange('classic')).toEqual({ lte: '1989-12-31' });
  });

  it('builds movie discover params with genre, rating, and year filters', () => {
    const params = buildBrowseDiscoverParams({
      mediaType: 'movie',
      sortBy: 'popularity.desc',
      genreId: 18,
      minRating: '8',
      year: '2023',
    });

    expect(params).toEqual({
      sort_by: 'popularity.desc',
      with_genres: '18',
      'vote_average.gte': 8,
      'vote_count.gte': 100,
      'primary_release_date.gte': '2023-01-01',
      'primary_release_date.lte': '2023-12-31',
    });
  });

  it('uses first_air_date and TV vote_count floor when mediaType is tv', () => {
    const params = buildBrowseDiscoverParams({
      mediaType: 'tv',
      sortBy: 'date.desc',
      genreId: 10765,
      minRating: '7',
      year: '2020s',
    });

    expect(params).toEqual({
      sort_by: 'first_air_date.desc',
      with_genres: '10765',
      'vote_average.gte': 7,
      'vote_count.gte': 50,
      'first_air_date.gte': '2020-01-01',
      'first_air_date.lte': '2029-12-31',
    });
  });
});
