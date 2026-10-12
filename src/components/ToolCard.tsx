import React from 'react';
import { 
  FileType2, Table, FileCode, CopyPlus, Scissors, Minimize2, Stamp, ShieldCheck,
  Sparkles, Scaling, FileArchive, Eraser, RefreshCw, SlidersHorizontal, Crop, RotateCw, Palette, ShieldOff,
  AlignLeft, Type, FileCode2, GitCompare, BookOpen, Link, ListOrdered, SearchCheck, FlipHorizontal2, Code2,
  Braces, Binary, Globe, Hash, Layers2, KeyRound, Fingerprint, Regex,
  QrCode, ScanBarcode, Lock, ArrowLeftRight, Pipette, Clock, Percent, Timer,
  Star
} from 'lucide-react';
import { ToolItem } from '../types';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  FileType2, Table, FileCode, CopyPlus, Scissors, Minimize2, Stamp, ShieldCheck,
  Sparkles, Scaling, FileArchive, Eraser, RefreshCw, SlidersHorizontal, Crop, RotateCw, Palette, ShieldOff,
  AlignLeft, Type, FileCode2, GitCompare, BookOpen, Link, ListOrdered, SearchCheck, FlipHorizontal2, Code2,
  Braces, Binary, Globe, Hash, Layers2, KeyRound, Fingerprint, Regex,
  QrCode, ScanBarcode, Lock, ArrowLeftRight, Pipette, Clock, Percent, Timer,
};

interface ToolCardProps {
  tool: ToolItem;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, toolId: string) => void;
  onSelect: (tool: ToolItem) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  isFavorite,
  onToggleFavorite,
  onSelect,
}) => {
  const IconComponent = ICON_MAP[tool.icon] || AlignLeft;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'pdf': return 'text-red-600 bg-red-50 border-red-100';
      case 'image': return 'text-purple-600 bg-purple-50 border-purple-100';
      case 'text': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'dev': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'utility': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div
      onClick={() => onSelect(tool)}
      className="group relative bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top bar of card */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border ${getCategoryColor(tool.category)}`}>
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={e => onToggleFavorite(e, tool.id)}
              className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors ${
                isFavorite ? 'text-amber-400 hover:text-amber-500' : 'text-slate-300 hover:text-slate-500'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
          {tool.description}
        </p>
      </div>

      {/* Metadata footer without pills - unboxed metadata */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="uppercase tracking-wider text-slate-500">{tool.category}</span>
          {tool.badge && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-blue-600 font-semibold">{tool.badge}</span>
            </>
          )}
        </div>
        <span className="font-mono tabular-nums text-slate-400">{tool.estimatedTime}</span>
      </div>
    </div>
  );
};
