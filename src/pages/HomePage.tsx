import { Link } from 'react-router-dom';
import { Flame, ChevronRight } from 'lucide-react';
import { CinematicHero } from '../components/home/CinematicHero';
import { ContentRow } from '../components/home/ContentRow';
import { Top10Row } from '../components/home/Top10Row';
import { SEO } from '../components/common/SEO';
import { CURATED_REELS } from '../api/reels';
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
          <Link
            to="/network/netflix"
            className="apple-glass-regular group flex h-16 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-[1.04] shadow-md hover:border-red-500/40"
          >
            <span className="text-lg font-black tracking-wider text-[#E50914] group-hover:brightness-125 transition-all">
              NETFLIX
            </span>
          </Link>
          <Link
            to="/network/hbo"
            className="apple-glass-regular group flex h-16 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-[1.04] shadow-md hover:border-purple-500/40"
          >
            <span className="text-lg font-black tracking-wider text-white group-hover:text-purple-300 transition-colors">
              HBO <span className="text-xs font-bold text-amber-300">MAX</span>
            </span>
          </Link>
          <Link
            to="/network/prime"
            className="apple-glass-regular group flex h-16 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-[1.04] shadow-md hover:border-blue-400/40"
          >
            <span className="text-base font-bold text-[#00A8E1] group-hover:brightness-125 transition-all">
              prime video
            </span>
          </Link>
          <Link
            to="/network/disney"
            className="apple-glass-regular group flex h-16 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-[1.04] shadow-md hover:border-blue-500/40"
          >
            <span className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
              Disney<span className="text-[#38bdf8]">+</span>
            </span>
          </Link>
          <Link
            to="/network/hulu"
            className="apple-glass-regular group flex h-16 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-[1.04] shadow-md hover:border-emerald-500/40"
          >
            <span className="text-xl font-black tracking-tighter text-[#1CE783] group-hover:brightness-125 transition-all">
              hulu
            </span>
          </Link>
          <Link
            to="/network/apple"
            className="apple-glass-regular group flex h-16 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-[1.04] shadow-md hover:border-white/50"
          >
            <span className="text-base font-semibold text-slate-200 group-hover:text-white transition-colors">
               tv+
            </span>
          </Link>
        </div>
      </div>

      {/* Curated Rails with Quick-Peek Interactions */}
      <div className="mx-auto max-w-7xl space-y-8 px-4 pt-8 pb-36 lg:px-8">
        <Top10Row
          title="Top 10 Trending Today"
          items={trendingToday?.results}
          isLoading={trendingTodayLoading}
        />

        {/* ReelShort & Micro-Dramas Showcase Rail */}
        <section className="relative space-y-3.5 my-8">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="apple-glass-thin flex h-7 w-7 items-center justify-center rounded-full text-amber-300 shadow-sm">
                <Flame size={14} className="text-amber-400" />
              </div>
              <h2 className="tracking-tight-title text-xl font-bold text-white md:text-2xl">
                ReelShort & Micro-Dramas
              </h2>
            </div>
            <Link
              to="/reels"
              className="group flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-amber-300 hover:text-amber-200 transition-colors"
            >
              <span>Watch Reels</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="rail-fade-mask hide-scrollbar flex items-start gap-4 overflow-x-auto py-2">
            {CURATED_REELS.map((drama) => (
              <Link
                key={drama.id}
                to="/reels"
                className="group relative flex-shrink-0 w-36 sm:w-44 outline-none select-none transition-transform duration-300 hover:-translate-y-2 hover:scale-[1.03]"
              >
                <div className="ios-card-glass relative aspect-[9/16] w-full overflow-hidden rounded-2xl shadow-xl">
                  <img
                    src={drama.verticalPoster}
                    alt={drama.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* Platform Badge */}
                  <span className="apple-glass-thin absolute top-2.5 left-2.5 rounded-full px-2 py-0.5 text-[9px] font-bold text-amber-300">
                    {drama.platform}
                  </span>

                  {/* Views & Episodes */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                    <p className="text-xs font-bold line-clamp-2 drop-shadow-md group-hover:text-amber-300 transition-colors">
                      {drama.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-300 mt-1">
                      <span>{drama.totalEpisodes} Eps</span>
                      <span className="text-amber-300 font-semibold">{drama.views}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

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
