import { useRef, useCallback } from 'react';
import { clusterDominantOklab, type RGBColor } from '../../lib/color';
import { useAmbientStore } from '../../stores/ambient';

interface ExtractOptions {
  fallbackPalette?: string[];
  k?: number;
}

export function useDominantColors() {
  const { setColors, ambilightEnabled } = useAmbientStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastSampleTimeRef = useRef<number>(0);

  const getCanvas = () => {
    if (!canvasRef.current && typeof document !== 'undefined') {
      const c = document.createElement('canvas');
      c.width = 32;
      c.height = 18;
      canvasRef.current = c;
    }
    return canvasRef.current;
  };

  /**
   * Sample dominant colors from an Image or Video element
   * Throttled to max 4 Hz for video streams to preserve 60-120 FPS.
   */
  const sampleElement = useCallback(
    (source: HTMLImageElement | HTMLVideoElement, options: ExtractOptions = {}) => {
      if (!ambilightEnabled) return;

      const now = performance.now();
      if (source instanceof HTMLVideoElement && now - lastSampleTimeRef.current < 250) {
        return; // Throttle to <= 4 Hz (§4.1)
      }
      lastSampleTimeRef.current = now;

      // Skip sampling if document is hidden to conserve GPU/CPU
      if (typeof document !== 'undefined' && document.hidden) return;

      const canvas = getCanvas();
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      try {
        ctx.drawImage(source, 0, 0, 32, 18);
        const imgData = ctx.getImageData(0, 0, 32, 18);
        const clustered = clusterDominantOklab(imgData.data, options.k ?? 3);
        setColors(clustered);
      } catch {
        // CORS fallback to metadata palette (§4.1)
        if (options.fallbackPalette && options.fallbackPalette.length > 0) {
          const fallbackRgb: RGBColor[] = options.fallbackPalette.slice(0, 3).map((hex) => {
            const clean = hex.replace('#', '');
            const bigint = parseInt(clean, 16);
            return {
              r: (bigint >> 16) & 255,
              g: (bigint >> 8) & 255,
              b: bigint & 255,
            };
          });
          setColors(fallbackRgb);
        }
      }
    },
    [ambilightEnabled, setColors]
  );

  const sampleImageUrl = useCallback(
    (url: string, options: ExtractOptions = {}) => {
      if (!url || !ambilightEnabled) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;

      img.onload = () => {
        sampleElement(img, options);
      };
      img.onerror = () => {
        if (options.fallbackPalette) {
          const fallbackRgb: RGBColor[] = options.fallbackPalette.slice(0, 3).map((hex) => {
            const clean = hex.replace('#', '');
            const bigint = parseInt(clean, 16);
            return {
              r: (bigint >> 16) & 255,
              g: (bigint >> 8) & 255,
              b: bigint & 255,
            };
          });
          setColors(fallbackRgb);
        }
      };
    },
    [ambilightEnabled, sampleElement, setColors]
  );

  return { sampleElement, sampleImageUrl };
}
