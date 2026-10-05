/**
 * Liquid Micro-Scrubber Component (§6.3)
 * 2px glass hairline expanding to 6px on hover/drag via scaleY transform.
 * Pointer-capture dragging, hover timecode tooltip, ARIA slider semantics.
 */
import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface MicroScrubberProps {
  currentTime: number; // in seconds
  duration: number; // in seconds
  bufferedFraction?: number; // 0.0 - 1.0
  onSeek: (targetSeconds: number) => void;
}

function formatTimecode(secs: number): string {
  if (isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function MicroScrubber({
  currentTime,
  duration,
  bufferedFraction = 0,
  onSeek,
}: MicroScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; time: number } | null>(null);

  const safeDuration = duration > 0 ? duration : 1;
  const progressRatio = Math.max(0, Math.min(1, currentTime / safeDuration));

  // Compute position to seconds
  const calculateSecondsFromEvent = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track) return 0;
      const rect = track.getBoundingClientRect();
      const relativeX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const ratio = relativeX / rect.width;
      return ratio * safeDuration;
    },
    [safeDuration]
  );

  // Pointer down & drag with pointer capture (§6.3)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    const target = calculateSecondsFromEvent(e.clientX);
    onSeek(target);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(rect.width, clientXFromEvent(e) - rect.left));
    const targetSeconds = (relativeX / rect.width) * safeDuration;

    setHoverPosition({ x: relativeX, time: targetSeconds });

    if (isDragging) {
      onSeek(targetSeconds);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setIsDragging(false);
    }
  };

  const clientXFromEvent = (e: React.PointerEvent<HTMLDivElement>) => e.clientX;

  return (
    <div
      className="relative w-full py-2 cursor-pointer select-none group focus-optical"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => {
        setIsHovered(false);
        setHoverPosition(null);
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="slider"
      tabIndex={0}
      aria-label="Reel playback progress"
      aria-valuemin={0}
      aria-valuemax={Math.round(safeDuration)}
      aria-valuenow={Math.round(currentTime)}
      aria-valuetext={`${formatTimecode(currentTime)} of ${formatTimecode(safeDuration)}`}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          onSeek(Math.min(safeDuration, currentTime + 5));
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          onSeek(Math.max(0, currentTime - 5));
        }
      }}
    >
      {/* Hover Timecode Tooltip */}
      {isHovered && hoverPosition && (
        <div
          className="absolute -top-7 apple-glass-thin px-2 py-0.5 rounded text-[10px] font-mono text-white/90 pointer-events-none -translate-x-1/2"
          style={{ left: hoverPosition.x }}
        >
          {formatTimecode(hoverPosition.time)}
        </div>
      )}

      {/* Track Base - 2px animated to 6px via scaleY (§6.3) */}
      <motion.div
        ref={trackRef}
        animate={{
          scaleY: isHovered || isDragging ? 3 : 1, // 2px * 3 = 6px
        }}
        transition={{
          duration: 0.16,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative w-full h-[2px] rounded-full bg-white/[0.18] overflow-hidden origin-center"
      >
        {/* Buffered Progress */}
        <div
          className="absolute inset-y-0 left-0 bg-white/[0.22] rounded-full transition-all duration-300"
          style={{ width: `${bufferedFraction * 100}%` }}
        />

        {/* Current Playback Progress */}
        <div
          className="absolute inset-y-0 left-0 bg-white/90 rounded-full"
          style={{ width: `${progressRatio * 100}%` }}
        />
      </motion.div>

      {/* Glass Thumb (Visible on hover/drag) */}
      {(isHovered || isDragging) && (
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-white shadow-md pointer-events-none"
          style={{ left: `${progressRatio * 100}%` }}
        />
      )}
    </div>
  );
}
