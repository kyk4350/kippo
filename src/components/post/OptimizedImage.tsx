import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { ImageOff } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  className,
  onClick,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer로 뷰포트에 가까워지면 로드 시작
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // 뷰포트 200px 전에 미리 로드
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={imgRef} className={cn('relative w-full h-full', className)}>
      {/* 로딩 중 플레이스홀더 */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* 에러 시 대체 UI */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-text-secondary">
          <ImageOff size={32} className="mb-2" />
          <p className="text-xs">이미지 로드 실패</p>
        </div>
      ) : (
        isInView && (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            onClick={onClick}
          />
        )
      )}
    </div>
  );
}
