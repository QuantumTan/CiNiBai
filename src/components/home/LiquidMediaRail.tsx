import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { QuickPeekCard } from '../cards/QuickPeekCard';
import { ContentRowSkeleton } from '../ui/Skeleton';
import type { TMDBMovie, TMDBTVShow } from '../../api/tmdb.types';

export interface LiquidMediaRailProps {
  title: string;
  items: (TMDBMovie | TMDBTVShow)[] | undefined;
  isLoading?: boolean;
  seeMoreLink?: string;
}

export function LiquidMediaRail({ title, items, isLoading, seeMoreLink }: LiquidMediaRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeHoveredId, setActiveHoveredId] = useState<number | null>(null);

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
    const scrollAmount = el.clientWidth * 0.78;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (isLoading) {
    return <ContentRowSkeleton />;
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="relative space-y-3.5 my-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-1">
        <h2 className="tracking-tight-title text-xl font-bold text-white md:text-2xl">
          {title}
        </h2>
        {seeMoreLink && (
          <Link
            to={seeMoreLink}
            className="group flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-amber-300 hover:text-amber-200 transition-colors"
          >
            <span>Explore All</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
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
          className="rail-fade-mask hide-scrollbar flex items-start gap-4 overflow-x-auto overflow-y-visible py-4 scroll-smooth will-change-scroll"
        >
          {items.map((item) => (
            <QuickPeekCard
              key={`${item.id}-${'title' in item ? 'movie' : 'tv'}`}
              item={item}
              size="md"
              isDimmed={activeHoveredId !== null && activeHoveredId !== item.id}
              onHoverStateChange={(isHovered) => {
                setActiveHoveredId(isHovered ? item.id : null);
              }}
            />
          ))}
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
