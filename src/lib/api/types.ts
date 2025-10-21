/**
 * API 응답 타입 정의
 * 실제 백엔드 API와 동일한 구조로 설계
 */

export interface ApiResponse<T> {
  success: true;
  data: T;
  message: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: number;
    message: string;
  };
  timestamp: string;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;
