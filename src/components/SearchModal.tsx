import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Layers } from 'lucide-react';
import { ToolItem } from '../types';
import { TOOLS_DATA } from '../data/toolsData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: ToolItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global key listener for Ctrl+K / Cmd+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();
  const filteredTools = TOOLS_DATA.filter(tool => {
    if (!cleanQuery) return true;
    return (
      tool.name.toLowerCase().includes(cleanQuery) ||
      tool.description.toLowerCase().includes(cleanQuery) ||
      tool.category.toLowerCase().includes(cleanQuery) ||
      tool.tags.some(t => t.toLowerCase().includes(cleanQuery))
    );
  }).slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search all 44 tools (e.g. PDF to Word, unblur, resize, json)..."
            className="w-full text-base bg-transparent border-0 focus:outline-none text-slate-900 placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-xs font-mono bg-slate-100 text-slate-500 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 p-2">
          {filteredTools.length > 0 ? (
            filteredTools.map(tool => (
              <button
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">
                        {tool.name}
                      </span>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                        {tool.category}
                      </span>
                      {tool.badge && (
                        <span className="text-[10px] text-blue-600 font-medium">
                          · {tool.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {tool.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
              </button>
            ))
          ) : (
            <div className="py-12 text-center text-slate-500 text-sm">
              No matching tools found for "{query}". Try searching by keyword like "compress", "resize", or "word".
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Found {filteredTools.length} matching tools</span>
          <span>Press Enter to launch</span>
        </div>
      </div>
    </div>
  );
};
