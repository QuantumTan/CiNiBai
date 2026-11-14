import type { DiscoverParams } from '../api/tmdb.types';

export interface BrowseFilterState {
  mediaType: 'movie' | 'tv';
  sortBy: string;
  genreId: number | null;
  minRating: string;
  year: string;
}

export interface YearRange {
  gte?: string;
  lte?: string;
}

export function resolveYearRange(year: string): YearRange {
  const trimmed = year.trim();
  if (!trimmed) return {};

  if (/^\d{4}$/.test(trimmed)) {
    return { gte: `${trimmed}-01-01`, lte: `${trimmed}-12-31` };
  }

  if (trimmed === '2020s') return { gte: '2020-01-01', lte: '2029-12-31' };
  if (trimmed === '2010s') return { gte: '2010-01-01', lte: '2019-12-31' };
  if (trimmed === '2000s') return { gte: '2000-01-01', lte: '2009-12-31' };
  if (trimmed === '1990s') return { gte: '1990-01-01', lte: '1999-12-31' };
  if (trimmed === 'classic') return { lte: '1989-12-31' };

  return {};
}

export function buildBrowseDiscoverParams({
  mediaType,
  sortBy,
  genreId,
  minRating,
  year,
}: BrowseFilterState): DiscoverParams {
  const dateSortDesc = mediaType === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc';
  const dateSortAsc = mediaType === 'movie' ? 'primary_release_date.asc' : 'first_air_date.asc';

  const params: DiscoverParams = {
    sort_by: sortBy === 'date.desc' ? dateSortDesc : sortBy === 'date.asc' ? dateSortAsc : sortBy,
  };

  if (genreId !== null && Number.isFinite(genreId) && genreId > 0) {
    params.with_genres = String(genreId);
  }

  const parsedRating = minRating ? Number(minRating) : NaN;
  if (Number.isFinite(parsedRating) && parsedRating > 0) {
    params['vote_average.gte'] = parsedRating;
    params['vote_count.gte'] = mediaType === 'movie' ? 100 : 50;
  } else if (sortBy === 'vote_average.desc') {
    params['vote_count.gte'] = mediaType === 'movie' ? 100 : 50;
  }

  const { gte, lte } = resolveYearRange(year);
  if (mediaType === 'movie') {
    if (gte) params['primary_release_date.gte'] = gte;
    if (lte) params['primary_release_date.lte'] = lte;
  } else {
    if (gte) params['first_air_date.gte'] = gte;
    if (lte) params['first_air_date.lte'] = lte;
  }

  return params;
}
