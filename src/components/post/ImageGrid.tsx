import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/store/uiStore';
import OptimizedImage from './OptimizedImage';

interface ImageGridProps {
  images: string[];
}

export default function ImageGrid({ images }: ImageGridProps) {
  const openImageViewer = useUIStore((state) => state.openImageViewer);

  const handleImageClick = (index: number) => {
    openImageViewer(images, index);
  };

  const getGridClass = () => {
    switch (images.length) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-2';
      case 4:
        return 'grid-cols-2';
      default:
        return 'grid-cols-2';
    }
  };

  if (images.length === 0) return null;

  return (
    <div className={cn('grid gap-2', getGridClass())}>
      {images.map((image, index) => (
        <div
          key={index}
          className={cn(
            'relative overflow-hidden rounded-2xl bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity',
            images.length === 3 && index === 0 ? 'col-span-2' : '',
            images.length === 1 ? 'aspect-video' : 'aspect-square'
          )}
        >
          <OptimizedImage
            src={image}
            alt={`게시물 이미지 ${index + 1}`}
            onClick={() => handleImageClick(index)}
          />
        </div>
      ))}
    </div>
  );
}
