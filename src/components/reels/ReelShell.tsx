/**
 * Individual Reel Shell Component (§6, §6.3)
 * Implements the 9:16 Ultra-HD stage, non-9:16 blurred backdrop letterbox,
 * poster/video cross-fade, single/double tap gestures, and HUD anchors.
 */
import React, { useState, useRef } from 'react';
import type { Reel } from '../../lib/reels/types';
import { ReelContextHUD } from './ReelContextHUD';
import { ReelActionDock } from './ReelActionDock';
import { useReelsStore } from '../../stores/reels';

interface ReelShellProps {
  reel: Reel;
  index: number;
  isActive: boolean;
  videoElementNode?: React.ReactNode;
  isFirstFrameReady?: boolean;
  onOpenDiscussion: () => void;
  onActorClick: (name: string) => void;
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
}

export function ReelShell({
  reel,
  index,
  isActive,
  videoElementNode,
  isFirstFrameReady = false,
  onOpenDiscussion,
  onActorClick,
  currentTime,
  duration,
  onSeek,
}: ReelShellProps) {
  const { isPlaying, setIsPlaying, toggleLike, captionsEnabled } = useReelsStore();
  const [doubleTapFeedback, setDoubleTapFeedback] = useState(false);
  const lastTapTimeRef = useRef(0);

  // Handle single tap (play/pause) vs double tap (like) per §5.5
  const handleStageClick = () => {
    const now = Date.now();
    const diff = now - lastTapTimeRef.current;

    if (diff < 300) {
      // Double tap -> Like
      toggleLike(reel.id);
      setDoubleTapFeedback(true);
      setTimeout(() => setDoubleTapFeedback(false), 600);
      lastTapTimeRef.current = 0;
    } else {
      lastTapTimeRef.current = now;
      setTimeout(() => {
        if (Date.now() - lastTapTimeRef.current >= 280 && lastTapTimeRef.current !== 0) {
          setIsPlaying(!isPlaying);
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
      className="relative w-full h-[100dvh] flex items-center justify-center snap-start snap-always overflow-hidden"
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

        {/* Double-Tap Like Pulse Feedback (§5.5) */}
        {doubleTapFeedback && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-ping">
            <div className="h-20 w-20 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
              <span className="text-3xl">❤️</span>
            </div>
          </div>
        )}

        {/* Bottom Context HUD & Progress (§6.3) */}
        <ReelContextHUD
          reel={reel}
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
          onActorClick={onActorClick}
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
