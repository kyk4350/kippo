/**
 * 실제 백엔드 API 연동용 Axios Client
 *
 * 현재 과제에서는 Mock 데이터를 사용하므로 이 파일은 사용되지 않습니다.
 * 하지만 실무 프로젝트 전환 시를 대비하여 구조를 준비해두었습니다.
 *
 * 실제 API 연동 시:
 * 1. .env 파일에 VITE_API_BASE_URL 설정
 * 2. posts.ts에서 mockClient 대신 이 apiClient import
 * 3. 토큰 관련 주석 해제
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 실제 프로젝트에서 인증 토큰 추가
    // JWT 토큰을 localStorage에서 가져와 헤더에 자동 추가
    // const token = localStorage.getItem('accessToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    // 개발 환경에서 API 요청 로깅
    if (import.meta.env.DEV) {
      console.log(
        '[API Request]',
        config.method?.toUpperCase(),
        config.url,
        config.params || config.data || ''
      );
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 중앙화
apiClient.interceptors.response.use(
  (response) => {
    // 개발 환경에서 API 응답 로깅
    if (import.meta.env.DEV) {
      console.log('[API Response]', response.status, response.config.url);
    }

    return response;
  },
  (error: AxiosError) => {
    // HTTP 에러 처리
    if (error.response) {
      const { status, data } = error.response;

      if (import.meta.env.DEV) {
        console.error('[API Error]', status, error.config?.url, data);
      }

      // 상태 코드별 에러 처리
      switch (status) {
        case 401:
          // 인증 실패 - 토큰 만료 또는 유효하지 않음
          // 실제 프로젝트에서는 로그인 페이지로 리다이렉트
          // localStorage.removeItem('accessToken');
          // window.location.href = '/login';
          console.error('인증이 필요합니다');
          break;

        case 403:
          // 권한 없음 - 인증은 되었지만 해당 리소스 접근 권한 없음
          console.error('권한이 없습니다');
          break;

        case 404:
          // 리소스 없음
          console.error('요청한 리소스를 찾을 수 없습니다');
          break;

        case 500:
          // 서버 내부 오류
          console.error('서버 오류가 발생했습니다');
          break;

        default:
          // 기타 에러
          console.error('API 요청 중 오류가 발생했습니다');
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못함 (네트워크 오류)
      console.error('[Network Error]', '네트워크 연결을 확인해주세요');
    } else {
      // 요청 설정 중 오류 발생
      console.error('[Request Error]', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
