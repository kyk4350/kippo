import { Component, ReactNode, ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary 컴포넌트
 *
 * React 컴포넌트 렌더링 중 발생하는 에러를 캐치하여 앱 전체가 크래시되는 것을 방지합니다.
 *
 * 캐치할 수 있는 에러:
 * - 컴포넌트 렌더링 중 에러
 * - 생명주기 메서드 에러
 * - 자식 컴포넌트 트리의 에러
 *
 * 캐치할 수 없는 에러:
 * - 이벤트 핸들러 (onClick, onChange 등)
 * - 비동기 코드 (setTimeout, Promise)
 * - API 호출 에러 (이건 Toast로 처리)
 * - 서버 사이드 렌더링 에러
 * - ErrorBoundary 자체의 에러
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  /**
   * 생성자: 초기 state 설정
   * 컴포넌트가 처음 생성될 때 한 번만 실행
   */
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false, // 에러 발생 여부 (초기값: false)
      error: null, // 에러 객체 (초기값: null)
    };
  }

  /**
   * 1. React가 자동으로 호출하는 특별한 메서드 (1단계)
   *
   * 역할: 에러 발생 시 state를 업데이트하여 UI를 변경 준비
   * 실행 시점: 자식 컴포넌트에서 렌더링 에러 발생 즉시 (동기적)
   * React의 동작: 이 메서드가 있으면 해당 클래스를 ErrorBoundary로 인식
   *
   * @param error - React가 전달하는 에러 객체 (TypeError, ReferenceError 등)
   * @returns 새로운 state (hasError: true로 설정하여 fallback UI 표시)
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true, // 에러 발생 플래그
      error, // 에러 객체 저장 (fallback UI에서 표시용)
    };
  }

  /**
   * 2. React가 자동으로 호출하는 특별한 메서드 (2단계)
   *
   * 역할: 에러 정보를 로깅하거나 외부 서비스(Sentry)로 전송
   * 실행 시점: getDerivedStateFromError 직후 (비동기 가능)
   *
   * @param error - 발생한 에러 객체
   * @param errorInfo - React가 제공하는 추가 정보 (컴포넌트 스택 추적)
   *
   * errorInfo.componentStack 예시:
   *   "in PostCard (at HomePage.tsx:20)
   *    in PostList (at HomePage.tsx:15)
   *    in HomePage (at App.tsx:10)"
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 개발 환경에서 콘솔에 에러 출력
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // 실제 프로덕션 환경에서는 에러 모니터링 서비스로 전송 구현
    // Sentry.captureException(error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo.componentStack
    //     }
    //   }
    // });
  }

  /**
   * "다시 시도" 버튼 핸들러
   *
   * 역할: state를 초기화하여 정상 UI(children)로 복구 시도
   * 주의: 근본 원인이 해결되지 않으면 다시 에러 발생 가능
   */
  handleReset = () => {
    this.setState({
      hasError: false, // 에러 플래그 제거
      error: null, // 에러 객체 초기화
    });
    // state 변경 → render() 재실행 → this.props.children 반환
  };

  /**
   * 렌더 메서드: state에 따라 fallback UI 또는 정상 UI 반환
   *
   * 실행 시점:
   * 1. 컴포넌트 마운트 시
   * 2. state 변경 시 (getDerivedStateFromError 호출 후)
   * 3. props 변경 시
   */
  render() {
    // 에러가 발생한 상태라면
    if (this.state.hasError) {
      // 외부에서 커스텀 fallback UI를 제공했는지 확인
      if (this.props.fallback) {
        return this.props.fallback; // 커스텀 UI 반환
      }

      // 기본 fallback UI: 사용자 친화적인 에러 안내 화면
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg text-center">
            {/* 경고 아이콘 */}
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* 에러 메시지 제목 */}
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              오류가 발생했습니다
            </h1>

            {/* 에러 설명 (사용자용) */}
            <p className="text-text-secondary mb-6">
              예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 다시
              시도해주세요.
            </p>

            {/* 개발 환경 전용: 상세 에러 메시지 표시 */}
            {/* import.meta.env.DEV: Vite 환경 변수 (개발 모드에서만 true) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-4 p-3 bg-red-50 rounded text-left">
                <p className="text-sm font-mono text-red-800 break-all">
                  {/* 에러 객체를 문자열로 변환하여 표시 */}
                  {/* 예: "Error: Cannot read property 'name' of undefined" */}
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {/* 복구 버튼들 */}
            <div className="flex gap-3 justify-center">
              {/* 다시 시도: state 초기화 → 정상 UI로 복구 시도 */}
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                다시 시도
              </button>

              {/* 새로고침: 브라우저 전체 새로고침 (강력한 복구) */}
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300 transition-colors"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 에러가 없는 정상 상태: 자식 컴포넌트를 그대로 렌더링
    // this.props.children = <App /> 또는 <HomePage /> 등
    return this.props.children;
  }
}

export default ErrorBoundary;
