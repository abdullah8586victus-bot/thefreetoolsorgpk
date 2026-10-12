import { UserProfile, UserHistoryItem } from '../types';

const STORAGE_KEY_USER = 'thefreetools_current_user';
const STORAGE_KEY_ACCOUNTS = 'thefreetools_registered_accounts';
const STORAGE_KEY_GUEST_HISTORY = 'thefreetools_guest_history';
const STORAGE_KEY_GUEST_FAVORITES = 'thefreetools_guest_favorites';

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarSeed: string;
  joinedDate: string;
  favoriteToolIds: string[];
  history: UserHistoryItem[];
  themePreference: 'light' | 'system';
}

// Compute SHA-256 hash using native Web Crypto API
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getGuestUser(): UserProfile {
  let favorites: string[] = [];
  let history: UserHistoryItem[] = [];
  try {
    const rawFavs = localStorage.getItem(STORAGE_KEY_GUEST_FAVORITES);
    if (rawFavs) favorites = JSON.parse(rawFavs);
    const rawHist = localStorage.getItem(STORAGE_KEY_GUEST_HISTORY);
    if (rawHist) history = JSON.parse(rawHist);
  } catch (e) {
    console.error('Error reading guest data', e);
  }

  return {
    id: 'guest',
    name: 'Guest User',
    email: 'guest@thefreetools.org',
    avatarSeed: 'guest',
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    favoriteToolIds: favorites,
    history: history,
    themePreference: 'light',
  };
}

export function getCurrentUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      const parsed: UserProfile = JSON.parse(raw);
      return parsed;
    }
  } catch (e) {
    console.error('Error loading current user', e);
  }
  return getGuestUser();
}

export function setCurrentUser(user: UserProfile | null) {
  if (!user || user.id === 'guest') {
    localStorage.removeItem(STORAGE_KEY_USER);
  } else {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    // Also sync to accounts list
    syncAccountRecord(user);
  }
}

function getStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading stored accounts', e);
  }
  return [];
}

function syncAccountRecord(user: UserProfile) {
  const accounts = getStoredAccounts();
  const idx = accounts.findIndex(a => a.id === user.id);
  if (idx !== -1) {
    accounts[idx] = {
      ...accounts[idx],
      name: user.name,
      favoriteToolIds: user.favoriteToolIds,
      history: user.history,
      avatarSeed: user.avatarSeed,
    };
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  }
}

export async function registerAccount(name: string, email: string, password: string):Promise<{ success: boolean; message: string; user?: UserProfile }> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!name.trim()) return { success: false, message: 'Please provide a valid name.' };
  if (!normalizedEmail || !normalizedEmail.includes('@')) return { success: false, message: 'Please provide a valid email.' };
  if (password.length < 6) return { success: false, message: 'Password must be at least 6 characters long.' };

  const accounts = getStoredAccounts();
  if (accounts.some(a => a.email === normalizedEmail)) {
    return { success: false, message: 'An account with this email already exists. Please log in.' };
  }

  const passwordHash = await sha256(password);
  const guest = getGuestUser();

  const newAccount: StoredAccount = {
    id: 'user_' + Math.random().toString(36).substring(2, 9),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    avatarSeed: name.trim().charAt(0).toUpperCase(),
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    favoriteToolIds: guest.favoriteToolIds.length > 0 ? guest.favoriteToolIds : ['pdf-to-word', 'photo-unblur', 'image-resize', 'qr-generator'],
    history: guest.history,
    themePreference: 'light',
  };

  accounts.push(newAccount);
  localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));

  const profile: UserProfile = {
    id: newAccount.id,
    name: newAccount.name,
    email: newAccount.email,
    avatarSeed: newAccount.avatarSeed,
    joinedDate: newAccount.joinedDate,
    favoriteToolIds: newAccount.favoriteToolIds,
    history: newAccount.history,
    themePreference: newAccount.themePreference,
  };

  setCurrentUser(profile);
  return { success: true, message: 'Account created successfully!', user: profile };
}

export async function loginAccount(email: string, password: string): Promise<{ success: boolean; message: string; user?: UserProfile }> {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getStoredAccounts();
  const account = accounts.find(a => a.email === normalizedEmail);

  if (!account) {
    return { success: false, message: 'No account found with this email. Please check or register.' };
  }

  const hash = await sha256(password);
  if (account.passwordHash !== hash) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }

  const profile: UserProfile = {
    id: account.id,
    name: account.name,
    email: account.email,
    avatarSeed: account.avatarSeed,
    joinedDate: account.joinedDate,
    favoriteToolIds: account.favoriteToolIds || [],
    history: account.history || [],
    themePreference: account.themePreference || 'light',
  };

  setCurrentUser(profile);
  return { success: true, message: 'Logged in successfully!', user: profile };
}

export function logoutAccount(): UserProfile {
  localStorage.removeItem(STORAGE_KEY_USER);
  return getGuestUser();
}

export function toggleFavoriteTool(toolId: string, currentUser: UserProfile): UserProfile {
  const isFav = currentUser.favoriteToolIds.includes(toolId);
  const newFavs = isFav
    ? currentUser.favoriteToolIds.filter(id => id !== toolId)
    : [...currentUser.favoriteToolIds, toolId];

  const updated: UserProfile = {
    ...currentUser,
    favoriteToolIds: newFavs,
  };

  if (currentUser.id === 'guest') {
    localStorage.setItem(STORAGE_KEY_GUEST_FAVORITES, JSON.stringify(newFavs));
  } else {
    setCurrentUser(updated);
  }

  return updated;
}

export function addHistoryEntry(toolId: string, toolName: string, details: string, currentUser: UserProfile): UserProfile {
  const newEntry: UserHistoryItem = {
    id: 'hist_' + Date.now().toString(36),
    toolId,
    toolName,
    timestamp: Date.now(),
    details,
  };

  const newHistory = [newEntry, ...currentUser.history.slice(0, 49)]; // keep latest 50

  const updated: UserProfile = {
    ...currentUser,
    history: newHistory,
  };

  if (currentUser.id === 'guest') {
    localStorage.setItem(STORAGE_KEY_GUEST_HISTORY, JSON.stringify(newHistory));
  } else {
    setCurrentUser(updated);
  }

  return updated;
}

export function clearHistory(currentUser: UserProfile): UserProfile {
  const updated: UserProfile = {
    ...currentUser,
    history: [],
  };

  if (currentUser.id === 'guest') {
    localStorage.removeItem(STORAGE_KEY_GUEST_HISTORY);
  } else {
    setCurrentUser(updated);
  }

  return updated;
}
