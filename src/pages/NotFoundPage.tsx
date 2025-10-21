import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-text-primary mb-4">404</h1>
        <p className="text-xl text-text-secondary mb-6">페이지를 찾을 수 없습니다</p>
        <Link
          to="/"
          className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-opacity-90 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
