/**
 * DramaBox Vertical Poster Card (2:3 Aspect Ratio)
 * Matches https://reels.7xmtools.com SeriesCard with squircle styling and bottom scrim.
 */

import { Play, Eye, Bookmark } from 'lucide-react';
import type { DramaSeries } from '../../lib/reels/dramaboxTypes';
import { useDramaBoxStore } from '../../stores/dramaboxStore';

interface DramaCardProps {
  series: DramaSeries;
}

function formatCompact(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

export function DramaCard({ series }: DramaCardProps) {
  const { openPlayerModal } = useDramaBoxStore();

  return (
    <div
      onClick={() => openPlayerModal(series, 1)}
      className="group relative flex flex-col flex-shrink-0 w-36 sm:w-44 md:w-48 cursor-pointer select-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPlayerModal(series, 1);
        }
      }}
    >
      {/* 2:3 Aspect Ratio Poster */}
      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#12131a] border border-white/[0.08] group-hover:border-white/20 transition-all duration-300 shadow-md group-hover:shadow-2xl group-hover:scale-[1.02]">
        <img
          src={series.cover_pic}
          alt={series.title}
          className="w-full h-full object-cover object-center filter brightness-[0.92] group-hover:brightness-100 transition-all duration-300"
          loading="lazy"
        />

        {/* Top Floating Badge: Episode Count */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="px-2 py-0.5 rounded-md apple-glass-heavy text-[11px] font-semibold text-white/92 tracking-tight border border-white/10 shadow-sm">
            {series.chapter_count} EP
          </span>
        </div>

        {/* Center Hover Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bg-black/30 backdrop-blur-[2px]">
          <div className="w-11 h-11 rounded-full bg-[#e11d48] text-white flex items-center justify-center shadow-lg shadow-rose-950/60 transform scale-90 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-5 h-5 fill-white ml-0.5" strokeWidth={1.5} />
          </div>
        </div>

        {/* Bottom Scrim for Stats */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        {/* Floating Bottom Stats inside card */}
        <div className="absolute bottom-2 inset-x-2 flex items-center justify-between text-[11px] font-medium text-white/80 z-10 type-meta">
          <span className="flex items-center gap-1 drop-shadow">
            <Eye className="w-3 h-3 text-white/60" strokeWidth={1.5} />
            {formatCompact(series.read_count)}
          </span>
          <span className="flex items-center gap-1 drop-shadow">
            <Bookmark className="w-3 h-3 text-white/60" strokeWidth={1.5} />
            {formatCompact(series.collect_count)}
          </span>
        </div>
      </div>

      {/* Series Title Below Card */}
      <h3 className="mt-2 text-xs sm:text-sm font-semibold tracking-tight text-white/90 group-hover:text-white line-clamp-2 leading-snug transition-colors">
        {series.title}
      </h3>
    </div>
  );
}
