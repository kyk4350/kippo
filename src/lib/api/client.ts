/**
 * API 클라이언트 및 Mock 헬퍼 함수
 *
 * 실제 백엔드 API가 있다면 axios 인스턴스를 사용하지만,
 * 현재는 Mock API이므로 헬퍼 함수만 제공
 */

import { ApiResponse, ApiError } from './types';

/**
 * Mock API 네트워크 지연 시뮬레이션
 * 실제 API 호출처럼 느끼게 하고, 로딩 UI 테스트에 활용
 */
export const mockDelay = (ms = 800): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * 성공 응답 생성 헬퍼
 * 모든 API 응답을 통일된 형식으로 반환
 */
export const createSuccessResponse = <T>(
  data: T,
  message = 'Success'
): ApiResponse<T> => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString(),
});

/**
 * 에러 응답 생성 헬퍼
 * API 에러 발생 시 통일된 형식으로 반환
 */
export const createErrorResponse = (
  code: number,
  message: string
): ApiError => ({
  success: false,
  error: {
    code,
    message,
  },
  timestamp: new Date().toISOString(),
});

/**
 * API 로깅 헬퍼
 * 개발 환경에서 API 호출 추적
 */
export const logApiCall = (method: string, endpoint: string, data?: unknown) => {
  if (import.meta.env.DEV) {
    console.log(`[API ${method}] ${endpoint}`, data ? data : '');
  }
};

export const logApiResponse = <T>(
  endpoint: string,
  response: ApiResponse<T>
) => {
  if (import.meta.env.DEV) {
    console.log(`[API Response] ${endpoint}`, response);
  }
};

export const logApiError = (endpoint: string, error: ApiError) => {
  if (import.meta.env.DEV) {
    console.error(`[API Error] ${endpoint}`, error);
  }
};
