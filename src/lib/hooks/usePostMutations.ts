import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  toggleLike as toggleLikeApi,
  toggleRetweet as toggleRetweetApi,
  createPost as createPostApi,
  createComment as createCommentApi,
  toggleCommentLike as toggleCommentLikeApi,
  CreatePostParams,
} from "@/lib/api/posts";
import { Post } from "@/types/post";
import { InfinitePostsData } from "@/types/api";

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
    mutationFn: (postId: number) => toggleLikeApi(postId), // 서버 호출

    // 1. onMutate: 서버 호출 직전 즉시 실행
    onMutate: async (postId) => {
      // 진행중인 refetch 취소 (충돌 방지)
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      // 롤백용 데이터 백업
      const previousData = queryClient.getQueryData(["posts"]);

      // 즉시 UI 업데이트
      queryClient.setQueriesData<InfinitePostsData>(
        { queryKey: ["posts"] },
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
                      isLiked: !post.isLiked, // 즉시 토글
                      likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                    }
                  : post
              ),
            })),
          };
        }
      );

      return { previousData }; // 백업 데이터 반환
    },

    // 2. onError: 서버 호출 실패시 실행
    onError: (_err, _postId, context) => {
      // 실패시 이전 데이터로 롤백
      if (context?.previousData) {
        queryClient.setQueryData(["posts"], context.previousData);
      }
    },

    // 3. onSettled 제거
    // 낙관적 업데이트로 이미 UI 반영됨
    // 서버 응답도 성공하면 데이터 일치 보장
    // 불필요한 전체 refetch 방지
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
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousData = queryClient.getQueryData(["posts"]);

      queryClient.setQueriesData<InfinitePostsData>(
        { queryKey: ["posts"] },
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
        queryClient.setQueryData(["posts"], context.previousData);
      }
    },

    // onSettled 제거 - 낙관적 업데이트로 이미 UI 반영됨
    // onSettled: () => {
    //   queryClient.invalidateQueries({ queryKey: ["posts"] });
    // },
  });
};

// 게시물 작성
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreatePostParams) => createPostApi(params),

    onSuccess: async () => {
      // 게시물 목록 새로고침
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

/**
 * 댓글 작성
 * 서버 응답 후 데이터 refetch
 *
 * NOTE: 낙관적 업데이트를 사용하지 않는 이유
 * - Comment 타입에 고유 id 필드가 없음 (createdAt을 식별자로 사용)
 * - 낙관적 업데이트 시 클라이언트 createdAt과 서버 createdAt 불일치
 * - 댓글 좋아요 기능이 정상 작동하지 않음
 * - 실제 데이터라면 Comment에 id 필드를 추가하고 낙관적 업데이트 사용 권장
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content }: { postId: number; content: string }) =>
      createCommentApi(postId, content),

    onSuccess: async () => {
      // 서버 응답 성공 후 즉시 리페치
      // refetchQueries 사용 이유: 같은 페이지에서 즉시 UI 반영 필요
      await queryClient.refetchQueries({ queryKey: ["posts"] });
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
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousData = queryClient.getQueryData(["posts"]);

      // 낙관적 업데이트: 즉시 UI에 좋아요 반영
      queryClient.setQueriesData<InfinitePostsData>(
        { queryKey: ["posts"] },
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
        queryClient.setQueryData(["posts"], context.previousData);
      }
    },
  });
};
