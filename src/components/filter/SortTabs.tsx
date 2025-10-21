import { useFilterStore } from '@/store/filterStore';
import { cn } from '@/lib/utils/cn';

export default function SortTabs() {
  const { sortBy, setSortBy } = useFilterStore();

  return (
    <div className="flex border-b border-border">
      <button
        onClick={() => setSortBy('latest')}
        className={cn(
          'flex-1 py-4 font-medium text-sm transition-colors relative',
          sortBy === 'latest'
            ? 'text-text-primary'
            : 'text-text-secondary hover:bg-surface'
        )}
      >
        최신순
        {sortBy === 'latest' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
        )}
      </button>

      <button
        onClick={() => setSortBy('popular')}
        className={cn(
          'flex-1 py-4 font-medium text-sm transition-colors relative',
          sortBy === 'popular'
            ? 'text-text-primary'
            : 'text-text-secondary hover:bg-surface'
        )}
      >
        인기순
        {sortBy === 'popular' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
        )}
      </button>
    </div>
  );
}
