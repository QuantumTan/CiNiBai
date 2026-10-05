import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpatialMotion } from '../../lib/motion';
import type { Chapter } from '../../stores/player';

export interface ScrubberProps {
  currentTime: number;
  duration: number;
  bufferedTime: number;
  chapters?: Chapter[];
  previewThumbnail?: string;
  onSeek: (targetTime: number) => void;
  onSeekingChange?: (isSeeking: boolean) => void;
}

export function Scrubber({
  currentTime,
  duration,
  bufferedTime,
  chapters = [],
  previewThumbnail,
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
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getActiveChapterTitle = (time: number) => {
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
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="group/scrubber relative flex h-6 w-full cursor-pointer items-center select-none outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
    >
      {/* Frame-Accurate Hover Tooltip Preview */}
      <AnimatePresence>
        {(isHovered || isDragging) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={activeSpring}
            className="apple-glass-heavy apple-glass-grain pointer-events-none absolute bottom-8 -translate-x-1/2 z-50 overflow-hidden rounded-xl p-2 shadow-2xl border border-white/10"
            style={{ left: `${hoverFraction * 100}%` }}
          >
            {/* Thumbnail Preview (§4.5) */}
            <div className="aspect-video w-32 overflow-hidden rounded-lg bg-neutral-900 border border-white/10 mb-1.5">
              <img
                src={previewThumbnail || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300'}
                alt="Timeframe preview"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="text-center">
              <span className="font-mono text-xs font-bold text-amber-300">
                {formatTime(hoverTime)}
              </span>
              {getActiveChapterTitle(hoverTime) && (
                <p className="text-[10px] text-slate-300 truncate max-w-[120px]">
                  {getActiveChapterTitle(hoverTime)}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hairline 2px baseline -> Springs to 8px via scaleY (zero reflow §4.5) */}
      <motion.div
        animate={{ scaleY: isHovered || isDragging ? 3.5 : 1 }}
        transition={activeSpring}
        style={{ transformOrigin: 'center' }}
        className="relative h-[2.5px] w-full rounded-full bg-white/20 will-change-transform"
      >
        {/* Buffered Range Track */}
        <div
          className="absolute top-0 bottom-0 left-0 rounded-full bg-white/30"
          style={{ width: `${bufferedPercent}%` }}
        />

        {/* Current Position Track */}
        <div
          className="absolute top-0 bottom-0 left-0 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-white shadow-[0_0_8px_rgba(251,191,36,0.6)]"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Chapter Marker Gaps (§4.5) */}
        {chapters.map((ch) => (
          <div
            key={ch.time}
            className="absolute top-0 bottom-0 w-[2px] bg-black/80 z-10"
            style={{ left: `${(ch.time / activeDuration) * 100}%` }}
            title={ch.title}
          />
        ))}

        {/* Glowing Optical Scrubber Thumb */}
        <motion.div
          animate={{ scale: isHovered || isDragging ? 1.25 : 0.85 }}
          transition={activeSpring}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]"
          style={{ left: `${progressPercent}%` }}
        />
      </motion.div>
    </div>
  );
}
