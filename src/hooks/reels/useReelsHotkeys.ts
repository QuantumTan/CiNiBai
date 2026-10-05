/**
 * Scoped Hotkeys Hook for Reels Engine (§5.5)
 * Handles full keyboard navigation, play/pause, like burst, mute, search,
 * and suspends hotkeys when inputs or modals are focused.
 */
import { useEffect } from 'react';
import { useReelsStore } from '../../stores/reels';

interface UseReelsHotkeysOptions {
  onNext: () => void;
  onPrev: () => void;
  onScrub: (deltaSeconds: number) => void;
  onWatchFullTitle: () => void;
}

export function useReelsHotkeys({
  onNext,
  onPrev,
  onScrub,
  onWatchFullTitle,
}: UseReelsHotkeysOptions) {
  const {
    reelsList,
    activeIndex,
    isPlaying,
    setIsPlaying,
    toggleMute,
    toggleCaptions,
    toggleLike,
    toggleSave,
    setDiscussionOpen,
    isDiscussionOpen,
    setSearchOpen,
    setHotkeysModalOpen,
    isSearchOpen,
  } = useReelsStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Suspend hotkeys while input, textarea, or search has focus (§5.5)
      const target = e.target as HTMLElement | null;
      const isInputField =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox');

      if (isInputField) return;

      // 2. Global shortcut for Spotlight Search (⌘K / Ctrl+K or /)
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      // If search modal is currently open, allow Esc to close, but block others
      if (isSearchOpen) {
        if (e.key === 'Escape') {
          setSearchOpen(false);
        }
        return;
      }

      const currentReel = reelsList[activeIndex];

      switch (e.key) {
        case 'ArrowDown':
        case 'j':
        case 'J':
          e.preventDefault();
          onNext();
          break;

        case 'ArrowUp':
        case 'k':
        case 'K':
          e.preventDefault();
          onPrev();
          break;

        case ' ':
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;

        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;

        case 'l':
        case 'L':
          e.preventDefault();
          if (currentReel) {
            toggleLike(currentReel.id);
          }
          break;

        case 's':
        case 'S':
          e.preventDefault();
          if (currentReel) {
            toggleSave(currentReel.id);
          }
          break;

        case 'c':
        case 'C':
          e.preventDefault();
          toggleCaptions();
          break;

        case 'd':
        case 'D':
          e.preventDefault();
          setDiscussionOpen(!isDiscussionOpen);
          break;

        case 'Enter':
          e.preventDefault();
          onWatchFullTitle();
          break;

        case 'ArrowLeft':
          e.preventDefault();
          onScrub(-5);
          break;

        case 'ArrowRight':
          e.preventDefault();
          onScrub(5);
          break;

        case '?':
          e.preventDefault();
          setHotkeysModalOpen(true);
          break;

        case 'Escape':
          if (isDiscussionOpen) {
            setDiscussionOpen(false);
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onNext,
    onPrev,
    onScrub,
    onWatchFullTitle,
    reelsList,
    activeIndex,
    isPlaying,
    setIsPlaying,
    toggleMute,
    toggleCaptions,
    toggleLike,
    toggleSave,
    setDiscussionOpen,
    isDiscussionOpen,
    setSearchOpen,
    isSearchOpen,
    setHotkeysModalOpen,
  ]);
}
