import CategoryFilter from '@/components/filter/CategoryFilter';
import SortTabs from '@/components/filter/SortTabs';
import PostList from '@/components/post/PostList';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Category Filter - Sticky */}
      <div className="sticky top-[61px] z-40 bg-white border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <CategoryFilter />
        </div>
      </div>

      {/* Sort Tabs */}
      <div className="max-w-2xl mx-auto">
        <SortTabs />
      </div>

      {/* Post List */}
      <div className="max-w-2xl mx-auto">
        <PostList />
      </div>
    </div>
  );
}
