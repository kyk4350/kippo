/**
 * Posts API
 * Mock 데이터를 활용한 게시물 관련 API 함수들
 *
 * 현재: mockClient 사용 (Mock 데이터 + 딜레이 시뮬레이션)
 *
 * 에러 처리 테스트:
 * - mockClient.ts의 ENABLE_MOCK_ERROR를 true로 설정
 * - 모든 API 요청이 실패하여 Toast 에러 메시지 및 낙관적 업데이트 롤백 확인 가능
 *
 * 실제 API 전환 시:
 *
 * 1. import 변경
 *    - import { mockDelay, mockApiError, ... } from './mockClient';
 *    + import apiClient from './apiClient';
 *
 * 2. 함수 수정 예시 (getPosts)
 *    Before:
 *      await mockDelay();
 *      mockApiError(...);
 *      // ... 필터링, 정렬, 페이지네이션
 *      return createSuccessResponse({ posts, nextPage, hasMore, total });
 *
 *    After:
 *      const { data } = await apiClient.get<ApiResponse<GetPostsResponse>>('/posts', {
 *        params: { page, limit, category, sortBy }
 *      });
 *      return data;
 *
 * 3. 기타 함수들도 동일한 패턴 적용 (mockApiError 호출 제거)
 *    POST: apiClient.post('/posts', requestBody)
 *    PUT: apiClient.put(`/posts/${id}`, requestBody)
 *    DELETE: apiClient.delete(`/posts/${id}`)
 */

import { mockPosts } from "@/data/mockPosts";
import { Post } from "@/types/post";
import { GetPostsParams, GetPostsResponse } from "@/types/api";
import {
  mockDelay,
  mockApiError,
  createSuccessResponse,
  logApiCall,
  logApiResponse,
} from "./mockClient";
import { ApiResponse } from "./types";

// 실제 API 연동 시 사용 (현재는 주석 처리)
// import apiClient from './apiClient';

// 전역 포스트 저장소 (mockPosts만 사용, localStorage 제거)
const postsStore: Post[] = [...mockPosts] as Post[];

const getPostsStore = (): Post[] => {
  return postsStore;
};

/**
 * 게시물 목록 조회
 * GET /api/posts
 */
export const getPosts = async (
  params: GetPostsParams
): Promise<ApiResponse<GetPostsResponse>> => {
  const { page, limit, category, sortBy = "latest" } = params;

  logApiCall("GET", "/api/posts", params);

  // 네트워크 시뮬레이션 (800ms)
  await mockDelay();

  // postsStore 배열 복사 (post 객체는 참조 유지)
  let filteredPosts = [...getPostsStore()];

  // 카테고리 필터
  if (category) {
    filteredPosts = filteredPosts.filter((post) => post.category === category);
  }

  // 정렬
  if (sortBy === "popular") {
    filteredPosts.sort((a, b) => b.likes + b.retweets - (a.likes + a.retweets));
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

  logApiResponse("/api/posts", response);

  return response;
};

/**
 * 좋아요 토글
 * POST /api/posts/:id/like
 */
export const toggleLike = async (postId: number): Promise<void> => {
  logApiCall("POST", `/api/posts/${postId}/like`);
  await mockDelay(300);
  mockApiError(`/api/posts/${postId}/like`);

  const store = getPostsStore();
  const post = store.find((p) => p.id === postId);
  if (post) {
    post.isLiked = !post.isLiked;
    post.likes = post.isLiked ? post.likes + 1 : post.likes - 1;
  }
};

/**
 * 리트윗 토글
 * POST /api/posts/:id/retweet
 */
export const toggleRetweet = async (postId: number): Promise<void> => {
  logApiCall("POST", `/api/posts/${postId}/retweet`);
  await mockDelay(300);
  mockApiError(`/api/posts/${postId}/retweet`);

  const store = getPostsStore();
  const post = store.find((p) => p.id === postId);
  if (post) {
    post.isRetweeted = !post.isRetweeted;
    post.retweets = post.isRetweeted ? post.retweets + 1 : post.retweets - 1;
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
  logApiCall("POST", "/api/posts", params);
  await mockDelay(1000);
  mockApiError("/api/posts");

  const { currentUser } = await import("@/data/mockUser");
  const { mockCategories } = await import("@/data/mockCategories");

  const categoryName =
    mockCategories.find((c) => c.id === params.category)?.name || "";

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

  return newPost;
};

/**
 * 댓글 작성
 * POST /api/posts/:id/comments
 *
 * 불변성 유지 패턴:
 * - 기존 post 객체를 직접 수정하지 않고 새로운 객체로 교체
 * - 이유: React memo가 참조 비교로 변경 감지를 하기 때문
 * - 효과: 댓글이 추가된 PostCard만 리렌더링 (나머지는 스킵)
 */
export const createComment = async (
  postId: number,
  content: string
): Promise<void> => {
  logApiCall("POST", `/api/posts/${postId}/comments`, { content });
  await mockDelay(500);
  mockApiError(`/api/posts/${postId}/comments`);

  // 현재 로그인한 사용자 정보 가져오기
  const { currentUser } = await import("@/data/mockUser");

  // 전역 메모리의 postsStore 가져오기
  const store = getPostsStore();

  // 댓글을 추가할 post의 인덱스 찾기
  // findIndex 사용 이유: 배열 요소를 교체하려면 인덱스가 필요
  const postIndex = store.findIndex((p) => p.id === postId);

  if (postIndex !== -1) {
    // 기존 post 객체 참조 가져오기
    const post = store[postIndex];

    // 새 댓글 객체 생성
    const newComment = {
      author: currentUser,
      content,
      createdAt: new Date().toISOString(), // 서버 시간 시뮬레이션
      likes: 0,
      isLiked: false,
    };

    // 불변성 유지를 위한 새로운 post 객체 생성
    // 직접 수정(post.commentList.unshift) 대신 새 객체 생성
    store[postIndex] = {
      ...post, // 기존 필드 모두 복사 (id, author, content, likes 등)
      commentList: [newComment, ...post.commentList], // 새 배열 생성 (참조 변경)
      comments: post.comments + 1, // 댓글 개수 증가
    };

    // 왜 이렇게 해야 하나?
    // 1. refetch 시 getPosts가 store를 반환
    // 2. store[postIndex]는 새로운 객체 참조 (메모리 주소 변경)
    // 3. PostCard의 React.memo가 commentList 참조 비교
    // 4. 참조가 달라졌으므로 해당 PostCard만 리렌더링
    // 5. 나머지 PostCard는 참조가 같아서 리렌더링 스킵 (성능 최적화)
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
  logApiCall("POST", `/api/posts/${postId}/comments/${commentCreatedAt}/like`);
  await mockDelay(300);
  mockApiError(`/api/posts/${postId}/comments/${commentCreatedAt}/like`);

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
    }
  }
};
