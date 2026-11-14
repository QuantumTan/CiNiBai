import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { AlertCircle, RefreshCw, Key } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { CinematicHero } from '../components/home/CinematicHero';
import { ContentRow } from '../components/home/ContentRow';
import { Top10Row } from '../components/home/Top10Row';
import { ContentRowSkeleton } from '../components/ui/Skeleton';
import { SEO } from '../components/common/SEO';
import { useRailIntersection } from '../hooks/useRailIntersection';
import { getTMDBErrorMessage, setTMDBToken } from '../api/tmdb';
import type { TMDBMovie, TMDBTVShow } from '../api/tmdb.types';
import { useRecentlyViewedStore } from '../stores/recentlyViewedStore';
import {
  useTrending,
  useTrendingToday,
  usePopularMovies,
  useNowPlayingMovies,
  useNetflixOriginals,
  usePrimeOriginals,
  useDisneyOriginals,
  useHBOMaxOriginals,
  useHuluOriginals,
  useAppleTVOriginals,
  useAnime,
} from '../hooks/useTMDB';

interface HomeRailProps {
  title: string;
  items?: (TMDBMovie | TMDBTVShow)[];
  isLoading: boolean;
  isError: boolean;
  isFetching?: boolean;
  error: unknown;
  refetch: () => void;
  seeMoreLink?: string;
  isTop10?: boolean;
}

function HomeRail({
  title,
  items,
  isLoading,
  isError,
  isFetching,
  error,
  refetch,
  seeMoreLink,
  isTop10 = false,
}: HomeRailProps) {
  const queryClient = useQueryClient();

  if (isError) {
    const errorMsg = getTMDBErrorMessage(error);
    const isMissingToken = errorMsg === 'Missing TMDB token';

    return (
      <section className="relative my-8 space-y-3.5" role="region" aria-label={title}>
        <div className="flex items-center justify-between px-1">
          <h2 className="tracking-tight-title text-xl font-bold text-text-primary md:text-2xl">
            {title}
          </h2>
        </div>
        <div
          role="alert"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-error/30 bg-bg-surface/80 p-5 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error/15 text-error border border-error/20">
              <AlertCircle size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Unable to load this row</p>
              <p className="text-xs text-text-secondary mt-0.5">
                {errorMsg}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isMissingToken && (
              <button
                type="button"
                onClick={() => {
                  const token = window.prompt(
                    'Enter your TMDB API Read Access Token (v4 auth):\n\nGet a free token at: https://www.themoviedb.org/settings/api'
                  );
                  if (token && token.trim()) {
                    setTMDBToken(token.trim());
                    queryClient.invalidateQueries();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-accent text-on-accent text-xs font-semibold hover:bg-accent-light transition-colors min-h-[44px] cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Key size={14} aria-hidden="true" />
                <span>Set Token</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-colors min-h-[44px] cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 disabled:cursor-not-allowed ${
                isMissingToken
                  ? 'bg-bg-elevated border border-border-default text-text-primary hover:border-border-strong hover:bg-bg-surface'
                  : 'bg-accent text-on-accent hover:bg-accent-light'
              }`}
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} aria-hidden="true" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!isLoading && (!items || items.length === 0)) {
    return (
      <section className="relative my-8 space-y-3.5" role="region" aria-label={title}>
        <div className="flex items-center justify-between px-1">
          <h2 className="tracking-tight-title text-xl font-bold text-text-primary md:text-2xl">
            {title}
          </h2>
        </div>
        <div className="rounded-xl border border-border-default bg-bg-surface/50 p-6 text-center">
          <p className="text-sm text-text-secondary">No titles in this row right now.</p>
        </div>
      </section>
    );
  }

  if (isTop10) {
    return (
      <Top10Row
        title={title}
        items={items as any}
        isLoading={isLoading}
      />
    );
  }

  return (
    <ContentRow
      title={title}
      items={items}
      isLoading={isLoading}
      seeMoreLink={seeMoreLink}
    />
  );
}

interface DeferredHomeRailProps {
  title: string;
  useRailQuery: (enabled?: boolean) => {
    data?: { results: (TMDBMovie | TMDBTVShow)[] };
    isLoading: boolean;
    isError: boolean;
    isFetching: boolean;
    error: unknown;
    refetch: () => void;
  };
  seeMoreLink?: string;
}

function DeferredHomeRail({ title, useRailQuery, seeMoreLink }: DeferredHomeRailProps) {
  const { ref, isVisible } = useRailIntersection('150px 0px');
  const { data, isLoading, isError, isFetching, error, refetch } = useRailQuery(isVisible);

  return (
    <div ref={ref}>
      {!isVisible ? (
        <ContentRowSkeleton />
      ) : (
        <HomeRail
          title={title}
          items={data?.results}
          isLoading={isLoading}
          isError={isError}
          isFetching={isFetching}
          error={error}
          refetch={refetch}
          seeMoreLink={seeMoreLink}
        />
      )}
    </div>
  );
}

export function HomePage() {
  const queryClient = useQueryClient();
  const recentlyViewed = useRecentlyViewedStore((s) => s.items);
  const recentlyViewedMedia = useMemo<(TMDBMovie | TMDBTVShow)[]>(
    () =>
      recentlyViewed.map((item) =>
        item.type === 'tv'
          ? ({
              id: item.id,
              name: item.title,
              original_name: item.title,
              overview: '',
              poster_path: item.posterPath,
              backdrop_path: item.backdropPath,
              first_air_date: item.releaseDate,
              vote_average: item.voteAverage,
              vote_count: 0,
              popularity: 0,
              genre_ids: [],
              origin_country: [],
              original_language: 'en',
              media_type: 'tv',
            } satisfies TMDBTVShow)
          : ({
              id: item.id,
              title: item.title,
              original_title: item.title,
              overview: '',
              poster_path: item.posterPath,
              backdrop_path: item.backdropPath,
              release_date: item.releaseDate,
              vote_average: item.voteAverage,
              vote_count: 0,
              popularity: 0,
              genre_ids: [],
              adult: false,
              original_language: 'en',
              video: false,
              media_type: 'movie',
            } satisfies TMDBMovie)
      ),
    [recentlyViewed]
  );

  const { data: trending, isError: trendingError, isFetching: trendingFetching, error: trendingErr, refetch: refetchTrending, isLoading: trendingLoading } = useTrending('all', 'week');
  const { data: trendingToday, isLoading: trendingTodayLoading, isError: trendingTodayError, isFetching: trendingTodayFetching, error: trendingTodayErr, refetch: refetchTrendingToday } = useTrendingToday();

  // Filter items with backdrops for the cinematic hero
  const heroItems = trending?.results.filter((item) => item.backdrop_path) || [];

  return (
    <div className="relative overflow-hidden">
      <SEO
        title="CineBai — Calm, cinema-first home for finding what to watch next"
        description="A calm, cinema-first home for finding what to watch next. Discover trending movies, television series, anime, ratings, cast details, and curated watchlists on CineBai."
        url="https://cinibai.vercel.app/"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'CineBai',
          url: 'https://cinibai.vercel.app/',
          description: 'A calm, cinema-first home for finding what to watch next.',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://cinibai.vercel.app/search?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        }}
      />

      {/* Semantic H1 for the page */}
      <h1 className="sr-only">CineBai — Discover Movies, TV Series & Anime</h1>

      {/* Cinematic Hero Showcase */}
      {trendingError ? (
        <section aria-label="Featured Showcase" className="mx-auto max-w-7xl px-4 pt-6 lg:px-8">
          <div
            role="alert"
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-error/30 bg-bg-surface/80 p-6 backdrop-blur-sm shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-error/15 text-error border border-error/20">
                <AlertCircle size={24} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-bold font-display text-text-primary">Featured content unavailable</h2>
                <p className="text-xs text-text-secondary mt-1">
                  {getTMDBErrorMessage(trendingErr)}
                </p>
                {getTMDBErrorMessage(trendingErr) === 'Missing TMDB token' && (
                  <p className="text-xs text-text-secondary mt-1">
                    Provide a TMDB Read Access Token to display featured films and catalog rails.
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {getTMDBErrorMessage(trendingErr) === 'Missing TMDB token' && (
                <button
                  type="button"
                  onClick={() => {
                    const token = window.prompt(
                      'Enter your TMDB API Read Access Token (v4 auth):\n\nGet a free token at: https://www.themoviedb.org/settings/api'
                    );
                    if (token && token.trim()) {
                      setTMDBToken(token.trim());
                      queryClient.invalidateQueries();
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-accent text-on-accent text-xs font-semibold hover:bg-accent-light transition-colors min-h-[44px] cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Key size={15} aria-hidden="true" />
                  <span>Set TMDB Token</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => refetchTrending()}
                disabled={trendingFetching}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-semibold transition-colors min-h-[44px] cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 disabled:cursor-not-allowed ${
                  getTMDBErrorMessage(trendingErr) === 'Missing TMDB token'
                    ? 'bg-bg-elevated border border-border-default text-text-primary hover:bg-bg-surface hover:border-border-strong'
                    : 'bg-accent text-on-accent hover:bg-accent-light'
                }`}
              >
                <RefreshCw size={15} className={trendingFetching ? 'animate-spin' : ''} aria-hidden="true" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        </section>
      ) : (
        <CinematicHero items={heroItems} />
      )}

      {/* Curated Streaming Studios */}
      <section aria-labelledby="studios-heading" className="mx-auto max-w-7xl px-4 pt-6 pb-4 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 id="studios-heading" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Premier Studios & Networks
          </h2>
          <span className="text-xs text-text-muted hidden sm:inline">Direct catalog hubs</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {/* Netflix */}
          <Link
            to="/network/netflix"
            className="group relative flex h-16 sm:h-20 items-center justify-center rounded-2xl bg-bg-surface/90 border border-border-default hover:border-[#FF2A35]/60 hover:bg-bg-elevated transition-all duration-200 shadow-sm hover:shadow-[0_0_24px_rgba(255,42,53,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Netflix network titles"
          >
            <span className="text-base sm:text-lg font-black tracking-widest text-text-primary group-hover:scale-105 transition-transform duration-200">
              <span className="text-[#FF2A35]">N</span>ETFLIX
            </span>
          </Link>

          {/* HBO Max */}
          <Link
            to="/network/hbo"
            className="group relative flex h-16 sm:h-20 items-center justify-center rounded-2xl bg-bg-surface/90 border border-border-default hover:border-[#9900FF]/60 hover:bg-bg-elevated transition-all duration-200 shadow-sm hover:shadow-[0_0_24px_rgba(153,0,255,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="HBO Max network titles"
          >
            <span className="text-base sm:text-lg font-black tracking-wider text-text-primary group-hover:scale-105 transition-transform duration-200">
              HBO <span className="text-xs font-bold text-accent">MAX</span>
            </span>
          </Link>

          {/* Prime Video */}
          <Link
            to="/network/prime"
            className="group relative flex h-16 sm:h-20 flex-col items-center justify-center gap-0.5 rounded-2xl bg-bg-surface/90 border border-border-default hover:border-[#00A8E1]/60 hover:bg-bg-elevated transition-all duration-200 shadow-sm hover:shadow-[0_0_24px_rgba(0,168,225,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Amazon Prime Video network titles"
          >
            <div className="flex items-center gap-1 group-hover:scale-105 transition-transform duration-200">
              <span className="text-base sm:text-lg font-black tracking-tight text-text-primary">
                prime
              </span>
              <span className="text-base sm:text-lg font-bold tracking-tight text-[#38C5F8]">
                video
              </span>
            </div>
            {/* Amazon Smile Curve */}
            <svg
              className="w-12 h-2 text-[#38C5F8]"
              viewBox="0 0 80 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 4C24 11 56 11 79 4"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M73 1.5L80 4L75.5 8.5"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          {/* Disney+ */}
          <Link
            to="/network/disney"
            className="group relative flex h-16 sm:h-20 items-center justify-center rounded-2xl bg-bg-surface/90 border border-border-default hover:border-[#4E95FF]/60 hover:bg-bg-elevated transition-all duration-200 shadow-sm hover:shadow-[0_0_24px_rgba(78,149,255,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Disney+ network titles"
          >
            <span className="text-base sm:text-lg font-extrabold tracking-wide text-text-primary group-hover:scale-105 transition-transform duration-200">
              Disney<span className="text-[#4E95FF] font-black">+</span>
            </span>
          </Link>

          {/* Hulu */}
          <Link
            to="/network/hulu"
            className="group relative flex h-16 sm:h-20 items-center justify-center rounded-2xl bg-bg-surface/90 border border-border-default hover:border-[#1CE783]/60 hover:bg-bg-elevated transition-all duration-200 shadow-sm hover:shadow-[0_0_24px_rgba(28,231,131,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Hulu network titles"
          >
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-[#1CE783] group-hover:scale-105 transition-transform duration-200">
              hulu
            </span>
          </Link>

          {/* Apple TV+ (Bulletproof cross-platform SVG logo for Windows, Mac, Linux, iOS, Android) */}
          <Link
            to="/network/apple"
            className="group relative flex h-16 sm:h-20 items-center justify-center gap-1.5 rounded-2xl bg-bg-surface/90 border border-border-default hover:border-text-secondary/60 hover:bg-bg-elevated transition-all duration-200 shadow-sm hover:shadow-[0_0_24px_rgba(255,255,255,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Apple TV+ network titles"
          >
            <div className="flex items-center gap-1.5 group-hover:scale-105 transition-transform duration-200">
              <svg
                className="h-4.5 w-4.5 fill-current text-text-primary"
                viewBox="0 0 170 170"
                aria-hidden="true"
              >
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.31-7.86-12.01-13.59-25.04-17.18-39.09-3.59-14.05-5.39-27.18-5.39-39.4 0-14.46 3.65-26.68 10.96-36.65 7.3-9.98 16.59-15.08 27.86-15.3 4.9.11 10.3 1.34 16.2 3.68 5.9 2.34 9.77 3.56 11.62 3.68 1.49-.12 5.54-1.39 12.15-3.8 6.61-2.42 12.18-3.48 16.71-3.18 12.98.88 23.32 5.68 31.02 14.41-11.22 6.74-16.71 16.12-16.48 28.14.23 9.47 3.96 17.37 11.19 23.71 7.23 6.33 15.86 9.94 25.88 10.83-2.13 6.53-4.8 13.04-8.02 19.53zM119.22 31.05c0-7.29 2.65-14.15 7.95-20.59 5.3-6.44 11.83-10.15 19.59-11.14.33 1.1.49 2.2.49 3.3 0 7.39-2.73 14.34-8.19 20.85-5.46 6.51-12.07 10.31-19.84 11.41z" />
              </svg>
              <span className="text-base sm:text-lg font-bold tracking-tight text-text-primary">
                tv+
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Curated Media Rails */}
      <div className="mx-auto max-w-7xl space-y-8 px-4 pt-8 lg:px-8">
        {recentlyViewedMedia.length > 0 && (
          <ContentRow
            title="Recently Viewed"
            items={recentlyViewedMedia}
          />
        )}

        <HomeRail
          title="Top 10 Trending Today"
          items={trendingToday?.results}
          isLoading={trendingTodayLoading}
          isError={trendingTodayError}
          isFetching={trendingTodayFetching}
          error={trendingTodayErr}
          refetch={refetchTrendingToday}
          isTop10
        />

        <HomeRail
          title="Trending This Week"
          items={trending?.results}
          isLoading={trendingLoading}
          isError={trendingError}
          isFetching={trendingFetching}
          error={trendingErr}
          refetch={refetchTrending}
          seeMoreLink="/movies"
        />

        <DeferredHomeRail
          title="Streaming on Apple TV+"
          useRailQuery={useAppleTVOriginals}
          seeMoreLink="/network/apple"
        />

        <DeferredHomeRail
          title="Streaming on Netflix"
          useRailQuery={useNetflixOriginals}
          seeMoreLink="/network/netflix"
        />

        <DeferredHomeRail
          title="Streaming on HBO Max"
          useRailQuery={useHBOMaxOriginals}
          seeMoreLink="/network/hbo"
        />

        <DeferredHomeRail
          title="Streaming on Prime Video"
          useRailQuery={usePrimeOriginals}
          seeMoreLink="/network/prime"
        />

        <DeferredHomeRail
          title="Streaming on Disney+"
          useRailQuery={useDisneyOriginals}
          seeMoreLink="/network/disney"
        />

        <DeferredHomeRail
          title="Anime Showcase"
          useRailQuery={useAnime}
          seeMoreLink="/anime"
        />

        <DeferredHomeRail
          title="Streaming on Hulu"
          useRailQuery={useHuluOriginals}
          seeMoreLink="/network/hulu"
        />

        <DeferredHomeRail
          title="Popular Movies"
          useRailQuery={usePopularMovies}
          seeMoreLink="/movies"
        />

        <DeferredHomeRail
          title="In Theaters"
          useRailQuery={useNowPlayingMovies}
          seeMoreLink="/movies"
        />
      </div>
    </div>
  );
}
