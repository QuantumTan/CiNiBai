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

  // Use trending items with backdrops for the cinematic hero
  const heroItems = trending?.results.filter((item) => item.backdrop_path) || [];

  return (
    <div className="relative overflow-hidden">
      <SEO
        title="CineBai - Cinematic Streaming Experience"
        description="Stream full movies, trending TV series, and anime in 4K HDR with dynamic ambient lighting on CineBai."
      />

      {/* Cinematic Hero Showcase */}
      <CinematicHero items={heroItems} />

      {/* Curated Streaming Studios */}
      <div className="mx-auto max-w-7xl px-4 pt-10 lg:px-8">
        <h2 className="tracking-tight-title mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Premier Studios & Networks
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          <a
            href="/network/netflix"
            className="liquid-glass-control group flex h-16 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-[1.03]"
          >
            <span className="text-lg font-black tracking-wider text-[#E50914] group-hover:brightness-125 transition-all">
              NETFLIX
            </span>
          </a>
          <a
            href="/network/hbo"
            className="liquid-glass-control group flex h-16 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-[1.03]"
          >
            <span className="text-lg font-black tracking-wider text-white group-hover:text-purple-300 transition-colors">
              HBO <span className="text-xs font-bold text-amber-300">MAX</span>
            </span>
          </a>
          <a
            href="/network/prime"
            className="liquid-glass-control group flex h-16 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-[1.03]"
          >
            <span className="text-base font-bold text-[#00A8E1] group-hover:brightness-125 transition-all">
              prime video
            </span>
          </a>
          <a
            href="/network/disney"
            className="liquid-glass-control group flex h-16 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-[1.03]"
          >
            <span className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
              Disney<span className="text-[#38bdf8]">+</span>
            </span>
          </a>
          <a
            href="/network/hulu"
            className="liquid-glass-control group flex h-16 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-[1.03]"
          >
            <span className="text-xl font-black tracking-tighter text-[#1CE783] group-hover:brightness-125 transition-all">
              hulu
            </span>
          </a>
          <a
            href="/network/apple"
            className="liquid-glass-control group flex h-16 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-[1.03]"
          >
            <span className="text-base font-semibold text-slate-200 group-hover:text-white transition-colors">
               tv+
            </span>
          </a>
        </div>
      </div>

      {/* Curated Rails with Quick-Peek Interactions */}
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:px-8">
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
