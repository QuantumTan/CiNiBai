/**
 * Reels Infinite Query & Discovery Engine Hook (§5.1, §5.3, §5.4)
 * Solves the Reels Dead-End Bug:
 * 1. Single-flight cursor pagination guarded by isFetching.
 * 2. Exponential backoff retry with inline glass retry state.
 * 3. Seamless Infinite Discovery Loop on catalog exhaustion.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReelFilter, ReelMood } from '../../lib/reels/types';
import { fetchReelsCatalog } from '../../lib/reels/api';
import { useReelsStore } from '../../stores/reels';

export function useReelsQuery() {
  const {
    activeFilter,
    activeMoods,
    reelsList,
    setReelsList,
    appendReels,
  } = useReelsStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isDiscoveryMode, setIsDiscoveryMode] = useState(false);

  const fetchingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  // Reset and fetch first page on filter or mood change
  const fetchInitialPage = useCallback(
    async (filter: ReelFilter, moods: ReelMood[]) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      fetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const page = await fetchReelsCatalog({
          filter,
          moods,
          cursor: null,
          limit: 4,
          signal: controller.signal,
        });

        setReelsList(page.items);
        setNextCursor(page.nextCursor);
        setIsDiscoveryMode(page.source === 'discovery');
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Unable to load reels');
      } finally {
        if (abortRef.current === controller) {
          setIsLoading(false);
          fetchingRef.current = false;
        }
      }
    },
    [setReelsList]
  );

  // Fetch initial page on mount and when filter/moods change
  useEffect(() => {
    fetchInitialPage(activeFilter, activeMoods);
    return () => abortRef.current?.abort();
  }, [activeFilter, activeMoods, fetchInitialPage]);

  // Fetch next page with exponential backoff (§5.3)
  const fetchNextPage = useCallback(async () => {
    if (fetchingRef.current || isFetchingNextPage) return;
    if (nextCursor === null && !isDiscoveryMode) return;

    fetchingRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    setIsFetchingNextPage(true);
    setError(null);

    const executeFetch = async (attempt: number): Promise<void> => {
      try {
        const page = await fetchReelsCatalog({
          filter: activeFilter,
          moods: activeMoods,
          cursor: nextCursor,
          limit: 3,
          signal: controller.signal,
        });

        appendReels(page.items);
        setNextCursor(page.nextCursor);
        if (page.source === 'discovery') {
          setIsDiscoveryMode(true);
        }
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        if (attempt < 3) {
          // Exponential backoff: 1s, 2s, 4s (§5.3)
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((res) => setTimeout(res, delay));
          return executeFetch(attempt + 1);
        }
        setError(err instanceof Error ? err.message : 'Failed to fetch next reels page');
      }
    };

    try {
      await executeFetch(0);
    } finally {
      setIsFetchingNextPage(false);
      fetchingRef.current = false;
    }
  }, [activeFilter, activeMoods, isFetchingNextPage, nextCursor, isDiscoveryMode, appendReels]);

  return {
    reels: reelsList,
    isLoading,
    isFetchingNextPage,
    error,
    isDiscoveryMode,
    fetchNextPage,
    retryFetch:
      reelsList.length === 0
        ? () => fetchInitialPage(activeFilter, activeMoods)
        : fetchNextPage,
    refreshFeed: () => fetchInitialPage(activeFilter, activeMoods),
  };
}
