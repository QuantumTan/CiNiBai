/**
 * DramaBox Categorized Horizontal Shelf Row
 * Matches https://reels.7xmtools.com SeriesShelf with smooth arrow scroll controls.
 */

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DramaCard } from './DramaCard';
import type { DramaSeries } from '../../lib/reels/dramaboxTypes';

interface DramaSeriesShelfProps {
  title: string;
  subtitle?: string;
  items: DramaSeries[];
}

export function DramaSeriesShelf({ title, subtitle, items }: DramaSeriesShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -600 : 600;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      {/* Header with Title and Scroll Arrows */}
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            {title}
            <span className="type-meta text-xs text-white/48 font-normal">({items.length})</span>
          </h2>
          {subtitle && <p className="type-meta text-xs text-white/48 mt-0.5">{subtitle}</p>}
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full apple-glass-thin border border-white/10 flex items-center justify-center text-white/72 hover:text-white hover:border-white/30 transition-all active:scale-95"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full apple-glass-thin border border-white/10 flex items-center justify-center text-white/72 hover:text-white hover:border-white/30 transition-all active:scale-95"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Container */}
      <div
        ref={scrollRef}
        className="flex items-start gap-3.5 sm:gap-4.5 overflow-x-auto scrollbar-none scroll-smooth pb-2 pt-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((series) => (
          <DramaCard key={series.id} series={series} />
        ))}
      </div>
    </section>
  );
}
