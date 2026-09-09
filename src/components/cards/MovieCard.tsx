import type React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPosterUrl } from '../../api/tmdb';
import { getMediaTitle, getMediaDate, getYear, getMediaType } from '../../lib/utils';
import { Rating } from '../ui/Rating';
import { useWatchlistStore } from '../../store/watchlistStore';

export interface MovieCardProps {
  item: {
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
    media_type?: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-[140px]',
  md: 'w-[180px]',
  lg: 'w-[220px]',
};

export function MovieCard({ item, size = 'md' }: MovieCardProps) {
  const type = getMediaType(item);
  const title = getMediaTitle(item);
  const year = getYear(getMediaDate(item));
  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();
  const inWatchlist = isInWatchlist(item.id, type);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    <motion.div
      className={`flex-shrink-0 ${sizeClasses[size]}`}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/${type}/${item.id}`} className="group block">
        <div className="relative overflow-hidden rounded-xl">
          {/* Poster Image */}
          <img
            src={getPosterUrl(item.poster_path, 'w342')}
            alt={title}
            className="aspect-[2/3] w-full object-cover transition-all duration-300 group-hover:brightness-110"
            loading="lazy"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Rating badge */}
          <div className="absolute top-2 left-2 glass rounded-full px-2 py-1">
            <Rating value={item.vote_average} size="sm" showLabel={false} />
          </div>

          {/* Watchlist button */}
          <button
            onClick={toggleWatchlist}
            className={`absolute top-2 right-2 rounded-full p-1.5 transition-all duration-200 ${
              inWatchlist
                ? 'bg-gold text-black'
                : 'glass text-white opacity-0 group-hover:opacity-100'
            }`}
            aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {inWatchlist ? <Check size={14} /> : <Plus size={14} />}
          </button>

          {/* Media type badge */}
          {item.media_type && (
            <div className="absolute bottom-2 right-2 glass rounded px-1.5 py-0.5 text-xs font-medium uppercase text-text-secondary opacity-0 transition-opacity group-hover:opacity-100">
              {type === 'tv' ? 'TV' : 'Movie'}
            </div>
          )}
        </div>

        {/* Title and year */}
        <h3 className="mt-2 truncate text-sm font-medium text-text-primary group-hover:text-gold transition-colors">
          {title}
        </h3>
        {year && (
          <p className="text-xs text-text-muted">{year}</p>
        )}
      </Link>
    </motion.div>
  );
}
