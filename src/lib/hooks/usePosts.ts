import { useInfiniteQuery } from "@tanstack/react-query";
import { getPosts } from "@/lib/api/posts";

interface UsePostsOptions {
  category?: number | null;
  sortBy?: "latest" | "popular";
  limit?: number;
}

export const usePosts = ({
  category,
  sortBy = "latest",
  limit = 10,
}: UsePostsOptions = {}) => {
  return useInfiniteQuery({
    queryKey: ["posts", { category, sortBy, limit }],

    queryFn: async ({ pageParam = 1 }) => {
      const response = await getPosts({
        page: pageParam,
        limit,
        category: category ?? undefined,
        sortBy,
      });

      // API 응답에서 data 추출
      return response.data;
    },

    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    // refetchInterval: 1000 * 60 * 2, // 2분마다
  });
};
