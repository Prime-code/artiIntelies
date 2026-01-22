
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

export interface ChatLog {
  userName: string;
  messages: Message[];
  timestamp: number;
  summary?: string;
}

export interface FeedbackLog {
  userName: string;
  rating: 'good' | 'bad';
  comment?: string;
  timestamp: number;
}

export interface AuditLog {
  type: 'login_success' | 'login_failure' | 'access_update' | 'success' | 'failure' | 'key_rotation';
  userName: string;
  details: string;
  timestamp: number;
}

export interface SecuritySettings {
  authCode: string;
  isMfaEnabled: boolean;
  accessPin: string;
  lastRotation: number;
}

// Fixed: Added missing Plan interface required by constants.tsx
export interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  wordLimit: number;
}

// Fixed: Added missing WindowState interface required by OS components
export interface WindowState {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
}
