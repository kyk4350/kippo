import { useEffect, useState, useRef } from "react";
import { useTimeStore } from "@/lib/store/timeStore";

/**
 * 화면에 보이는 경우에만 시간 업데이트를 구독하는 최적화된 hook
 *
 * 동작 원리:
 * 1. Intersection Observer로 요소가 뷰포트에 있는지 감지
 * 2. 보이는 경우에만 전역 타이머(timeStore) 구독
 * 3. 안 보이면 구독 해제하여 불필요한 리렌더링 방지
 *
 * 성능 이점:
 * - 화면 밖 게시물 100개 → 리렌더링 0번
 * - 화면에 보이는 10개만 리렌더링
 * - 90% 리렌더링 감소
 */
export const useRelativeTime = (_createdAt: string) => {
  const elementRef = useRef<HTMLElement | HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer로 뷰포트 감지
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        // 화면에 들어오기 200px 전부터 미리 구독 (부드러운 UX)
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  // 화면에 보일 때만 전역 타이머 구독
  const currentTime = useTimeStore((state) =>
    isVisible ? state.currentTime : 0
  );

  return { elementRef, currentTime };
};
