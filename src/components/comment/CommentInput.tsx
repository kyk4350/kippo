import { useState } from 'react';
import { currentUser } from '@/data/mockUser';
import { useCreateComment } from '@/lib/hooks/usePostMutations';

interface CommentInputProps {
  postId: number;
  onCommentCreated?: () => void;
}

export default function CommentInput({ postId, onCommentCreated }: CommentInputProps) {
  const [comment, setComment] = useState('');
  const createCommentMutation = useCreateComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || createCommentMutation.isPending) return;

    createCommentMutation.mutate(
      { postId, content: comment.trim() },
      {
        onSuccess: () => {
          setComment('');
          onCommentCreated?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-3 pt-3 border-t border-border">
      <img
        src={currentUser.profileImage}
        alt={currentUser.name}
        className="w-8 h-8 rounded-full"
      />
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="댓글을 입력하세요..."
        disabled={createCommentMutation.isPending}
        className="flex-1 px-3 py-2 text-sm border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
      />
    </form>
  );
}
