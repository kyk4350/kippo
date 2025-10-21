import { Post } from '@/types/post';

const STORAGE_KEY = 'kippo_posts';

// localStorage에서 게시물 불러오기
export const loadPostsFromStorage = (): Post[] => {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load posts from localStorage:', error);
    return [];
  }
};

// localStorage에 게시물 저장
export const savePostsToStorage = (posts: Post[]): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error('Failed to save posts to localStorage:', error);
  }
};

// localStorage 초기화 (개발용)
export const clearStorage = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};
