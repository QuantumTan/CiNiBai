import { Link } from 'react-router-dom';
import { Bookmark, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPosterUrl } from '../api/tmdb';
import { getYear } from '../lib/utils';
import { Rating } from '../components/ui/Rating';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/common/SEO';
import { useWatchlistStore } from '../store/watchlistStore';

export function WatchlistPage() {
  const { items, removeItem, clearWatchlist } = useWatchlistStore();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-10 lg:px-8">
      <SEO
        title="My Watchlist - CineBai"
        description="View and manage your saved movies and TV shows to watch later on CineBai."
      />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">My Watchlist</h1>
          <p className="mt-1 text-sm text-text-muted">{items.length} items saved</p>
        </div>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearWatchlist}>
            Clear All
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Bookmark size={64} className="text-text-muted mb-4" />
          <p className="text-lg text-text-muted">Your watchlist is empty</p>
          <p className="mt-2 text-sm text-text-muted">Browse movies and TV shows to add them here</p>
          <Link to="/" className="mt-6">
            <Button variant="gold">Browse Content</Button>
          </Link>
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item) => (
              <motion.div
                key={`${item.type}-${item.id}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Link to={`/${item.type}/${item.id}`} className="group block">
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={getPosterUrl(item.posterPath, 'w342')}
                      alt={item.title}
                      className="aspect-[2/3] w-full object-cover transition-all group-hover:brightness-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeItem(item.id, item.type);
                      }}
                      className="absolute top-2 right-2 rounded-full bg-red-500/80 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
                      aria-label="Remove from watchlist"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="absolute bottom-2 left-2">
                      <Rating value={item.voteAverage} size="sm" showLabel={false} />
                    </div>
                  </div>
                  <h3 className="mt-2 truncate text-sm font-medium text-text-primary">{item.title}</h3>
                  <p className="text-xs text-text-muted">
                    {getYear(item.releaseDate)} -- {item.type === 'tv' ? 'TV' : 'Movie'}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
