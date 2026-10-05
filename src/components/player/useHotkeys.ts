import { useEffect } from 'react';

export interface HotkeyActions {
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onJumpPercent: (percent: number) => void;
  onVolumeDelta: (delta: number) => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onToggleCaptions: () => void;
  onTogglePiP: () => void;
  onFrameStep: (forward: boolean) => void;
  onSpeedDelta: (faster: boolean) => void;
  onToggleHelp: () => void;
}

export function useHotkeys(actions: HotkeyActions, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keystrokes inside form fields
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
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
        case 'KeyC':
          e.preventDefault();
          actions.onToggleCaptions();
          break;
        case 'KeyP':
          e.preventDefault();
          actions.onTogglePiP();
          break;
        case 'Comma':
          e.preventDefault();
          actions.onFrameStep(false);
          break;
        case 'Period':
          e.preventDefault();
          actions.onFrameStep(true);
          break;
        case 'Slash':
          if (e.shiftKey) {
            e.preventDefault();
            actions.onToggleHelp();
          }
          break;
        default:
          // 0-9 percentage jump (§4.5)
          if (e.code.startsWith('Digit')) {
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
