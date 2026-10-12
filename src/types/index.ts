export type ToolCategory = 'pdf' | 'image' | 'text' | 'dev' | 'utility';

export interface ToolItem {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  icon: string;
  tags: string[];
  isPopular?: boolean;
  badge?: string;
  estimatedTime?: string;
}

export interface UserHistoryItem {
  id: string;
  toolId: string;
  toolName: string;
  timestamp: number;
  details: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarSeed: string;
  joinedDate: string;
  favoriteToolIds: string[];
  history: UserHistoryItem[];
  themePreference: 'light' | 'system';
}
