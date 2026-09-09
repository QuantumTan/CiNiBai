import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Check, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBackdropUrl } from '../../api/tmdb';
import { getMediaTitle, getMediaDate, getYear, truncate, getMediaType } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Rating } from '../ui/Rating';
import { useWatchlistStore } from '../../store/watchlistStore';
import type { TMDBMovie, TMDBTVShow } from '../../api/tmdb.types';

export interface HeroBannerProps {
  items: (TMDBMovie | TMDBTVShow)[];
}

export function HeroBanner({ items }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(items.length, 5));
    }, 8000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (!items.length) return null;

  const item = items[currentIndex];
  const type = getMediaType(item);
  const title = getMediaTitle(item);
  const year = getYear(getMediaDate(item));
  const overview = item.overview ? truncate(item.overview, 200) : '';
  const inWatchlist = isInWatchlist(item.id, type);

  const toggleWatchlist = () => {
    if (inWatchlist) {
      removeItem(item.id, type);
    } else {
      addItem({
        id: item.id,
        type,
        title,
        posterPath: item.poster_path,
        voteAverage: item.vote_average,
        releaseDate: getMediaDate(item),
      });
    }
  };

  return (
    <div className="relative h-[80vh] min-h-[500px] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Backdrop image */}
          <img
            src={getBackdropUrl(item.backdrop_path, 'original')}
            alt={title}
            className="h-full w-full object-cover"
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Title */}
            <h1
              className="mb-3 text-4xl font-black uppercase tracking-wide text-white md:text-6xl lg:text-7xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {title}
            </h1>

            {/* Meta info */}
            <div className="mb-4 flex items-center gap-4 text-sm text-text-secondary">
              <Rating value={item.vote_average} size="md" />
              {year && <span>{year}</span>}
              <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-medium uppercase">
                {type === 'tv' ? 'TV Series' : 'Movie'}
              </span>
            </div>

            {/* Overview */}
            <p className="mb-6 max-w-xl text-base leading-relaxed text-text-secondary">
              {overview}
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link to={`/watch/${type}/${item.id}`}>
                <Button variant="gold" size="lg">
                  <Play size={20} className="fill-current" /> Watch Now
                </Button>
              </Link>
              <Link to={`/${type}/${item.id}`}>
                <Button variant="outline" size="lg">
                  <Info size={20} /> More Info
                </Button>
              </Link>
              <button
                onClick={toggleWatchlist}
                className={`rounded-full p-3 transition-all duration-200 ${
                  inWatchlist
                    ? 'bg-gold text-black'
                    : 'border border-white/20 text-white hover:bg-white/10'
                }`}
                aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                {inWatchlist ? <Check size={20} /> : <Plus size={20} />}
              </button>
            </div>
          </motion.div>

          {/* Dots indicator */}
          {items.length > 1 && (
            <div className="mt-8 flex gap-2">
              {items.slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? 'w-8 bg-gold'
                      : 'w-4 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
