/**
 * Three-Element Reusable Video Pool Hook (§5.2)
 * Eliminates memory leaks and decoder exhaustion by maintaining exactly 3 reusable
 * video elements (prev, active, next). Recycles video slots and handles HLS lifecycle.
 */
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import type { Reel } from '../../lib/reels/types';
import { useReelsStore } from '../../stores/reels';

export type PoolRole = 'prev' | 'active' | 'next' | 'idle';

export interface PoolSlot {
  slotId: number; // 0, 1, 2
  role: PoolRole;
  reelIndex: number | null;
  reelId: string | null;
  videoElement: HTMLVideoElement | null;
  isFirstFrameRendered: boolean;
  hasPlayError: boolean;
}

export function useVideoPool(reels: Reel[], activeIndex: number) {
  const { isMuted, isPlaying, setMuted, setIsPlaying } = useReelsStore();

  // Three fixed video slots
  const [slots, setSlots] = useState<PoolSlot[]>([
    { slotId: 0, role: 'active', reelIndex: null, reelId: null, videoElement: null, isFirstFrameRendered: false, hasPlayError: false },
    { slotId: 1, role: 'next', reelIndex: null, reelId: null, videoElement: null, isFirstFrameRendered: false, hasPlayError: false },
    { slotId: 2, role: 'prev', reelIndex: null, reelId: null, videoElement: null, isFirstFrameRendered: false, hasPlayError: false },
  ]);

  // HLS instances per slotId
  const hlsInstancesRef = useRef<Record<number, Hls | null>>({
    0: null,
    1: null,
    2: null,
  });
  const slotsRef = useRef(slots);
  const sourceByVideoRef = useRef(new WeakMap<HTMLVideoElement, string>());

  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  // Attach a video element to a slot
  const registerVideoElement = useCallback((slotId: number, el: HTMLVideoElement | null) => {
    setSlots((prev) => {
      const slot = prev.find((item) => item.slotId === slotId);
      if (slot?.videoElement === el) return prev;
      return prev.map((item) =>
        item.slotId === slotId ? { ...item, videoElement: el } : item
      );
    });
  }, []);

  const videoRefs = useMemo(
    () => [0, 1, 2].map((slotId) => (el: HTMLVideoElement | null) => registerVideoElement(slotId, el)),
    [registerVideoElement]
  );

  // Clean up and detach a video slot (§5.2)
  const detachSlot = useCallback((slotId: number, video: HTMLVideoElement | null) => {
    // 1. Destroy HLS instance if present
    if (hlsInstancesRef.current[slotId]) {
      hlsInstancesRef.current[slotId]?.destroy();
      hlsInstancesRef.current[slotId] = null;
    }
    // 2. Pause and unload native video
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
  }, []);

  // Update pool role assignments on index change
  useEffect(() => {
    if (reels.length === 0) return;

    const prevIndex = activeIndex > 0 ? activeIndex - 1 : null;
    const currIndex = activeIndex;
    const nextIndex = activeIndex < reels.length - 1 ? activeIndex + 1 : null;

    setSlots((currentSlots) => {
      // Deep clone slots to keep updates pure
      const nextSlots = currentSlots.map((s) => ({ ...s }));

      // Targets map: role -> index
      const targets: { role: PoolRole; index: number | null }[] = [
        { role: 'active', index: currIndex },
        { role: 'prev', index: prevIndex },
        { role: 'next', index: nextIndex },
      ];

      // Assign slots matching current indices first
      const assignedSlotIds = new Set<number>();
      const unassignedTargets: { role: PoolRole; index: number | null }[] = [];

      for (const target of targets) {
        if (target.index === null) continue;
        const matchingSlot = nextSlots.find(
          (s) => s.reelIndex === target.index && !assignedSlotIds.has(s.slotId)
        );
        if (matchingSlot) {
          matchingSlot.role = target.role;
          assignedSlotIds.add(matchingSlot.slotId);
        } else {
          unassignedTargets.push(target);
        }
      }

      // Reassign remaining unassigned slots
      for (const target of unassignedTargets) {
        const freeSlot = nextSlots.find((s) => !assignedSlotIds.has(s.slotId));
        if (freeSlot) {
          if (freeSlot.reelIndex !== target.index) {
            detachSlot(freeSlot.slotId, freeSlot.videoElement);
            freeSlot.isFirstFrameRendered = false;
            freeSlot.hasPlayError = false;
          }
          freeSlot.role = target.role;
          freeSlot.reelIndex = target.index;
          freeSlot.reelId = target.index !== null && reels[target.index] ? reels[target.index].id : null;
          assignedSlotIds.add(freeSlot.slotId);
        }
      }

      // Any still unassigned slots become idle
      for (const s of nextSlots) {
        if (!assignedSlotIds.has(s.slotId)) {
          detachSlot(s.slotId, s.videoElement);
          s.role = 'idle';
          s.reelIndex = null;
          s.reelId = null;
          s.isFirstFrameRendered = false;
        }
      }

      return nextSlots;
    });
  }, [activeIndex, reels, detachSlot]);

  // Bind video sources and handle play/pause/mute state
  useEffect(() => {
    for (const slot of slots) {
      const video = slot.videoElement;
      if (!video || slot.reelIndex === null) continue;

      const reel = reels[slot.reelIndex];
      if (!reel) continue;

      const isM3u8 = reel.playbackUrl.includes('.m3u8');

      // Setup source if changed
      if (sourceByVideoRef.current.get(video) !== reel.playbackUrl) {
        sourceByVideoRef.current.set(video, reel.playbackUrl);

        if (isM3u8) {
          if (Hls.isSupported()) {
            if (hlsInstancesRef.current[slot.slotId]) {
              hlsInstancesRef.current[slot.slotId]?.destroy();
            }
            const hls = new Hls({
              enableWorker: true,
              maxBufferLength: 6, // Lean buffer for reels (§5.2)
            });
            hlsInstancesRef.current[slot.slotId] = hls;
            hls.loadSource(reel.playbackUrl);
            hls.attachMedia(video);
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = reel.playbackUrl;
          }
        } else {
          video.src = reel.playbackUrl;
        }
      }

      // Configure playback and audio rules (§5.2)
      if (slot.role === 'active') {
        video.muted = isMuted;
        video.preload = 'auto';

        if (isPlaying) {
          video.play().catch(() => {
            setMuted(true);
            video.muted = true;
            video.play().catch(() => {
              setIsPlaying(false);
              setSlots((prev) =>
                prev.map((s) => (s.slotId === slot.slotId ? { ...s, hasPlayError: true } : s))
              );
            });
          });
        } else {
          video.pause();
        }
      } else {
        video.pause();
        video.muted = true;
        if (slot.role === 'prev') {
          video.currentTime = 0;
          video.preload = 'none';
        } else {
          video.preload = 'auto';
        }
      }
    }
  }, [slots, reels, isMuted, isPlaying, setMuted, setIsPlaying]);

  // Tab visibility handling (§5.2)
  useEffect(() => {
    const handleVisibility = () => {
      const activeSlot = slots.find((s) => s.role === 'active');
      if (!activeSlot?.videoElement) return;

      if (document.hidden) {
        activeSlot.videoElement.pause();
      } else if (isPlaying) {
        activeSlot.videoElement.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [slots, isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    const currentHls = hlsInstancesRef.current;
    return () => {
      for (const slotId in currentHls) {
        currentHls[slotId]?.destroy();
      }
      for (const slot of slotsRef.current) {
        if (!slot.videoElement) continue;
        slot.videoElement.pause();
        slot.videoElement.removeAttribute('src');
        slot.videoElement.load();
      }
    };
  }, []);

  return {
    slots,
    videoRefs,
    setFrameRendered: (slotId: number) => {
      setSlots((prev) =>
        prev.map((s) => (s.slotId === slotId ? { ...s, isFirstFrameRendered: true } : s))
      );
    },
  };
}
