export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  conflict_archetype?: string;
  archetype_emoji?: string;
  archetype_assigned_at?: string;
  supporter_level?: string;
  is_admin?: boolean;
  supporter_emoji?: string;
  supporter_since?: string;
}

export interface Conflict {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'active' | 'resolved' | 'abandoned' | 'final_judgment';
  created_at: string;
  resolved_at?: string;
  title: string;
  ai_rehash_summary?: string;
  ai_rehash_suggestion?: string;
  rehash_attempted_at?: string;
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