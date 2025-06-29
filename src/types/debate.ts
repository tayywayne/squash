export interface Debate {
  id: string;
  title: string;
  creator_id: string;
  creator_username?: string;
  creator_position: string;
  creator_side: string;
  creator_archetype_emoji?: string;
  creator_supporter_emoji?: string;
  opponent_id?: string;
  opponent_username?: string;
  opponent_position?: string;
  opponent_side: string;
  opponent_archetype_emoji?: string;
  opponent_supporter_emoji?: string;
  created_at: string;
  expires_at?: string;
  status: 'pending' | 'active' | 'complete';
  winner_id?: string;
  creator_votes: number;
  opponent_votes: number;
  user_vote_for_id?: string;
}

export interface DebateInvite {
  id: string;
  title: string;
  creator_id: string;
  creator_username?: string;
  creator_position: string;
  creator_side: string;
  opponent_side: string;
  created_at: string;
}

export interface CompletedDebate extends Debate {
  winner_username?: string;
}

export interface CreateDebateData {
  title: string;
  creator_side: string;
  creator_position: string;
  opponent_side: string;
  opponent_email: string;
}

export interface RespondToDebateData {
  debate_id: string;
  position: string;
}