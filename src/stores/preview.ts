import { create } from 'zustand';

export interface CardRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface PreviewState {
  activePreviewId: string | number | null;
  activeRect: CardRect | null;
  setActivePreview: (id: string | number | null, rect?: CardRect | null) => void;
  clearActivePreview: () => void;
}

export const usePreviewStore = create<PreviewState>((set) => ({
  activePreviewId: null,
  activeRect: null,
  setActivePreview: (id, rect = null) =>
    set({
      activePreviewId: id,
      activeRect: rect,
    }),
  clearActivePreview: () =>
    set({
      activePreviewId: null,
      activeRect: null,
    }),
}));
