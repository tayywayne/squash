export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface Conflict {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'active' | 'resolved' | 'abandoned';
  created_at: string;
  resolved_at?: string;
  title: string;
}

export interface ConflictMessage {
  id: string;
  conflict_id: string;
  user_id: string;
  message: string;
  message_type: 'user_input' | 'ai_summary' | 'ai_suggestion';
  created_at: string;
}

export interface Resolution {
  id: string;
  conflict_id: string;
  ai_summary: string;
  ai_suggestion: string;
  user1_reaction?: 'positive' | 'negative' | 'neutral';
  user2_reaction?: 'positive' | 'negative' | 'neutral';
  follow_up_status: 'resolved' | 'still_beefing' | 'unknown';
  created_at: string;
}

export type MoodLevel = 'rage' | 'annoyed' | 'meh' | 'chill' | 'zen';