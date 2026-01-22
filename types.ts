export type AppMode = 'paid' | 'test';

export interface SecuritySettings {
  isMfaEnabled: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  type: 'parent' | 'student' | null;
  role: 'admin' | 'user';
  creditsUsed: number;
  creditLimit: number; // For admin reference/legacy
  isRestricted: boolean;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  lastActive: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: Array<{ title: string; uri: string }>;
}

export interface AuditLog {
  type: 'login' | 'restriction_active' | 'restriction_lifted' | 'system_update' | 'credit_allocation' | 'login_success' | 'success';
  userName: string;
  details: string;
  timestamp: number;
}

export interface SystemConfig {
  isActive: boolean;
  totalQuota: number;
  usedQuota: number;
}

export interface ChatLog {
  email: string;
  userName: string;
  timestamp: number;
  summary: string;
  wordCount: number;
}

export interface FeedbackLog {
  id: string;
  userName: string;
  content: string;
  timestamp: number;
}

export interface ExploreUpdate {
  id: string;
  category: 'Strategic' | 'Events' | 'Campus';
  title: string;
  excerpt: string;
  details: string;
  date: string;
}

export interface WindowState {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
}