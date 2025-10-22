import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  toggleLike as toggleLikeApi,
  toggleRetweet as toggleRetweetApi,
  createPost as createPostApi,
  createComment as createCommentApi,
  toggleCommentLike as toggleCommentLikeApi,
  CreatePostParams,
} from "@/lib/api/posts";
import { currentUser } from "@/data/mockUser";
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

      // 롤백용 데이터 백업 (모든 posts 쿼리의 데이터)
      const previousQueries = queryClient.getQueriesData<InfinitePostsData>({
        queryKey: ["posts"],
      });

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

      return { previousQueries }; // 백업 데이터 반환
    },

    // 2. onError: 서버 호출 실패시 실행
    onError: (_err, _postId, context) => {
      // 실패시 이전 데이터로 롤백
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      toast.error("좋아요 처리에 실패했습니다");
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

      // 롤백용 데이터 백업
      const previousQueries = queryClient.getQueriesData<InfinitePostsData>({
        queryKey: ["posts"],
      });

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

      return { previousQueries };
    },

    onError: (_err, _postId, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("리트윗 처리에 실패했습니다");
    },
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
      toast.success("게시물이 작성되었습니다");
    },

    onError: () => {
      toast.error("게시물 작성에 실패했습니다");
    },
  });
};

/**
 * 댓글 작성
 * 서버 응답 후 캐시 직접 업데이트 (refetch 없이 성능 최적화)
 * - 대신 onSuccess에서 캐시만 업데이트하여 불필요한 refetch 방지
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content }: { postId: number; content: string }) =>
      createCommentApi(postId, content),

    onSuccess: (_data, { postId, content }) => {
      // refetch 대신 해당 게시물만 캐시 업데이트
      // Mock API가 이미 postsStore를 업데이트했으므로
      // 캐시에만 새 댓글을 추가하면 됨

      // 실제 API 연동 시: _data를 서버 응답 데이터로 받아서 사용
      // const serverComment = _data; // 서버가 반환한 댓글 (id, createdAt 등 포함)

      queryClient.setQueriesData<InfinitePostsData>(
        { queryKey: ["posts"] },
        (old) => {
          if (!old) return old;

          // Mock 환경: 클라이언트에서 댓글 객체 생성
          // 실제 API 환경: 서버 응답(serverComment)을 그대로 사용해야 함
          const newComment = {
            author: currentUser,
            content,
            createdAt: new Date().toISOString(),
            likes: 0,
            isLiked: false,
          };
          // 실제 사용: const newComment = serverComment;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post: Post) =>
                post.id === postId
                  ? {
                      ...post,
                      commentList: [newComment, ...post.commentList],
                      //             ↑ 실제 API: serverComment 사용
                      comments: post.comments + 1,
                    }
                  : post
              ),
            })),
          };
        }
      );
      // API 호출 0번으로 최적화!
    },

    onError: () => {
      toast.error("댓글 작성에 실패했습니다");
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

      // 롤백용 데이터 백업
      const previousQueries = queryClient.getQueriesData<InfinitePostsData>({
        queryKey: ["posts"],
      });

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

      return { previousQueries };
    },

    onError: (_err, _variables, context) => {
      // 에러 발생 시 이전 상태로 롤백
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      toast.error("댓글 좋아요 처리에 실패했습니다");
    },
  });
};
