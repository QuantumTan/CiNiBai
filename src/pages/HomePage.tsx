import { HeroBanner } from '../components/home/HeroBanner';
import { ContentRow } from '../components/home/ContentRow';
import { Top10Row } from '../components/home/Top10Row';
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

  // Use trending items with backdrops for the hero
  const heroItems = trending?.results.filter((item) => item.backdrop_path) || [];

  return (
    <div>
      {/* Hero Banner */}
      <HeroBanner items={heroItems} />

      {/* Network Links */}
      <div className="mx-auto max-w-7xl px-4 pt-10 lg:px-8">
        <h2 className="mb-4 text-xl font-bold text-text-primary md:text-2xl">
          <span className="text-gold-gradient">Streaming Platforms</span>
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          <a href="/network/netflix" className="flex h-16 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-[#E50914]/20 hover:ring-[#E50914] transition-all">
            <span className="text-xl font-black text-[#E50914] tracking-wider">NETFLIX</span>
          </a>
          <a href="/network/hbo" className="flex h-16 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-[#9900FF]/20 hover:ring-[#9900FF] transition-all">
            <span className="text-xl font-black text-[#9900FF] tracking-wider">HBO <span className="text-sm font-bold text-white">MAX</span></span>
          </a>
          <a href="/network/prime" className="flex h-16 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-[#00A8E1]/20 hover:ring-[#00A8E1] transition-all">
            <span className="text-lg font-bold text-[#00A8E1]">prime video</span>
          </a>
          <a href="/network/disney" className="flex h-16 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-[#113CCF]/20 hover:ring-[#113CCF] transition-all">
            <span className="text-xl font-bold text-white">Disney<span className="text-[#113CCF]">+</span></span>
          </a>
          <a href="/network/hulu" className="flex h-16 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-[#1CE783]/20 hover:ring-[#1CE783] transition-all">
            <span className="text-2xl font-black text-[#1CE783] tracking-tighter">hulu</span>
          </a>
          <a href="/network/apple" className="flex h-16 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/20 hover:ring-white transition-all">
            <span className="text-lg font-semibold text-[#A2AAAD]"> tv+</span>
          </a>
        </div>
      </div>

      {/* Content Rows */}
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 lg:px-8 overflow-hidden">
        
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
          title="Anime"
          items={anime?.results}
          isLoading={animeLoading}
          seeMoreLink="/anime"
        />
        <ContentRow
          title="Streaming on Apple TV+"
          items={apple?.results}
          isLoading={appleLoading}
          seeMoreLink="/network/apple"
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
