# Kippo - 소셜 미디어 피드 프로젝트

Twitter/X 스타일의 소셜 미디어 피드 애플리케이션입니다.

## 서비스 컨셉

취미 생활을 공유하는 소셜 미디어 플랫폼. 요리, 그림, 음악, 영화, 독서 등 다양한 취미를 가진 사람들이 자신의 활동을 기록하고 공유하는 공간.

뜻: keep + passion + o → “열정을 계속 이어가는 공간”

## 실행 방법

### 개발 환경 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (localhost:5173)
npm run dev

# 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

### 브라우저 접속

```
http://localhost:5173
```

## 기술 스택 및 선택 이유

### 핵심 기술

- **React 18** - 최신 기능(Concurrent Features, Automatic Batching) 활용
- **TypeScript 5** - 타입 안정성 확보 및 개발 생산성 향상
- **Vite 5** - 빠른 개발 서버 및 빌드 성능

### 상태 관리

- **TanStack Query v5** - 서버 상태 관리 및 캐싱 최적화
  - 선택 이유: 복잡한 API 상태 관리, 자동 캐싱, 낙관적 업데이트 지원
- **Zustand v4** - 클라이언트 전역 상태 관리 (카테고리, 정렬 필터)
  - 선택 이유: 가볍고 직관적인 API, Redux 대비 보일러플레이트 최소화

### 라우팅

- **React Router v6.4** - 페이지 라우팅 및 네비게이션
  - 선택 이유: React Router v6의 개선된 API, Data Router 기능

### UI/스타일링

- **Tailwind CSS v3.4** - 유틸리티 우선 CSS 프레임워크
  - 선택 이유: 빠른 스타일링, 일관된 디자인 시스템, 번들 크기 최적화
- **Framer Motion v10** - 애니메이션 라이브러리
  - 선택 이유: 선언적 애니메이션, React 친화적 API
- **clsx + tailwind-merge** - 조건부 클래스 네이밍 및 충돌 방지
  - 선택 이유: 동적 스타일링 편의성, Tailwind 클래스 충돌 자동 해결

### 성능 최적화 기술

- **Intersection Observer API** - 무한 스크롤, 이미지 Lazy Loading, 상대적 시간 업데이트
  - 선택 이유: 네이티브 브라우저 API, 높은 성능, 정확한 뷰포트 감지
- **React.memo** - 컴포넌트 메모이제이션
  - 선택 이유: 불필요한 리렌더링 방지, 대량 게시물 렌더링 최적화

### UX 라이브러리

- **react-simple-pull-to-refresh** - Pull-to-Refresh 구현
  - 선택 이유: 모바일 네이티브 앱과 유사한 UX, 간단한 API
- **react-dropzone** - 드래그 앤 드롭 파일 업로드
  - 선택 이유: 직관적인 이미지 업로드 UX, 파일 검증 기능 내장

### 기타 라이브러리

- **date-fns** - 날짜 포맷팅 및 상대적 시간 표시
  - 선택 이유: moment.js 대비 가볍고 트리 쉐이킹 지원
- **sonner** - Toast 알림 시스템
  - 선택 이유: 가볍고 커스터마이징 가능, Promise 기반 알림 지원
- **axios** - HTTP 클라이언트
  - 선택 이유: 인터셉터, 자동 JSON 변환, 에러 처리 편의성
- **lucide-react** - 아이콘 라이브러리
  - 선택 이유: 일관된 디자인, 트리 쉐이킹 지원, 가벼운 번들 크기

## 디렉토리 구조

```
src/
├── pages/                  # 페이지 컴포넌트
│   ├── HomePage.tsx        # 메인 피드 페이지 (무한 스크롤, 필터)
│   ├── CreatePage.tsx      # 게시물 작성 페이지 (이미지 업로드, 카테고리)
│   └── NotFoundPage.tsx    # 404 에러 페이지
│
├── components/             # 재사용 컴포넌트
│   ├── common/             # 공통 컴포넌트
│   │   ├── ErrorBoundary.tsx    # 렌더링 에러 처리
│   │   ├── ErrorTest.tsx        # ErrorBoundary 테스트용
│   │   ├── Header.tsx           # 상단 헤더 (네비게이션)
│   │   ├── Skeleton.tsx         # 기본 스켈레톤 UI
│   │   └── ImageViewerModal.tsx # 이미지 확대보기 모달
│   ├── filter/             # 필터 컴포넌트
│   │   ├── CategoryFilter.tsx   # 카테고리 필터 (Sticky)
│   │   └── SortTabs.tsx         # 정렬 탭 (최신순/인기순)
│   ├── post/               # 게시물 관련
│   │   ├── PostList.tsx         # 게시물 목록 (무한 스크롤, Pull-to-Refresh)
│   │   ├── PostCard.tsx         # 게시물 카드 (React.memo 적용)
│   │   ├── PostSkeleton.tsx     # 게시물 스켈레톤 로딩
│   │   ├── ImageGrid.tsx        # 이미지 그리드 (최대 4장)
│   │   ├── OptimizedImage.tsx   # 이미지 Lazy Loading
│   │   └── InteractionButtons.tsx # 좋아요/리트윗/댓글 버튼
│   ├── comment/            # 댓글 관련
│   │   ├── CommentList.tsx      # 댓글 목록
│   │   ├── CommentItem.tsx      # 댓글 아이템 (좋아요 기능)
│   │   └── CommentInput.tsx     # 댓글 입력 (모바일 UX 최적화)
│   └── create/             # 게시물 작성 관련
│       └── ImageUploader.tsx    # 이미지 업로드 (드래그 앤 드롭, 미리보기)
│
├── lib/                    # 비즈니스 로직
│   ├── api/                # API 레이어
│   │   ├── mockClient.ts        # Mock API 클라이언트 (딜레이, 에러 시뮬레이션)
│   │   ├── apiClient.ts         # 실제 API 클라이언트 (인터셉터 구현)
│   │   ├── posts.ts             # 게시물 API 함수
│   │   └── types.ts             # API 응답 타입
│   ├── hooks/              # 커스텀 훅
│   │   ├── usePosts.ts          # 게시물 조회 (무한 스크롤)
│   │   ├── usePostMutations.ts  # 게시물 변경 (좋아요, 댓글 등)
│   │   ├── useRelativeTime.ts   # 상대적 시간 업데이트 (1분 전, 2시간 전)
│   │   ├── useIntersectionObserver.ts # Intersection Observer 커스텀 훅
│   │   └── useIsMobile.ts       # 모바일 기기 감지
│   └── utils/              # 유틸리티 함수
│       ├── cn.ts                # clsx + tailwind-merge 래퍼
│       ├── date.ts              # 날짜 포맷팅
│       ├── category.ts          # 카테고리 유틸
│       ├── storage.ts           # 로컬 스토리지 유틸
│       └── text.tsx             # 텍스트 처리 (해시태그, URL 하이라이트)
│
├── store/                  # Zustand 전역 상태
│   ├── filterStore.ts      # 필터 상태 (카테고리, 정렬)
│   ├── uiStore.ts          # UI 상태 (이미지 뷰어 모달)
│   └── timeStore.ts        # 시간 업데이트 상태
│
├── types/                  # TypeScript 타입 정의
│   ├── post.ts             # 게시물 타입
│   ├── comment.ts          # 댓글 타입
│   ├── user.ts             # 사용자 타입
│   ├── category.ts         # 카테고리 타입
│   └── api.ts              # API 응답 타입 (Infinite Query)
│
└── data/                   # Mock 데이터
    ├── mockPosts.ts        # 게시물 데이터 (50개)
    ├── mockCategories.ts   # 카테고리 데이터 (6개)
    └── mockUser.ts         # 현재 사용자 데이터
```

## 구현 기능 목록

### 핵심 요구사항

#### 1. 전체

- [x] 반응형 UI (모바일/태블릿/데스크탑)
  - Tailwind breakpoints (sm/md/lg) 활용
  - 모바일 기기 감지 (useIsMobile 훅)

#### 2. 게시물 리스트 (/)

- [x] 무한 스크롤로 게시물 목록 표시
  - TanStack Query Infinite Query
  - Intersection Observer 기반 자동 로딩
- [x] 게시물 카드 정보
  - 작성자 정보 (프로필 이미지, 닉네임, 인증 배지)
  - 게시물 내용 (텍스트, 이미지 그리드, 카테고리 태그)
  - 작성시간 (상대적 시간: "방금 전", "1시간 전")
  - 상호작용 수치 (좋아요 수, 리트윗 수, 댓글 수)
  - 상호작용 버튼 (좋아요, 리트윗, 댓글)

#### 3. 게시물 작성 (/create)

- [x] 게시물 작성 페이지 (별도 라우트)
- [x] 텍스트 입력 (최대 280자)
- [x] 실시간 글자 수 카운터 (색상 변화로 시각적 피드백)
- [x] 이미지 첨부 기능
  - 드래그 앤 드롭 지원
  - 미리보기 포함
  - 최대 4장 제한
  - 개별 이미지 삭제 가능
- [x] 카테고리 선택 (1개만 선택)
- [x] 작성 완료 후 피드에 새 게시물 반영
  - TanStack Query invalidateQueries로 목록 갱신

### 추가 개선 사항 (선택사항)

#### UX 개선

- [x] 스켈레톤 로딩 적용
  - PostSkeleton 컴포넌트
  - 초기 로딩 시 3개 스켈레톤 표시
- [x] Pull-to-Refresh (모바일)
  - react-simple-pull-to-refresh 사용
  - 모바일 네이티브 앱과 유사한 UX
- [x] 이미지 확대보기 모달
  - ImageViewerModal 컴포넌트
  - 클릭 시 전체 화면으로 이미지 확대
  - 배경 클릭/ESC 키로 닫기
- [x] 댓글 표시 및 입력 UI
  - 게시물 카드 하단에 댓글 목록
  - 댓글 입력 폼 (모바일 UX 최적화)
  - 댓글 좋아요 기능
  - 줄바꿈 지원 (whitespace-pre-wrap)
  - 자동 높이 조절 (최대 4줄, 96px)
  - 280자 무음 제한 (입력 차단 방식)
- [x] 텍스트 하이라이팅
  - 해시태그 강조 표시
  - URL 링크 변환

#### 기능 개선

- [x] 카테고리 필터링 기능
  - Sticky 카테고리 필터 (스크롤 시 고정)
  - 6개 카테고리 (전체, 개발, 요리, 여행, 음악, 운동)
  - Zustand로 상태 관리
- [x] 등록시간별 정렬 기능
  - 최신순 (createdAt 기준)
  - 인기순 (likes + retweets 기준)
  - SortTabs 컴포넌트
- [x] 이미지 Lazy Loading
  - Intersection Observer + loading="lazy"
  - OptimizedImage 컴포넌트
  - 뷰포트 200px 전에 미리 로드
  - 로딩 중 스켈레톤 UI
  - 에러 시 대체 UI

### 성능 최적화

- [x] React.memo를 통한 불필요한 리렌더링 방지
  - PostCard 컴포넌트 메모이제이션
  - 커스텀 비교 함수로 정확한 변경 감지
- [x] TanStack Query 캐싱 및 낙관적 업데이트
  - 좋아요, 리트윗, 댓글 좋아요에 낙관적 업데이트
  - 실패 시 자동 롤백
- [x] 무한 스크롤 최적화
  - 페이지네이션 (10개씩 로드)
  - Intersection Observer로 자동 로딩
- [x] 댓글 작성 시 refetch 제거
  - setQueriesData로 캐시 직접 업데이트
  - API 호출 6번 → 0번 최적화
- [x] Intersection Observer 기반 상대적 시간 업데이트
  - 화면에 보이는 게시물만 1분마다 업데이트
  - 성능 최적화

### 에러 처리

- [x] ErrorBoundary (렌더링 에러 처리)
  - Class Component 구현
  - Fallback UI 제공
  - 에러 로깅 (실제로는 Sentry 전송)
- [x] Toast 알림 (API 에러, 비즈니스 로직 에러)
  - sonner 라이브러리 사용
  - 성공/에러 메시지 구분
- [x] 낙관적 업데이트 실패 시 자동 롤백
  - getQueriesData로 정확한 쿼리 백업
  - 에러 시 이전 상태로 복구

### 코드 품질

- [x] TypeScript 타입 안정성
  - any/unknown 사용 금지
  - 제네릭 우선 사용
  - interface 우선 (union/intersection 시 type 사용)
- [x] ESLint 설정 및 준수
  - 미사용 변수 `_` prefix 처리
  - strict 모드 활성화
- [x] 계층화된 아키텍처
  - UI Layer (Components)
  - Business Logic Layer (Hooks)
  - Data Layer (API)
- [x] 실제 API 연동 대비 구조
  - apiClient.ts 인터셉터 구현
  - Mock/실제 API 쉽게 전환 가능

## 주요 기술적 특징

### 1. 낙관적 업데이트 (Optimistic Update)

좋아요, 리트윗, 댓글 좋아요 기능에 낙관적 업데이트를 적용하여 즉각적인 사용자 경험을 제공합니다.

```typescript
onMutate: async (postId) => {
  // 서버 응답 전 즉시 UI 업데이트
  queryClient.setQueriesData({ queryKey: ["posts"] }, (old) => {
    // 좋아요 토글
  });
  return { previousQueries }; // 롤백용 백업
},
onError: (err, variables, context) => {
  // 실패 시 이전 상태로 롤백
  context?.previousQueries.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
}
```

### 2. 성능 최적화

댓글 작성 시 불필요한 refetch를 제거하고 캐시를 직접 업데이트하여 API 호출을 최소화했습니다.

- Before: invalidateQueries → 6페이지 전체 refetch (API 6번)
- After: setQueriesData → 캐시 직접 업데이트 (API 0번)

### 3. Intersection Observer 활용

네이티브 브라우저 API를 활용하여 다양한 기능을 최적화했습니다.

- 무한 스크롤 (뷰포트 200px 전 자동 로딩)
- 이미지 Lazy Loading (필요할 때만 로드)
- 상대적 시간 업데이트 (화면에 보이는 것만 업데이트)

### 4. 확장 가능한 구조

Mock API와 실제 API를 쉽게 교체할 수 있도록 레이어를 분리했습니다.

```typescript
// 현재 (Mock)
import { mockDelay, createSuccessResponse } from "./mockClient";

// 실제 API 전환 시
import apiClient from "./apiClient";
const { data } = await apiClient.get("/posts", { params });
```

## 기타

### 개발 문서

상세한 개발 과정, 기술적 의사결정, 문제 해결 과정은 [DEVELOPMENT.md](./DEVELOPMENT.md)를 참고하세요.

### 에러 테스트

에러 처리 기능을 테스트하려면:

1. `src/lib/api/mockClient.ts`에서 `ENABLE_MOCK_ERROR`를 `true`로 변경
2. 좋아요, 댓글 등의 기능 실행 시 에러 Toast 및 롤백 확인 가능

### 브라우저 지원

- Chrome (권장)
- Safari
- Firefox
- Edge
