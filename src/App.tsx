import React, { useState, useEffect } from 'react';
import { 
  Search, Heart, Wrench, ShieldCheck, Zap, FileText, Image, AlignLeft, Code, Sliders,
  Sparkles, Rocket, Filter
} from 'lucide-react';
import { ToolItem, UserProfile } from './types';
import { CATEGORIES, TOOLS_DATA } from './data/toolsData';
import { getCurrentUser, toggleFavoriteTool, addHistoryEntry } from './utils/auth';
import { Navbar } from './components/Navbar';
import { ToolCard } from './components/ToolCard';
import { ToolWorkspace } from './components/ToolWorkspace';
import { DeploymentGuide } from './components/DeploymentGuide';
import { SearchModal } from './components/SearchModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(getCurrentUser());
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Sync state with URL hash on mount and hashchange
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/tool/')) {
        const toolId = hash.replace('#/tool/', '');
        const found = TOOLS_DATA.find(t => t.id === toolId);
        if (found) {
          setSelectedTool(found);
          setIsDeployGuideOpen(false);
        }
      } else if (hash === '#/deploy-guide') {
        setIsDeployGuideOpen(true);
        setSelectedTool(null);
      } else if (hash.startsWith('#/category/')) {
        const cat = hash.replace('#/category/', '');
        setActiveCategory(cat);
        setSelectedTool(null);
        setIsDeployGuideOpen(false);
      } else {
        setSelectedTool(null);
        setIsDeployGuideOpen(false);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTool = (tool: ToolItem) => {
    setSelectedTool(tool);
    setIsDeployGuideOpen(false);
    window.location.hash = `#/tool/${tool.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMatrix = () => {
    setSelectedTool(null);
    setIsDeployGuideOpen(false);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDeployGuide = () => {
    setIsDeployGuideOpen(true);
    setSelectedTool(null);
    window.location.hash = '#/deploy-guide';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    setSelectedTool(null);
    setIsDeployGuideOpen(false);
    if (catId === 'all') {
      window.location.hash = '';
    } else {
      window.location.hash = `#/category/${catId}`;
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent, toolId: string) => {
    e.stopPropagation();
    const updated = toggleFavoriteTool(toolId, currentUser);
    setCurrentUser(updated);
  };

  const handleRecordUsage = (toolId: string, toolName: string, summary: string) => {
    const updated = addHistoryEntry(toolId, toolName, summary, currentUser);
    setCurrentUser(updated);
  };

  // Filter tools based on category, search query, and favorites
  const filteredTools = TOOLS_DATA.filter(tool => {
    // 1. Favorites tab filter
    if (activeCategory === 'favorites') {
      if (!currentUser.favoriteToolIds.includes(tool.id)) return false;
    } 
    // 2. Specific category filter
    else if (activeCategory !== 'all' && tool.category !== activeCategory) {
      return false;
    }

    // 3. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = tool.name.toLowerCase().includes(q);
      const matchDesc = tool.description.toLowerCase().includes(q);
      const matchTags = tool.tags.some(t => t.toLowerCase().includes(q));
      return matchName || matchDesc || matchTags;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        currentUser={currentUser}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenDeployGuide={handleOpenDeployGuide}
        favoritesCount={currentUser.favoriteToolIds.length}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {isDeployGuideOpen ? (
          <DeploymentGuide onBackToTools={handleBackToMatrix} />
        ) : selectedTool ? (
          <ToolWorkspace
            tool={selectedTool}
            currentUser={currentUser}
            isFavorite={currentUser.favoriteToolIds.includes(selectedTool.id)}
            onToggleFavorite={handleToggleFavorite}
            onBack={handleBackToMatrix}
            onSelectTool={handleSelectTool}
            onRecordUsage={handleRecordUsage}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Hero Section */}
            <section className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>44+ Free Browser-Based Web Tools & Converters</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Simple, Private & Free Online Utilities
              </h1>
              <p className="mt-3.5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Convert PDFs to Word and Excel, unblur photos, resize images, format code, and generate barcodes. 
                Runs 100% on your device with zero server uploads and no subscriptions.
              </p>

              {/* Primary Search Bar */}
              <div className="mt-7 max-w-xl mx-auto relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search 44+ tools by name, format, or task (e.g. PDF to Word, unblur)..."
                  className="w-full pl-11 pr-24 py-3 bg-white border border-slate-300 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder:text-slate-400"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 px-2 py-1 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-block absolute right-3 top-3 px-2 py-0.5 text-xs font-mono text-slate-400 bg-slate-100 rounded border border-slate-200">
                    ⌘K
                  </kbd>
                )}
              </div>
            </section>

            {/* Category Segmented Tabs */}
            <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-8 gap-2 no-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all border ${
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}

              {currentUser.favoriteToolIds.length > 0 && (
                <button
                  onClick={() => handleSelectCategory('favorites')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                    activeCategory === 'favorites'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white text-rose-600 hover:text-rose-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>Starred ({currentUser.favoriteToolIds.length})</span>
                </button>
              )}
            </div>

            {/* Filter Status Bar */}
            <div className="flex items-center justify-between mb-6 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Showing <strong>{filteredTools.length}</strong> {filteredTools.length === 1 ? 'tool' : 'tools'}
                  {activeCategory !== 'all' && ` in ${activeCategory.toUpperCase()}`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                WebAssembly & Canvas Engine
              </span>
            </div>

            {/* 44-Tools Matrix Grid */}
            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTools.map(tool => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    isFavorite={currentUser.favoriteToolIds.includes(tool.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onSelect={handleSelectTool}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  No tools found
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  {activeCategory === 'favorites'
                    ? "You haven't starred any tools yet. Click the star icon on any tool card to add it to your quick access."
                    : `No tools matched "${searchQuery}". Try searching for PDF, resize, unblur, JSON, or QR.`}
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View All 44 Tools
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Modals */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectTool={handleSelectTool}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
      />

      {/* Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenDeployGuide={handleOpenDeployGuide}
      />
    </div>
  );
}
