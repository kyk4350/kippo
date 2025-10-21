import { User } from './user';

export interface Comment {
  author: User;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}
