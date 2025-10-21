import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { useIsMobile } from '@/lib/hooks/useIsMobile';

export default function ImageViewerModal() {
  const {
    isImageViewerOpen,
    currentImages,
    currentImageIndex,
    closeImageViewer,
    setCurrentImageIndex,
  } = useUIStore();

  const handlePrevious = useCallback(() => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  }, [currentImageIndex, setCurrentImageIndex]);

  const handleNext = useCallback(() => {
    if (currentImageIndex < currentImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  }, [currentImageIndex, currentImages.length, setCurrentImageIndex]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isImageViewerOpen) return;

      if (e.key === 'Escape') {
        closeImageViewer();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImageViewerOpen, closeImageViewer, handlePrevious, handleNext]);

  // 스크롤 방지
  useEffect(() => {
    if (isImageViewerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isImageViewerOpen]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImages[currentImageIndex];
    link.download = `hobbylog-image-${currentImageIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 모바일 기기 감지 (커스텀 훅 사용)
  // 모바일에서는 이미지 길게 누르기로 저장하는 것이 더 직관적이므로 다운로드 버튼 숨김
  // 데스크탑에서는 다운로드 버튼 제공으로 사용자 편의성 향상
  const isMobile = useIsMobile();

  if (!isImageViewerOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
        onClick={closeImageViewer}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
          <button
            onClick={closeImageViewer}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>

          {/* 다운로드 버튼 - 데스크탑에서만 표시 */}
          {!isMobile && (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <Download size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Image */}
        <motion.img
          key={currentImageIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          src={currentImages[currentImageIndex]}
          alt={`이미지 ${currentImageIndex + 1}`}
          className="max-w-[90vw] max-h-[90vh] object-contain"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Navigation */}
        {currentImages.length > 1 && (
          <>
            {/* Previous Button */}
            {currentImageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-4 p-3 text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Next Button */}
            {currentImageIndex < currentImages.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 p-3 text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* Indicators */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
              {currentImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'bg-white w-8'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
