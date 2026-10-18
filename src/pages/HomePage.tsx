import { Link } from 'react-router-dom';
import { CinematicHero } from '../components/home/CinematicHero';
import { ContentRow } from '../components/home/ContentRow';
import { Top10Row } from '../components/home/Top10Row';
import { SEO } from '../components/common/SEO';
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

export function HomePage() {
  const { data: trending, isLoading: trendingLoading } = useTrending('all', 'week');
  const { data: trendingToday, isLoading: trendingTodayLoading } = useTrendingToday();
  const { data: popularMovies, isLoading: popularMoviesLoading } = usePopularMovies();
  const { data: nowPlaying, isLoading: nowPlayingLoading } = useNowPlayingMovies();
  const { data: netflix, isLoading: netflixLoading } = useNetflixOriginals();
  const { data: prime, isLoading: primeLoading } = usePrimeOriginals();
  const { data: disney, isLoading: disneyLoading } = useDisneyOriginals();
  const { data: hbo, isLoading: hboLoading } = useHBOMaxOriginals();
  const { data: hulu, isLoading: huluLoading } = useHuluOriginals();
  const { data: apple, isLoading: appleLoading } = useAppleTVOriginals();
  const { data: anime, isLoading: animeLoading } = useAnime();

  // Filter items with backdrops for the cinematic hero
  const heroItems = trending?.results.filter((item) => item.backdrop_path) || [];

  return (
    <div className="relative overflow-hidden">
      <SEO
        title="CineBai - Cinematic Streaming Experience"
        description="Stream full movies, trending TV series, and anime in HD with dynamic ambient lighting on CineBai."
      />

      {/* Semantic H1 for the page */}
      <h1 className="sr-only">CineBai — Stream Movies, TV Series & Anime</h1>

      {/* Cinematic Hero Showcase */}
      <CinematicHero items={heroItems} />

      {/* Curated Streaming Studios */}
      <section aria-labelledby="studios-heading" className="mx-auto max-w-7xl px-4 pt-10 lg:px-8">
        <h2 id="studios-heading" className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Premier Studios & Networks
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          <Link
            to="/network/netflix"
            className="flex h-16 items-center justify-center rounded-xl bg-bg-surface/80 border border-border-default hover:border-[#E50914]/50 transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Netflix network titles"
          >
            <span className="text-lg font-black tracking-wider text-[#E50914]">
              NETFLIX
            </span>
          </Link>
          <Link
            to="/network/hbo"
            className="flex h-16 items-center justify-center rounded-xl bg-bg-surface/80 border border-border-default hover:border-[#9900FF]/50 transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="HBO Max network titles"
          >
            <span className="text-lg font-black tracking-wider text-text-primary">
              HBO <span className="text-xs font-bold text-accent">MAX</span>
            </span>
          </Link>
          <Link
            to="/network/prime"
            className="flex h-16 items-center justify-center rounded-xl bg-bg-surface/80 border border-border-default hover:border-[#00A8E1]/50 transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Amazon Prime Video network titles"
          >
            <span className="text-base font-bold text-[#00A8E1]">
              prime video
            </span>
          </Link>
          <Link
            to="/network/disney"
            className="flex h-16 items-center justify-center rounded-xl bg-bg-surface/80 border border-border-default hover:border-[#3070F7]/50 transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Disney+ network titles"
          >
            <span className="text-lg font-bold text-text-primary">
              Disney<span className="text-[#38bdf8]">+</span>
            </span>
          </Link>
          <Link
            to="/network/hulu"
            className="flex h-16 items-center justify-center rounded-xl bg-bg-surface/80 border border-border-default hover:border-[#1CE783]/50 transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Hulu network titles"
          >
            <span className="text-xl font-black tracking-tighter text-[#1CE783]">
              hulu
            </span>
          </Link>
          <Link
            to="/network/apple"
            className="flex h-16 items-center justify-center rounded-xl bg-bg-surface/80 border border-border-default hover:border-border-strong transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Apple TV+ network titles"
          >
            <span className="text-base font-semibold text-text-primary">
               tv+
            </span>
          </Link>
        </div>
      </section>

      {/* Curated Media Rails */}
      <div className="mx-auto max-w-7xl space-y-8 px-4 pt-8 lg:px-8">
        <Top10Row
          title="Top 10 Trending Today"
          items={trendingToday?.results}
          isLoading={trendingTodayLoading}
        />

        <ContentRow
          title="Trending This Week"
          items={trending?.results}
          isLoading={trendingLoading}
          seeMoreLink="/movies"
        />

        <ContentRow
          title="Streaming on Apple TV+"
          items={apple?.results}
          isLoading={appleLoading}
          seeMoreLink="/network/apple"
        />

        <ContentRow
          title="Streaming on Netflix"
          items={netflix?.results}
          isLoading={netflixLoading}
          seeMoreLink="/network/netflix"
        />

        <ContentRow
          title="Streaming on HBO Max"
          items={hbo?.results}
          isLoading={hboLoading}
          seeMoreLink="/network/hbo"
        />

        <ContentRow
          title="Streaming on Prime Video"
          items={prime?.results}
          isLoading={primeLoading}
          seeMoreLink="/network/prime"
        />

        <ContentRow
          title="Streaming on Disney+"
          items={disney?.results}
          isLoading={disneyLoading}
          seeMoreLink="/network/disney"
        />

        <ContentRow
          title="Anime Showcase"
          items={anime?.results}
          isLoading={animeLoading}
          seeMoreLink="/anime"
        />

        <ContentRow
          title="Streaming on Hulu"
          items={hulu?.results}
          isLoading={huluLoading}
          seeMoreLink="/network/hulu"
        />

        <ContentRow
          title="Popular Movies"
          items={popularMovies?.results}
          isLoading={popularMoviesLoading}
          seeMoreLink="/movies"
        />

        <ContentRow
          title="In Theaters"
          items={nowPlaying?.results}
          isLoading={nowPlayingLoading}
          seeMoreLink="/movies"
        />
      </div>
    </div>
  );
}
