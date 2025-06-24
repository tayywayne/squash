import { supabase } from './supabase';
import { squashCredService } from './squashcred';

export interface RedditConflict {
  id: string;
  reddit_post_id: string;
  subreddit: string;
  title: string;
  author: string;
  original_text: string;
  ai_summary: string;
  ai_suggestion: string;
  created_at: string;
  vote_counts: Record<string, number>;
}

export interface RedditVote {
  vote_type: string;
  created_at: string;
}

export type RedditVoteType = 'nta' | 'yta' | 'esh' | 'nah';

export const REDDIT_VOTE_OPTIONS: { type: RedditVoteType; emoji: string; label: string; description: string }[] = [
  { type: 'nta', emoji: '😇', label: 'NTA', description: 'Not the Asshole' },
  { type: 'yta', emoji: '😈', label: 'YTA', description: 'You are the Asshole' },
  { type: 'esh', emoji: '🤦', label: 'ESH', description: 'Everyone Sucks Here' },
  { type: 'nah', emoji: '🤷', label: 'NAH', description: 'No Assholes Here' },
];

export const redditConflictsService = {
  getCurrentConflict: async (): Promise<RedditConflict | null> => {
    try {
      const { data, error } = await supabase.rpc('get_current_reddit_conflict');

      if (error) {
        console.error('Error fetching current Reddit conflict:', error);
        throw error;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error in getCurrentConflict:', error);
      return null;
    }
  },

  getUserVote: async (conflictId: string, userId: string): Promise<RedditVote | null> => {
    try {
      const { data, error } = await supabase.rpc('get_user_reddit_vote', {
        conflict_uuid: conflictId,
        user_uuid: userId
      });

      if (error) {
        console.error('Error fetching user Reddit vote:', error);
        throw error;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error in getUserVote:', error);
      return null;
    }
  },

  castVote: async (conflictId: string, voteType: RedditVoteType, userId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if user has already voted
      const { data: existingVote, error: checkError } = await supabase
        .from('reddit_conflict_votes')
        .select('vote_type')
        .eq('reddit_conflict_id', conflictId)
        .eq('voter_id', userId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing vote:', checkError);
        return { success: false, error: checkError.message };
      }

      // If user has already voted, prevent changing vote
      if (existingVote) {
        return { success: false, error: 'You have already voted on this conflict. Votes cannot be changed.' };
      }

      // Insert new vote (first time voting)
      const { error } = await supabase
        .from('reddit_conflict_votes')
        .insert({
          reddit_conflict_id: conflictId,
          voter_id: userId,
          vote_type: voteType
        });

      if (error) {
        console.error('Error casting Reddit vote:', error);
        return { success: false, error: error.message };
      }

      // Award SquashCred for voting on Reddit conflict (different from public conflicts)
      try {
        await squashCredService.awardForAction(userId, 'VOTE_ON_REDDIT_CONFLICT');
      } catch (credError) {
        console.error('Error awarding SquashCred for Reddit vote:', credError);
      }

      return { success: true };
    } catch (error) {
      console.error('Error in castVote:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  fetchNewDailyConflict: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/fetch-reddit-conflict`;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to fetch new conflict' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error fetching new daily conflict:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }
};