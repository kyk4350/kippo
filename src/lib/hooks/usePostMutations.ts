import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  toggleLike as toggleLikeApi,
  toggleRetweet as toggleRetweetApi,
  createPost as createPostApi,
  createComment as createCommentApi,
  toggleCommentLike as toggleCommentLikeApi,
  CreatePostParams,
} from '@/lib/api/posts';
import { Post } from '@/types/post';
import { InfinitePostsData } from '@/types/api';
import { currentUser } from '@/data/mockUser';

/**
 * 좋아요 토글 - 낙관적 업데이트
 *
 * 제네릭 사용 이유:
 * - TanStack Query의 제네릭을 활용하여 타입 안전성 확보
 * - any/unknown 대신 명시적 타입으로 자동완성 및 타입 체크 지원
 * - 타입 단언(as) 불필요, TypeScript가 자동으로 타입 추론
 */
export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => toggleLikeApi(postId),

    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousData = queryClient.getQueryData(['posts']);

      queryClient.setQueriesData<InfinitePostsData>(
        { queryKey: ['posts'] },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post: Post) =>
                post.id === postId
                  ? {
                      ...post,
                      isLiked: !post.isLiked,
                      likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                    }
                  : post
              ),
            })),
          };
        }
      );

      return { previousData };
    },

    onError: (_err, _postId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['posts'], context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

/**
 * 리트윗 토글 - 낙관적 업데이트
 */
export const useToggleRetweet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => toggleRetweetApi(postId),

    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousData = queryClient.getQueryData(['posts']);

      queryClient.setQueriesData<InfinitePostsData>(
        { queryKey: ['posts'] },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post: Post) =>
                post.id === postId
                  ? {
                      ...post,
                      isRetweeted: !post.isRetweeted,
                      retweets: post.isRetweeted
                        ? post.retweets - 1
                        : post.retweets + 1,
                    }
                  : post
              ),
            })),
          };
        }
      );

      return { previousData };
    },

    onError: (_err, _postId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['posts'], context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// 게시물 작성
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreatePostParams) => createPostApi(params),

    onSuccess: () => {
      // 게시물 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

/**
 * 댓글 작성 - 낙관적 업데이트
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content }: { postId: number; content: string }) =>
      createCommentApi(postId, content),

    onMutate: async ({ postId, content }) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousData = queryClient.getQueryData(['posts']);

      // 낙관적 업데이트: 즉시 UI에 댓글 추가
      queryClient.setQueriesData<InfinitePostsData>(
        { queryKey: ['posts'] },
        (old) => {
          if (!old) return old;

          const newComment = {
            author: currentUser,
            content,
            createdAt: new Date().toISOString(),
            likes: 0,
            isLiked: false,
          };

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post: Post) =>
                post.id === postId
                  ? {
                      ...post,
                      commentList: [newComment, ...post.commentList],
                    }
                  : post
              ),
            })),
          };
        }
      );

      return { previousData };
    },

    onError: (_err, _variables, context) => {
      // 에러 발생 시 이전 상태로 롤백
      if (context?.previousData) {
        queryClient.setQueryData(['posts'], context.previousData);
      }
    },

    onSettled: () => {
      // 최종적으로 서버 데이터와 동기화
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

/**
 * 댓글 좋아요 토글 - 낙관적 업데이트
 */
export const useToggleCommentLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      commentCreatedAt,
    }: {
      postId: number;
      commentCreatedAt: string;
    }) => toggleCommentLikeApi(postId, commentCreatedAt),

    onMutate: async ({ postId, commentCreatedAt }) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousData = queryClient.getQueryData(['posts']);

      // 낙관적 업데이트: 즉시 UI에 좋아요 반영
      queryClient.setQueriesData<InfinitePostsData>(
        { queryKey: ['posts'] },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post: Post) => {
                if (post.id === postId) {
                  return {
                    ...post,
                    commentList: post.commentList.map((comment) => {
                      if (comment.createdAt === commentCreatedAt) {
                        return {
                          ...comment,
                          isLiked: !comment.isLiked,
                          likes: comment.isLiked
                            ? comment.likes - 1
                            : comment.likes + 1,
                        };
                      }
                      return comment;
                    }),
                  };
                }
                return post;
              }),
            })),
          };
        }
      );

      return { previousData };
    },

    onError: (_err, _variables, context) => {
      // 에러 발생 시 이전 상태로 롤백
      if (context?.previousData) {
        queryClient.setQueryData(['posts'], context.previousData);
      }
    },

    onSettled: () => {
      // 최종적으로 서버 데이터와 동기화
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
