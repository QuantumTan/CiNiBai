import { useEffect } from 'react';

export interface HotkeyActions {
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onJumpPercent?: (percent: number) => void;
  onVolumeDelta: (delta: number) => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onToggleHelp: () => void;
  onCloseModal?: () => void;
  isModalOpen?: boolean;
}

export function useHotkeys(actions: HotkeyActions, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If modal or drawer is open, handle Escape to close it and prevent all other hotkeys
      if (actions.isModalOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          actions.onCloseModal?.();
        }
        return;
      }

      const target = e.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName;
        // Ignore keystrokes when focus is in input, textarea, select, button, or contenteditable
        if (
          tagName === 'INPUT' ||
          tagName === 'TEXTAREA' ||
          tagName === 'SELECT' ||
          tagName === 'BUTTON' ||
          target.isContentEditable
        ) {
          return;
        }
      }

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          actions.onTogglePlay();
          break;
        case 'KeyJ':
          e.preventDefault();
          actions.onSeek(-10);
          break;
        case 'KeyL':
          e.preventDefault();
          actions.onSeek(10);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          actions.onSeek(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          actions.onSeek(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          actions.onVolumeDelta(0.05);
          break;
        case 'ArrowDown':
          e.preventDefault();
          actions.onVolumeDelta(-0.05);
          break;
        case 'KeyM':
          e.preventDefault();
          actions.onToggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          actions.onToggleFullscreen();
          break;
        case 'Slash':
          if (e.shiftKey) {
            e.preventDefault();
            actions.onToggleHelp();
          }
          break;
        default:
          if (e.code.startsWith('Digit') && actions.onJumpPercent) {
            const digit = parseInt(e.code.replace('Digit', ''), 10);
            if (!isNaN(digit)) {
              e.preventDefault();
              actions.onJumpPercent(digit * 0.1);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions, enabled]);
}
