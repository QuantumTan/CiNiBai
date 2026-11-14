import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Check, Film } from 'lucide-react';
import { getPosterUrl, getPosterSrcSet } from '../../api/tmdb';
import { getMediaTitle, getMediaDate, getYear, getMediaType, formatRating } from '../../lib/utils';
import { useWatchlistStore } from '../../stores/watchlistStore';

export interface MovieCardProps {
  item: {
    id: number;
    title?: string;
    name?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    vote_average?: number;
    release_date?: string;
    first_air_date?: string;
    media_type?: string;
    overview?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'auto';
  className?: string;
}

export function MovieCard({ item, size = 'auto', className = '' }: MovieCardProps) {
  const [imageError, setImageError] = useState(false);
  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();

  const type = getMediaType(item);

  // Never render a person result as a media card or link person id to /tv/ or /movie/
  if (type === 'person') {
    return null;
  }

  const title = getMediaTitle(item);
  const year = getYear(getMediaDate(item));
  const rawRating = item.vote_average ?? 0;
  const ratingText = formatRating(rawRating);
  const inWatchlist = isInWatchlist(item.id, type);

  const hasPoster = Boolean(item.poster_path && typeof item.poster_path === 'string' && !item.poster_path.includes('undefined'));
  const posterUrl = hasPoster ? getPosterUrl(item.poster_path, 'w342') : null;
  const posterSrcSet = hasPoster ? getPosterSrcSet(item.poster_path) : undefined;

  const handleWatchlistClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeItem(item.id, type);
    } else {
      addItem({
        id: item.id,
        type,
        title,
        posterPath: item.poster_path || null,
        voteAverage: rawRating,
        releaseDate: getMediaDate(item),
      });
    }
  };

  const widthClass =
    size === 'auto'
      ? 'w-full'
      : size === 'sm'
      ? 'w-[140px] sm:w-[155px]'
      : size === 'lg'
      ? 'w-[190px] sm:w-[220px]'
      : 'w-[160px] sm:w-[185px]';

  return (
    <article
      className={`group relative flex flex-col flex-shrink-0 transition-transform duration-200 ease-standard hover:-translate-y-1 active:translate-y-0 ${widthClass} ${className}`}
    >
      {/* Primary Card Anchor */}
      <Link
        to={`/${type}/${item.id}`}
        className="block w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-lg"
        aria-label={`${title} (${type === 'tv' ? 'Series' : 'Movie'}, ${year})`}
      >
        {/* Poster Media Container */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-poster-fallback border border-border-default shadow-md group-hover:border-border-strong group-hover:shadow-lg transition-[border-color,box-shadow] duration-200">
          {posterUrl && !imageError ? (
            <img
              src={posterUrl}
              srcSet={posterSrcSet}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
              alt={title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center p-3 text-center bg-poster-fallback text-text-secondary">
              <Film size={28} className="mb-2 text-text-disabled" aria-hidden="true" />
              <span className="text-xs font-semibold text-text-secondary line-clamp-2">{title}</span>
            </div>
          )}

          {/* Rating Badge */}
          {rawRating > 0 && (
            <div
              role="img"
              aria-label={`Rated ${ratingText} out of 10`}
              className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-xs font-semibold text-accent-light border border-white/10 shadow-sm"
            >
              <Star size={12} className="fill-accent text-accent" aria-hidden="true" />
              <span>{ratingText}</span>
            </div>
          )}
        </div>

        {/* Caption & Metadata */}
        <div className="mt-2.5 px-0.5">
          <h3
            className="text-sm font-semibold text-text-primary line-clamp-2 leading-tight group-hover:text-accent-light transition-colors"
            title={title}
          >
            {title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
            {year !== '—' && <span>{year}</span>}
            {year !== '—' && <span className="h-1 w-1 rounded-full bg-border-strong" aria-hidden="true" />}
            <span className="uppercase text-xs tracking-wider text-text-secondary font-medium">
              {type === 'tv' ? 'Series' : 'Movie'}
            </span>
          </div>
        </div>
      </Link>

      {/* Watchlist Button (Dedicated External Control, Always Visible & 44x44 Touch Target) */}
      <button
        type="button"
        onClick={handleWatchlistClick}
        aria-pressed={inWatchlist}
        aria-label={inWatchlist ? `Remove ${title} from Watchlist` : `Add ${title} to Watchlist`}
        className={`absolute top-2 right-2 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-border-default backdrop-blur-md transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.96] ${
          inWatchlist
            ? 'bg-accent text-on-accent border-accent shadow-md'
            : 'bg-black/60 text-text-primary hover:bg-black/80 hover:border-border-strong'
        }`}
      >
        {inWatchlist ? (
          <Check size={18} strokeWidth={2.5} aria-hidden="true" />
        ) : (
          <Plus size={18} strokeWidth={2} aria-hidden="true" />
        )}
      </button>
    </article>
  );
}
