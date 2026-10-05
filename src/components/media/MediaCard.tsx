import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';
import { Squircle } from '../glass/Squircle';
import { QuickPeekOverlay, type QuickPeekData } from './QuickPeekOverlay';
import { usePreviewStore, type CardRect } from '../../stores/preview';
import { useSpatialMotion } from '../../lib/motion';

export interface MediaCardItem {
  id: string | number;
  title: string;
  poster: string;
  backdrop?: string;
  previewVideoUrl?: string;
  voteAverage?: number;
  releaseDate?: string;
  overview?: string;
  rating?: string;
  duration?: string;
}

export interface MediaCardProps {
  item: MediaCardItem;
  size?: 'sm' | 'md' | 'lg';
  progress?: number; // 0..1 for Continue Watching radial ring
  inWatchlist?: boolean;
  onToggleWatchlist?: () => void;
}

const cardSizes = {
  sm: 'w-[155px] md:w-[175px]',
  md: 'w-[185px] md:w-[215px]',
  lg: 'w-[230px] md:w-[270px]',
};

export function MediaCard({
  item,
  size = 'md',
  progress,
  inWatchlist,
  onToggleWatchlist,
}: MediaCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointerPosRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const rafRef = useRef<number | null>(null);

  const [portalRect, setPortalRect] = useState<CardRect | null>(null);
  const { activePreviewId, setActivePreview, clearActivePreview } = usePreviewStore();
  const { isReduced } = useSpatialMotion();

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

      // High velocity cancels hover intent to prevent scrubbing stutter (§4.3)
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

        // Update CSS Variables directly on element (No React re-renders)
        el.style.setProperty('--pointer-x', `${px}px`);
        el.style.setProperty('--pointer-y', `${py}px`);

        // Subtle 3D tilt: max +-4 deg with 900px perspective (§3.4)
        const tiltX = ((py / rect.height) - 0.5) * -8;
        const tiltY = ((px / rect.width) - 0.5) * 8;
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
    // 250ms Hover-intent threshold (§4.3)
    hoverTimerRef.current = setTimeout(() => {
      triggerHoverExpansion();
    }, 250);
  };

  const handlePointerLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    resetPointerStyle();
  };

  const handleFocus = () => {
    // Keyboard focus parity (§4.3, §7)
    hoverTimerRef.current = setTimeout(() => {
      triggerHoverExpansion();
    }, 250);
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

  const closeQuickPeek = () => {
    setPortalRect(null);
    clearActivePreview();
  };

  const quickPeekData: QuickPeekData = {
    id: item.id,
    title: item.title,
    poster: item.poster,
    backdrop: item.backdrop,
    previewVideoUrl: item.previewVideoUrl,
    matchScore: item.voteAverage ? Math.round(item.voteAverage * 10) : 94,
    rating: item.rating || 'PG-13',
    duration: item.duration || '2h 10m',
    year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : '2025',
    overview: item.overview,
    inWatchlist,
    onToggleWatchlist,
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
        aria-label={`${item.title}`}
        className={`relative flex-shrink-0 ${cardSizes[size]} select-none outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 transition-[opacity,filter] duration-300 will-change-transform ${
          isDimmed
            ? isReduced
              ? 'opacity-60'
              : 'opacity-55 filter blur-[1px]'
            : 'opacity-100 filter-none'
        }`}
      >
        <Squircle
          radius={24}
          className="fresnel-lens apple-glass-regular apple-glass-grain aspect-[2/3] w-full overflow-hidden shadow-lg"
        >
          {/* Base Poster Image */}
          <img
            src={item.poster}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out"
          />

          {/* Chamfered Inset Highlight and Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060709] via-transparent to-transparent opacity-70 pointer-events-none" />

          {/* Star Rating Badge */}
          {item.voteAverage !== undefined && item.voteAverage > 0 && (
            <div className="apple-glass-thin absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span>{item.voteAverage.toFixed(1)}</span>
            </div>
          )}

          {/* Radial Scrub Ring for Continue Watching (§4.4) */}
          {typeof progress === 'number' && progress > 0 && (
            <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  className="stroke-white/20"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  className="stroke-amber-400"
                  strokeWidth="3"
                  strokeDasharray="88"
                  strokeDashoffset={88 - 88 * progress}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
        </Squircle>

        {/* Static Title Caption (Keeps rail geometry constant CLS = 0) */}
        <div className="mt-2.5 px-0.5">
          <h3 className="truncate text-xs font-semibold tracking-tight text-slate-200">
            {item.title}
          </h3>
          {item.releaseDate && (
            <p className="text-[10px] text-slate-400 mt-0.5">
              {new Date(item.releaseDate).getFullYear()}
            </p>
          )}
        </div>
      </div>

      {/* Portaled Zero-CLS Hover Modal */}
      {isCurrentActive && portalRect && (
        <QuickPeekOverlay
          data={quickPeekData}
          rect={portalRect}
          onClose={closeQuickPeek}
        />
      )}
    </>
  );
}
