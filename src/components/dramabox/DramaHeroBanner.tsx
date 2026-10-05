/**
 * DramaBox Trending Spotlight Hero Banner
 * 1-to-1 parity with https://reels.7xmtools.com/ Hero Banner with optical scrims and visionOS glass.
 */

import { Play, Bookmark, Check, Eye, Layers } from 'lucide-react';
import type { DramaSeries } from '../../lib/reels/dramaboxTypes';
import { useDramaBoxStore } from '../../stores/dramaboxStore';

interface DramaHeroBannerProps {
  series: DramaSeries | null;
}

function formatCompact(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function DramaHeroBanner({ series }: DramaHeroBannerProps) {
  const { openPlayerModal, toggleShelf, isInShelf } = useDramaBoxStore();

  if (!series) {
    return (
      <div className="w-full h-[460px] sm:h-[520px] bg-[#0c0d12] animate-pulse rounded-3xl mx-auto my-4 max-w-7xl" />
    );
  }

  const saved = isInShelf(series.id);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      <div className="relative w-full h-[480px] sm:h-[540px] rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl bg-black">
        {/* Full-bleed Backdrop Image */}
        <img
          src={series.cover_pic}
          alt={series.title}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.05]"
          loading="eager"
        />

        {/* Optical Double Scrim: Left-to-Right linear fade + Bottom-to-Top vertical fade */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060709] via-[#060709]/80 to-transparent w-full md:w-3/4 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060709] via-[#060709]/60 to-transparent z-10 pointer-events-none" />

        {/* Content Box */}
        <div className="relative z-20 h-full flex flex-col justify-end p-6 sm:p-10 md:p-14 max-w-2xl">
          {/* Badge: TRENDING NO. 1 */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 type-meta tracking-wider uppercase mb-3 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Trending No. 1
          </div>

          {/* Title Lockup */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white line-clamp-2 mb-3">
            {series.title}
          </h1>

          {/* Meta Statistics Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 type-meta text-white/72 mb-4">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-white/48" strokeWidth={1.5} />
              <span className="font-semibold text-white tabular-nums">{series.chapter_count}</span>
              <span>Episodes</span>
            </div>
            <span className="text-white/20">·</span>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-white/48" strokeWidth={1.5} />
              <span className="font-semibold text-white tabular-nums">{formatCompact(series.read_count)}</span>
              <span>Plays</span>
            </div>
            <span className="text-white/20">·</span>
            <div className="flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-white/48" strokeWidth={1.5} />
              <span className="font-semibold text-white tabular-nums">{formatCompact(series.collect_count)}</span>
              <span>Saves</span>
            </div>

            {/* Themes / Genre Chips */}
            {series.theme?.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md apple-glass-thin border border-white/10 text-white/88 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          <p className="type-body text-white/72 line-clamp-3 mb-6 max-w-xl text-sm sm:text-base leading-relaxed">
            {series.description || 'Experience this addictive short-form drama sequence with high-stakes twists and live real-time episode streaming.'}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Primary Watch Action */}
            <button
              type="button"
              onClick={() => openPlayerModal(series, 1)}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#e11d48] hover:bg-[#f43f5e] text-white text-sm font-semibold tracking-wide transition-all duration-200 shadow-xl shadow-rose-950/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-4 h-4 text-white fill-white ml-0.5" strokeWidth={1.5} />
              <span>Watch Episode 1</span>
            </button>

            {/* My Shelf Action */}
            <button
              type="button"
              onClick={() => toggleShelf(series)}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-full apple-glass-regular border text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                saved
                  ? 'border-rose-500/40 text-rose-300 bg-rose-500/10'
                  : 'border-white/10 text-white hover:text-white hover:border-white/25'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-rose-400" strokeWidth={1.5} />
                  <span>In Shelf</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-white/72" strokeWidth={1.5} />
                  <span>My Shelf</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
