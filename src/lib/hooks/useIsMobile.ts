import { useState, useEffect } from 'react';

/**
 * 모바일 기기 여부를 감지하는 커스텀 훅
 *
 * User Agent 기반으로 모바일 기기를 판별합니다.
 * 앱 실행 시 한 번만 감지하며, 이후 변경되지 않습니다.
 *
 * 사용 예시:
 * const isMobile = useIsMobile();
 * {!isMobile && <DesktopOnlyComponent />}
 *
 * @returns {boolean} 모바일 기기 여부
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // User Agent 기반 모바일 기기 감지
    const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    // 대안: 화면 크기 기반 감지 (반응형)
    // 화면 크기가 변경될 때마다 다시 계산하고 싶다면 아래 코드 사용
    // const checkMobile = () => window.innerWidth < 768;
    // setIsMobile(checkMobile());
    //
    // const handleResize = () => {
    //   setIsMobile(checkMobile());
    // };
    //
    // window.addEventListener('resize', handleResize);
    // return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};
