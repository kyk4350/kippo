/**
 * Posts API
 * Mock 데이터를 활용한 게시물 관련 API 함수들
 *
 * 현재: mockClient 사용 (Mock 데이터 + 딜레이 시뮬레이션)
 * 실제 API 전환 시:
 *
 * 1. import 변경
 *    - import { mockDelay, ... } from './mockClient';
 *    + import apiClient from './apiClient';
 *
 * 2. 함수 수정 예시 (getPosts)
 *    Before:
 *      await mockDelay();
 *      // ... 필터링, 정렬, 페이지네이션
 *      return createSuccessResponse({ posts, nextPage, hasMore, total });
 *
 *    After:
 *      const { data } = await apiClient.get<ApiResponse<GetPostsResponse>>('/posts', {
 *        params: { page, limit, category, sortBy }
 *      });
 *      return data;
 *
 * 3. 기타 함수들도 동일한 패턴 적용
 *    POST: apiClient.post('/posts', requestBody)
 *    PUT: apiClient.put(`/posts/${id}`, requestBody)
 *    DELETE: apiClient.delete(`/posts/${id}`)
 */

import { mockPosts } from '@/data/mockPosts';
import { Post } from '@/types/post';
import { GetPostsParams, GetPostsResponse } from '@/types/api';
import { loadPostsFromStorage, savePostsToStorage } from '@/lib/utils/storage';
import {
  mockDelay,
  createSuccessResponse,
  logApiCall,
  logApiResponse,
} from './mockClient';
import { ApiResponse } from './types';

// 실제 API 연동 시 사용 (현재는 주석 처리)
// import apiClient from './apiClient';

// 전역 포스트 저장소 (localStorage에서 불러온 데이터 + mockPosts 병합)
let postsStore: Post[] = [];
let isInitialized = false;

const getPostsStore = (): Post[] => {
  if (!isInitialized) {
    // 처음 한번만 localStorage에서 불러오기
    const storedPosts = loadPostsFromStorage();

    if (storedPosts.length > 0) {
      // localStorage에 저장된 게시물이 있으면 mockPosts와 병합
      // storedPosts의 ID와 중복되지 않는 mockPosts만 추가
      const storedIds = new Set(storedPosts.map((p) => p.id));
      const uniqueMockPosts = mockPosts.filter((p) => !storedIds.has(p.id));
      postsStore = [...storedPosts, ...uniqueMockPosts] as Post[];
    } else {
      // localStorage가 비어있으면 mockPosts 사용
      postsStore = [...mockPosts] as Post[];
    }
    isInitialized = true;
  }
  return postsStore;
};

/**
 * 게시물 목록 조회
 * GET /api/posts
 */
export const getPosts = async (
  params: GetPostsParams
): Promise<ApiResponse<GetPostsResponse>> => {
  const { page, limit, category, sortBy = 'latest' } = params;

  logApiCall('GET', '/api/posts', params);

  // 네트워크 시뮬레이션 (800ms)
  await mockDelay();

  let filteredPosts = [...getPostsStore()];

  // 카테고리 필터
  if (category) {
    filteredPosts = filteredPosts.filter((post) => post.category === category);
  }

  // 정렬
  if (sortBy === 'popular') {
    filteredPosts.sort(
      (a, b) => b.likes + b.retweets - (a.likes + a.retweets)
    );
  } else {
    filteredPosts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const total = filteredPosts.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const posts = filteredPosts.slice(start, end);
  const hasMore = end < total;

  const response = createSuccessResponse<GetPostsResponse>({
    posts,
    nextPage: hasMore ? page + 1 : null,
    hasMore,
    total,
  });

  logApiResponse('/api/posts', response);

  return response;
};

/**
 * 좋아요 토글
 * POST /api/posts/:id/like
 */
export const toggleLike = async (postId: number): Promise<void> => {
  logApiCall('POST', `/api/posts/${postId}/like`);
  await mockDelay(300);

  const store = getPostsStore();
  const post = store.find((p) => p.id === postId);
  if (post) {
    post.isLiked = !post.isLiked;
    post.likes = post.isLiked ? post.likes + 1 : post.likes - 1;
    savePostsToStorage(store);
  }
};

/**
 * 리트윗 토글
 * POST /api/posts/:id/retweet
 */
export const toggleRetweet = async (postId: number): Promise<void> => {
  logApiCall('POST', `/api/posts/${postId}/retweet`);
  await mockDelay(300);

  const store = getPostsStore();
  const post = store.find((p) => p.id === postId);
  if (post) {
    post.isRetweeted = !post.isRetweeted;
    post.retweets = post.isRetweeted ? post.retweets + 1 : post.retweets - 1;
    savePostsToStorage(store);
  }
};

/**
 * 게시물 작성
 * POST /api/posts
 */
export interface CreatePostParams {
  content: string;
  images: string[];
  category: number;
}

export const createPost = async (params: CreatePostParams): Promise<Post> => {
  logApiCall('POST', '/api/posts', params);
  await mockDelay(1000);

  const { currentUser } = await import('@/data/mockUser');
  const { mockCategories } = await import('@/data/mockCategories');

  const categoryName =
    mockCategories.find((c) => c.id === params.category)?.name || '';

  const newPost: Post = {
    id: Date.now(),
    author: currentUser,
    content: params.content,
    images: params.images,
    category: params.category,
    categoryName,
    createdAt: new Date().toISOString(),
    likes: 0,
    retweets: 0,
    comments: 0,
    isLiked: false,
    isRetweeted: false,
    hasMoreComments: false,
    commentList: [],
  };

  // postsStore 배열 맨 앞에 추가
  const store = getPostsStore();
  store.unshift(newPost);
  savePostsToStorage(store);

  return newPost;
};

/**
 * 댓글 작성
 * POST /api/posts/:id/comments
 */
export const createComment = async (
  postId: number,
  content: string
): Promise<void> => {
  logApiCall('POST', `/api/posts/${postId}/comments`, { content });
  await mockDelay(500);

  const { currentUser } = await import('@/data/mockUser');

  const store = getPostsStore();
  const post = store.find((p) => p.id === postId);
  if (post) {
    const newComment = {
      author: currentUser,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };

    post.commentList.unshift(newComment);
    post.comments += 1;
    savePostsToStorage(store);
  }
};

/**
 * 댓글 좋아요 토글
 * POST /api/posts/:id/comments/:commentId/like
 */
export const toggleCommentLike = async (
  postId: number,
  commentCreatedAt: string
): Promise<void> => {
  logApiCall('POST', `/api/posts/${postId}/comments/${commentCreatedAt}/like`);
  await mockDelay(300);

  const store = getPostsStore();
  const post = store.find((p) => p.id === postId);

  if (post) {
    // createdAt으로 댓글 찾기 (고유 식별자로 사용)
    const comment = post.commentList.find(
      (c) => c.createdAt === commentCreatedAt
    );
    if (comment) {
      comment.isLiked = !comment.isLiked;
      comment.likes = comment.isLiked ? comment.likes + 1 : comment.likes - 1;
      savePostsToStorage(store);
    }
  }
};
