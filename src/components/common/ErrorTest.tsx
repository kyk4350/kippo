/**
 * ErrorBoundary 테스트용 컴포넌트
 *
 * 사용법
 * 1. HomePage.tsx 상단에 import { ErrorTest } from '@/components/common/ErrorTest';
 * 2. <ErrorTest /> 추가
 * 3. 브라우저에서 확인 → ErrorBoundary fallback UI 표시
 * 4. 테스트 완료 후 제거
 */

interface ErrorTestProps {
  shouldThrow?: boolean;
}

export const ErrorTest = ({ shouldThrow = true }: ErrorTestProps) => {
  if (shouldThrow) {
    // 렌더링 중 에러 발생
    throw new Error("ErrorBoundary 테스트: 의도적으로 발생시킨 에러입니다");
  }

  return null;
};

export default ErrorTest;
