import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '../ui/Skeleton';
import { getPosterUrl } from '../../api/tmdb';
import { getMediaDate, getYear, getMediaTitle, getMediaType, formatRating } from '../../lib/utils';
import type { TMDBMediaItem } from '../../api/tmdb.types';

interface Top10RowProps {
  title: string;
  items?: TMDBMediaItem[];
  isLoading?: boolean;
}

export function Top10Row({ title, items, isLoading }: Top10RowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 15);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScrollState();
    el.addEventListener('scroll', checkScrollState, { passive: true });
    window.addEventListener('resize', checkScrollState);
    return () => {
      el.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [items]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      handleScroll('right');
    } else if (e.key === 'ArrowLeft') {
      handleScroll('left');
    }
  };

  const top10 = items?.slice(0, 10) || [];

  if (!isLoading && top10.length === 0) {
    return null;
  }

  return (
    <section
      className="relative space-y-3.5 my-8"
      role="region"
      aria-label={`${title} - Global Top 10`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 border border-accent/30 text-accent shadow-sm">
            <TrendingUp size={16} className="text-accent" aria-hidden="true" />
          </div>
          <h2 className="tracking-tight-title text-xl font-bold text-text-primary md:text-2xl">
            {title}
          </h2>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Global Top 10
        </span>
      </div>

      {/* Rail Container */}
      <div className="group/rail relative -mx-4 px-4 overflow-visible">
        {/* Left Floating Chevron (44x44, visible on touch/focus) */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="absolute left-2 top-1/2 z-30 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 border border-border-default text-text-primary shadow-xl opacity-90 sm:opacity-0 sm:group-hover/rail:opacity-100 sm:focus-visible:opacity-100 transition-opacity hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Scroll top 10 left"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          className="rail-fade-mask hide-scrollbar flex items-end gap-5 overflow-x-auto overflow-y-visible py-4 pl-4 pr-12 scroll-smooth will-change-scroll"
        >
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 flex items-center pr-4">
                  <div className="w-16 sm:w-20 md:w-24 h-48 sm:h-56 md:h-64" />
                  <div className="-ml-6 sm:-ml-8 md:-ml-10 w-32 sm:w-36 md:w-44">
                    <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                  </div>
                </div>
              ))
            : top10.map((item, index) => {
                const mediaType = getMediaType(item);
                const itemTitle = getMediaTitle(item);
                const releaseYear = getYear(getMediaDate(item));
                const rating = item.vote_average ?? 0;

                return (
                  <Link
                    key={item.id}
                    to={`/${mediaType}/${item.id}`}
                    className="group/top10 relative flex-shrink-0 flex flex-col items-start select-none transition-transform duration-200 hover:-translate-y-1 pr-2 sm:pr-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    title={itemTitle}
                  >
                    <div className="relative flex items-center">
                      {/* Authentic Netflix-Style Massive Spatial Numeral */}
                      <div
                        className="relative z-0 flex items-center justify-end select-none pointer-events-none w-20 sm:w-24 md:w-28 h-48 sm:h-56 md:h-64 pr-1 sm:pr-2"
                        aria-hidden="true"
                      >
                        <span className="netflix-spatial-numeral text-[115px] sm:text-[145px] md:text-[180px]">
                          {index + 1}
                        </span>
                      </div>

                      {/* Overlapping Poster Card */}
                      <div className="relative z-10 -ml-7 sm:-ml-9 md:-ml-12 w-32 sm:w-36 md:w-44 aspect-[2/3] overflow-hidden rounded-lg bg-poster-fallback border border-border-default shadow-xl flex-shrink-0 group-hover/top10:border-border-strong transition-colors">
                        <img
                          src={getPosterUrl(item.poster_path, 'w342')}
                          alt={itemTitle}
                          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover/top10:scale-105"
                          loading="lazy"
                        />

                        {/* Rating Pill */}
                        {rating > 0 && (
                          <div
                            role="img"
                            aria-label={`Rated ${formatRating(rating)} out of 10`}
                            className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-xs font-semibold text-accent-light border border-white/10 shadow-md"
                          >
                            <Star size={12} className="fill-accent text-accent" aria-hidden="true" />
                            <span>{formatRating(rating)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata Caption directly under Poster (4pt scale: ml-14 sm:ml-16 md:ml-16) */}
                    <div className="mt-2.5 ml-14 sm:ml-16 md:ml-16 w-32 sm:w-36 md:w-44">
                      <h3
                        className="truncate text-xs font-semibold tracking-tight text-text-primary group-hover/top10:text-accent-light transition-colors"
                        title={itemTitle}
                      >
                        {itemTitle}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-text-muted">
                        <span className="uppercase text-xs tracking-wider font-semibold text-text-secondary">
                          {mediaType === 'tv' ? 'Series' : 'Movie'}
                        </span>
                        {releaseYear !== '—' && (
                          <>
                            <span className="h-0.5 w-0.5 rounded-full bg-border-strong" aria-hidden="true" />
                            <span>{releaseYear}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>

        {/* Right Floating Chevron (44x44, visible on touch/focus) */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="absolute right-2 top-1/2 z-30 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 border border-border-default text-text-primary shadow-xl opacity-90 sm:opacity-0 sm:group-hover/rail:opacity-100 sm:focus-visible:opacity-100 transition-opacity hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Scroll top 10 right"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>
    </section>
  );
}
