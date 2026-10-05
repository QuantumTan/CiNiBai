import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Check } from 'lucide-react';
import { getPosterUrl, getBackdropUrl } from '../../api/tmdb';
import { getMediaTitle, getMediaDate, getYear, getMediaType } from '../../lib/utils';
import { useWatchlistStore } from '../../store/watchlistStore';
import { QuickPeekOverlay, type QuickPeekData } from '../media/QuickPeekOverlay';
import { usePreviewStore, type CardRect } from '../../stores/preview';
import { useSpatialMotion } from '../../lib/motion';

export interface MovieCardProps {
  item: {
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    backdrop_path?: string | null;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
    media_type?: string;
    overview?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'auto';
}

const sizeClasses = {
  sm: 'w-[145px] md:w-[165px]',
  md: 'w-[185px] md:w-[210px]',
  lg: 'w-[230px] md:w-[260px]',
  auto: 'w-full',
};

export function MovieCard({ item, size = 'md' }: MovieCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastPointerPosRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  const [portalRect, setPortalRect] = useState<CardRect | null>(null);
  const { activePreviewId, setActivePreview, clearActivePreview } = usePreviewStore();
  const { isReduced } = useSpatialMotion();

  const type = getMediaType(item);
  const title = getMediaTitle(item);
  const year = getYear(getMediaDate(item));

  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();
  const inWatchlist = isInWatchlist(item.id, type);

  const isCurrentActive = activePreviewId === item.id;
  const isAnyActive = activePreviewId !== null;
  const isDimmed = isAnyActive && !isCurrentActive;

  const triggerHoverExpansion = useCallback(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const bounds: CardRect = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
    setPortalRect(bounds);
    setActivePreview(item.id, bounds);
  }, [item.id, setActivePreview]);

  // Direct DOM pointer math for 60-120 FPS cursor glare & 3D tilt (§3.4)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isReduced) return;
      const el = cardRef.current;
      if (!el) return;

      const now = performance.now();
      const dt = now - lastPointerPosRef.current.time;
      const dx = e.clientX - lastPointerPosRef.current.x;
      const dy = e.clientY - lastPointerPosRef.current.y;
      const velocity = dt > 0 ? Math.sqrt(dx * dx + dy * dy) / dt : 0;

      lastPointerPosRef.current = { x: e.clientX, y: e.clientY, time: now };

      // High velocity cancels hover intent to prevent scrubbing stutter
      if (velocity > 1.8 && hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = setTimeout(() => {
          triggerHoverExpansion();
        }, 250);
      }

      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;

        el.style.setProperty('--pointer-x', `${px}px`);
        el.style.setProperty('--pointer-y', `${py}px`);

        const tiltX = ((py / rect.height) - 0.5) * -7;
        const tiltY = ((px / rect.width) - 0.5) * 7;
        el.style.transform = `perspective(900px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(0)`;
      });
    },
    [isReduced, triggerHoverExpansion]
  );

  const resetPointerStyle = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--pointer-x', '50%');
    el.style.setProperty('--pointer-y', '0%');
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
  };

  const handlePointerEnter = () => {
    hoverTimerRef.current = setTimeout(() => {
      triggerHoverExpansion();
    }, 280);
  };

  const handlePointerLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    resetPointerStyle();
  };

  const handleFocus = () => {
    hoverTimerRef.current = setTimeout(() => {
      triggerHoverExpansion();
    }, 280);
  };

  const handleBlur = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeItem(item.id, type);
    } else {
      addItem({
        id: item.id,
        type,
        title,
        posterPath: item.poster_path,
        voteAverage: item.vote_average,
        releaseDate: getMediaDate(item),
      });
    }
  };

  const quickPeekData: QuickPeekData = {
    id: item.id,
    title,
    poster: getPosterUrl(item.poster_path, 'w500'),
    backdrop: getBackdropUrl(item.backdrop_path || item.poster_path, 'w780'),
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    matchScore: item.vote_average ? Math.round(item.vote_average * 10) : 92,
    rating: type === 'tv' ? 'Series' : 'Feature',
    duration: 'HD',
    year,
    overview: item.overview,
    inWatchlist,
    onToggleWatchlist: () => toggleWatchlist({} as any),
  };

  return (
    <>
      <div
        ref={cardRef}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={0}
        role="button"
        aria-label={title}
        className={`relative flex-shrink-0 ${sizeClasses[size]} select-none outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 transition-[opacity,filter] duration-300 will-change-transform ${
          isDimmed
            ? isReduced
              ? 'opacity-60'
              : 'opacity-55 filter blur-[1px]'
            : 'opacity-100 filter-none'
        }`}
      >
        <Link to={`/${type}/${item.id}`} className="group block outline-none">
          {/* iOS Liquid Glass Card Container */}
          <div className="ios-card-glass fresnel-lens apple-glass-grain relative aspect-[2/3] w-full overflow-hidden rounded-2xl shadow-lg">
            {/* Poster Image */}
            <img
              src={getPosterUrl(item.poster_path, 'w500')}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />

            {/* Inset Light Specular Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060709] via-transparent to-transparent opacity-65 pointer-events-none" />

            {/* Apple Crystal Glass Rating Pill */}
            {item.vote_average > 0 && (
              <div className="apple-glass-thin absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white shadow-md">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                <span>{item.vote_average.toFixed(1)}</span>
              </div>
            )}

            {/* Quick Watchlist Bookmark Button */}
            <button
              onClick={toggleWatchlist}
              className={`absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 ${
                inWatchlist
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'apple-glass-thin text-white opacity-0 group-hover:opacity-100'
              }`}
              aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {inWatchlist ? <Check size={14} strokeWidth={2.5} /> : <Plus size={14} strokeWidth={2} />}
            </button>
          </div>

          {/* High-Legibility Title & Metadata Caption (No Overlap) */}
          <div className="mt-2.5 px-0.5">
            <h3 className="truncate text-xs font-semibold tracking-tight text-slate-100 group-hover:text-amber-300 transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
              {year && <span>{year}</span>}
              <span className="h-0.5 w-0.5 rounded-full bg-slate-600" />
              <span className="uppercase text-[9px] tracking-wider text-slate-400 font-medium">
                {type === 'tv' ? 'Series' : 'Movie'}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Portaled Zero-CLS Hover Modal */}
      {isCurrentActive && portalRect && (
        <QuickPeekOverlay
          data={quickPeekData}
          rect={portalRect}
          onClose={() => {
            setPortalRect(null);
            clearActivePreview();
          }}
        />
      )}
    </>
  );
}
