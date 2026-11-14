import { Link } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { CinematicHero } from '../components/home/CinematicHero';
import { ContentRow } from '../components/home/ContentRow';
import { Top10Row } from '../components/home/Top10Row';
import { SEO } from '../components/common/SEO';
import { getTMDBErrorMessage } from '../api/tmdb';
import type { TMDBMovie, TMDBTVShow } from '../api/tmdb.types';
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
  if (isError) {
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
                {getTMDBErrorMessage(error)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent text-on-accent text-xs font-semibold hover:bg-accent-light transition-colors min-h-[44px] cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} aria-hidden="true" />
            <span>Retry</span>
          </button>
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

export function HomePage() {
  const { data: trending, isLoading: trendingLoading, isError: trendingError, isFetching: trendingFetching, error: trendingErr, refetch: refetchTrending } = useTrending('all', 'week');
  const { data: trendingToday, isLoading: trendingTodayLoading, isError: trendingTodayError, isFetching: trendingTodayFetching, error: trendingTodayErr, refetch: refetchTrendingToday } = useTrendingToday();
  const { data: popularMovies, isLoading: popularMoviesLoading, isError: popularMoviesError, isFetching: popularMoviesFetching, error: popularMoviesErr, refetch: refetchPopularMovies } = usePopularMovies();
  const { data: nowPlaying, isLoading: nowPlayingLoading, isError: nowPlayingError, isFetching: nowPlayingFetching, error: nowPlayingErr, refetch: refetchNowPlaying } = useNowPlayingMovies();
  const { data: netflix, isLoading: netflixLoading, isError: netflixError, isFetching: netflixFetching, error: netflixErr, refetch: refetchNetflix } = useNetflixOriginals();
  const { data: prime, isLoading: primeLoading, isError: primeError, isFetching: primeFetching, error: primeErr, refetch: refetchPrime } = usePrimeOriginals();
  const { data: disney, isLoading: disneyLoading, isError: disneyError, isFetching: disneyFetching, error: disneyErr, refetch: refetchDisney } = useDisneyOriginals();
  const { data: hbo, isLoading: hboLoading, isError: hboError, isFetching: hboFetching, error: hboErr, refetch: refetchHbo } = useHBOMaxOriginals();
  const { data: hulu, isLoading: huluLoading, isError: huluError, isFetching: huluFetching, error: huluErr, refetch: refetchHulu } = useHuluOriginals();
  const { data: apple, isLoading: appleLoading, isError: appleError, isFetching: appleFetching, error: appleErr, refetch: refetchApple } = useAppleTVOriginals();
  const { data: anime, isLoading: animeLoading, isError: animeError, isFetching: animeFetching, error: animeErr, refetch: refetchAnime } = useAnime();

  // Filter items with backdrops for the cinematic hero
  const heroItems = trending?.results.filter((item) => item.backdrop_path) || [];

  return (
    <div className="relative overflow-hidden">
      <SEO
        title="CineBai — Calm, cinema-first home for finding what to watch next"
        description="A calm, cinema-first home for finding what to watch next. Discover trending movies, television series, anime, ratings, cast details, and curated watchlists on CineBai."
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
              </div>
            </div>
            <button
              type="button"
              onClick={() => refetchTrending()}
              disabled={trendingFetching}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-accent text-on-accent text-xs font-semibold hover:bg-accent-light transition-colors min-h-[44px] cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw size={15} className={trendingFetching ? 'animate-spin' : ''} aria-hidden="true" />
              <span>Retry</span>
            </button>
          </div>
        </section>
      ) : (
        <CinematicHero items={heroItems} />
      )}

      {/* Curated Streaming Studios */}
      <section aria-labelledby="studios-heading" className="mx-auto max-w-7xl px-4 pt-4 pb-6 lg:px-8">
        <h2 id="studios-heading" className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Premier Studios & Networks
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          <Link
            to="/network/netflix"
            className="group flex h-14 sm:h-16 items-center justify-center rounded-xl bg-bg-surface/80 border border-border-default hover:border-border-strong hover:bg-bg-elevated transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Netflix network titles"
          >
            <span className="text-base sm:text-lg font-black tracking-widest text-text-primary group-hover:text-accent transition-colors">
              NETFLIX
            </span>
          </Link>
          <Link
            to="/network/hbo"
            className="group flex h-14 sm:h-16 items-center justify-center rounded-xl bg-bg-surface/80 border border-border-default hover:border-border-strong hover:bg-bg-elevated transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="HBO Max network titles"
          >
            <span className="text-base sm:text-lg font-black tracking-wider text-text-primary group-hover:text-accent transition-colors">
              HBO <span className="text-xs font-bold text-accent">MAX</span>
            </span>
          </Link>
          <Link
            to="/network/prime"
            className="group flex h-14 sm:h-16 items-center justify-center rounded-xl bg-bg-surface/80 border border-border-default hover:border-border-strong hover:bg-bg-elevated transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Amazon Prime Video network titles"
          >
            <span className="text-sm sm:text-base font-bold text-text-primary group-hover:text-accent transition-colors">
              prime video
            </span>
          </Link>
          <Link
            to="/network/disney"
            className="group flex h-14 sm:h-16 items-center justify-center rounded-xl bg-bg-surface/80 border border-border-default hover:border-border-strong hover:bg-bg-elevated transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Disney+ network titles"
          >
            <span className="text-base sm:text-lg font-bold text-text-primary group-hover:text-accent transition-colors">
              Disney<span className="text-accent">+</span>
            </span>
          </Link>
          <Link
            to="/network/hulu"
            className="group flex h-14 sm:h-16 items-center justify-center rounded-xl bg-bg-surface/80 border border-border-default hover:border-border-strong hover:bg-bg-elevated transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Hulu network titles"
          >
            <span className="text-lg sm:text-xl font-black tracking-tighter text-text-primary group-hover:text-accent transition-colors">
              hulu
            </span>
          </Link>
          <Link
            to="/network/apple"
            className="group flex h-14 sm:h-16 items-center justify-center rounded-xl bg-bg-surface/80 border border-border-default hover:border-border-strong hover:bg-bg-elevated transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Apple TV+ network titles"
          >
            <span className="text-sm sm:text-base font-semibold text-text-primary group-hover:text-accent transition-colors">
               tv+
            </span>
          </Link>
        </div>
      </section>

      {/* Curated Media Rails */}
      <div className="mx-auto max-w-7xl space-y-8 px-4 pt-8 lg:px-8">
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

        <HomeRail
          title="Streaming on Apple TV+"
          items={apple?.results}
          isLoading={appleLoading}
          isError={appleError}
          isFetching={appleFetching}
          error={appleErr}
          refetch={refetchApple}
          seeMoreLink="/network/apple"
        />

        <HomeRail
          title="Streaming on Netflix"
          items={netflix?.results}
          isLoading={netflixLoading}
          isError={netflixError}
          isFetching={netflixFetching}
          error={netflixErr}
          refetch={refetchNetflix}
          seeMoreLink="/network/netflix"
        />

        <HomeRail
          title="Streaming on HBO Max"
          items={hbo?.results}
          isLoading={hboLoading}
          isError={hboError}
          isFetching={hboFetching}
          error={hboErr}
          refetch={refetchHbo}
          seeMoreLink="/network/hbo"
        />

        <HomeRail
          title="Streaming on Prime Video"
          items={prime?.results}
          isLoading={primeLoading}
          isError={primeError}
          isFetching={primeFetching}
          error={primeErr}
          refetch={refetchPrime}
          seeMoreLink="/network/prime"
        />

        <HomeRail
          title="Streaming on Disney+"
          items={disney?.results}
          isLoading={disneyLoading}
          isError={disneyError}
          isFetching={disneyFetching}
          error={disneyErr}
          refetch={refetchDisney}
          seeMoreLink="/network/disney"
        />

        <HomeRail
          title="Anime Showcase"
          items={anime?.results}
          isLoading={animeLoading}
          isError={animeError}
          isFetching={animeFetching}
          error={animeErr}
          refetch={refetchAnime}
          seeMoreLink="/anime"
        />

        <HomeRail
          title="Streaming on Hulu"
          items={hulu?.results}
          isLoading={huluLoading}
          isError={huluError}
          isFetching={huluFetching}
          error={huluErr}
          refetch={refetchHulu}
          seeMoreLink="/network/hulu"
        />

        <HomeRail
          title="Popular Movies"
          items={popularMovies?.results}
          isLoading={popularMoviesLoading}
          isError={popularMoviesError}
          isFetching={popularMoviesFetching}
          error={popularMoviesErr}
          refetch={refetchPopularMovies}
          seeMoreLink="/movies"
        />

        <HomeRail
          title="In Theaters"
          items={nowPlaying?.results}
          isLoading={nowPlayingLoading}
          isError={nowPlayingError}
          isFetching={nowPlayingFetching}
          error={nowPlayingErr}
          refetch={refetchNowPlaying}
          seeMoreLink="/movies"
        />
      </div>
    </div>
  );
}
