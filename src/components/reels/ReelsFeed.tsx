/**
 * Infinite Reels Engine Main Feed Component (§1, §5, §6, §7)
 * Unifies the three layers:
 * 1. Data window (useReelsQuery with Infinite Discovery Loop)
 * 2. DOM window (useReelsWindow active ± 2 with stable spacers)
 * 3. Media window (useVideoPool exactly 3 recycled video elements)
 * Provides optical-grade spatial liquid glass, keyboard navigation, and ambient lighting.
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReelsQuery } from '../../hooks/reels/useReelsQuery';
import { useReelsWindow } from '../../hooks/reels/useReelsWindow';
import { useVideoPool } from '../../hooks/reels/useVideoPool';
import { useReelsHotkeys } from '../../hooks/reels/useReelsHotkeys';
import { ReelShell } from './ReelShell';
import { ReelsDiscoveryBar } from './ReelsDiscoveryBar';
import { DiscussionDrawer } from './DiscussionDrawer';
import { ClipSearchModal } from './ClipSearchModal';
import { SkeletonReel, EmptyState, ErrorState, EndOfCatalogState } from './states';
import { useReelsStore } from '../../stores/reels';
import { useAmbientCanvas } from '../../context/AmbientCanvasContext';

export function ReelsFeed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    reels,
    isLoading,
    isFetchingNextPage,
    error,
    isDiscoveryMode,
    fetchNextPage,
    retryFetch,
    refreshFeed,
  } = useReelsQuery();

  const {
    activeIndex,
    isDiscussionOpen,
    setDiscussionOpen,
    isSearchOpen,
    setSearchOpen,
    isHotkeysModalOpen,
    setHotkeysModalOpen,
    insertReelAtActive,
  } = useReelsStore();

  const { extractAndSetAmbientColor } = useAmbientCanvas();

  // Viewport reel height
  const [reelHeightPx, setReelHeightPx] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => setReelHeightPx(container.clientHeight);
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    window.visualViewport?.addEventListener('resize', measure);
    measure();
    return () => {
      observer.disconnect();
      window.visualViewport?.removeEventListener('resize', measure);
    };
  }, []);

  // 1. Virtual DOM Window Hook (active ± 2 with spacers, §5.2)
  const { stableIndex, windowRange, topSpacerHeight, bottomSpacerHeight } = useReelsWindow({
    totalItems: reels.length,
    containerRef,
    reelHeightPx,
    onNearEnd: fetchNextPage,
  });

  // 2. Media Window Video Pool (exactly 3 recycled elements, §5.2)
  const { slots, videoRefs, setFrameRendered } = useVideoPool(reels, stableIndex);

  // Playback time & duration for active slot
  const [activeCurrentTime, setActiveCurrentTime] = useState(0);
  const [activeDuration, setActiveDuration] = useState(0);

  // Drive Ambient Canvas from active reel palette / poster (§6.3)
  useEffect(() => {
    const activeReel = reels[stableIndex];
    if (activeReel?.posterUrl) {
      extractAndSetAmbientColor(activeReel.posterUrl);
    }
  }, [stableIndex, reels, extractAndSetAmbientColor]);

  // Programmatic scroll driver with spring mechanics (§5.5)
  const scrollToIndex = useCallback(
    (index: number) => {
      const container = containerRef.current;
      if (!container) return;
      const targetTop = index * reelHeightPx;
      container.scrollTo({ top: targetTop, behavior: 'smooth' });
    },
    [reelHeightPx]
  );

  const handleNext = useCallback(() => {
    if (stableIndex < reels.length - 1) {
      scrollToIndex(stableIndex + 1);
    }
  }, [stableIndex, reels.length, scrollToIndex]);

  const handlePrev = useCallback(() => {
    if (stableIndex > 0) {
      scrollToIndex(stableIndex - 1);
    }
  }, [stableIndex, scrollToIndex]);

  const handleScrub = useCallback(
    (deltaSec: number) => {
      const activeSlot = slots.find((s) => s.role === 'active');
      if (activeSlot?.videoElement) {
        activeSlot.videoElement.currentTime = Math.max(
          0,
          Math.min(activeSlot.videoElement.duration || 100, activeSlot.videoElement.currentTime + deltaSec)
        );
      }
    },
    [slots]
  );

  const handleWatchFullTitle = useCallback(() => {
    const activeReel = reels[stableIndex];
    if (!activeReel) return;
    const seconds = Math.floor(activeReel.source.startAtMs / 1000);
    navigate(
      `/watch/${activeReel.source.kind === 'series' ? 'tv' : 'movie'}/${activeReel.source.titleId}?t=${seconds}&from=reel:${activeReel.id}`
    );
  }, [reels, stableIndex, navigate]);

  // 3. Scoped Keyboard Hotkeys Hook (§5.5)
  useReelsHotkeys({
    onNext: handleNext,
    onPrev: handlePrev,
    onScrub: handleScrub,
    onWatchFullTitle: handleWatchFullTitle,
  });

  const handleDirectSeek = (seconds: number) => {
    const activeSlot = slots.find((s) => s.role === 'active');
    if (activeSlot?.videoElement) {
      activeSlot.videoElement.currentTime = seconds;
      setActiveCurrentTime(seconds);
    }
  };

  const activeReel = reels[stableIndex] || reels[0];

  return (
    <div className="relative w-full h-full min-h-0 bg-[#060709] overflow-hidden select-none">
      {/* Top Floating Glass Discovery Bar (§6.1) */}
      <ReelsDiscoveryBar />

      {/* Main Snap-Scroll Virtual Feed Container (§5.5) */}
      <div
        ref={containerRef}
        role="feed"
        aria-busy={isLoading || isFetchingNextPage}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory overscroll-contain hide-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Loading Initial Skeleton */}
        {isLoading && reels.length === 0 && (
          <div className="w-full h-full flex items-center justify-center p-4">
            <SkeletonReel />
          </div>
        )}

        {/* Empty Catalog State */}
        {!isLoading && !error && reels.length === 0 && (
          <div className="w-full h-full flex items-center justify-center p-4">
            <EmptyState onRetry={refreshFeed} />
          </div>
        )}

        {!isLoading && error && reels.length === 0 && (
          <div className="flex h-full w-full items-center justify-center p-4">
            <ErrorState message={error} onRetry={retryFetch} isRetrying={isLoading} />
          </div>
        )}

        {/* Render Virtualized DOM Window with Stable Spacers (§5.2) */}
        {reels.length > 0 && (
          <>
            {/* Top Spacer */}
            {topSpacerHeight > 0 && (
              <div
                style={{ height: `${topSpacerHeight}px` }}
                className="w-full flex-shrink-0"
                aria-hidden="true"
              />
            )}

            {/* DOM Window (active ± 2) */}
            {windowRange.renderedIndices.map((idx) => {
              const reel = reels[idx];
              if (!reel) return null;

              // Find which pool slot is rendering this reel
              const slot = slots.find((s) => s.reelIndex === idx);
              const isActive = idx === stableIndex;

              return (
                <ReelShell
                  key={reel.id}
                  reel={reel}
                  index={idx}
                  heightPx={reelHeightPx}
                  isActive={isActive}
                  isFirstFrameReady={slot?.isFirstFrameRendered}
                  currentTime={isActive ? activeCurrentTime : 0}
                  duration={isActive ? activeDuration : reel.durationMs / 1000}
                  onSeek={handleDirectSeek}
                  onOpenDiscussion={() => setDiscussionOpen(true)}
                  videoElementNode={
                    slot ? (
                      <video
                        ref={videoRefs[slot.slotId]}
                        playsInline
                        loop
                        onCanPlay={() => setFrameRendered(slot.slotId)}
                        onPlaying={() => setFrameRendered(slot.slotId)}
                        onTimeUpdate={(e) => {
                          if (isActive) {
                            setActiveCurrentTime(e.currentTarget.currentTime);
                            setActiveDuration(e.currentTarget.duration || reel.durationMs / 1000);
                          }
                        }}
                        className={`absolute inset-0 w-full h-full ${
                          reel.aspect !== '9:16' ? 'object-contain' : 'object-cover'
                        } pointer-events-none transition-opacity duration-300 ${
                          slot.isFirstFrameRendered && isActive ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    ) : undefined
                  }
                />
              );
            })}

            {/* Bottom Spacer */}
            {bottomSpacerHeight > 0 && (
              <div
                style={{ height: `${bottomSpacerHeight}px` }}
                className="w-full flex-shrink-0"
                aria-hidden="true"
              />
            )}

            {/* Infinite Discovery Loop Indicator (§5.4) */}
            {isDiscoveryMode && <EndOfCatalogState />}

            {/* Inline Error State with Retry (§5.3) */}
            {error && (
              <ErrorState
                message={error}
                onRetry={retryFetch}
                isRetrying={isFetchingNextPage}
              />
            )}
          </>
        )}
      </div>

      {/* Discussion Drawer (§6.2) */}
      {activeReel && (
        <DiscussionDrawer
          isOpen={isDiscussionOpen}
          reel={activeReel}
          currentTimeMs={activeCurrentTime * 1000}
          onClose={() => setDiscussionOpen(false)}
          onSeekToMs={(ms) => handleDirectSeek(ms / 1000)}
        />
      )}

      {/* Spotlight Clip Search Modal (§6.1) */}
      <ClipSearchModal
        isOpen={isSearchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectReel={(selected) => {
          insertReelAtActive(selected);
          // Scroll immediately to the newly inserted active reel
          setTimeout(() => scrollToIndex(activeIndex), 50);
        }}
      />

      {/* Hotkeys Cheat Sheet Modal (§5.5) */}
      {isHotkeysModalOpen && (
        <div 
          onClick={() => setHotkeysModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="apple-glass-heavy rounded-3xl p-6 max-w-sm w-full border border-white/[0.12] space-y-4 cursor-default"
          >
            <h3 className="type-section-title text-white">Reels Keyboard Shortcuts</h3>
            <div className="space-y-2 type-meta text-white/72">
              <div className="flex justify-between"><span>Next sequence</span><kbd className="apple-glass-thin px-2 py-0.5 rounded">↓ / J</kbd></div>
              <div className="flex justify-between"><span>Previous sequence</span><kbd className="apple-glass-thin px-2 py-0.5 rounded">↑ / K</kbd></div>
              <div className="flex justify-between"><span>Play / Pause</span><kbd className="apple-glass-thin px-2 py-0.5 rounded">Space</kbd></div>
              <div className="flex justify-between"><span>Mute / Unmute</span><kbd className="apple-glass-thin px-2 py-0.5 rounded">M</kbd></div>
              <div className="flex justify-between"><span>Like sequence</span><kbd className="apple-glass-thin px-2 py-0.5 rounded">L</kbd></div>
              <div className="flex justify-between"><span>Save to Watchlist</span><kbd className="apple-glass-thin px-2 py-0.5 rounded">S</kbd></div>
              <div className="flex justify-between"><span>Toggle Captions</span><kbd className="apple-glass-thin px-2 py-0.5 rounded">C</kbd></div>
              <div className="flex justify-between"><span>Discussion Drawer</span><kbd className="apple-glass-thin px-2 py-0.5 rounded">D</kbd></div>
              <div className="flex justify-between"><span>Watch Full Title</span><kbd className="apple-glass-thin px-2 py-0.5 rounded">Enter</kbd></div>
              <div className="flex justify-between"><span>Spotlight Search</span><kbd className="apple-glass-thin px-2 py-0.5 rounded">⌘K / /</kbd></div>
              <div className="flex justify-between"><span>Scrub −5s / +5s</span><kbd className="apple-glass-thin px-2 py-0.5 rounded">← / →</kbd></div>
            </div>
            <button
              onClick={() => setHotkeysModalOpen(false)}
              className="w-full py-2 apple-glass-thin rounded-xl type-label text-white/80 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
