import { useState, useEffect } from 'react';
import { Comment } from '@/types/comment';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';

interface CommentListProps {
  postId: number;
  comments: Comment[];
  onCommentCreated?: () => void;
}

export default function CommentList({
  postId,
  comments,
  onCommentCreated,
}: CommentListProps) {
  const [showAll, setShowAll] = useState(false);

  // comments가 변경되면 자동으로 showAll을 true로 (새 댓글 추가 시)
  useEffect(() => {
    if (comments.length <= 3) {
      setShowAll(true);
    }
  }, [comments.length]);

  const visibleComments = showAll ? comments : comments.slice(0, 3);
  const remainingCount = comments.length - visibleComments.length;

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <div className="space-y-1">
        {visibleComments.map((comment, index) => (
          <CommentItem
            key={`${comment.createdAt}-${index}`}
            comment={comment}
            postId={postId}
          />
        ))}
      </div>

      {!showAll && remainingCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="text-sm text-primary hover:underline mt-2"
        >
          댓글 {remainingCount}개 더 보기
        </button>
      )}

      <CommentInput postId={postId} onCommentCreated={onCommentCreated} />
    </div>
  );
}
