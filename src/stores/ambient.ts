import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { extractDominantColors, type RGBColor } from '../lib/color';

interface AmbientState {
  colors: RGBColor[];
  setColors: (colors: RGBColor[]) => void;
  setColorsFromImage: (imageUrl: string) => Promise<void>;
  setSingleColor: (color: RGBColor) => void;
  ambilightEnabled: boolean;
  setAmbilightEnabled: (enabled: boolean | ((prev: boolean) => boolean)) => void;
}

const DEFAULT_MESH: RGBColor[] = [
  { r: 42, g: 32, b: 20 },
  { r: 18, g: 26, b: 38 },
  { r: 28, g: 16, b: 24 },
];

/**
 * Note on Volume Persistence (Phase 2b technical blocker):
 * Player volume cannot be persisted because the custom player store (src/stores/player.ts)
 * and player component (src/components/player/LiquidVideoPlayer.tsx) were deleted in
 * Prompt 3 Branch B (commit a0ae588). The active playback pipeline in src/pages/WatchPage.tsx:539-553
 * mounts third-party cross-origin <iframe> embeds (VidLink, Embed.su, Vidsrc) where browser
 * cross-origin security prevents parent window script from inspecting or controlling internal media volume.
 * Per prompt instructions ("do not invent a file that does not exist", "LiquidVideoPlayer as the single player file
 * (do not wire or delete it in this prompt)"), no separate player store is created.
 */
export const useAmbientStore = create<AmbientState>()(
  persist(
    (set) => ({
      colors: DEFAULT_MESH,
      setColors: (colors) => set({ colors }),
      setColorsFromImage: async (imageUrl: string) => {
        const colors = await extractDominantColors(imageUrl);
        set({ colors });
      },
      setSingleColor: (color: RGBColor) => {
        set({
          colors: [
            color,
            {
              r: Math.max(0, Math.round(color.r * 0.7)),
              g: Math.max(0, Math.round(color.g * 0.7)),
              b: Math.max(0, Math.round(color.b * 0.7)),
            },
            {
              r: Math.max(0, Math.round(color.r * 0.5)),
              g: Math.max(0, Math.round(color.g * 0.5)),
              b: Math.max(0, Math.round(color.b * 0.5)),
            },
          ],
        });
      },
      ambilightEnabled: true,
      setAmbilightEnabled: (updater) =>
        set((state) => ({
          ambilightEnabled: typeof updater === 'function' ? updater(state.ambilightEnabled) : updater,
        })),
    }),
    {
      name: 'cinebai-ambient',
      version: 1,
      partialize: (state) => ({ ambilightEnabled: state.ambilightEnabled }),
    }
  )
);
