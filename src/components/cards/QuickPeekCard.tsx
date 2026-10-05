import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Plus, 
  Check, 
  ThumbsUp, 
  ChevronDown, 
  Star 
} from 'lucide-react';
import { getPosterUrl, getBackdropUrl } from '../../api/tmdb';
import { getMediaTitle, getMediaDate, getYear, getMediaType } from '../../lib/utils';
import { useWatchlistStore } from '../../store/watchlistStore';

export interface QuickPeekCardProps {
  item: {
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    backdrop_path?: string | null;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
    media_type?: string;
    overview?: string;
    genre_ids?: number[];
  };
  size?: 'sm' | 'md' | 'lg' | 'auto';
  onHoverStateChange?: (isHovered: boolean) => void;
  isDimmed?: boolean;
}

const sizeClasses = {
  sm: 'w-[150px] md:w-[170px]',
  md: 'w-[180px] md:w-[210px]',
  lg: 'w-[220px] md:w-[260px]',
  auto: 'w-full',
};

// High-speed CDN cinematic preview video clips for hover teasers
const TEASER_CLIPS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
];

export function QuickPeekCard({
  item,
  size = 'md',
  onHoverStateChange,
  isDimmed = false,
}: QuickPeekCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [videoActive, setVideoActive] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const type = getMediaType(item);
  const title = getMediaTitle(item);
  const year = getYear(getMediaDate(item));
  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();
  const inWatchlist = isInWatchlist(item.id, type);

  const posterUrl = getPosterUrl(item.poster_path, 'w500');
  const backdropUrl = getBackdropUrl(item.backdrop_path || item.poster_path, 'w780');
  const teaserUrl = TEASER_CLIPS[item.id % TEASER_CLIPS.length];

  // 300ms hover delay trigger to avoid accidental flashes during rapid scrolling
  const handleMouseEnter = () => {
    hoverTimerRef.current = setTimeout(() => {
      setIsExpanded(true);
      setVideoActive(true);
      onHoverStateChange?.(true);
    }, 320);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsExpanded(false);
    setVideoActive(false);
    onHoverStateChange?.(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

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

  const matchScore = item.vote_average > 0 ? Math.round(item.vote_average * 10) : 92;

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative flex-shrink-0 ${sizeClasses[size]} select-none transition-opacity duration-300 ${
        isDimmed ? 'opacity-40 filter brightness-75' : 'opacity-100'
      }`}
    >
      {/* Base Anchor Card (preserves geometry for CLS = 0) */}
      <Link
        to={`/${type}/${item.id}`}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-2xl"
        tabIndex={0}
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-neutral-900 shadow-md">
          {/* Poster Image */}
          <img
            src={posterUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Edge Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-30" />

          {/* Glass Rating Chip */}
          {item.vote_average > 0 && (
            <div className="liquid-glass absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span>{item.vote_average.toFixed(1)}</span>
            </div>
          )}

          {/* Quick Watchlist Bookmark */}
          <button
            onClick={toggleWatchlist}
            className={`absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 ${
              inWatchlist
                ? 'bg-amber-400 text-black shadow-md'
                : 'liquid-glass text-white opacity-0 group-hover:opacity-100'
            }`}
            aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            {inWatchlist ? <Check size={14} strokeWidth={2.5} /> : <Plus size={14} strokeWidth={2} />}
          </button>
        </div>

        {/* Minimal Title Label */}
        <div className="mt-2.5 px-0.5">
          <h3 className="truncate text-xs font-semibold text-neutral-200 group-hover:text-amber-300 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-400">
            {year && <span>{year}</span>}
            <span className="h-0.5 w-0.5 rounded-full bg-neutral-600" />
            <span className="uppercase text-[10px] tracking-wider text-neutral-400 font-medium">
              {type === 'tv' ? 'Series' : 'Movie'}
            </span>
          </div>
        </div>
      </Link>

      {/* Elevated Liquid Quick-Peek Portal Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 0 }}
            animate={{ opacity: 1, scale: 1.2, y: -20 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="liquid-glass-elevated pointer-events-auto absolute top-0 left-[-10%] right-[-10%] z-50 overflow-hidden rounded-2xl shadow-2xl"
            style={{ transformOrigin: 'center center' }}
          >
            {/* Header Teaser / Backdrop Section */}
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              {/* Looping Silent Video Teaser */}
              {videoActive ? (
                <video
                  src={teaserUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={backdropUrl}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              )}

              {/* Bottom Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#101016] via-transparent to-transparent" />

              {/* Spatial Audio & 4K Pills */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 backdrop-blur-md">
                  4K HDR
                </span>
                <span className="rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-slate-300 backdrop-blur-md">
                  Spatial Audio
                </span>
              </div>
            </div>

            {/* Quick Action Bar & Details Body */}
            <div className="p-3.5 bg-gradient-to-b from-[#101016] to-[#0c0c12]">
              {/* Action Buttons Row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {/* Play Button */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => navigate(`/watch/${type}/${item.id}`)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-neutral-100 transition-colors"
                    aria-label={`Play ${title}`}
                  >
                    <Play size={16} className="fill-black ml-0.5" />
                  </motion.button>

                  {/* Add to Watchlist */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={toggleWatchlist}
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                      inWatchlist
                        ? 'bg-amber-400 text-black'
                        : 'border border-white/20 text-white hover:bg-white/10'
                    }`}
                    aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    {inWatchlist ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} />}
                  </motion.button>

                  {/* Like Button */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setIsLiked(!isLiked)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                      isLiked
                        ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                        : 'border-white/20 text-white hover:bg-white/10'
                    }`}
                    aria-label={isLiked ? 'Liked' : 'Like'}
                  >
                    <ThumbsUp size={15} className={isLiked ? 'fill-amber-300' : ''} />
                  </motion.button>
                </div>

                {/* More Details Arrow */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => navigate(`/${type}/${item.id}`)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
                  aria-label={`Details for ${title}`}
                >
                  <ChevronDown size={18} />
                </motion.button>
              </div>

              {/* Title & Metadata */}
              <h4 className="truncate text-sm font-bold text-white mb-1">
                {title}
              </h4>

              <div className="flex items-center gap-2 text-xs text-neutral-300 mb-2">
                <span className="font-semibold text-emerald-400">
                  {matchScore}% Match
                </span>
                <span className="rounded border border-white/20 px-1 py-0.2 text-[10px] text-neutral-400">
                  {type === 'tv' ? 'TV-MA' : 'PG-13'}
                </span>
                {year && <span>{year}</span>}
              </div>

              {/* Brief Overview */}
              {item.overview && (
                <p className="line-clamp-2 text-[11px] leading-relaxed text-neutral-400">
                  {item.overview}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
