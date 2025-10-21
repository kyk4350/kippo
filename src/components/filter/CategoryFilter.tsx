import { mockCategories } from '@/data/mockCategories';
import { useFilterStore } from '@/store/filterStore';
import { getCategoryIcon } from '@/lib/utils/category';
import { cn } from '@/lib/utils/cn';

export default function CategoryFilter() {
  const { selectedCategory, setSelectedCategory } = useFilterStore();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => setSelectedCategory(null)}
        className={cn(
          'px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors',
          selectedCategory === null
            ? 'bg-primary text-white'
            : 'bg-surface text-text-secondary hover:bg-border'
        )}
      >
        전체
      </button>

      {mockCategories.map((category) => (
        <button
          key={category.id}
          onClick={() => setSelectedCategory(category.id)}
          className={cn(
            'px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-1',
            selectedCategory === category.id
              ? 'bg-primary text-white'
              : 'bg-surface text-text-secondary hover:bg-border'
          )}
        >
          <span>{getCategoryIcon(category.id)}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
}
