// Pagination wrapper
export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// Movie (list/search result)
export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  video: boolean;
  media_type?: 'movie';
}

// TV Show (list/search result)
export interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  media_type?: 'tv';
}

// Person (multi search)
export interface TMDBPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  media_type?: 'person';
}

// Multi search result union
export type TMDBMultiSearchResult = (TMDBMovie & { media_type: 'movie' }) | (TMDBTVShow & { media_type: 'tv' }) | (TMDBPerson & { media_type: 'person' });

// Genre
export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBGenreList {
  genres: TMDBGenre[];
}

// Movie Details (full, from /movie/{id})
export interface TMDBMovieDetails {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genres: TMDBGenre[];
  runtime: number | null;
  status: string;
  tagline: string | null;
  budget: number;
  revenue: number;
  homepage: string | null;
  imdb_id: string | null;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }[];
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  // Appended responses
  credits?: TMDBCredits;
  videos?: TMDBVideoResponse;
  similar?: TMDBPaginatedResponse<TMDBMovie>;
  recommendations?: TMDBPaginatedResponse<TMDBMovie>;
  images?: TMDBImageResponse;
}

// TV Show Details
export interface TMDBTVDetails {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genres: TMDBGenre[];
  episode_run_time: number[];
  status: string;
  tagline: string | null;
  type: string;
  number_of_episodes: number;
  number_of_seasons: number;
  seasons: TMDBSeason[];
  homepage: string | null;
  networks: {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }[];
  created_by: {
    id: number;
    name: string;
    profile_path: string | null;
  }[];
  // Appended responses
  credits?: TMDBCredits;
  videos?: TMDBVideoResponse;
  similar?: TMDBPaginatedResponse<TMDBTVShow>;
  recommendations?: TMDBPaginatedResponse<TMDBTVShow>;
}

// Season
export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  vote_average: number;
}

// Season Details (with episodes)
export interface TMDBSeasonDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  air_date: string | null;
  episodes: TMDBEpisode[];
}

// Episode
export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  episode_number: number;
  season_number: number;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
}

// Credits (cast + crew)
export interface TMDBCredits {
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  known_for_department: string;
  gender: number;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
  gender: number;
}

// Videos
export interface TMDBVideoResponse {
  results: TMDBVideo[];
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  iso_639_1: string;
  iso_3166_1: string;
}

// Images
export interface TMDBImageResponse {
  backdrops: TMDBImage[];
  posters: TMDBImage[];
  logos: TMDBImage[];
}

export interface TMDBImage {
  aspect_ratio: number;
  file_path: string;
  height: number;
  width: number;
  vote_average: number;
  vote_count: number;
  iso_639_1: string | null;
}

// Union type for media items in lists
export type TMDBMediaItem = TMDBMovie | TMDBTVShow;
