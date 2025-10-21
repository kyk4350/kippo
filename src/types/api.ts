import { Post } from './post';

export interface GetPostsParams {
  page: number;
  limit: number;
  category?: number;
  sortBy?: 'latest' | 'popular';
}

export interface GetPostsResponse {
  posts: Post[];
  nextPage: number | null;
  hasMore: boolean;
  total: number;
}

export interface InfinitePostsData {
  pages: GetPostsResponse[];
  pageParams: number[];
}
