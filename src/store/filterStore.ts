import { create } from 'zustand';

interface FilterStore {
  selectedCategory: number | null;
  sortBy: 'latest' | 'popular';
  setSelectedCategory: (category: number | null) => void;
  setSortBy: (sortBy: 'latest' | 'popular') => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  selectedCategory: null,
  sortBy: 'latest',
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSortBy: (sortBy) => set({ sortBy }),
}));
