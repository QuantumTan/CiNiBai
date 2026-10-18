import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpatialMotion } from '../../lib/motion';
import type { Chapter } from '../../stores/player';

export interface ScrubberProps {
  currentTime: number;
  duration: number;
  bufferedTime: number;
  chapters?: Chapter[];
  onSeek: (targetTime: number) => void;
  onSeekingChange?: (isSeeking: boolean) => void;
}

export function Scrubber({
  currentTime,
  duration,
  bufferedTime,
  chapters = [],
  onSeek,
  onSeekingChange,
}: ScrubberProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverFraction, setHoverFraction] = useState(0);
  const { springScrubber: activeSpring } = useSpatialMotion();

  const activeDuration = duration > 0 ? duration : 1;
  const progressPercent = Math.min(Math.max((currentTime / activeDuration) * 100, 0), 100);
  const bufferedPercent = Math.min(Math.max((bufferedTime / activeDuration) * 100, 0), 100);
  const hoverTime = hoverFraction * activeDuration;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getActiveChapterTitle = (time: number) => {
    if (!chapters || chapters.length === 0) return '';
    return (
      chapters
        .slice()
        .reverse()
        .find((ch) => time >= ch.time)?.title || ''
    );
  };

  const calcFractionFromEvent = (clientX: number): number => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    return Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    onSeekingChange?.(true);

    const fraction = calcFractionFromEvent(e.clientX);
    setHoverFraction(fraction);
    onSeek(fraction * activeDuration);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const fraction = calcFractionFromEvent(e.clientX);
    setHoverFraction(fraction);

    if (isDragging) {
      onSeek(fraction * activeDuration);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setIsDragging(false);
      onSeekingChange?.(false);
      const fraction = calcFractionFromEvent(e.clientX);
      onSeek(fraction * activeDuration);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let delta = 0;
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        delta = e.shiftKey ? -10 : -5;
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        delta = e.shiftKey ? 10 : 5;
        break;
      case 'PageDown':
        delta = -60;
        break;
      case 'PageUp':
        delta = 60;
        break;
      case 'Home':
        e.preventDefault();
        onSeek(0);
        return;
      case 'End':
        e.preventDefault();
        onSeek(duration);
        return;
      default:
        return;
    }
    e.preventDefault();
    const newTime = Math.min(Math.max(currentTime + delta, 0), duration);
    onSeek(newTime);
  };

  // Clamped tooltip percentage between 6% and 94% to avoid viewport clipping
  const clampedTooltipLeft = `${Math.min(Math.max(hoverFraction * 100, 6), 94)}%`;

  return (
    <div
      ref={barRef}
      role="slider"
      tabIndex={0}
      aria-label="Video scrubber"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(currentTime)}
      aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
      onKeyDown={handleKeyDown}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="group/scrubber relative flex h-11 w-full cursor-pointer items-center select-none outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
    >
      {/* Edge-clamped Hover Tooltip Preview without fake frame preview */}
      <AnimatePresence>
        {(isHovered || isDragging) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={activeSpring}
            className="apple-glass-heavy pointer-events-none absolute bottom-11 -translate-x-1/2 z-50 overflow-hidden rounded-md px-2.5 py-1.5 shadow-lg border border-border-default text-center whitespace-nowrap"
            style={{ left: clampedTooltipLeft }}
          >
            <span className="font-mono text-xs font-bold text-accent-light">
              {formatTime(hoverTime)}
            </span>
            {getActiveChapterTitle(hoverTime) && (
              <p className="text-xs text-text-muted truncate max-w-[140px]">
                {getActiveChapterTitle(hoverTime)}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrubber Track Bar */}
      <div className="relative h-[4px] w-full rounded-full bg-white/20 transition-[height] duration-150 group-hover/scrubber:h-[6px]">
        {/* Buffered Range */}
        <div
          className="absolute top-0 bottom-0 left-0 rounded-full bg-white/30"
          style={{ width: `${bufferedPercent}%` }}
        />

        {/* Current Position Track */}
        <div
          className="absolute top-0 bottom-0 left-0 rounded-full bg-accent shadow-[0_0_8px_rgba(229,184,105,0.6)]"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Chapter Marker Gaps */}
        {chapters.map((ch) => (
          <div
            key={ch.time}
            className="absolute top-0 bottom-0 w-[2px] bg-black/80 z-10"
            style={{ left: `${(ch.time / activeDuration) * 100}%` }}
            title={ch.title}
          />
        ))}

        {/* Always-Visible Scrubber Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-accent border-2 border-white shadow-md transition-transform duration-150 group-hover/scrubber:scale-125"
          style={{ left: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
