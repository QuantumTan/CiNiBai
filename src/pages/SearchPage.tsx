import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useSearchMulti } from '../hooks/useTMDB';
import { useDebounce } from '../hooks/useDebounce';
import { MovieCard } from '../components/cards/MovieCard';
import { Skeleton } from '../components/ui/Skeleton';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { data, isLoading } = useSearchMulti(debouncedQuery);

  // Filter out people from results
  const results = data?.results.filter((item) => item.media_type !== 'person') || [];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-10 lg:px-8">
      <SEO
        title={debouncedQuery ? `Search: "${debouncedQuery}" - CineBai` : 'Search Movies & TV Series - CineBai'}
        description="Search for movies, TV series, actors, and anime to watch online for free in HD on CineBai."
      />
      {/* Search Input */}
      <div className="relative mx-auto max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={22} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, TV shows..."
          className="w-full rounded-2xl border border-white/10 bg-bg-secondary px-12 py-4 text-lg text-text-primary placeholder:text-text-muted focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Results */}
      <div className="mt-10">
        {!debouncedQuery && (
          <div className="text-center">
            <p className="text-lg text-text-muted">Start typing to search for movies and TV shows</p>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                <Skeleton className="mt-2 h-4 w-3/4" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && debouncedQuery && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg text-text-muted">No results found for "{debouncedQuery}"</p>
            <p className="mt-2 text-sm text-text-muted">Try a different search term</p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <>
            <p className="mb-6 text-sm text-text-muted">
              {data?.total_results} results for "{debouncedQuery}"
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
