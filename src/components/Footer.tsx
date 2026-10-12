import React from 'react';
import { ShieldCheck, Heart, Rocket, Layers } from 'lucide-react';
import { CATEGORIES } from '../data/toolsData';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  onOpenDeployGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenDeployGuide }) => {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      {/* Privacy Guarantee Bar */}
      <div className="border-b border-slate-100 py-6 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>100% Client-Side Privacy:</strong> Your files never upload to any remote server or cloud database.
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Client WebAssembly Engine</span>
            <span>·</span>
            <span>Zero Subscription Fees</span>
            <span>·</span>
            <span>No Usage Limits</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold tracking-tight text-slate-900">
                TheFreeTools<span className="text-blue-600">Org</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mb-4">
              Free, private, high-speed web utility platform with 40+ professional tools for PDF conversion, photo unblurring, image resizing, document editing, and developer utilities.
            </p>
            <button
              onClick={onOpenDeployGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Beginner Vercel & Netlify Hosting Guide</span>
            </button>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              {CATEGORIES.slice(1).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.id)}
                    className="hover:text-slate-900 transition-colors"
                  >
                    {cat.name} ({cat.count})
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Popular Tools
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>PDF to Word (.doc)</li>
              <li>Photo Unblur & Sharpen</li>
              <li>PDF to Excel / CSV</li>
              <li>Client Image Resizer</li>
              <li>QR Code Generator</li>
              <li>JSON Formatter</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Hosting & Deploy
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <button onClick={onOpenDeployGuide} className="hover:text-blue-600 text-left">
                  Vercel Setup in 60s
                </button>
              </li>
              <li>
                <button onClick={onOpenDeployGuide} className="hover:text-blue-600 text-left">
                  Netlify 1-Click Drop
                </button>
              </li>
              <li>
                <button onClick={onOpenDeployGuide} className="hover:text-blue-600 text-left">
                  Custom Domain & SSL
                </button>
              </li>
              <li>
                <button onClick={onOpenDeployGuide} className="hover:text-blue-600 text-left">
                  Google SEO Checklist
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} TheFreeToolsOrg. Built for open, free, and unrestricted web utilities.</p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Built with care for creators and developers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
