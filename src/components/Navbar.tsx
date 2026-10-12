import React from 'react';
import { Search, User, Wrench, Rocket, Heart } from 'lucide-react';
import { UserProfile, ToolCategory } from '../types';

interface NavbarProps {
  currentUser: UserProfile;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onOpenDeployGuide: () => void;
  favoritesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeCategory,
  onSelectCategory,
  onOpenSearch,
  onOpenAuth,
  onOpenDeployGuide,
  favoritesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectCategory('all')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors whitespace-nowrap">
                TheFreeTools<span className="text-blue-600">Org</span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectCategory('all')}
            className={`whitespace-nowrap transition-colors hover:text-slate-900 ${
              activeCategory === 'all' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            All Tools
          </button>
          <button
            onClick={() => onSelectCategory('pdf')}
            className={`whitespace-nowrap transition-colors hover:text-slate-900 ${
              activeCategory === 'pdf' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            PDF Suite
          </button>
          <button
            onClick={() => onSelectCategory('image')}
            className={`whitespace-nowrap transition-colors hover:text-slate-900 ${
              activeCategory === 'image' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            Image Studio
          </button>
          <button
            onClick={() => onSelectCategory('text')}
            className={`whitespace-nowrap transition-colors hover:text-slate-900 ${
              activeCategory === 'text' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            Text & Docs
          </button>
          <button
            onClick={() => onSelectCategory('dev')}
            className={`whitespace-nowrap transition-colors hover:text-slate-900 ${
              activeCategory === 'dev' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            Developer
          </button>
          <button
            onClick={onOpenDeployGuide}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 whitespace-nowrap font-medium"
          >
            <Rocket className="w-4 h-4" />
            <span>Host & Deploy Guide</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg border border-slate-200 transition-colors whitespace-nowrap"
            title="Search tools (Ctrl+K or Cmd+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search 40+ tools</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-slate-300 text-slate-500">
              ⌘K
            </kbd>
          </button>

          {favoritesCount > 0 && (
            <button
              onClick={() => onSelectCategory('favorites')}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                activeCategory === 'favorites'
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Saved Favorite Tools"
            >
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span className="hidden sm:inline font-mono text-xs">{favoritesCount}</span>
            </button>
          )}

          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
          >
            {currentUser.id !== 'guest' ? (
              <>
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {currentUser.avatarSeed}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate">{currentUser.name}</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Guest / Sign In</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
