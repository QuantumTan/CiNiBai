import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieCard } from '../cards/MovieCard';
import { ContentRowSkeleton } from '../ui/Skeleton';
import { useRailIntersection } from '../../hooks/useRailIntersection';
import type { TMDBMovie, TMDBTVShow } from '../../api/tmdb.types';

export interface LiquidMediaRailProps {
  title: string;
  items: (TMDBMovie | TMDBTVShow)[] | undefined;
  isLoading?: boolean;
  seeMoreLink?: string;
  lazyMount?: boolean;
  onVisible?: () => void;
}

export function LiquidMediaRail({
  title,
  items,
  isLoading,
  seeMoreLink,
  lazyMount = false,
  onVisible,
}: LiquidMediaRailProps) {
  const { ref: lazyRef, isVisible } = useRailIntersection('150px 0px', !lazyMount);
  const scrollRef = useRef<HTMLDivElement>(null);
  const onVisibleRef = useRef(onVisible);
  const hasNotifiedRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    onVisibleRef.current = onVisible;
  }, [onVisible]);

  useEffect(() => {
    if (lazyMount && isVisible && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      onVisibleRef.current?.();
    }
  }, [lazyMount, isVisible]);

  const checkScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 15);
  };

  useEffect(() => {
    if (!isVisible) return;
    const el = scrollRef.current;
    if (!el) return;
    checkScrollState();
    el.addEventListener('scroll', checkScrollState, { passive: true });
    window.addEventListener('resize', checkScrollState);
    return () => {
      el.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [items, isVisible]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.78;
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

  if (lazyMount && !isVisible) {
    return (
      <div ref={lazyRef}>
        <ContentRowSkeleton />
      </div>
    );
  }

  if (isLoading) {
    return <ContentRowSkeleton />;
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section
      className="relative space-y-3.5 my-8"
      role="region"
      aria-label={title}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-1">
        <h2 className="tracking-tight-title text-xl font-bold text-text-primary md:text-2xl">
          {title}
        </h2>
        {seeMoreLink && (
          <Link
            to={seeMoreLink}
            className="group flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-accent hover:text-accent-light transition-colors min-h-[44px] px-2 py-2"
          >
            <span>Explore All</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* Rail Container */}
      <div className="group/rail relative -mx-4 px-4 overflow-visible">
        {/* Left Floating Chevron (44x44 touch target, visible on hover, focus-visible, and rail focus-within) */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="absolute left-2 top-1/2 z-30 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 border border-border-default text-text-primary shadow-xl opacity-0 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100 focus-visible:opacity-100 transition-opacity hover:bg-black/90 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          className="rail-fade-mask hide-scrollbar flex items-start gap-4 overflow-x-auto overflow-y-visible py-4 pl-4 pr-12 scroll-smooth will-change-scroll"
        >
          {items.map((item) => (
            <MovieCard
              key={`${item.id}-${'title' in item ? 'movie' : 'tv'}`}
              item={item}
              size="md"
            />
          ))}
        </div>

        {/* Right Floating Chevron (44x44 touch target, visible on hover, focus-visible, and rail focus-within) */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="absolute right-2 top-1/2 z-30 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 border border-border-default text-text-primary shadow-xl opacity-0 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100 focus-visible:opacity-100 transition-opacity hover:bg-black/90 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>
    </section>
  );
}
