import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaCard, type MediaCardItem } from './MediaCard';

export interface ShelfProps {
  title: string;
  items: MediaCardItem[];
  itemSize?: 'sm' | 'md' | 'lg';
  isContinueWatching?: boolean;
}

export function Shelf({
  title,
  items,
  itemSize = 'md',
  isContinueWatching = false,
}: ShelfProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Item width estimation based on size tier
  const cardWidth = itemSize === 'sm' ? 175 : itemSize === 'lg' ? 270 : 215;
  const gap = 16;
  const totalItemDimension = cardWidth + gap;

  // Horizontal virtualization (§4.4)
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => totalItemDimension,
    horizontal: true,
    overscan: 3, // 3 items each side buffer (§4.4)
  });

  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative my-8 px-6 md:px-12">
      {/* Shelf Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-sm">
          {title}
        </h2>

        {/* Scroll Controls */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scrollBy('left')}
            className="apple-glass-thin flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:text-white"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scrollBy('right')}
            className="apple-glass-thin flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:text-white"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Virtualized Horizontal Rail with Edge-to-Edge Inertia */}
      <div
        ref={scrollContainerRef}
        className="hide-scrollbar relative flex overflow-x-auto scroll-smooth py-4 -my-4 contain-layout"
        style={{ scrollSnapType: 'x proximity' }}
      >
        <div
          style={{
            width: `${virtualizer.getTotalSize()}px`,
            height: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = items[virtualItem.index];
            if (!item) return null;

            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transform: `translateX(${virtualItem.start}px)`,
                  scrollSnapAlign: 'start',
                }}
              >
                <MediaCard
                  item={item}
                  size={itemSize}
                  progress={isContinueWatching ? 0.65 : undefined}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
