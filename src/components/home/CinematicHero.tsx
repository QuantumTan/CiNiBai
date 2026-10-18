import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Plus, Check, Star, Pause } from 'lucide-react';
import { getBackdropUrl } from '../../api/tmdb';
import { getMediaTitle, getMediaDate, getYear, getMediaType, formatRating } from '../../lib/utils';
import { useWatchlistStore } from '../../store/watchlistStore';
import { useDominantColors } from '../ambient/useDominantColors';
import { HeroSkeleton } from '../ui/Skeleton';
import type { TMDBMovie, TMDBTVShow } from '../../api/tmdb.types';

export interface CinematicHeroProps {
  items: (TMDBMovie | TMDBTVShow)[];
}

export function CinematicHero({ items }: CinematicHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHoveredOrFocused, setIsHoveredOrFocused] = useState(false);
  const navigate = useNavigate();

  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();
  const { sampleImageUrl } = useDominantColors();

  const heroItems = items.slice(0, 5);
  const currentItem = heroItems[currentIndex];

  // Dynamic dominant color sampling when slide changes
  useEffect(() => {
    if (!currentItem?.backdrop_path) return;
    const backdrop = getBackdropUrl(currentItem.backdrop_path, 'w780');
    sampleImageUrl(backdrop);
  }, [currentIndex, currentItem, sampleImageUrl]);

  // Autoplay 8s timer - pauses on hover/focus, paused state, or prefers-reduced-motion
  useEffect(() => {
    if (heroItems.length <= 1 || isPaused || isHoveredOrFocused) return;

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroItems.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [heroItems.length, isPaused, isHoveredOrFocused]);

  if (!items || items.length === 0 || !currentItem) {
    return <HeroSkeleton />;
  }

  const type = getMediaType(currentItem);
  const title = getMediaTitle(currentItem);
  const year = getYear(getMediaDate(currentItem));
  const overview = currentItem.overview || '';
  const rawRating = currentItem.vote_average ?? 0;
  const ratingText = formatRating(rawRating);
  const inWatchlist = isInWatchlist(currentItem.id, type);
  const backdropUrl = getBackdropUrl(currentItem.backdrop_path, 'w1280');

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeItem(currentItem.id, type);
    } else {
      addItem({
        id: currentItem.id,
        type,
        title,
        posterPath: currentItem.poster_path || null,
        voteAverage: rawRating,
        releaseDate: getMediaDate(currentItem),
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      setCurrentIndex((prev) => (prev + 1) % heroItems.length);
    } else if (e.key === 'ArrowLeft') {
      setCurrentIndex((prev) => (prev - 1 + heroItems.length) % heroItems.length);
    }
  };

  return (
    <section
      className="relative h-[50vh] sm:h-[54vh] min-h-[380px] max-h-[480px] w-full overflow-hidden bg-bg-base"
      aria-label="Featured Showcase"
      onMouseEnter={() => setIsHoveredOrFocused(true)}
      onMouseLeave={() => setIsHoveredOrFocused(false)}
      onFocus={() => setIsHoveredOrFocused(true)}
      onBlur={() => setIsHoveredOrFocused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Background Media Engine */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          {backdropUrl && (
            <img
              src={backdropUrl}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-center"
            />
          )}

          {/* Dual Left-to-Right + Bottom Scrim */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(8, 8, 10, 0.92), rgba(8, 8, 10, 0.55) 55%, transparent), linear-gradient(to top, rgba(8, 8, 10, 0.95), transparent 45%)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Editorial Title & Content Lockup */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-6 sm:pb-8 md:px-12 lg:px-20">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Meta row */}
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-text-secondary">
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-text-primary">
                  {type === 'tv' ? 'Series' : 'Feature Film'}
                </span>
                {year !== '—' && (
                  <span className="text-text-secondary font-medium ml-1">
                    {year}
                  </span>
                )}
                {rawRating > 0 && (
                  <div
                    role="img"
                    aria-label={`Rated ${ratingText} out of 10`}
                    className="flex items-center gap-1 text-accent-light ml-1"
                  >
                    <Star size={13} className="fill-accent text-accent" aria-hidden="true" />
                    <span>{ratingText}</span>
                  </div>
                )}
              </div>

              {/* Display Title: Uncollapsed spacing, max-w wrapping, Playfair Display */}
              <h2
                className="mb-4 text-4xl sm:text-5xl md:text-6xl font-bold font-display text-text-primary tracking-normal break-words max-w-2xl lg:max-w-3xl line-clamp-2 drop-shadow-md"
                title={title}
              >
                {title}
              </h2>

              {/* Synopsis: text-secondary (#C7CAD1) at 16px/24px line-clamp-3 */}
              {overview && (
                <p className="mb-6 max-w-2xl text-base leading-6 text-text-secondary line-clamp-3">
                  {overview}
                </p>
              )}

              {/* Action Row: Primary Watch + Ghost Details + 44px Watchlist */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/watch/${type}/${currentItem.id}`)}
                  className="flex items-center gap-2 rounded-md bg-accent text-on-accent px-6 py-3 text-sm font-semibold min-h-[44px] hover:bg-accent-light active:bg-accent-dark active:scale-[0.98] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-md cursor-pointer"
                >
                  <Play size={18} className="fill-current" aria-hidden="true" />
                  <span>Watch Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/${type}/${currentItem.id}`)}
                  className="flex items-center gap-2 rounded-md bg-white/10 border border-border-default text-text-primary px-6 py-3 text-sm font-semibold min-h-[44px] hover:bg-white/15 hover:border-border-strong active:scale-[0.98] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
                >
                  <Info size={18} aria-hidden="true" />
                  <span>Details</span>
                </button>

                <button
                  type="button"
                  onClick={handleWatchlistToggle}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border border-border-default backdrop-blur-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer active:scale-[0.96] ${
                    inWatchlist
                      ? 'bg-accent text-on-accent border-accent shadow-md'
                      : 'bg-black/60 text-text-primary hover:bg-black/80 hover:border-border-strong'
                  }`}
                  aria-pressed={inWatchlist}
                  aria-label={inWatchlist ? `Remove ${title} from Watchlist` : `Add ${title} to Watchlist`}
                >
                  {inWatchlist ? (
                    <Check size={18} strokeWidth={2.5} aria-hidden="true" />
                  ) : (
                    <Plus size={18} strokeWidth={2} aria-hidden="true" />
                  )}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slide Controls Row: min 24px hit area each, active = gold 24px wide pill, inactive = white/40, Pause = 44x44 */}
          {heroItems.length > 1 && (
            <div
              className="mt-6 flex items-center gap-3"
              role="tablist"
              aria-label="Featured slides"
            >
              {heroItems.map((item, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentIndex(idx)}
                    role="tab"
                    id={`hero-tab-${idx}`}
                    aria-controls={`hero-panel-${idx}`}
                    aria-selected={isActive}
                    aria-label={`Slide ${idx + 1}: ${getMediaTitle(item)}`}
                    className="flex h-11 min-w-[24px] px-1 items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
                  >
                    <span
                      className={`block h-2 rounded-full transition-all duration-300 ${
                        isActive
                          ? 'w-6 bg-accent shadow-sm'
                          : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  </button>
                );
              })}

              {/* 44x44 Visible Pause/Play Control */}
              <button
                type="button"
                onClick={() => setIsPaused((prev) => !prev)}
                className="ml-2 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 border border-border-default text-text-primary hover:bg-black/80 hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer transition-colors"
                aria-label={isPaused ? 'Play hero autoplay' : 'Pause hero autoplay'}
                title={isPaused ? 'Play hero autoplay' : 'Pause hero autoplay'}
              >
                {isPaused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
