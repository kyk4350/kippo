import { create } from 'zustand';

interface UIStore {
  isImageViewerOpen: boolean;
  currentImageIndex: number;
  currentImages: string[];
  openImageViewer: (images: string[], index: number) => void;
  closeImageViewer: () => void;
  setCurrentImageIndex: (index: number) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isImageViewerOpen: false,
  currentImageIndex: 0,
  currentImages: [],
  openImageViewer: (images, index) =>
    set({
      isImageViewerOpen: true,
      currentImages: images,
      currentImageIndex: index,
    }),
  closeImageViewer: () =>
    set({
      isImageViewerOpen: false,
      currentImages: [],
      currentImageIndex: 0,
    }),
  setCurrentImageIndex: (index) => set({ currentImageIndex: index }),
}));
