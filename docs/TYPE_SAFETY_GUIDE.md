# TypeScript 타입 안전성 가이드

## 목차

1. [기본 원칙](#기본-원칙)
2. [any vs unknown vs 제네릭](#any-vs-unknown-vs-제네릭)
3. [TanStack Query에서 제네릭 사용](#tanstack-query에서-제네릭-사용)
4. [실전 예제](#실전-예제)
5. [체크리스트](#체크리스트)

---

## 기본 원칙

### 해야 할 것

- 모든 변수, 함수, 컴포넌트에 **명시적 타입 정의**
- 라이브러리에서 제네릭 지원 시 **제네릭 우선 사용**
- 타입 추론이 명확할 때만 타입 생략
- interface 우선 사용 (union/intersection 필요 시 type 사용)

### 하지 말아야 할 것

- `any` 타입 사용 (타입 체크 완전 무력화)
- `unknown` 무분별 사용 (타입 가드 없이 사용)
- 타입 단언(`as`) 남발 (제네릭으로 해결 가능한 경우)
- 암묵적 `any` (noImplicitAny 항상 활성화)

---

## any vs unknown vs 제네릭

### 1. any - 절대 사용 금지

```typescript
// 나쁜 예: any는 모든 타입 체크를 무력화
function processData(data: any) {
  return data.pages.map((page) => page.posts); // 오타나 잘못된 접근도 잡지 못함
}

// 문제점:
// - IDE 자동완성 없음
// - 컴파일 타임 에러 검출 불가
// - 런타임 에러 발생 가능성 높음
// - TypeScript를 쓰는 의미가 없어짐
```

### 2. unknown - 불가피한 경우만 사용

```typescript
// 제한적 사용: 외부 API 응답 등 타입을 알 수 없는 경우
function parseExternalAPI(response: unknown) {
  // 타입 가드로 안전하게 사용
  if (typeof response === "object" && response !== null) {
    if ("data" in response) {
      return response.data;
    }
  }
  throw new Error("Invalid response");
}

// 문제점:
// - 매번 타입 가드 필요
// - 코드 복잡도 증가
// - 개발자 실수 가능성
```

### 3. 제네릭 - 최선의 선택

```typescript
// 좋은 예: 제네릭으로 타입 안전성 확보
interface ApiResponse<T> {
  data: T;
  status: number;
}

function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  return fetch(url).then((res) => res.json());
}

// 사용
const result = await fetchData<User[]>("/api/users");
result.data.map((user) => user.name); // 자동완성 완벽 지원
```

---

## TanStack Query에서 제네릭 사용

### 왜 제네릭을 사용해야 하는가?

TanStack Query는 데이터 타입을 알 수 없기 때문에 내부적으로 `unknown`을 반환합니다.
**제네릭을 사용하면 타입 안전성을 확보하면서도 코드가 간결해집니다.**

### 나쁜 예: any 사용

```typescript
queryClient.setQueriesData({ queryKey: ["posts"] }, (old: any) => {
  if (!old) return old;

  // 문제:
  // - old.pages 접근 시 타입 체크 없음
  // - 오타도 컴파일 에러 없이 통과
  // - 런타임 에러 발생 가능
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      posts: page.posts.map((post) => ({ ...post, isLiked: true })),
    })),
  };
});
```

### 개선된 예: unknown + 타입 단언

```typescript
queryClient.setQueriesData({ queryKey: ["posts"] }, (old: unknown) => {
  if (!old) return old;

  // 문제:
  // - 매번 타입 단언 필요
  // - 코드 가독성 저하
  // - 타입 단언이 틀릴 수 있음
  const data = old as InfinitePostsData;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      posts: page.posts.map((post) => ({ ...post, isLiked: true })),
    })),
  };
});
```

### 최선의 예: 제네릭 사용

```typescript
// 1. 먼저 인터페이스 정의
interface InfinitePostsData {
  pages: GetPostsResponse[];
  pageParams: number[];
}

// 2. 제네릭으로 타입 지정
queryClient.setQueriesData<InfinitePostsData>(
  { queryKey: ["posts"] },
  (old) => {
    // old는 자동으로 InfinitePostsData | undefined
    if (!old) return old;

    // 장점:
    // - 타입 단언 불필요
    // - IDE 자동완성 완벽 지원
    // - 컴파일 타임 타입 체크
    // - 코드 간결성
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        posts: page.posts.map((post) => ({ ...post, isLiked: true })),
      })),
    };
  }
);
```

---

## 실전 예제

### 예제 1: 낙관적 업데이트 (Optimistic Update)

```typescript
// src/lib/hooks/usePostMutations.ts

export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => toggleLikeApi(postId),

    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousData = queryClient.getQueryData(["posts"]);

      // 제네릭 사용으로 타입 안전성 확보
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
        queryClient.setQueryData(["posts"], context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};
```

### 예제 2: useInfiniteQuery

```typescript
// src/lib/hooks/usePosts.ts

interface UsePostsOptions {
  category?: number;
  sortBy?: "latest" | "popular";
  limit?: number;
}

export const usePosts = ({
  category,
  sortBy = "latest",
  limit = 10,
}: UsePostsOptions = {}) => {
  // 제네릭으로 반환 타입 명시
  return useInfiniteQuery<
    GetPostsResponse, // 각 페이지 데이터 타입
    Error, // 에러 타입
    InfiniteData<GetPostsResponse>, // 전체 데이터 타입
    QueryKey, // 쿼리 키 타입
    number // pageParam 타입
  >({
    queryKey: ["posts", { category, sortBy, limit }],

    queryFn: async ({ pageParam = 1 }) => {
      return getPosts({
        page: pageParam,
        limit,
        category,
        sortBy,
      });
    },

    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
};
```

### 예제 3: 커스텀 훅 타입 정의

```typescript
// 나쁜 예
export const useCustomHook = () => {
  const [data, setData] = useState<any>(null); // any 사용
  return { data, setData };
};

// 좋은 예
interface CustomHookData {
  id: number;
  name: string;
  createdAt: string;
}

export const useCustomHook = () => {
  const [data, setData] = useState<CustomHookData | null>(null);
  return { data, setData };
};

// 더 나은 예: 제네릭 훅
export const useCustomHook = <T>(initialValue: T | null = null) => {
  const [data, setData] = useState<T | null>(initialValue);
  return { data, setData };
};

// 사용
const { data } = useCustomHook<User>(null);
```

---

## 체크리스트

### 코드 작성 시

- [ ] `any` 타입 사용하지 않았는가?
- [ ] 라이브러리 API에서 제네릭 지원 시 제네릭 사용했는가?
- [ ] `unknown` 사용 시 타입 가드 추가했는가?
- [ ] 타입 단언(`as`) 대신 제네릭으로 해결할 수 있는가?
- [ ] 모든 함수와 변수에 명시적 타입 정의했는가?

### 코드 리뷰 시

- [ ] IDE에서 자동완성이 제대로 작동하는가?
- [ ] 컴파일 타임에 타입 에러를 잡을 수 있는가?
- [ ] 타입 안전성이 보장되는가?
- [ ] 코드 가독성이 좋은가?

### 빌드 전

- [ ] TypeScript 에러 0개
- [ ] ESLint 경고 0개
- [ ] `npm run build` 성공

---

## 참고 자료

- [TypeScript 공식 문서 - Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [TanStack Query - TypeScript](https://tanstack.com/query/latest/docs/react/typescript)

---

## 변경 이력

- 2025-10-21: 초기 작성 - TanStack Query 제네릭 사용 가이드 추가
