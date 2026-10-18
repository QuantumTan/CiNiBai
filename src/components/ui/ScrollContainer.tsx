import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ScrollContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

export function ScrollContainer({
  children,
  className,
  'aria-label': ariaLabel = 'Scrollable content',
  ...rest
}: ScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      scroll('right');
    } else if (e.key === 'ArrowLeft') {
      scroll('left');
    }
  };

  return (
    <div
      className={cn("group relative", className)}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {/* Left Arrow (44x44 touch target, visible on touch and focus) */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 border border-border-default text-text-primary shadow-xl opacity-90 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 transition-opacity hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Scroll left"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Scroll Content */}
      <div
        ref={scrollRef}
        className={cn(
          'hide-scrollbar flex gap-4 overflow-x-auto scroll-smooth py-2',
          className
        )}
      >
        {children}
      </div>

      {/* Right Arrow (44x44 touch target, visible on touch and focus) */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 border border-border-default text-text-primary shadow-xl opacity-90 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 transition-opacity hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Scroll right"
        >
          <ChevronRight size={22} />
        </button>
      )}

      {/* Edge fade gradients */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-bg-base to-transparent" />
      )}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-bg-base to-transparent" />
      )}
    </div>
  );
}
