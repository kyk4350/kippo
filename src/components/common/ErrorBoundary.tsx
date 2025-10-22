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
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 에러 발생 시 state 업데이트
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 에러 로깅 (실제 프로젝트에서는 Sentry 등으로 전송)
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // 실제 프로젝트 예시:
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 fallback UI가 제공되면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg text-center">
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
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              오류가 발생했습니다
            </h1>
            <p className="text-text-secondary mb-6">
              예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 다시
              시도해주세요.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-4 p-3 bg-red-50 rounded text-left">
                <p className="text-sm font-mono text-red-800 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                다시 시도
              </button>
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

    return this.props.children;
  }
}

export default ErrorBoundary;
