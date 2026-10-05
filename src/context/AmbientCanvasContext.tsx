import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export interface AmbientColor {
  r: number;
  g: number;
  b: number;
}

interface AmbientCanvasContextType {
  ambientColor: AmbientColor;
  setAmbientColor: (color: AmbientColor) => void;
  extractAndSetAmbientColor: (imageUrl: string) => Promise<void>;
  ambientEnabled: boolean;
  setAmbientEnabled: (enabled: boolean | ((prev: boolean) => boolean)) => void;
}

const DEFAULT_COLOR: AmbientColor = { r: 180, g: 140, b: 65 }; // Deep warm cinematic gold

const AmbientCanvasContext = createContext<AmbientCanvasContextType>({
  ambientColor: DEFAULT_COLOR,
  setAmbientColor: () => {},
  extractAndSetAmbientColor: async () => {},
  ambientEnabled: true,
  setAmbientEnabled: () => {},
});

export function AmbientCanvasProvider({ children }: { children: React.ReactNode }) {
  const [ambientColor, setAmbientColor] = useState<AmbientColor>(DEFAULT_COLOR);
  const [ambientEnabled, setAmbientEnabled] = useState<boolean>(true);
  const cacheRef = useRef<Map<string, AmbientColor>>(new Map());

  // Dynamic dominant color extraction from media image using offscreen canvas
  const extractAndSetAmbientColor = useCallback(async (imageUrl: string) => {
    if (!imageUrl) return;

    if (cacheRef.current.has(imageUrl)) {
      setAmbientColor(cacheRef.current.get(imageUrl)!);
      return;
    }

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      canvas.width = 32;
      canvas.height = 32;
      ctx.drawImage(img, 0, 0, 32, 32);

      const imageData = ctx.getImageData(0, 0, 32, 32).data;
      let totalR = 0;
      let totalG = 0;
      let totalB = 0;
      let count = 0;

      // Sample pixels with meaningful saturation and luminance
      for (let i = 0; i < imageData.length; i += 16) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const sat = max === 0 ? 0 : (max - min) / max;
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // Filter out extreme blacks, whites, and completely desaturated grays
        if (sat > 0.15 && lum > 25 && lum < 235) {
          totalR += r;
          totalG += g;
          totalB += b;
          count++;
        }
      }

      if (count > 0) {
        const extracted: AmbientColor = {
          r: Math.round(totalR / count),
          g: Math.round(totalG / count),
          b: Math.round(totalB / count),
        };
        cacheRef.current.set(imageUrl, extracted);
        setAmbientColor(extracted);
      }
    } catch {
      // Fallback to warm cinematic baseline if CORS prevents pixel reading
      setAmbientColor(DEFAULT_COLOR);
    }
  }, []);

  return (
    <AmbientCanvasContext.Provider
      value={{
        ambientColor,
        setAmbientColor,
        extractAndSetAmbientColor,
        ambientEnabled,
        setAmbientEnabled,
      }}
    >
      <div className="relative min-h-screen bg-[#08080a] text-slate-100 overflow-x-hidden">
        {/* Dynamic Atmospheric Canvas Glow */}
        {ambientEnabled && (
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-1000"
            style={{
              opacity: ambientEnabled ? 1 : 0,
            }}
          >
            {/* Top Atmospheric Glow */}
            <div
              className="absolute -top-[20%] left-1/2 h-[750px] w-[1200px] -translate-x-1/2 rounded-full blur-[140px] transition-all duration-1000 ease-out"
              style={{
                background: `radial-gradient(ellipse at center, rgba(${ambientColor.r}, ${ambientColor.g}, ${ambientColor.b}, 0.28) 0%, rgba(${ambientColor.r}, ${ambientColor.g}, ${ambientColor.b}, 0.08) 50%, transparent 80%)`,
                transform: 'translate3d(-50%, 0, 0)',
                willChange: 'background',
              }}
            />

            {/* Mid Subtle Ambient Field */}
            <div
              className="absolute top-[40%] right-[-10%] h-[600px] w-[600px] rounded-full blur-[160px] transition-all duration-1000 ease-out"
              style={{
                background: `radial-gradient(circle, rgba(${ambientColor.r}, ${ambientColor.g}, ${ambientColor.b}, 0.12) 0%, transparent 70%)`,
                transform: 'translate3d(0, 0, 0)',
                willChange: 'background',
              }}
            />
          </div>
        )}

        {/* Foreground Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </AmbientCanvasContext.Provider>
  );
}

export function useAmbientCanvas() {
  return useContext(AmbientCanvasContext);
}
