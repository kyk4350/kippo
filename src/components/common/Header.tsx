import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { currentUser } from "@/data/mockUser";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">Kippo</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/create"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full font-medium hover:bg-opacity-90 transition-colors"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">새 글 작성</span>
          </Link>

          <div className="flex items-center gap-2">
            <img
              src={currentUser.profileImage}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-text-primary">
                {currentUser.name}
              </p>
              <p className="text-xs text-text-secondary">
                @{currentUser.nickname}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
