import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '../ui/Skeleton';
import { getPosterUrl } from '../../api/tmdb';
import type { TMDBMediaItem } from '../../api/tmdb.types';

interface Top10RowProps {
  title: string;
  items?: TMDBMediaItem[];
  isLoading?: boolean;
}

export function Top10Row({ title, items, isLoading }: Top10RowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const top10 = items?.slice(0, 10) || [];

  return (
    <div className="relative group">
      <h2 className="mb-4 text-xl font-bold text-text-primary md:text-2xl">{title}</h2>
      
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute -left-4 top-1/2 z-40 hidden -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-gold hover:text-black opacity-0 group-hover:opacity-100 md:block"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="custom-scrollbar flex gap-6 overflow-x-auto overflow-y-hidden pb-4 pt-2 pl-4 md:pl-8"
        >
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-40 md:w-48 flex items-end">
                  <Skeleton className="h-full w-full rounded-xl aspect-[2/3]" />
                </div>
              ))
            : top10.map((item, index) => {
                const mediaType = item.media_type || ('name' in item ? 'tv' : 'movie');
                const title = 'title' in item ? item.title : item.name;
                
                return (
                  <Link
                    key={item.id}
                    to={`/${mediaType}/${item.id}`}
                    className="relative flex-shrink-0 flex items-end group/card transition-transform hover:-translate-y-2 hover:scale-105"
                  >
                    {/* Big Number */}
                    <span 
                      className="absolute -left-6 md:-left-8 -bottom-4 text-[100px] md:text-[140px] font-black leading-none text-black z-10"
                      style={{
                        WebkitTextStroke: '4px #c9a44c',
                        textShadow: '0 0 20px rgba(201,164,76,0.3)'
                      }}
                    >
                      {index + 1}
                    </span>
                    
                    {/* Poster */}
                    <div className="relative z-20 ml-8 md:ml-12 w-32 md:w-40 aspect-[2/3] overflow-hidden rounded-xl ring-1 ring-white/20 shadow-2xl bg-bg-secondary">
                      <img
                        src={getPosterUrl(item.poster_path, 'w500')}
                        alt={title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                );
              })}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute -right-4 top-1/2 z-40 hidden -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-gold hover:text-black opacity-0 group-hover:opacity-100 md:block"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
