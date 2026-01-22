
export interface UserProfile {
  name: string;
  email: string;
  type: 'parent' | 'student' | null;
  role: 'admin' | 'user';
  credits: number;
  subscriptionStatus: 'active' | 'expired' | 'none';
  plan: string | null;
  hasClaimedFree: boolean;
  isAuthenticated: boolean;
}

export type AppMode = 'test' | 'paid';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: Array<{ title: string; uri: string }>;
}

export interface WindowState {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
}

export interface ChatLog {
  userName: string;
  messages: Message[];
  timestamp: number;
  summary?: string;
}

export enum InteractionMode {
  TEXT = 'TEXT',
  VOICE = 'VOICE'
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  duration: 'daily' | 'weekly' | 'monthly';
  wordLimit: number;
}

// Fixed missing types used in governance and administration sections
export interface FeedbackLog {
  userName: string;
  rating: 'good' | 'bad';
  comment?: string;
  timestamp: number;
}

export interface AuditLog {
  type: 'login_success' | 'login_failure' | 'key_rotation' | 'success' | 'failure';
  userName: string;
  details: string;
  timestamp: number;
}

export interface SecuritySettings {
  adminKey: string;
  isMfaEnabled: boolean;
  securityPin: string;
  lastRotation: number;
}
