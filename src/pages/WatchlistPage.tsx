import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/common/SEO';
import { MovieCard } from '../components/cards/MovieCard';
import { useWatchlistStore } from '../store/watchlistStore';
import { useAmbientCanvas } from '../context/AmbientCanvasContext';
import { getPosterUrl } from '../api/tmdb';

export function WatchlistPage() {
  const { items, clearWatchlist } = useWatchlistStore();
  const { extractAndSetAmbientColor } = useAmbientCanvas();

  // Sample ambient color from first watchlist item
  useEffect(() => {
    if (items.length > 0 && items[0]?.posterPath) {
      extractAndSetAmbientColor(getPosterUrl(items[0].posterPath, 'w500'));
    }
  }, [items, extractAndSetAmbientColor]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-16 md:pt-20 pb-36 lg:px-8">
      <SEO
        title="My Watchlist - CineBai"
        description="View and manage your saved movies and TV shows to watch later on CineBai."
      />
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="apple-glass-thin inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold text-amber-300 mb-3 shadow-md">
            <Bookmark size={13} className="text-amber-400" />
            <span>Personal Collection</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">My Watchlist</h1>
          <p className="mt-1 text-sm text-slate-400">{items.length} titles saved</p>
        </div>
        {items.length > 0 && (
          <button 
            onClick={clearWatchlist}
            className="apple-glass-thin rounded-full px-4 py-2 text-xs font-semibold text-slate-300 hover:text-red-400 hover:border-red-400/40 transition-colors shadow-sm"
          >
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="apple-glass-regular flex flex-col items-center justify-center py-20 rounded-3xl text-center px-4 max-w-md mx-auto my-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/10 mb-4">
            <Bookmark size={32} className="text-slate-400" />
          </div>
          <p className="text-xl font-bold text-white">Your watchlist is empty</p>
          <p className="mt-2 text-sm text-slate-400 max-w-xs">
            Save movies and TV series to keep track of what you want to watch next.
          </p>
          <Link to="/" className="mt-6">
            <Button variant="gold" className="rounded-full px-6 py-2.5 font-bold shadow-lg">
              Explore Catalog
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item) => (
            <MovieCard
              key={`${item.type}-${item.id}`}
              item={{
                id: item.id,
                title: item.title,
                poster_path: item.posterPath,
                vote_average: item.voteAverage,
                release_date: item.releaseDate,
                media_type: item.type,
              } as any}
              size="auto"
            />
          ))}
        </div>
      )}
    </div>
  );
}
