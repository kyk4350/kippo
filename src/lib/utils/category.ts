export const getCategoryColor = (categoryId: number): string => {
  const colors: Record<number, string> = {
    1: 'bg-category-cooking text-white',
    2: 'bg-category-art text-white',
    3: 'bg-category-music text-white',
    4: 'bg-category-movie text-white',
    5: 'bg-category-book text-white',
  };
  return colors[categoryId] || 'bg-gray-500 text-white';
};

export const getCategoryIcon = (categoryId: number): string => {
  const icons: Record<number, string> = {
    1: '🍳',
    2: '🎨',
    3: '🎵',
    4: '🎬',
    5: '📚',
  };
  return icons[categoryId] || '📌';
};
