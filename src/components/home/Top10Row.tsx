import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Skeleton } from '../ui/Skeleton';
import { getPosterUrl } from '../../api/tmdb';
import { getMediaDate, getYear, getMediaTitle, getMediaType } from '../../lib/utils';
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

  const top10 = items?.slice(0, 10) || [];

  return (
    <section className="relative space-y-3.5 my-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="apple-glass-thin flex h-7 w-7 items-center justify-center rounded-full text-amber-300 shadow-sm">
            <TrendingUp size={14} className="text-amber-400" />
          </div>
          <h2 className="tracking-tight-title text-xl font-bold text-white md:text-2xl">
            {title}
          </h2>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Global Top 10
        </span>
      </div>

      {/* Rail Container with Soft Edge-Fade Mask */}
      <div className="group/rail relative -mx-4 px-4 overflow-visible">
        {/* Left Floating Chevron */}
        {canScrollLeft && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleScroll('left')}
            className="liquid-glass-control absolute left-2 top-1/2 z-30 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-xl opacity-0 group-hover/rail:opacity-100 transition-opacity focus-visible:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft size={22} />
          </motion.button>
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
                    <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
                  </div>
                </div>
              ))
            : top10.map((item, index) => {
                const mediaType = getMediaType(item);
                const itemTitle = getMediaTitle(item);
                const releaseYear = getYear(getMediaDate(item));

                return (
                  <Link
                    key={item.id}
                    to={`/${mediaType}/${item.id}`}
                    className="group/top10 relative flex-shrink-0 flex flex-col items-start outline-none select-none transition-transform duration-300 hover:-translate-y-2 hover:scale-[1.03] pr-2 sm:pr-4"
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

                      {/* Overlapping Apple Liquid Glass Poster Card */}
                      <div className="ios-card-glass relative z-10 -ml-7 sm:-ml-9 md:-ml-12 w-32 sm:w-36 md:w-44 aspect-[2/3] overflow-hidden rounded-2xl shadow-2xl flex-shrink-0">
                        <img
                          src={getPosterUrl(item.poster_path, 'w500')}
                          alt={itemTitle}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/top10:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#060709] via-transparent to-transparent opacity-65 pointer-events-none" />

                        {/* Apple Glass Rating Pill */}
                        {item.vote_average > 0 && (
                          <div className="apple-glass-thin absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white shadow-md">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            <span>{item.vote_average.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata Caption directly under Poster */}
                    <div className="mt-2.5 ml-14 sm:ml-16 md:ml-18 w-32 sm:w-36 md:w-44">
                      <h3 className="truncate text-xs font-semibold tracking-tight text-slate-100 group-hover/top10:text-amber-300 transition-colors">
                        {itemTitle}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
                        <span className="uppercase text-[9px] tracking-wider font-semibold text-slate-300">
                          {mediaType === 'tv' ? 'Series' : 'Movie'}
                        </span>
                        {releaseYear && (
                          <>
                            <span className="h-0.5 w-0.5 rounded-full bg-slate-600" />
                            <span>{releaseYear}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>

        {/* Right Floating Chevron */}
        {canScrollRight && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleScroll('right')}
            className="liquid-glass-control absolute right-2 top-1/2 z-30 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-xl opacity-0 group-hover/rail:opacity-100 transition-opacity focus-visible:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight size={22} />
          </motion.button>
        )}
      </div>
    </section>
  );
}
