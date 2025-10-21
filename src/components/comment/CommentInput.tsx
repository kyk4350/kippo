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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
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
    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
      <img
        src={currentUser.profileImage}
        alt={currentUser.name}
        className="w-8 h-8 rounded-full"
      />
      <div className="flex-1 flex gap-2 items-center">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="댓글을 입력하세요..."
          disabled={createCommentMutation.isPending}
          rows={1}
          className="flex-1 px-3 py-2 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 max-h-24 overflow-y-auto"
          style={{
            minHeight: '40px',
            height: 'auto',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 96)}px`;
          }}
        />
        {comment.trim() && (
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={createCommentMutation.isPending}
            className="bg-primary text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {createCommentMutation.isPending ? '전송 중...' : '전송'}
          </button>
        )}
      </div>
    </div>
  );
}
