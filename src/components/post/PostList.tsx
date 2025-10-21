import { useEffect } from 'react';
import { usePosts } from '@/lib/hooks/usePosts';
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';
import { useFilterStore } from '@/store/filterStore';
import PostCard from './PostCard';
import PostSkeleton from './PostSkeleton';

export default function PostList() {
  const { selectedCategory, sortBy } = useFilterStore();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = usePosts({
    category: selectedCategory,
    sortBy,
    limit: 10,
  });

  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    enabled: hasNextPage && !isFetchingNextPage,
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="divide-y divide-border">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-500 mb-4">
          게시물을 불러오는 중 오류가 발생했습니다.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-full"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (allPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-text-secondary text-lg mb-2">게시물이 없습니다</p>
        <p className="text-text-secondary text-sm">
          첫 번째 게시물을 작성해보세요!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="divide-y divide-border">
        {allPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {hasNextPage && (
        <div ref={targetRef} className="py-8">
          {isFetchingNextPage ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 2 }).map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="text-center text-text-secondary">
              <p>스크롤하여 더 보기</p>
            </div>
          )}
        </div>
      )}

      {!hasNextPage && allPosts.length > 0 && (
        <div className="py-8 text-center text-text-secondary">
          <p>모든 게시물을 확인했습니다</p>
        </div>
      )}
    </div>
  );
}
