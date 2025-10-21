import { Comment } from '@/types/comment';
import { Check, Heart } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import { useRelativeTime } from '@/lib/hooks/useRelativeTime';
import { useToggleCommentLike } from '@/lib/hooks/usePostMutations';
import { motion } from 'framer-motion';

interface CommentItemProps {
  comment: Comment;
  postId: number;
}

export default function CommentItem({ comment, postId }: CommentItemProps) {
  // 최적화된 상대적 시간 업데이트: 화면에 보일 때만 구독
  const { elementRef } = useRelativeTime(comment.createdAt);

  // 댓글 좋아요 토글
  const toggleCommentLikeMutation = useToggleCommentLike();

  const handleLikeClick = () => {
    toggleCommentLikeMutation.mutate({
      postId,
      commentCreatedAt: comment.createdAt,
    });
  };

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className="flex gap-2 py-2">
      <img
        src={comment.author.profileImage}
        alt={comment.author.name}
        className="w-8 h-8 rounded-full"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-text-primary">
              {comment.author.name}
            </span>
            {comment.author.verified && (
              <div className="flex items-center justify-center w-3 h-3 bg-primary rounded-full">
                <Check size={8} className="text-white" />
              </div>
            )}
          </div>
          <span className="text-text-secondary text-xs">
            @{comment.author.nickname}
          </span>
        </div>

        <p className="text-sm text-text-primary mt-1">{comment.content}</p>

        <div className="flex items-center gap-3 mt-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLikeClick}
            className="flex items-center gap-1 text-text-secondary hover:text-like transition-colors"
          >
            <Heart
              size={14}
              className={cn(
                'transition-colors',
                comment.isLiked && 'fill-like text-like'
              )}
            />
            <span className="text-xs">{comment.likes}</span>
          </motion.button>
          <span className="text-xs text-text-secondary">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
