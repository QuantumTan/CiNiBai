/**
 * Individual Reel Shell Component (§6, §6.3)
 * Implements the 9:16 Ultra-HD stage, non-9:16 blurred backdrop letterbox,
 * poster/video cross-fade, single/double tap gestures, and HUD anchors.
 */
import React, { useEffect, useState, useRef } from 'react';
import { Heart, LoaderCircle, Play } from 'lucide-react';
import type { Reel } from '../../lib/reels/types';
import { ReelContextHUD } from './ReelContextHUD';
import { ReelActionDock } from './ReelActionDock';
import { useReelsStore } from '../../stores/reels';

interface ReelShellProps {
  reel: Reel;
  index: number;
  heightPx: number;
  isActive: boolean;
  videoElementNode?: React.ReactNode;
  isFirstFrameReady?: boolean;
  onOpenDiscussion: () => void;
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
}

export function ReelShell({
  reel,
  index,
  heightPx,
  isActive,
  videoElementNode,
  isFirstFrameReady = false,
  onOpenDiscussion,
  currentTime,
  duration,
  onSeek,
}: ReelShellProps) {
  const { isPlaying, setIsPlaying, toggleLike, captionsEnabled } = useReelsStore();
  const [doubleTapFeedback, setDoubleTapFeedback] = useState(false);
  const lastTapTimeRef = useRef(0);
  const singleTapTimerRef = useRef<number | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (singleTapTimerRef.current) window.clearTimeout(singleTapTimerRef.current);
    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
  }, []);

  // Handle single tap (play/pause) vs double tap (like) per §5.5
  const handleStageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button, input, [role="slider"]')) return;
    const now = Date.now();
    const diff = now - lastTapTimeRef.current;

    if (diff < 300) {
      // Double tap -> Like
      toggleLike(reel.id);
      setDoubleTapFeedback(true);
      if (singleTapTimerRef.current) window.clearTimeout(singleTapTimerRef.current);
      feedbackTimerRef.current = window.setTimeout(() => setDoubleTapFeedback(false), 520);
      lastTapTimeRef.current = 0;
    } else {
      lastTapTimeRef.current = now;
      singleTapTimerRef.current = window.setTimeout(() => {
        if (Date.now() - lastTapTimeRef.current >= 280 && lastTapTimeRef.current !== 0) {
          setIsPlaying(!isPlaying);
          lastTapTimeRef.current = 0;
        }
      }, 290);
    }
  };

  const isNonVertical = reel.aspect !== '9:16';

  return (
    <article
      data-reel-index={index}
      role="article"
      aria-posinset={index + 1}
      aria-setsize={-1}
      aria-label={`${reel.source.title}${reel.source.season ? `, Season ${reel.source.season} Episode ${reel.source.episode}` : ''}`}
      className="relative w-full flex shrink-0 items-center justify-center snap-start snap-always overflow-hidden"
      style={{ height: heightPx > 0 ? `${heightPx}px` : '100dvh' }}
    >
      {/* Centered 9:16 Stage Container (§6) */}
      <div
        onClick={handleStageClick}
        className="relative w-full h-full max-w-[440px] max-h-[100dvh] md:max-h-[calc(100dvh-5rem)] aspect-[9/16] rounded-none md:rounded-3xl overflow-hidden bg-black border-0 md:border md:border-white/[0.1] shadow-2xl flex items-center justify-center select-none cursor-pointer"
      >
        {/* Backdrop for non-9:16 reels (letterbox on color-matched blurred backdrop, §6) */}
        {isNonVertical && (
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-40 scale-125 pointer-events-none"
            style={{ backgroundImage: `url(${reel.posterUrl})` }}
          />
        )}

        {/* Poster Frame (Cross-fades out once first video frame renders, §5.2) */}
        <img
          src={reel.posterUrl}
          alt=""
          className={`absolute inset-0 w-full h-full ${
            isNonVertical ? 'object-contain' : 'object-cover'
          } transition-opacity duration-300 pointer-events-none z-10 ${
            isFirstFrameReady && isActive ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Injected Video Element Slot from Pool */}
        {videoElementNode}

        {/* Top Vignette Scrim */}
        <div className="absolute inset-x-0 top-0 h-28 scrim-top pointer-events-none z-15" />

        {isActive && !isFirstFrameReady && (
          <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center" role="status" aria-label="Buffering reel">
            <LoaderCircle aria-hidden="true" className="animate-spin text-white" size={32} strokeWidth={2} />
          </div>
        )}

        {isActive && isFirstFrameReady && !isPlaying && (
          <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center" aria-hidden="true">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-black/62 text-white">
              <Play size={30} className="ml-1 fill-white" />
            </span>
          </div>
        )}

        {doubleTapFeedback && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
            <Heart aria-hidden="true" className="fill-[#ff375f] text-[#ff375f] drop-shadow-xl" size={76} strokeWidth={1.5} />
          </div>
        )}

        {/* Bottom Context HUD & Progress (§6.3) */}
        <ReelContextHUD
          reel={reel}
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
          captionsActive={captionsEnabled}
        />

        {/* Action Dock (Attached to right edge of stage) */}
        <ReelActionDock
          reel={reel}
          onOpenDiscussion={onOpenDiscussion}
        />
      </div>
    </article>
  );
}
