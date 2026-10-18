import type {
  TMDBMovie,
  TMDBTVShow,
  TMDBMovieDetails,
  TMDBTVDetails,
  TMDBPaginatedResponse,
} from './tmdb.types';

export const MOCK_VISION_QUEST: TMDBTVShow = {
  id: 213375,
  name: 'Vision Quest',
  original_name: 'Vision Quest',
  overview:
    'Following the events of WandaVision, Vision attempts to regain his memories and humanity while navigating a complex world of androids, synthezoids, and unexpected allies.',
  backdrop_path: '/uoXXbN2PrOxH6UKyP7kYwmGpAAP.jpg',
  poster_path: '/xK27l5uwaVyZSlENWnmLlWwDQNS.jpg',
  first_air_date: '2026-05-15',
  vote_average: 8.4,
  vote_count: 1420,
  popularity: 125.4,
  genre_ids: [18, 10765, 10759],
  origin_country: ['US'],
  original_language: 'en',
  media_type: 'tv',
};

export const MOCK_BATMAN_VS_ROBIN: TMDBMovie = {
  id: 321528,
  title: 'Batman vs. Robin',
  original_title: 'Batman vs. Robin',
  overview:
    "Damian Wayne is having a hard time coping with his father's 'no killing' rule. Meanwhile, Gotham is terrorized by a mysterious society known as the Court of Owls.",
  backdrop_path: '/g2XhZJhFiHcczWcXEEldItG53gd.jpg',
  poster_path: '/aGp9XDXmVM5lCKHWtgBC15S7XLr.jpg',
  release_date: '2015-04-14',
  vote_average: 7.2,
  vote_count: 890,
  popularity: 88.5,
  genre_ids: [28, 16, 80],
  adult: false,
  original_language: 'en',
  video: false,
  media_type: 'movie',
};

export const MOCK_THE_BATMAN: TMDBMovie = {
  id: 414906,
  title: 'The Batman',
  original_title: 'The Batman',
  overview:
    'In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.',
  backdrop_path: '/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
  poster_path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg',
  release_date: '2022-03-04',
  vote_average: 7.7,
  vote_count: 9400,
  popularity: 110.2,
  genre_ids: [80, 9648, 53],
  adult: false,
  original_language: 'en',
  video: false,
  media_type: 'movie',
};

export const MOCK_THE_DARK_KNIGHT: TMDBMovie = {
  id: 155,
  title: 'The Dark Knight',
  original_title: 'The Dark Knight',
  overview:
    'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent, but the Joker unleashes chaos on Gotham.',
  backdrop_path: '/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
  poster_path: '/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
  release_date: '2008-07-18',
  vote_average: 8.5,
  vote_count: 32000,
  popularity: 135.0,
  genre_ids: [18, 28, 80, 53],
  adult: false,
  original_language: 'en',
  video: false,
  media_type: 'movie',
};

export const MOCK_INTERSTELLAR: TMDBMovie = {
  id: 157336,
  title: 'Interstellar',
  original_title: 'Interstellar',
  overview:
    'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
  backdrop_path: '/gKkl37BQuKTanygYQG1pyYgLVgf.jpg',
  poster_path: '/gKkl37BQuKTanygYQG1pyYgLVgf.jpg',
  release_date: '2014-11-07',
  vote_average: 8.4,
  vote_count: 34500,
  popularity: 145.8,
  genre_ids: [12, 18, 878],
  adult: false,
  original_language: 'en',
  video: false,
  media_type: 'movie',
};

export const MOCK_DUNE_PART_TWO: TMDBMovie = {
  id: 693134,
  title: 'Dune: Part Two',
  original_title: 'Dune: Part Two',
  overview:
    'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.',
  backdrop_path: '/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
  poster_path: '/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
  release_date: '2024-03-01',
  vote_average: 8.2,
  vote_count: 5300,
  popularity: 130.4,
  genre_ids: [878, 12],
  adult: false,
  original_language: 'en',
  video: false,
  media_type: 'movie',
};

export const MOCK_INFINITY_WAR: TMDBMovie = {
  id: 299536,
  title: 'Avengers: Infinity War',
  original_title: 'Avengers: Infinity War',
  overview:
    'As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos.',
  backdrop_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
  poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
  release_date: '2018-04-27',
  vote_average: 8.3,
  vote_count: 28900,
  popularity: 160.1,
  genre_ids: [12, 28, 878],
  adult: false,
  original_language: 'en',
  video: false,
  media_type: 'movie',
};

export const MOCK_SON_OF_BATMAN: TMDBMovie = {
  id: 251519,
  title: 'Son of Batman',
  original_title: 'Son of Batman',
  overview:
    "Batman learns he has a violent, unruly pre-teen son with Talia al Ghul, secretly raised by Ra's al Ghul and the League of Assassins.",
  poster_path: '/yHx8OLSKc3VtIBB5lIe90c0fHOX.jpg',
  backdrop_path: '/g2XhZJhFiHcczWcXEEldItG53gd.jpg',
  release_date: '2014-04-22',
  vote_average: 7.0,
  vote_count: 1100,
  popularity: 42.5,
  genre_ids: [28, 16, 12],
  adult: false,
  original_language: 'en',
  video: false,
  media_type: 'movie',
};

export const MOCK_BATMAN_BAD_BLOOD: TMDBMovie = {
  id: 366924,
  title: 'Batman: Bad Blood',
  original_title: 'Batman: Bad Blood',
  overview:
    'Bruce Wayne is missing. Alfred covers for him while Nightwing and Robin patrol Gotham City in his stead as a new vigilante arrives.',
  poster_path: '/ktjbGsGm5GKlHDvvwQajXvDW2BN.jpg',
  backdrop_path: '/g2XhZJhFiHcczWcXEEldItG53gd.jpg',
  release_date: '2016-01-19',
  vote_average: 6.9,
  vote_count: 850,
  popularity: 38.2,
  genre_ids: [28, 16, 878],
  adult: false,
  original_language: 'en',
  video: false,
  media_type: 'movie',
};

export const MOCK_BATMAN_UNDER_RED_HOOD: TMDBMovie = {
  id: 40662,
  title: 'Batman: Under the Red Hood',
  original_title: 'Batman: Under the Red Hood',
  overview:
    'One part vigilante, one part criminal kingpin, Red Hood begins cleaning up Gotham with the efficiency of Batman, but without following the same code.',
  poster_path: '/5EJGeeuPy19EGDy8HErpbHba0yq.jpg',
  backdrop_path: '/g2XhZJhFiHcczWcXEEldItG53gd.jpg',
  release_date: '2010-07-27',
  vote_average: 7.8,
  vote_count: 1650,
  popularity: 45.1,
  genre_ids: [28, 16, 80],
  adult: false,
  original_language: 'en',
  video: false,
  media_type: 'movie',
};

export const MOCK_BATMAN_HUSH: TMDBMovie = {
  id: 537056,
  title: 'Batman: Hush',
  original_title: 'Batman: Hush',
  overview:
    'A mysterious villain known only as Hush will stop at nothing to tear Batman’s life apart, targeting everyone close to the Dark Knight.',
  poster_path: '/eevJuYAitUe6VwFN29aFwzeyeTr.jpg',
  backdrop_path: '/g2XhZJhFiHcczWcXEEldItG53gd.jpg',
  release_date: '2019-07-19',
  vote_average: 7.2,
  vote_count: 920,
  popularity: 40.0,
  genre_ids: [28, 16, 9648],
  adult: false,
  original_language: 'en',
  video: false,
  media_type: 'movie',
};

export const MOCK_SIMILAR_BATMAN_MOVIES: TMDBMovie[] = [
  MOCK_SON_OF_BATMAN,
  MOCK_BATMAN_BAD_BLOOD,
  MOCK_BATMAN_UNDER_RED_HOOD,
  MOCK_BATMAN_HUSH,
  MOCK_THE_BATMAN,
  MOCK_THE_DARK_KNIGHT,
];

export const MOCK_ALL_ITEMS: (TMDBMovie | TMDBTVShow)[] = [
  MOCK_VISION_QUEST,
  MOCK_BATMAN_VS_ROBIN,
  MOCK_THE_BATMAN,
  MOCK_INTERSTELLAR,
  MOCK_DUNE_PART_TWO,
  MOCK_INFINITY_WAR,
  MOCK_SON_OF_BATMAN,
  MOCK_BATMAN_BAD_BLOOD,
  MOCK_BATMAN_UNDER_RED_HOOD,
  MOCK_BATMAN_HUSH,
  MOCK_THE_DARK_KNIGHT,
];

export function getMockMovieDetails(movieId: number): TMDBMovieDetails {
  const isBatmanVsRobin = movieId === 321528;
  const isTheBatman = movieId === 414906;
  const isDarkKnight = movieId === 155;

  const baseTitle = isBatmanVsRobin
    ? 'Batman vs. Robin'
    : isTheBatman
    ? 'The Batman'
    : isDarkKnight
    ? 'The Dark Knight'
    : 'Batman vs. Robin';

  const basePoster = isTheBatman
    ? '/74xTEgt7R36Fpooo50r9T25onhq.jpg'
    : isDarkKnight
    ? '/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg'
    : '/aGp9XDXmVM5lCKHWtgBC15S7XLr.jpg';

  const baseBackdrop = isTheBatman || isDarkKnight
    ? '/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg'
    : '/g2XhZJhFiHcczWcXEEldItG53gd.jpg';

  return {
    id: movieId || 321528,
    title: baseTitle,
    original_title: baseTitle,
    overview:
      "Damian Wayne is having a hard time coping with his father's 'no killing' rule. Meanwhile, Gotham is terrorized by a mysterious society known as the Court of Owls.",
    poster_path: basePoster,
    backdrop_path: baseBackdrop,
    release_date: '2015-04-14',
    vote_average: 7.2,
    vote_count: 890,
    popularity: 88.5,
    genres: [
      { id: 28, name: 'Action' },
      { id: 16, name: 'Animation' },
      { id: 80, name: 'Crime' },
      { id: 12, name: 'Adventure' },
    ],
    runtime: 80,
    status: 'Released',
    tagline: 'The shadows have come for Gotham.',
    budget: 3500000,
    revenue: 4200000,
    homepage: null,
    imdb_id: 'tt4324274',
    belongs_to_collection: null,
    production_companies: [
      { id: 9993, name: 'DC Entertainment', logo_path: null, origin_country: 'US' },
      { id: 2785, name: 'Warner Bros. Animation', logo_path: null, origin_country: 'US' },
    ],
    spoken_languages: [{ english_name: 'English', iso_639_1: 'en', name: 'English' }],
    credits: {
      cast: [
        {
          id: 1,
          name: "Jason O'Mara",
          character: 'Bruce Wayne / Batman',
          profile_path: null,
          order: 0,
          known_for_department: 'Acting',
          gender: 2,
        },
        {
          id: 2,
          name: 'Stuart Allan',
          character: 'Damian Wayne / Robin',
          profile_path: null,
          order: 1,
          known_for_department: 'Acting',
          gender: 2,
        },
        {
          id: 3,
          name: 'David McCallum',
          character: 'Alfred Pennyworth',
          profile_path: null,
          order: 2,
          known_for_department: 'Acting',
          gender: 2,
        },
        {
          id: 4,
          name: 'Sean Maher',
          character: 'Dick Grayson / Nightwing',
          profile_path: null,
          order: 3,
          known_for_department: 'Acting',
          gender: 2,
        },
        {
          id: 5,
          name: 'Jeremy Sisto',
          character: 'Talon',
          profile_path: null,
          order: 4,
          known_for_department: 'Acting',
          gender: 2,
        },
      ],
      crew: [
        {
          id: 10,
          name: 'Jay Oliva',
          job: 'Director',
          department: 'Directing',
          profile_path: null,
          gender: 2,
        },
      ],
    },
    videos: {
      results: [
        {
          id: 'vid1',
          key: 'dQw4w9WgXcQ',
          name: 'Official Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2015-02-15T00:00:00Z',
          iso_639_1: 'en',
          iso_3166_1: 'US',
        },
      ],
    },
    similar: {
      page: 1,
      results: MOCK_SIMILAR_BATMAN_MOVIES,
      total_pages: 1,
      total_results: MOCK_SIMILAR_BATMAN_MOVIES.length,
    },
    recommendations: {
      page: 1,
      results: MOCK_SIMILAR_BATMAN_MOVIES,
      total_pages: 1,
      total_results: MOCK_SIMILAR_BATMAN_MOVIES.length,
    },
  };
}

export function getMockTVDetails(tvId: number): TMDBTVDetails {
  return {
    id: tvId || 213375,
    name: 'Vision Quest',
    original_name: 'Vision Quest',
    overview:
      'Following the events of WandaVision, Vision attempts to regain his memories and humanity while navigating a complex world of androids, synthezoids, and unexpected allies.',
    backdrop_path: '/uoXXbN2PrOxH6UKyP7kYwmGpAAP.jpg',
    poster_path: '/xK27l5uwaVyZSlENWnmLlWwDQNS.jpg',
    first_air_date: '2026-05-15',
    last_air_date: '2026-06-20',
    vote_average: 8.4,
    vote_count: 1420,
    popularity: 125.4,
    genres: [
      { id: 18, name: 'Drama' },
      { id: 10765, name: 'Sci-Fi & Fantasy' },
      { id: 10759, name: 'Action & Adventure' },
    ],
    episode_run_time: [52],
    status: 'In Production',
    tagline: 'What is grief, if not love persevering?',
    type: 'Miniseries',
    number_of_episodes: 6,
    number_of_seasons: 1,
    seasons: [
      {
        id: 1001,
        name: 'Season 1',
        overview: 'Vision explores what remains of himself and what the future holds.',
        poster_path: '/xK27l5uwaVyZSlENWnmLlWwDQNS.jpg',
        season_number: 1,
        episode_count: 6,
        air_date: '2026-05-15',
        vote_average: 8.4,
      },
    ],
    homepage: null,
    networks: [
      { id: 2739, name: 'Disney+', logo_path: null, origin_country: 'US' },
    ],
    created_by: [
      { id: 50, name: 'Terry Matalas', profile_path: null },
    ],
    credits: {
      cast: [
        {
          id: 1,
          name: 'Paul Bettany',
          character: 'Vision',
          profile_path: null,
          order: 0,
          known_for_department: 'Acting',
          gender: 2,
        },
        {
          id: 2,
          name: 'James Spader',
          character: 'Ultron',
          profile_path: null,
          order: 1,
          known_for_department: 'Acting',
          gender: 2,
        },
      ],
      crew: [],
    },
    videos: {
      results: [
        {
          id: 'v1',
          key: 'dQw4w9WgXcQ',
          name: 'Teaser Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2026-01-01T00:00:00Z',
          iso_639_1: 'en',
          iso_3166_1: 'US',
        },
      ],
    },
    similar: {
      page: 1,
      results: [MOCK_VISION_QUEST],
      total_pages: 1,
      total_results: 1,
    },
    recommendations: {
      page: 1,
      results: [MOCK_VISION_QUEST],
      total_pages: 1,
      total_results: 1,
    },
  };
}

export function getMockPaginated<T>(items: T[], page = 1): TMDBPaginatedResponse<T> {
  return {
    page,
    results: items,
    total_pages: 1,
    total_results: items.length,
  };
}
