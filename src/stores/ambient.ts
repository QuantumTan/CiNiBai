import { create } from 'zustand';
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

export const useAmbientStore = create<AmbientState>((set) => ({
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
}));
