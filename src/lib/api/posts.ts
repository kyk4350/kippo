import { mockPosts } from '@/data/mockPosts';
import { Post } from '@/types/post';
import { GetPostsParams, GetPostsResponse } from '@/types/api';
import { loadPostsFromStorage, savePostsToStorage } from '@/lib/utils/storage';

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
      const storedIds = new Set(storedPosts.map(p => p.id));
      const uniqueMockPosts = mockPosts.filter(p => !storedIds.has(p.id));
      postsStore = [...storedPosts, ...uniqueMockPosts] as Post[];
    } else {
      // localStorage가 비어있으면 mockPosts 사용
      postsStore = [...mockPosts] as Post[];
    }
    isInitialized = true;
  }
  return postsStore;
};

// 게시물 목록 조회
export const getPosts = async (
  params: GetPostsParams
): Promise<GetPostsResponse> => {
  const { page, limit, category, sortBy = 'latest' } = params;

  // 네트워크 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 800));

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

  return {
    posts,
    nextPage: hasMore ? page + 1 : null,
    hasMore,
    total,
  };
};

// 좋아요 토글
export const toggleLike = async (postId: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const store = getPostsStore();
  const post = store.find(p => p.id === postId);
  if (post) {
    post.isLiked = !post.isLiked;
    post.likes = post.isLiked ? post.likes + 1 : post.likes - 1;
    savePostsToStorage(store);
  }
};

// 리트윗 토글
export const toggleRetweet = async (postId: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const store = getPostsStore();
  const post = store.find(p => p.id === postId);
  if (post) {
    post.isRetweeted = !post.isRetweeted;
    post.retweets = post.isRetweeted ? post.retweets + 1 : post.retweets - 1;
    savePostsToStorage(store);
  }
};

// 게시물 작성
export interface CreatePostParams {
  content: string;
  images: string[];
  category: number;
}

export const createPost = async (params: CreatePostParams): Promise<Post> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const { currentUser } = await import('@/data/mockUser');
  const { mockCategories } = await import('@/data/mockCategories');

  const categoryName = mockCategories.find(c => c.id === params.category)?.name || '';

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

// 댓글 작성
export const createComment = async (postId: number, content: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { currentUser } = await import('@/data/mockUser');

  const store = getPostsStore();
  const post = store.find(p => p.id === postId);
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

// 댓글 좋아요 토글
export const toggleCommentLike = async (
  postId: number,
  commentCreatedAt: string
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const store = getPostsStore();
  const post = store.find((p) => p.id === postId);

  if (post) {
    // createdAt으로 댓글 찾기 (고유 식별자로 사용)
    const comment = post.commentList.find((c) => c.createdAt === commentCreatedAt);
    if (comment) {
      comment.isLiked = !comment.isLiked;
      comment.likes = comment.isLiked ? comment.likes + 1 : comment.likes - 1;
      savePostsToStorage(store);
    }
  }
};
