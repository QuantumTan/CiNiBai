import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useSearchMulti } from '../hooks/useTMDB';
import { useDebounce } from '../hooks/useDebounce';
import { MovieCard } from '../components/cards/MovieCard';
import { Skeleton } from '../components/ui/Skeleton';
import { useAmbientCanvas } from '../context/AmbientCanvasContext';
import { getPosterUrl } from '../api/tmdb';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { data, isLoading } = useSearchMulti(debouncedQuery);
  const { extractAndSetAmbientColor } = useAmbientCanvas();

  // Filter out people from results
  const results = data?.results.filter((item) => item.media_type !== 'person') || [];

  const leadPoster = results[0]?.poster_path;

  // Sample ambient color from first search hit
  useEffect(() => {
    if (leadPoster) {
      extractAndSetAmbientColor(getPosterUrl(leadPoster, 'w500'));
    }
  }, [leadPoster, extractAndSetAmbientColor]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-16 md:pt-20 pb-36 lg:px-8">
      <SEO
        title={debouncedQuery ? `Search: "${debouncedQuery}" - CineBai` : 'Search Movies & TV Series - CineBai'}
        description="Search for movies, TV series, actors, and anime to watch online for free in HD on CineBai."
      />
      {/* Liquid Glass Search Input */}
      <div className="relative mx-auto max-w-2xl">
        <div className="apple-glass-heavy relative flex items-center rounded-2xl shadow-2xl transition-all focus-within:ring-2 focus-within:ring-amber-400/80">
          <Search className="absolute left-4 text-slate-400" size={22} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, TV series, anime..."
            className="w-full bg-transparent px-12 py-4 text-base md:text-lg text-white placeholder:text-slate-500 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Clear Search"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="mt-10">
        {!debouncedQuery && (
          <div className="text-center py-16">
            <p className="text-base text-slate-400">Start typing to search across movies, TV series, and anime</p>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
                <Skeleton className="mt-2 h-4 w-3/4 rounded-md" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && debouncedQuery && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg text-slate-300 font-semibold">No results found for "{debouncedQuery}"</p>
            <p className="mt-2 text-sm text-slate-500">Check spelling or try searching for another title</p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <>
            <p className="mb-6 text-xs uppercase tracking-wider font-semibold text-slate-400">
              {data?.total_results} matching titles
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {results.map((item) => (
                <MovieCard key={`${item.media_type}-${item.id}`} item={item as any} size="auto" />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
