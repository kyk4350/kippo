# 개발 문서 (Development Documentation)

이 문서는 프로젝트 개발 과정에서 겪은 기술적 고민, 의사결정, 문제 해결 과정을 기록합니다.

## 목차

1. [아키텍처 설계](#아키텍처-설계)
2. [기술적 의사결정](#기술적-의사결정)
3. [성능 최적화](#성능-최적화)
4. [문제 해결 과정](#문제-해결-과정)
5. [에러 처리 전략](#에러-처리-전략)

---

## 아키텍처 설계

### 레이어 구조

프로젝트는 관심사 분리를 위해 3계층 구조로 설계했습니다.

```
UI Layer (Components)
    ↓
Business Logic Layer (Hooks)
    ↓
Data Layer (API)
```

#### 각 레이어의 역할

- **UI Layer**: 사용자 인터페이스 렌더링, 이벤트 처리
- **Business Logic Layer**: 데이터 변환, 상태 관리, 비즈니스 로직
- **Data Layer**: API 통신, 데이터 CRUD

#### 레이어 분리의 장점

1. 테스트 용이성 (각 레이어 독립적 테스트 가능)
2. 유지보수성 (변경 영향 범위 최소화)
3. 재사용성 (Hooks, API 함수 재사용)

### Mock API와 실제 API 전환 설계

현재는 Mock 데이터를 사용하지만, 실제 API로 전환이 쉽도록 설계했습니다.

#### 현재 구조 (Mock)

```typescript
// posts.ts
import { mockDelay, createSuccessResponse } from "./mockClient";

export const getPosts = async (params) => {
  await mockDelay();
  // Mock 데이터 반환
  return createSuccessResponse({ posts, nextPage, hasMore });
};
```

#### 실제 API 전환 시

```typescript
// posts.ts
import apiClient from "./apiClient";

export const getPosts = async (params) => {
  const { data } = await apiClient.get("/posts", { params });
  return data;
};
```

단순히 import만 변경하면 되도록 인터페이스를 동일하게 유지했습니다.

---

## 기술적 의사결정

### 1. TanStack Query 선택 이유

#### 고려한 대안

- Redux + Redux Toolkit
- Zustand만 사용
- React Context API

#### TanStack Query를 선택한 이유

1. **서버 상태 관리에 특화**: 캐싱, refetch, 낙관적 업데이트 기능 내장
2. **보일러플레이트 감소**: Redux 대비 코드량 50% 이상 감소
3. **자동 캐싱**: 동일한 쿼리 중복 호출 방지
4. **개발자 경험**: DevTools로 쿼리 상태 실시간 확인

#### 실제 코드 비교

```typescript
// TanStack Query (현재)
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ["posts", { category, sortBy }],
  queryFn: ({ pageParam }) => getPosts({ page: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});

// Redux로 구현 시 필요한 것들
// - actions, reducers, selectors 정의
// - loading, error 상태 별도 관리
// - 캐싱 로직 직접 구현
// - 무한 스크롤 로직 직접 구현
// → 200줄 이상의 보일러플레이트 필요
```

### 2. Zustand 선택 이유

TanStack Query와 함께 Zustand를 사용한 이유는 **용도 분리**입니다.

#### 역할 분담

- **TanStack Query**: 서버 상태 (게시물, 댓글 등)
- **Zustand**: 클라이언트 전역 상태 (필터, UI 상태)

#### Zustand를 선택한 이유

1. **가벼움**: Redux 대비 1/10 크기
2. **간단한 API**: 학습 곡선 낮음
3. **TypeScript 친화적**: 타입 추론 우수

```typescript
// filterStore.ts - 매우 간결
export const useFilterStore = create<FilterStore>((set) => ({
  category: null,
  sortBy: "latest",
  setCategory: (category) => set({ category }),
  setSortBy: (sortBy) => set({ sortBy }),
}));
```

### 3. react-simple-pull-to-refresh 선택 이유

모바일 네이티브 앱과 유사한 UX 제공을 위해 Pull-to-Refresh 기능 구현

```typescript
<PullToRefresh onRefresh={async () => await refetch()}>
  <PostList posts={posts} />
</PullToRefresh>
```

**선택 이유**: 간단한 API, 경량 (5KB), 터치 제스처 지원

### 4. react-dropzone 선택 이유

드래그 앤 드롭으로 직관적인 이미지 업로드 UX 제공

```typescript
const { getRootProps, getInputProps, isDragActive } = useDropzone({
  accept: { "image/*": [] },
  maxFiles: 4,
  onDrop: (acceptedFiles) => {
    /* 파일 처리 */
  },
});
```

**선택 이유**: 드래그 앤 드롭 + 클릭 지원, 파일 검증 내장, 접근성 우수

### 5. clsx + tailwind-merge 선택 이유

조건부 스타일링 간결화 및 Tailwind 클래스 충돌 방지

**선택 이유**: clsx로 조건부 className 간결화, tailwind-merge로 클래스 충돌 해결, 경량

### 6. Framer Motion 선택 이유

모달 등장/퇴장 애니메이션, 제스처 처리를 위한 선언적 애니메이션 라이브러리

```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
>
  <img src={image} alt="확대 이미지" />
</motion.div>
```

**선택 이유**: 선언적 API, GPU 가속, TypeScript 지원

### 3. 낙관적 업데이트 vs 비관적 업데이트

#### 낙관적 업데이트를 적용한 기능

- 좋아요
- 리트윗
- 댓글 좋아요

**이유**:

- 실패 확률 낮음 (단순 토글)
- 사용자 경험 중요 (즉각적인 피드백)
- 롤백 가능 (실패 시 이전 상태로 복구)

#### 비관적 업데이트를 적용한 기능

- 게시물 작성
- 댓글 작성

**이유**:

- 서버 검증 필요 (욕설 필터링, 길이 제한 등)
- 서버에서 생성되는 데이터 많음 (id, createdAt, mentions 등)
- 실패 시 롤백보다 에러 메시지가 더 명확

---

## 성능 최적화

### 1. 댓글 작성 시 refetch 제거

#### 문제 상황

댓글 1개 작성 시 6페이지(60개 게시물) 전체를 refetch하는 비효율 발생

```
사용자: 50번 게시물에 댓글 작성
  ↓
invalidateQueries({ queryKey: ["posts"] })
  ↓
API 6번 호출 (page 1~6)
  ↓
60개 게시물 데이터 재호출 (3초 소요)
```

#### 원인 분석

1. 쿼리키가 `["posts", {...}]` 하나로만 관리됨
2. 댓글이 `commentList`에 포함되어 있음 (쿼리키 분리 안 됨)
3. `invalidateQueries`는 쿼리키 단위로만 작동 (데이터 내부 특정 필드만 stale 불가)

#### 해결 방법: setQueriesData로 캐시 직접 업데이트

```typescript
// Before (invalidateQueries)
onSuccess: async () => {
  await queryClient.invalidateQueries({ queryKey: ["posts"] });
  // API 6번 호출
};

// After (setQueriesData)
onSuccess: (_data, { postId, content }) => {
  queryClient.setQueriesData({ queryKey: ["posts"] }, (old) => {
    // 캐시에서 postId 찾아서 commentList만 업데이트
    return { ...old /* 수정된 데이터 */ };
  });
  // API 0번 호출
};
```

#### 결과

- API 호출: 6번 → 0번
- 응답 시간: 3초 → 즉시
- 네트워크 비용 절감

#### 실제 API 환경 대비

Mock 환경에서는 클라이언트가 댓글 객체를 생성하지만, 실제 API에서는 서버 응답(`_data`)을 사용하도록 주석으로 명시했습니다.

```typescript
// Mock 환경
const newComment = {
  author: currentUser,
  content,
  createdAt: new Date().toISOString(),
  likes: 0,
  isLiked: false,
};
// 실제 사용: const newComment = serverComment;
```

### 2. React.memo를 통한 리렌더링 최적화

#### 문제

무한 스크롤로 60개 게시물이 로드된 상태에서 댓글 작성 시, 모든 PostCard가 리렌더링됨

#### 해결

```typescript
// PostCard.tsx
const MemoizedPostCard = memo(PostCard, (prevProps, nextProps) => {
  // 변경된 필드만 비교
  return (
    prevProps.post.likes === nextProps.post.likes &&
    prevProps.post.retweets === nextProps.post.retweets &&
    prevProps.post.isLiked === nextProps.post.isLiked &&
    prevProps.post.isRetweeted === nextProps.post.isRetweeted &&
    prevProps.post.commentList === nextProps.post.commentList
  );
});
```

#### 불변성 유지의 중요성

댓글 작성 시 Mock API에서 불변성을 유지하도록 구현했습니다.

```typescript
// posts.ts - createComment
// ❌ 직접 수정 (불변성 위반)
// post.commentList.unshift(newComment);

// ✅ 새 객체 생성 (불변성 유지)
store[postIndex] = {
  ...post,
  commentList: [newComment, ...post.commentList],
  comments: post.comments + 1,
};
```

**효과**: 댓글이 추가된 PostCard만 리렌더링, 나머지는 memo로 스킵

### 3. Intersection Observer 기반 상대적 시간 업데이트

#### 문제

모든 게시물의 상대적 시간을 1분마다 업데이트하면 성능 저하

#### 해결

화면에 보이는 게시물만 업데이트하도록 Intersection Observer 사용

```typescript
// useRelativeTime.ts
const useRelativeTime = (createdAt: string) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return; // 화면에 안 보이면 업데이트 안 함

    const interval = setInterval(() => {
      setRelativeTime(formatDistanceToNow(new Date(createdAt)));
    }, 60000);

    return () => clearInterval(interval);
  }, [isVisible, createdAt]);
};
```

### 4. Intersection Observer를 활용한 이미지 Lazy Loading

#### 문제 상황

모든 게시물의 이미지를 한 번에 로드하면 초기 로딩 시간이 길어지고 불필요한 네트워크 비용 발생

#### 해결 방법

Intersection Observer API로 뷰포트에 진입할 때만 이미지 로드

```typescript
// OptimizedImage.tsx
const OptimizedImage = ({ src, alt }: Props) => {
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // 한 번만 감지
        }
      },
      {
        rootMargin: "200px", // 뷰포트 진입 200px 전부터 로드 (체감 속도 향상)
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading="lazy" // 브라우저 네이티브 lazy loading과 병행
        />
      )}
    </div>
  );
};
```

#### 기술적 장점

1. **네이티브 브라우저 API**: 별도 라이브러리 불필요, 번들 크기 0 증가
2. **정확한 감지**: scroll 이벤트 대비 성능 우수 (requestAnimationFrame 내부 사용)
3. **rootMargin 활용**: 사용자가 스크롤하기 전 미리 로드하여 체감 속도 향상
4. **이중 최적화**: Intersection Observer + 브라우저 `loading="lazy"` 속성 병행

#### 성능 효과 (실측)

**측정 조건**: 초기 페이지 로드 시 스크롤 없이 화면에 보이는 콘텐츠만

**Lazy loading 미적용**:
- 전송량: 5,806 kB
- 완료 시간: 53.23초
- 이미지 로드 수: 17개

**Lazy loading 적용**:
- 전송량: 5,722 kB
- 완료 시간: 16.85초
- 이미지 로드 수: 12개

**개선 효과**:
- 네트워크 전송량: 84 kB 감소 (약 1.4%)
- 초기 로딩 시간: 36.38초 단축 (약 68% 개선)
- 이미지 로드 수: 5개 감소 (약 29% 감소)

**분석**:
- rootMargin: '200px' 설정으로 뷰포트 근처 이미지를 미리 로드하므로 전송량 차이는 작지만, 병렬 로딩 최적화로 인해 완료 시간이 크게 개선됨
- **주의**: 위 측정값은 Mock 환경(picsum.photos 랜덤 이미지 생성)에서의 결과이며, 외부 API 서버 응답 속도로 인해 절대 시간이 느림
- **실제 프로덕션 환경**: CDN + 최적화된 이미지(WebP, 적절한 해상도) 사용 시 1~2초 수준으로 크게 개선 예상

#### 브라우저 캐싱

- **첫 조회**: 이미지 다운로드 후 브라우저 캐시에 저장
- **재조회**: 캐시된 이미지 사용 (다운로드 없음)
- **개발 환경 제약**: `picsum.photos?random` 사용 시 같은 URL이어도 서버가 매번 다른 이미지 반환 → 브라우저가 새 이미지로 인식하여 매번 다운로드
- **실제 프로덕션**: 고정 URL 사용 시 정상적으로 캐시 작동

### 5. 무한 스크롤 구현

Intersection Observer를 커스텀 훅(`useIntersectionObserver`)으로 분리하여 재사용 가능하게 구현

```typescript
const { targetRef, isIntersecting } = useIntersectionObserver({
  threshold: 0,
  rootMargin: "200px",
  enabled: !!hasNextPage && !isFetchingNextPage,
});

useEffect(() => {
  if (isIntersecting) fetchNextPage();
}, [isIntersecting, fetchNextPage]);
```

**장점**: scroll 이벤트 대비 성능 우수 (throttle 불필요), 브라우저가 뷰포트 진입 정확히 계산, 재사용 가능

---

## 문제 해결 과정

### 1. 낙관적 업데이트 롤백 실패

#### 문제 상황

좋아요 API 실패 시 Toast 에러 메시지는 뜨지만, UI가 롤백되지 않는 현상 발생

```
사용자: 좋아요 클릭
  ↓
낙관적 업데이트: 하트 채워짐 (빨간색)
  ↓
서버: 에러 반환
  ↓
Toast: "좋아요 처리에 실패했습니다"
  ↓
문제: 하트가 여전히 채워진 상태로 남음 (롤백 안 됨)
```

#### 원인

```typescript
// 잘못된 코드
onMutate: async (postId) => {
  const previousData = queryClient.getQueryData(["posts"]); // ❌
  // ...
};
onError: (err, postId, context) => {
  if (context?.previousData) {
    queryClient.setQueryData(["posts"], context.previousData); // ❌
  }
};
```

**문제**:

- `getQueryData(["posts"])`는 exact match만 찾음
- 실제 쿼리키는 `["posts", { category, sortBy, limit }]`
- 백업 데이터가 `undefined`로 저장됨
- 롤백 시 복구할 데이터가 없음

#### 해결

```typescript
// 수정된 코드
onMutate: async (postId) => {
  const previousQueries = queryClient.getQueriesData({
    queryKey: ["posts"], // ✅ 패턴 매칭
  });
  // ...
  return { previousQueries };
};
onError: (err, postId, context) => {
  if (context?.previousQueries) {
    context.previousQueries.forEach(([queryKey, data]) => {
      queryClient.setQueryData(queryKey, data); // ✅ 정확한 키로 복구
    });
  }
};
```

**핵심**: `getQueriesData`를 사용하여 패턴에 맞는 모든 쿼리를 백업하고, 각 쿼리의 정확한 키로 복구

### 2. 댓글 좋아요 식별자 문제

#### 문제 상황

Comment 타입에 고유 id가 없어서 댓글을 식별할 수 없음

```typescript
// Comment 타입 (Mock 데이터)
interface Comment {
  // id 없음!
  author: User;
  content: string;
  createdAt: string; // 식별자로 사용 중
  likes: number;
  isLiked: boolean;
}
```

#### 해결 (임시)

createdAt을 식별자로 사용

```typescript
// toggleCommentLike
export const toggleCommentLike = async (
  postId: number,
  commentCreatedAt: string // createdAt을 식별자로
) => {
  const comment = post.commentList.find(
    (c) => c.createdAt === commentCreatedAt
  );
  // ...
};
```

#### 문제점

- createdAt은 서버 시간으로 생성되므로 클라이언트와 불일치 가능
- 동시에 같은 초에 작성된 댓글 구분 불가
- 낙관적 업데이트 시 클라이언트 createdAt과 서버 createdAt 불일치로 좋아요 기능 오작동 가능

#### 근본 해결책 (실제 프로덕션)

Comment에 id 필드 추가 필요

```typescript
interface Comment {
  id: number; // 서버가 생성한 고유 ID
  author: User;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}
```

### 3. localStorage 제거 결정

#### 초기 구현

게시물 데이터를 localStorage에 저장하여 새로고침 시에도 유지

#### 문제점

1. **Mock 데이터와 불일치**: 초기 mockPosts와 localStorage 데이터가 달라짐
2. **디버깅 어려움**: 어떤 데이터가 표시되는지 추적 어려움
3. **테스트 복잡도 증가**: localStorage 초기화 필요
4. **실제 API와 다른 동작**: 실제 API는 localStorage 사용 안 함

#### 해결

localStorage 제거, 전역 메모리(`postsStore`)만 사용

```typescript
// Before
const postsStore: Post[] =
  JSON.parse(localStorage.getItem("posts")) || mockPosts;

// After
const postsStore: Post[] = [...mockPosts];
```

**장점**:

1. 개발 환경과 실제 환경 일치
2. 새로고침 시 초기 상태로 리셋 (디버깅 용이)
3. Mock 데이터 변경 시 즉시 반영

### 4. 스켈레톤 로딩 UI 구현

초기 로딩 시 빈 화면 대신 로딩 중임을 시각적으로 표현하는 스켈레톤 UI 구현

**구현 방법**: Tailwind의 `animate-pulse`를 활용한 커스텀 스켈레톤 컴포넌트

**디자인 원칙**:

- 실제 콘텐츠와 유사한 구조로 사용자가 로딩 후 콘텐츠 위치 예측 가능
- 별도 라이브러리 없이 경량 구현
- 초기 로딩 시 3개, 추가 로딩 시 2개로 화면을 채워 체감 속도 향상

### 5. 이미지 확대보기 모달 구현

이미지 클릭 시 전체 화면 모달로 확대 표시

**사용 기술**:

- **Zustand (useUIStore)**: 모달 상태 관리 (열림/닫힘, 현재 이미지 인덱스)
- **Framer Motion**: 부드러운 등장/퇴장 애니메이션
- **키보드 이벤트**: 화살표 키 네비게이션, ESC로 닫기
- **useIsMobile 훅**: 모바일 감지로 다운로드 버튼 조건부 표시

**구현 기능**: 다중 이미지 탐색, 키보드 네비게이션, 인디케이터, 데스크톱 다운로드 버튼

### 6. 댓글 입력 UX 개선

textarea 자동 높이 조절 및 조건부 버튼 표시로 사용자 경험 개선

**구현 내용**:

- **자동 높이 조절**: React state로 scrollHeight 계산하여 동적 높이 조정 (최대 96px, 약 4줄)
- **높이 초기화**: 댓글 제출 성공 시 높이를 40px로 리셋
- **줄바꿈 표시**: CommentItem에 `whitespace-pre-wrap` 적용하여 줄바꿈 보존
- **280자 제한**: 게시물과 동일한 글자 수 제한 (Instagram 패턴)
- **무음 제한**: 글자 수 카운터 없이 입력 차단 방식 (SNS UX 패턴)
- **조건부 버튼 표시**: 텍스트 입력 시에만 전송 버튼 표시
- **중복 제출 방지**: mutation.isPending 상태로 버튼 비활성화

**React state vs ref 선택**:
- 초기에는 ref로 DOM을 직접 조작하여 높이 조절 구현
- React의 단방향 데이터 흐름에 맞춰 state 기반으로 리팩토링
- state 사용 시 React DevTools에서 디버깅 가능하고, 테스트 용이
- 높이 초기화가 필요한 경우 onSuccess 콜백에서 setState로 처리

### 7. 텍스트 하이라이팅 구현

게시물 내 해시태그(#), URL을 시각적으로 구분

**구현 방법**: 정규식(`/#[\w가-힣]+/g`, `/(https?:\/\/[^\s]+)/g`)으로 패턴 감지 후 React 컴포넌트로 변환

**장점**: 외부 라이브러리 불필요 (경량), 패턴 수정 용이, 한글 해시태그 지원

---

## 에러 처리 전략

### 에러 레이어 분리

프로젝트에서는 3가지 레이어로 에러를 처리합니다.

```
1. ErrorBoundary (렌더링 에러)
   ↓
2. API Client Interceptor (치명적 에러)
   ↓
3. Mutation onError (비즈니스 로직 에러)
```

### 1. ErrorBoundary - 렌더링 에러

React 컴포넌트 렌더링 중 에러를 잡아 앱 전체 다운 방지

**잡을 수 있는 에러**: 컴포넌트 렌더링 중 에러, 생명주기 메서드 에러

**잡을 수 없는 에러**: 이벤트 핸들러, 비동기 코드, API 호출 에러

**Class Component 사용 이유**: React Hook에는 ErrorBoundary 기능 없음 (`getDerivedStateFromError`, `componentDidCatch`는 Class Component 전용)

### 2. API Client Interceptor - 치명적 에러

401, 500, 네트워크 에러 등 사용자가 해결할 수 없는 치명적 에러를 중앙에서 처리

**구현 완료**: `apiClient.ts`에 axios interceptor로 구현

- **401**: 인증 실패 처리 (로그인 페이지 이동)
- **403**: 권한 없음 처리
- **500**: 서버 에러 Toast 알림
- **네트워크 에러**: 인터넷 연결 확인 Toast

**현재 상태**: Mock API 사용 중으로 미사용. Toast 코드는 주석 처리되어 있으며, 실제 API 연동 시 주석 해제로 즉시 사용 가능

### 3. Mutation onError - 비즈니스 로직 에러

#### 역할

사용자 행동에 대한 구체적인 에러 메시지 제공

```typescript
useMutation({
  mutationFn: toggleLike,
  onError: () => toast.error("좋아요 처리에 실패했습니다"),
});
```

#### API Client vs Mutation onError

| 위치                 | 에러 종류          | 메시지        |
| -------------------- | ------------------ | ------------- |
| **API Client**       | 401, 500, 네트워크 | 공통 메시지   |
| **Mutation onError** | 비즈니스 로직      | 구체적 메시지 |

### ErrorBoundary vs Toast

| 구분          | ErrorBoundary    | Toast                   |
| ------------- | ---------------- | ----------------------- |
| **잡는 에러** | 렌더링 에러      | API 에러, 비즈니스 에러 |
| **예시**      | `undefined.name` | 좋아요 API 실패         |
| **반응**      | 전체 화면 교체   | 알림 표시               |
| **복구**      | 새로고침 버튼    | 자동으로 사라짐         |
| **심각도**    | 치명적 (앱 죽음) | 일반적 (앱 계속 작동)   |

### 에러 테스트 방법

#### Mock API 에러 테스트

```typescript
// mockClient.ts
export const ENABLE_MOCK_ERROR = true; // ← true로 변경

// 모든 API 요청이 에러 반환
// Toast 알림 및 낙관적 업데이트 롤백 확인 가능
```

#### ErrorBoundary 테스트 (3가지 방법)

1. ErrorTest 컴포넌트 사용
2. PostCard에서 throw Error
3. mockPosts.ts에서 author를 undefined로 변경

---

## 향후 개선 사항

### 1. 쿼리키 분리

현재는 게시물과 댓글이 하나의 쿼리로 관리되지만, 실제 프로덕션에서는 분리 고려

```typescript
// 현재
queryKey: ["posts", { category, sortBy, limit }];
// → 게시물 + 댓글 전부 포함

// 개선
queryKey: ["posts", "list", { category, sortBy }];
queryKey: ["posts", postId, "comments"];
// → 댓글만 별도 refetch 가능
```

### 2. Comment에 id 추가

createdAt 대신 서버 생성 id를 식별자로 사용

### 3. 실제 API 연동

- apiClient.ts의 주석 해제
- posts.ts의 Mock API → 실제 API 함수로 교체
- 환경변수(.env)에 API_BASE_URL 설정

### 4. 테스트 코드 작성

- 단위 테스트 (Hooks, Utils)
- 통합 테스트 (API Layer)
- E2E 테스트 (사용자 시나리오)

### 5. CI/CD 파이프라인 구축

- GitHub Actions로 자동 빌드 및 배포
- Vercel/Netlify 자동 배포 설정

---

## 참고 자료

### 공식 문서

- [TanStack Query v5](https://tanstack.com/query/latest)
- [React Router v6](https://reactrouter.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/)

### 주요 학습 내용

- [Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Infinite Queries](https://tanstack.com/query/latest/docs/react/guides/infinite-queries)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
