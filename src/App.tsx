import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import NotFoundPage from "./pages/NotFoundPage";
import Header from "./components/common/Header";
import ImageViewerModal from "./components/common/ImageViewerModal";

/**
 * React Query 전역 설정
 *
 * 캐싱 전략
 * - staleTime: 5분 → 5분간 fresh 상태 유지
 * - gcTime: 30분 → 메모리에 30분간 보관
 * - refetchOnWindowFocus: false → 포그라운드 전환 시 자동 refetch 안함
 * - refetchOnMount: true (기본값) → 컴포넌트 리마운트 시 stale이면 refetch

 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
      // refetchOnMount: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-white">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create" element={<CreatePage />} />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </main>
        </div>
        <ImageViewerModal />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
