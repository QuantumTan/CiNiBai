import { useState, useEffect } from 'react';
import { Film, Tv } from 'lucide-react';
import { MovieCard } from '../components/cards/MovieCard';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/common/SEO';
import { useDiscoverMovies, useDiscoverTVShows, useMovieGenres, useTVGenres } from '../hooks/useTMDB';
import type { DiscoverParams } from '../api/tmdb';
import { useAmbientCanvas } from '../context/AmbientCanvasContext';
import { getPosterUrl } from '../api/tmdb';

interface BrowsePageProps {
  mediaType: 'movie' | 'tv';
}

export function BrowsePage({ mediaType }: BrowsePageProps) {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const { extractAndSetAmbientColor } = useAmbientCanvas();

  const { data: movieGenres } = useMovieGenres();
  const { data: tvGenres } = useTVGenres();
  const genres = mediaType === 'movie' ? movieGenres?.genres : tvGenres?.genres;

  const params: DiscoverParams = {
    sort_by: sortBy,
    ...(selectedGenre ? { with_genres: String(selectedGenre) } : {}),
  };

  const movieQuery = useDiscoverMovies(mediaType === 'movie' ? params : {});
  const tvQuery = useDiscoverTVShows(mediaType === 'tv' ? params : {});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query = mediaType === 'movie' ? movieQuery : tvQuery as any;
  const allItems = (query.data?.pages?.flatMap((page: any) => page.results) || []) as Array<{ 
    id: number; 
    title?: string; 
    name?: string; 
    poster_path: string | null; 
    vote_average: number; 
    release_date?: string; 
    first_air_date?: string; 
    media_type?: string 
  }>;
  const isLoading = query.isLoading;

  const leadPoster = allItems[0]?.poster_path;

  // Sample ambient color from the lead item
  useEffect(() => {
    if (leadPoster) {
      extractAndSetAmbientColor(getPosterUrl(leadPoster, 'w500'));
    }
  }, [leadPoster, extractAndSetAmbientColor]);

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'primary_release_date.desc', label: 'Newest' },
    { value: 'primary_release_date.asc', label: 'Oldest' },
  ];

  const pageTitle = mediaType === 'movie' ? 'Movies - Watch HD Movies Online' : 'TV Shows - Watch Full Series Online';
  const pageDesc = mediaType === 'movie'
    ? 'Browse and watch trending, top-rated, and newly released movies in HD for free on CineBai.'
    : 'Discover and stream popular TV series, top-rated shows, and new episodes for free on CineBai.';

  return (
    <div className="mx-auto max-w-7xl px-4 pt-16 md:pt-20 pb-36 lg:px-8">
      <SEO title={pageTitle} description={pageDesc} />

      {/* Editorial Header */}
      <div className="mb-8">
        <div className="apple-glass-thin inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold text-amber-300 mb-3 shadow-md">
          {mediaType === 'movie' ? <Film size={13} className="text-amber-400" /> : <Tv size={13} className="text-amber-400" />}
          <span>{mediaType === 'movie' ? 'Premier Feature Films' : 'Curated Television Series'}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
          {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-300 max-w-xl">
          Browse and discover {mediaType === 'movie' ? 'the world’s greatest cinema' : 'critically acclaimed series'} in pristine 4K HDR.
        </p>

        {/* Apple Liquid Glass Genre Chips */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              selectedGenre === null
                ? 'ios-active-lens text-white shadow-md'
                : 'apple-glass-thin text-slate-300 hover:text-white'
            }`}
          >
            All Genres
          </button>
          {genres?.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id === selectedGenre ? null : genre.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                genre.id === selectedGenre
                  ? 'ios-active-lens text-white shadow-md'
                  : 'apple-glass-thin text-slate-300 hover:text-white'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>

        {/* Apple Liquid Glass Sort Controls */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mr-1">Sort:</span>
          {sortOptions.map((opt) => {
            const isActive = sortBy === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                  isActive
                    ? 'ios-active-lens text-white shadow-md'
                    : 'apple-glass-thin text-slate-300 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
              <Skeleton className="mt-2 h-4 w-3/4 rounded-md" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {allItems.map((item) => (
              <MovieCard
                key={item.id}
                item={{ ...item, media_type: mediaType } as any}
                size="auto"
              />
            ))}
          </div>

          {/* Load More */}
          {query.hasNextPage && (
            <div className="mt-12 flex justify-center">
              <Button
                variant="outline"
                onClick={() => query.fetchNextPage()}
                disabled={query.isFetchingNextPage}
                className="apple-glass-regular px-8 py-3 rounded-full text-sm font-semibold text-white hover:border-amber-400/50 transition-all"
              >
                {query.isFetchingNextPage ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
