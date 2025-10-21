import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { mockCategories } from '@/data/mockCategories';
import { currentUser } from '@/data/mockUser';
import { useCreatePost } from '@/lib/hooks/usePostMutations';
import { getCategoryIcon } from '@/lib/utils/category';
import { cn } from '@/lib/utils/cn';
import ImageUploader from '@/components/create/ImageUploader';

export default function CreatePage() {
  const navigate = useNavigate();
  const createPost = useCreatePost();

  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [images, setImages] = useState<string[]>([]);

  const charCount = content.length;
  const maxChars = 280;
  const isValid = content.trim().length > 0 && selectedCategory !== null && charCount <= maxChars;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || selectedCategory === null) return;

    try {
      await createPost.mutateAsync({
        content: content.trim(),
        images,
        category: selectedCategory,
      });
      navigate('/');
    } catch (error) {
      console.error('게시물 작성 실패:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="p-2 hover:bg-surface rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold">새 글 작성</h1>
          <button
            onClick={handleSubmit}
            disabled={!isValid || createPost.isPending}
            className={cn(
              'px-4 py-2 rounded-full font-medium text-sm transition-colors',
              isValid && !createPost.isPending
                ? 'bg-primary text-white hover:bg-opacity-90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            )}
          >
            {createPost.isPending ? '게시 중...' : '게시'}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto p-4">
        {/* Author */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={currentUser.profileImage}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-medium text-text-primary">{currentUser.name}</p>
            <p className="text-sm text-text-secondary">@{currentUser.nickname}</p>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="무슨 일이 있었나요?"
          className="w-full min-h-[200px] p-3 text-text-primary placeholder-text-secondary resize-none focus:outline-none"
          maxLength={maxChars}
        />

        {/* Character Counter */}
        <div className="flex justify-end mb-6">
          <span
            className={cn(
              'text-sm font-medium',
              charCount > maxChars ? 'text-red-500' : 'text-text-secondary'
            )}
          >
            {charCount} / {maxChars}
          </span>
        </div>

        {/* Category Selector */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-text-primary mb-3">
            카테고리 선택 <span className="text-red-500">*</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {mockCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all',
                  selectedCategory === category.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-gray-300'
                )}
              >
                <span className="text-xl">{getCategoryIcon(category.id)}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Image Uploader */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-text-primary mb-3">
            이미지 첨부 (선택)
          </h2>
          <ImageUploader images={images} onImagesChange={setImages} />
        </div>
      </div>
    </div>
  );
}
