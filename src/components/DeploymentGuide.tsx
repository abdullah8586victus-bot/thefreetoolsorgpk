import React, { useState } from 'react';
import { 
  Rocket, Globe, CheckCircle2, Copy, Check, ArrowRight, ShieldCheck, Terminal,
  ExternalLink, Sparkles, Server, Cpu, Search
} from 'lucide-react';

export const DeploymentGuide: React.FC<{ onBackToTools: () => void }> = ({ onBackToTools }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activePlatform, setActivePlatform] = useState<'vercel' | 'netlify'>('vercel');
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
  });

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleChecklist = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <Rocket className="w-4 h-4" />
              <span>Complete Beginner's Deployment Roadmap</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              How to Build & Host TheFreeToolsOrg for $0/Month
            </h1>
            <p className="text-blue-100 text-sm mt-2 max-w-2xl leading-relaxed">
              Because all 44 tools run 100% inside your visitor's browser using WebAssembly & Canvas, 
              you can host this entire platform on global CDNs like <strong>Vercel</strong> or <strong>Netlify</strong> with 
              zero server costs, infinite scalability, and automatic SSL security.
            </p>
          </div>
          <button
            onClick={onBackToTools}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-bold text-xs hover:bg-blue-50 transition-colors shrink-0 shadow-sm"
          >
            Back to Tools Matrix
          </button>
        </div>
      </div>

      {/* Quick platform toggle */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl mb-8 max-w-xs">
        <button
          onClick={() => setActivePlatform('vercel')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activePlatform === 'vercel'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 1155 1000" fill="currentColor">
            <path d="m577.3 0 577.4 1000H0z" />
          </svg>
          Deploy to Vercel (Recommended)
        </button>
        <button
          onClick={() => setActivePlatform('netlify')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activePlatform === 'netlify'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          Deploy to Netlify
        </button>
      </div>

      {/* Step by Step Breakdown */}
      <div className="space-y-6">
        {/* Step 1 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
              1
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900">
                Push Your Project to GitHub
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Both Vercel and Netlify integrate directly with GitHub to automatically rebuild your website every time you make changes.
              </p>

              <div className="mt-4 bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-200 relative overflow-x-auto">
                <button
                  onClick={() => copyToClipboard(
`git init
git add .
git commit -m "Initial commit of TheFreeToolsOrg 40+ web tools"
git branch -M main
git remote add origin https://github.com/your-username/thefreetoolsorg.git
git push -u origin main`, 1
                  )}
                  className="absolute right-3 top-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                  title="Copy Commands"
                >
                  {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <div className="text-slate-500 mb-1"># In your computer terminal / command line:</div>
                <div className="text-emerald-400">git init</div>
                <div className="text-emerald-400">git add .</div>
                <div className="text-emerald-400">git commit -m "Initial commit of TheFreeToolsOrg"</div>
                <div className="text-emerald-400">git branch -M main</div>
                <div className="text-emerald-400">git remote add origin https://github.com/your-username/thefreetoolsorg.git</div>
                <div className="text-emerald-400">git push -u origin main</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        {activePlatform === 'vercel' ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    Deploy on Vercel in 1-Click
                  </h2>
                  <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Takes &lt; 60 seconds
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Vercel provides free global edge network hosting, automated HTTPS SSL certificates, and zero configuration.
                </p>

                <ol className="mt-4 space-y-3 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-slate-900">A.</span>
                    <span>Sign up or log in to <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1">Vercel.com <ExternalLink className="w-3 h-3" /></a> with your GitHub account.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-slate-900">B.</span>
                    <span>Click <strong>"Add New..."</strong> &rarr; <strong>"Project"</strong> and choose your repository <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">thefreetoolsorg</code>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-slate-900">C.</span>
                    <div>
                      <span>Confirm the Build Settings (automatically detected):</span>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px]">
                        <div><strong className="text-slate-600">Framework Preset:</strong> Vite</div>
                        <div><strong className="text-slate-600">Build Command:</strong> npm run build</div>
                        <div><strong className="text-slate-600">Output Directory:</strong> dist</div>
                        <div><strong className="text-slate-600">Install Command:</strong> npm install</div>
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-slate-900">D.</span>
                    <span>Click the blue <strong>"Deploy"</strong> button. Within 45 seconds, your site is live with a free <code className="text-blue-600 font-mono">.vercel.app</code> domain!</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    Deploy on Netlify
                  </h2>
                  <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Two Easy Methods
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Netlify is an outstanding alternative with high bandwidth and automated branch previews.
                </p>

                <div className="mt-4 space-y-4 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-1">Option A: Git Connection (Recommended)</h4>
                    <p className="text-slate-600 mb-2">Log in to Netlify &rarr; "Add new site" &rarr; "Import an existing project from GitHub". Select your repo. Set Build command to <code className="bg-slate-200 px-1 py-0.5 rounded">npm run build</code> and Publish directory to <code className="bg-slate-200 px-1 py-0.5 rounded">dist</code>.</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-1">Option B: Netlify Drop (Zero Git Required)</h4>
                    <p className="text-slate-600">Run <code className="bg-slate-200 px-1 py-0.5 rounded">npm run build</code> on your computer. Open <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">app.netlify.com/drop</a> in your browser and drag the generated <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">dist</code> folder right onto the window!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
              3
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900">
                Connect a Custom Domain (Optional: e.g. TheFreeTools.org)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Make your platform look 100% professional with your own branded dot-com or dot-org domain.
              </p>

              <div className="mt-4 space-y-3 text-xs text-slate-700">
                <p>
                  1. Purchase a domain from Namecheap, Cloudflare Registrar, or GoDaddy (usually $8–$12/year).
                </p>
                <p>
                  2. In your Vercel or Netlify project dashboard, navigate to <strong>Settings</strong> &rarr; <strong>Domains</strong>.
                </p>
                <p>
                  3. Enter your domain (e.g. <code className="font-mono text-slate-800">thefreetools.org</code>) and add these two standard DNS records at your domain registrar:
                </p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px] space-y-1">
                  <div><strong>Type:</strong> A &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>Name:</strong> @ &nbsp;&nbsp;&nbsp;&nbsp;<strong>Value:</strong> 76.76.21.21</div>
                  <div><strong>Type:</strong> CNAME &nbsp;<strong>Name:</strong> www &nbsp;<strong>Value:</strong> cname.vercel-dns.com</div>
                </div>
                <p className="text-emerald-700 font-medium">
                  ✓ SSL Certificates (HTTPS) are provisioned and renewed automatically for free by Let's Encrypt!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: SEO Optimization */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
              4
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  SEO & Search Engine Ranking Optimization
                </h2>
                <Search className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                The codebase comes pre-configured with Google best practices for organic search traffic.
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">Schema.org WebApplication</div>
                  <p className="text-slate-500 text-[11px]">Structured JSON-LD is injected into <code className="font-mono">index.html</code> so Google displays rich search results with zero pricing ($0 free).</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">OpenGraph & Twitter Cards</div>
                  <p className="text-slate-500 text-[11px]">Links shared on Twitter/X, Discord, LinkedIn, and Facebook automatically generate beautiful preview cards.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">Direct Hash Permalinks</div>
                  <p className="text-slate-500 text-[11px]">Every tool has its own bookmarkable URL (e.g. <code className="font-mono">/#/tool/pdf-to-word</code>) allowing individual tool ranking.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">Google Search Console</div>
                  <p className="text-slate-500 text-[11px]">Once your site is live, add your URL to search.google.com/search-console to request immediate Google indexing.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 5: Beginner Interactive Checklist */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Your Launch Checklist
          </h2>
          <div className="space-y-2">
            {[
              { id: 'step1', label: '1. Create GitHub repository & push code' },
              { id: 'step2', label: '2. Sign up on Vercel or Netlify and import repository' },
              { id: 'step3', label: '3. Test live site URL and verify all tools work smoothly' },
              { id: 'step4', label: '4. (Optional) Connect your custom domain name' },
              { id: 'step5', label: '5. Submit URL to Google Search Console for organic traffic' },
            ].map(item => (
              <label
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  checklist[item.id] ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist[item.id]}
                  readOnly
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-xs font-semibold ${checklist[item.id] ? 'line-through text-emerald-700' : ''}`}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
