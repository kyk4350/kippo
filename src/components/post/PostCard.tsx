import { useState, memo } from 'react';
import { Post } from '@/types/post';
import { Check } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/date';
import { highlightText } from '@/lib/utils/text';
import { getCategoryColor } from '@/lib/utils/category';
import { cn } from '@/lib/utils/cn';
import ImageGrid from './ImageGrid';
import InteractionButtons from './InteractionButtons';
import CommentList from '@/components/comment/CommentList';
import { useRelativeTime } from '@/lib/hooks/useRelativeTime';

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);

  // 최적화된 상대적 시간 업데이트: 화면에 보일 때만 구독
  const { elementRef } = useRelativeTime(post.createdAt);

  return (
    <article ref={elementRef} className="p-4 hover:bg-surface transition-colors">
      {/* Author */}
      <div className="flex items-start gap-3 mb-3">
        <img
          src={post.author.profileImage}
          alt={post.author.name}
          className="w-10 h-10 rounded-full"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="font-bold text-text-primary">
                {post.author.name}
              </span>
              {post.author.verified && (
                <div className="flex items-center justify-center w-4 h-4 bg-primary rounded-full">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </div>
            <span className="text-text-secondary text-sm">
              @{post.author.nickname}
            </span>
            <span className="text-text-secondary text-sm">·</span>
            <span className="text-text-secondary text-sm">
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>

          {/* Category Badge */}
          <div className="mt-1">
            <span
              className={cn(
                'inline-block px-2 py-1 text-xs rounded-full',
                getCategoryColor(post.category)
              )}
            >
              {post.categoryName}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <p className="text-text-primary whitespace-pre-wrap break-words">
          {highlightText(post.content)}
        </p>
      </div>

      {/* Images */}
      {post.images.length > 0 && (
        <div className="mb-3">
          <ImageGrid images={post.images} />
        </div>
      )}

      {/* Interaction Buttons */}
      <div className="mb-3">
        <InteractionButtons
          postId={post.id}
          likes={post.likes}
          retweets={post.retweets}
          comments={post.commentList.length}
          isLiked={post.isLiked}
          isRetweeted={post.isRetweeted}
          onCommentClick={() => setShowComments(!showComments)}
        />
      </div>

      {/* Comments */}
      {showComments && (
        <CommentList
          postId={post.id}
          comments={post.commentList}
        />
      )}
    </article>
  );
}

// React.memo로 최적화: 필요한 값이 변경될 때만 리렌더링
const MemoizedPostCard = memo(PostCard, (prevProps, nextProps) => {
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.likes === nextProps.post.likes &&
    prevProps.post.retweets === nextProps.post.retweets &&
    prevProps.post.isLiked === nextProps.post.isLiked &&
    prevProps.post.isRetweeted === nextProps.post.isRetweeted &&
    prevProps.post.commentList === nextProps.post.commentList // 배열 참조 비교로 변경
  );
});

MemoizedPostCard.displayName = 'PostCard';

export default MemoizedPostCard;
