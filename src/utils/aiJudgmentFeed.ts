import { supabase } from './supabase';
import { squashCredService, SQUASHCRED_ACTIONS } from './squashcred';

export interface PublicAIRuling {
  conflict_id: string;
  title: string;
  ai_final_summary: string;
  final_ai_ruling: string;
  final_ruling_issued_at: string;
  user1_id: string;
  user2_id: string;
  user1_username?: string;
  user2_username?: string;
  user1_archetype_emoji?: string;
  user2_archetype_emoji?: string;
  user1_supporter_emoji?: string;
  user2_supporter_emoji?: string;
  vote_counts: Record<string, number>;
}

export interface VoteCount {
  vote_type: string;
  vote_count: number;
}

export interface UserVote {
  vote_type: string;
  created_at: string;
}

export type VoteType = 'both_wrong' | 'user1_wrong' | 'user2_wrong' | 'get_therapy' | 'ai_right' | 'reset_conflict';

export const VOTE_OPTIONS: { type: VoteType; emoji: string; label: string }[] = [
  { type: 'both_wrong', emoji: '🙃', label: 'Both of you are dumb' },
  { type: 'user1_wrong', emoji: '🫵', label: 'Person 1 is dumb' },
  { type: 'user2_wrong', emoji: '👈', label: 'Person 2 is dumb' },
  { type: 'get_therapy', emoji: '🛋️', label: 'Get therapy' },
  { type: 'ai_right', emoji: '📢', label: 'The AI was right' },
  { type: 'reset_conflict', emoji: '🔄', label: 'Reboot the whole thing' },
];

export const aiJudgmentFeedService = {
  getPublicAIRulings: async (): Promise<PublicAIRuling[]> => {
    try {
      const { data, error } = await supabase.rpc('get_public_ai_rulings');

      if (error) {
        console.error('Error fetching public AI rulings:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPublicAIRulings:', error);
      return [];
    }
  },

  getConflictVoteCounts: async (conflictId: string): Promise<VoteCount[]> => {
    try {
      const { data, error } = await supabase.rpc('get_conflict_vote_counts', {
        conflict_uuid: conflictId
      });

      if (error) {
        console.error('Error fetching vote counts:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getConflictVoteCounts:', error);
      return [];
    }
  },

  getUserVoteForConflict: async (conflictId: string, userId: string): Promise<UserVote | null> => {
    try {
      const { data, error } = await supabase.rpc('get_user_vote_for_conflict', {
        conflict_uuid: conflictId,
        user_uuid: userId
      });

      if (error) {
        console.error('Error fetching user vote:', error);
        throw error;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error in getUserVoteForConflict:', error);
      return null;
    }
  },

  castVote: async (conflictId: string, voteType: VoteType, userId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Use upsert to handle both new votes and vote changes
      const { error } = await supabase
        .from('conflict_votes')
        .upsert({
          conflict_id: conflictId,
          voter_id: userId,
          vote_type: voteType
        }, {
          onConflict: 'conflict_id,voter_id'
        });

      if (error) {
        console.error('Error casting vote:', error);
        return { success: false, error: error.message };
      }

      // Check for voting achievements
      try {
        const { generalAchievementsService } = await import('./generalAchievements');
        
        // Award SquashCred for voting
        await squashCredService.awardForAction(userId, 'VOTE_ON_PUBLIC_CONFLICT');
        
        // Award extra points for helpful votes
        if (voteType === 'ai_right' || voteType === 'get_therapy') {
          await squashCredService.awardForAction(userId, 'HELPFUL_VOTE');
        }
        
        // Get vote counts for achievements
        const { data: userVotes } = await supabase
          .from('conflict_votes')
          .select('vote_type')
          .eq('voter_id', userId);
        
        const publicVoteCount = userVotes?.length || 0;
        const aiRightVotes = userVotes?.filter(v => v.vote_type === 'ai_right').length || 0;
        const therapyVotes = userVotes?.filter(v => v.vote_type === 'get_therapy').length || 0;
        const bothWrongVotes = userVotes?.filter(v => v.vote_type === 'both_wrong').length || 0;
        const resetVotes = userVotes?.filter(v => v.vote_type === 'reset_conflict').length || 0;
        
        await generalAchievementsService.checkAndUnlockAchievements(userId, {
          hasVotedOnConflict: true,
          hasVotedAiRight: voteType === 'ai_right',
          hasVotedTherapy: voteType === 'get_therapy',
          publicVoteCount,
          aiRightVotes,
          therapyVotes,
          bothWrongVotes,
          resetVotes
        });
      } catch (achievementError) {
        console.error('Error checking voting achievements:', achievementError);
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

  checkCanVote: async (conflictId: string, userId: string, user1Id: string, user2Id: string): Promise<{ canVote: boolean; reason?: string }> => {
    try {
      // Check if user is involved in the conflict using the provided user IDs
      if (user1Id === userId || user2Id === userId) {
        return { canVote: false, reason: 'Cannot vote on your own conflict' };
      }

      return { canVote: true };
    } catch (error) {
      console.error('Error in checkCanVote:', error);
      return { canVote: false, reason: 'Error checking voting eligibility' };
    }
  }
};