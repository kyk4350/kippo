import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeInMB?: number;
}

export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 4,
  maxSizeInMB = 5,
}: ImageUploaderProps) {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // 이미 최대 개수에 도달했는지 확인
      const remainingSlots = maxImages - images.length;
      if (remainingSlots <= 0) {
        alert(`최대 ${maxImages}장까지만 업로드할 수 있습니다.`);
        return;
      }

      // 파일 크기 검증
      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > maxSizeInBytes) {
          alert(`${file.name}의 크기가 ${maxSizeInMB}MB를 초과합니다.`);
          return false;
        }
        return true;
      });

      // 남은 슬롯만큼만 추가
      const filesToAdd = validFiles.slice(0, remainingSlots);

      // 파일을 Data URL로 변환
      const fileReaders = filesToAdd.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(fileReaders).then((dataUrls) => {
        onImagesChange([...images, ...dataUrls]);
      });
    },
    [images, maxImages, maxSizeInBytes, maxSizeInMB, onImagesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    },
    maxFiles: maxImages,
    disabled: images.length >= maxImages,
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-3">
      {/* 이미지 미리보기 그리드 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
            >
              <img
                src={image}
                alt={`미리보기 ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* 삭제 버튼 */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 드롭존 */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-surface'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            {isDragActive ? (
              <>
                <Upload size={40} className="text-primary" />
                <p className="text-text-primary font-medium">
                  이미지를 여기에 놓으세요
                </p>
              </>
            ) : (
              <>
                <ImageIcon size={40} className="text-text-secondary" />
                <div>
                  <p className="text-text-primary font-medium mb-1">
                    이미지를 드래그하거나 클릭하여 업로드
                  </p>
                  <p className="text-sm text-text-secondary">
                    최대 {maxImages}장, 각 {maxSizeInMB}MB 이하 (JPG, PNG, GIF, WebP)
                  </p>
                </div>
              </>
            )}
            <p className="text-xs text-text-secondary">
              {images.length} / {maxImages} 장 업로드됨
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
