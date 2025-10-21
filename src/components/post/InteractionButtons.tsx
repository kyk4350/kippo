import { Heart, Repeat2, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToggleLike, useToggleRetweet } from '@/lib/hooks/usePostMutations';
import { cn } from '@/lib/utils/cn';

interface InteractionButtonsProps {
  postId: number;
  likes: number;
  retweets: number;
  comments: number;
  isLiked: boolean;
  isRetweeted: boolean;
  onCommentClick?: () => void;
}

export default function InteractionButtons({
  postId,
  likes,
  retweets,
  comments,
  isLiked,
  isRetweeted,
  onCommentClick,
}: InteractionButtonsProps) {
  const toggleLike = useToggleLike();
  const toggleRetweet = useToggleRetweet();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike.mutate(postId);
  };

  const handleRetweet = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleRetweet.mutate(postId);
  };

  return (
    <div className="flex items-center gap-6">
      {/* Like */}
      <button
        onClick={handleLike}
        className="flex items-center gap-2 text-text-secondary hover:text-like transition-colors group"
      >
        <motion.div
          whileTap={{ scale: 0.8 }}
          className={cn(
            'p-2 rounded-full group-hover:bg-like/10 transition-colors',
            isLiked && 'bg-like/10'
          )}
        >
          <Heart
            size={18}
            className={cn(isLiked && 'fill-like text-like')}
          />
        </motion.div>
        <span className={cn('text-sm', isLiked && 'text-like font-medium')}>
          {likes}
        </span>
      </button>

      {/* Retweet */}
      <button
        onClick={handleRetweet}
        className="flex items-center gap-2 text-text-secondary hover:text-retweet transition-colors group"
      >
        <motion.div
          whileTap={{ scale: 0.8 }}
          className={cn(
            'p-2 rounded-full group-hover:bg-retweet/10 transition-colors',
            isRetweeted && 'bg-retweet/10'
          )}
        >
          <Repeat2
            size={18}
            className={cn(isRetweeted && 'text-retweet')}
          />
        </motion.div>
        <span
          className={cn('text-sm', isRetweeted && 'text-retweet font-medium')}
        >
          {retweets}
        </span>
      </button>

      {/* Comment */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCommentClick?.();
        }}
        className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors group"
      >
        <motion.div
          whileTap={{ scale: 0.8 }}
          className="p-2 rounded-full group-hover:bg-primary/10 transition-colors"
        >
          <MessageCircle size={18} />
        </motion.div>
        <span className="text-sm">{comments}</span>
      </button>
    </div>
  );
}
