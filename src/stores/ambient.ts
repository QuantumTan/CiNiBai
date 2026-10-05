import { create } from 'zustand';
import type { RGBColor } from '../lib/color';

interface AmbientState {
  colors: RGBColor[];
  setColors: (colors: RGBColor[]) => void;
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
  ambilightEnabled: true,
  setAmbilightEnabled: (updater) =>
    set((state) => ({
      ambilightEnabled: typeof updater === 'function' ? updater(state.ambilightEnabled) : updater,
    })),
}));
