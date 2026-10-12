import React, { useState } from 'react';
import { X, User, Lock, Mail, Download, Upload, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { UserProfile } from '../types';
import { loginAccount, registerAccount, logoutAccount, setCurrentUser } from '../utils/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
}) => {
  const isGuest = currentUser.id === 'guest';
  const [tab, setTab] = useState<'login' | 'register' | 'profile'>(isGuest ? 'login' : 'profile');
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await loginAccount(email, password);
      if (res.success && res.user) {
        setSuccessMsg(res.message);
        onUserChange(res.user);
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await registerAccount(name, email, password);
      if (res.success && res.user) {
        setSuccessMsg(res.message);
        onUserChange(res.user);
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    const guest = logoutAccount();
    onUserChange(guest);
    setTab('login');
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentUser, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `thefreetools_profile_${currentUser.name.replace(/\s+/g, '_')}.json`);
    dlAnchorElem.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed: UserProfile = JSON.parse(evt.target?.result as string);
        if (parsed.favoriteToolIds && Array.isArray(parsed.favoriteToolIds)) {
          setCurrentUser(parsed);
          onUserChange(parsed);
          setSuccessMsg('Profile and favorites restored successfully!');
        } else {
          setErrorMsg('Invalid backup file structure.');
        }
      } catch (err) {
        setErrorMsg('Could not read backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {currentUser.id !== 'guest' ? 'My Account' : 'User Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1">
          {currentUser.id !== 'guest' ? (
            <button
              onClick={() => setTab('profile')}
              className="flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors bg-white text-slate-900 shadow-sm"
            >
              Profile & Backup
            </button>
          ) : (
            <>
              <button
                onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  tab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  tab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Sign In'}
              </button>

              <div className="text-center">
                <p className="text-xs text-slate-500">
                  Guest mode is always enabled. You do not need to log in to use any of our 40+ free tools!
                </p>
              </div>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Smith"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Credentials are cryptographically salted and hashed locally (SHA-256) inside your browser.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {tab === 'profile' && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  {currentUser.avatarSeed}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{currentUser.name}</h4>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Member since {currentUser.joinedDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="block text-xs text-slate-500">Starred Tools</span>
                  <span className="font-mono font-bold text-lg text-slate-900">{currentUser.favoriteToolIds.length}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="block text-xs text-slate-500">Tools Used</span>
                  <span className="font-mono font-bold text-lg text-slate-900">{currentUser.history.length}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  Export Profile & Favorites JSON
                </button>

                <label className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer">
                  <Upload className="w-4 h-4 text-slate-500" />
                  Import Backup JSON
                  <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                </label>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
