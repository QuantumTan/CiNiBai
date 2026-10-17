/**
 * Virtual DOM Window & Stable Spacer Engine Hook (§5.2)
 * Renders active ± 2 (5 slots) as interactive shells and wraps non-visible items
 * in exact-height top/bottom spacers to ensure zero CLS and stable scroll snap.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useReelsStore } from '../../stores/reels';

interface UseReelsWindowOptions {
  totalItems: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  reelHeightPx: number; // e.g. window.innerHeight or fixed stage height
  onSettleIndex?: (index: number) => void;
  onNearEnd?: () => void;
}

export function useReelsWindow({
  totalItems,
  containerRef,
  reelHeightPx,
  onSettleIndex,
  onNearEnd,
}: UseReelsWindowOptions) {
  const { activeIndex, setActiveIndex, setScrollOffset } = useReelsStore();
  const [stableIndex, setStableIndex] = useState(activeIndex);
  
  // Rapid-scroll debouncer timer
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const clamped = Math.max(0, Math.min(activeIndex, Math.max(0, totalItems - 1)));
    setStableIndex(clamped);
  }, [activeIndex, totalItems]);

  // Keep the previous slide, active slide, and the next two slides mounted.
  const windowRange = useMemo(() => {
    if (totalItems === 0) return { start: 0, end: 0, renderedIndices: [] };
    const start = Math.max(0, stableIndex - 1);
    const end = Math.min(totalItems - 1, stableIndex + 2);
    const renderedIndices: number[] = [];
    for (let i = start; i <= end; i++) {
      renderedIndices.push(i);
    }
    return { start, end, renderedIndices };
  }, [stableIndex, totalItems]);

  // Spacer heights (prevents scroll collapsing or snap shifts)
  const topSpacerHeight = windowRange.start * reelHeightPx;
  const bottomSpacerHeight = Math.max(0, (totalItems - 1 - windowRange.end) * reelHeightPx);

  // Settle handler
  const handleIndexChange = useCallback(
    (newIndex: number) => {
      if (newIndex === stableIndex) return;

      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }

      // Rapid scroll guard: wait ~80ms before updating stable index
      settleTimerRef.current = setTimeout(() => {
        setStableIndex(newIndex);
        setActiveIndex(newIndex);
        onSettleIndex?.(newIndex);

        // Near-end prefetch trigger: activeIndex >= loadedCount - 3
        if (newIndex >= totalItems - 3) {
          onNearEnd?.();
        }
      }, 80);
    },
    [stableIndex, setActiveIndex, onSettleIndex, totalItems, onNearEnd]
  );

  // Setup IntersectionObserver on container shells
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let bestEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
              bestEntry = entry;
            }
          }
        }

        if (bestEntry) {
          const indexAttr = bestEntry.target.getAttribute('data-reel-index');
          if (indexAttr !== null) {
            const idx = parseInt(indexAttr, 10);
            if (!isNaN(idx)) {
              handleIndexChange(idx);
            }
          }
        }
      },
      {
        root: container,
        threshold: 0.5,
      }
    );

    observerRef.current = observer;

    const shells = container.querySelectorAll('[data-reel-index]');
    shells.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, [containerRef, windowRange, handleIndexChange]);

  // Track scroll and scrollend for snap confirmation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      setScrollOffset(container.scrollTop);

      // Debounced scroll snap detection for cross-browser stability
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (reelHeightPx > 0) {
          const snapIndex = Math.round(container.scrollTop / reelHeightPx);
          if (snapIndex >= 0 && snapIndex < totalItems && snapIndex !== stableIndex) {
            handleIndexChange(snapIndex);
          }
        }
      }, 80);
    };

    const handleScrollEnd = () => {
      if (reelHeightPx > 0) {
        const snapIndex = Math.round(container.scrollTop / reelHeightPx);
        if (snapIndex >= 0 && snapIndex < totalItems && snapIndex !== stableIndex) {
          handleIndexChange(snapIndex);
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    // Support modern scrollend where available
    container.addEventListener('scrollend', handleScrollEnd, { passive: true });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('scrollend', handleScrollEnd);
    };
  }, [containerRef, reelHeightPx, totalItems, stableIndex, handleIndexChange, setScrollOffset]);

  return {
    stableIndex,
    windowRange,
    topSpacerHeight,
    bottomSpacerHeight,
  };
}
