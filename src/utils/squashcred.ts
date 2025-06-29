import { supabase } from './supabase';

export interface SquashCredEvent {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export interface SquashCredTier {
  tier_emoji: string;
  tier_title: string;
  tier_range: string;
}

export interface UserPointsWithTier {
  squashcred: number;
  tier_emoji: string;
  tier_title: string;
  tier_range: string;
}

// Point values for different actions
export const SQUASHCRED_ACTIONS = {
  // Earning points
  START_CONFLICT: { points: 5, reason: 'Started a conflict' },
  RESOLVE_CONFLICT: { points: 20, reason: 'Resolved a conflict (both sides satisfied)' },
  RESPOND_TO_CONFLICT: { points: 10, reason: 'Responded to a conflict as user 2' },
  CORE_ISSUE_REFLECTION: { points: 10, reason: 'Added thoughtful core issue reflection' },
  REHASH_CONFLICT: { points: 5, reason: 'Attempted to rehash a conflict' },
  FIRST_CONFLICT: { points: 15, reason: 'Sent your first conflict' },
  QUICK_RESOLUTION: { points: 25, reason: 'Resolved conflict in under 1 hour' },
  PEACEFUL_RESOLUTION: { points: 30, reason: 'Achieved mutual satisfaction' },
  VOTE_ON_PUBLIC_CONFLICT: { points: 2, reason: 'Voted on a public conflict' },
  VOTE_ON_REDDIT_CONFLICT: { points: 5, reason: 'Voted on daily Reddit conflict' },
  START_DEBATE: { points: 10, reason: 'Started a public debate' },
  RESPOND_TO_DEBATE: { points: 10, reason: 'Responded to a debate invitation' },
  VOTE_ON_DEBATE: { points: 3, reason: 'Voted on a public debate' },
  WIN_DEBATE: { points: 25, reason: 'Won a public debate' },
  HELPFUL_VOTE: { points: 5, reason: 'Cast a constructive vote' },
  DAILY_LOGIN: { points: 3, reason: 'Logged in for the day' },
  REFERRAL_BONUS: { points: 25, reason: 'Referred a new user who signed up' },
  HIGH_RESOLUTION_RATE: { points: 50, reason: 'Maintained 90%+ resolution rate with 10+ conflicts' },
  FIRST_PUBLIC_SHAME: { points: 10, reason: 'First conflict reached the public shame board' },
  SUPPORTER_BONUS: { points: 100, reason: 'Became a Squashie supporter' },
  FIRST_REDDIT_VOTE: { points: 10, reason: 'Cast your first vote on a Reddit conflict' },
  FIRST_ARCHETYPE_UNLOCK: { points: 15, reason: 'Unlocked your first conflict archetype' },
  FIRST_ACHIEVEMENT_UNLOCK: { points: 15, reason: 'Unlocked your first achievement' },
  FIRST_QUEST_STARTED: { points: 10, reason: 'Started your first quest' },
  QUEST_COMPLETED: { points: 20, reason: 'Completed a quest' },
  QUEST_PERFECT_SCORE: { points: 30, reason: 'Completed a quest with perfect score' },
  QUEST_HARD_COMPLETED: { points: 40, reason: 'Completed a hard difficulty quest' },
  WEEKEND_RESOLUTION: { points: 15, reason: 'Resolved a conflict on the weekend' },
  CONSECUTIVE_LOGINS: { points: 20, reason: 'Logged in 7 days in a row' },
  
  // Losing points
  SPAM_OR_ABUSE: { points: -20, reason: 'Flagged for spammy or abusive language' },
  EXCESSIVE_REHASHING: { points: -5, reason: 'Rehashed the same issue 3+ times' },
  CONFLICT_EXPIRED: { points: -2, reason: 'Let conflict expire with no resolution' },
  GHOSTING: { points: -10, reason: 'Started conflict but never responded' },
  RECEIVED_NO_RESPONSE: { points: -5, reason: 'Received conflict but never responded' },
  ESCALATION: { points: -15, reason: 'Escalated conflict instead of resolving' },
  BAD_FAITH_VOTING: { points: -10, reason: 'Voted in bad faith on public conflicts' },
  ABANDONING_CONFLICT: { points: -8, reason: 'Abandoned conflict mid-resolution' },
  INVITE_IGNORED: { points: -5, reason: 'Invited user never joined after a week' },
  FINAL_JUDGMENT_ISSUED: { points: -10, reason: 'Conflict reached final AI judgment' },
  LOW_RESOLUTION_RATE: { points: -25, reason: 'Resolution rate fell below 25%' },
  REPORTED_BY_OTHER_USER: { points: -15, reason: 'Reported by another user for bad behavior' },
  MULTIPLE_ABANDONED_CONFLICTS: { points: -20, reason: 'Abandoned 3+ conflicts in a month' },
  EXCESSIVE_CAPS_USAGE: { points: -5, reason: 'Excessive use of ALL CAPS in messages' },
  INACTIVE_ACCOUNT: { points: -10, reason: 'No activity for over 30 days' },
  CONFLICT_SPAM: { points: -30, reason: 'Created 5+ conflicts in a single day' },
} as const;

export const squashCredService = {
  // Award or deduct points
  awardPoints: async (
    userId: string, 
    amount: number, 
    reason: string
  ): Promise<{ newBalance: number; error?: string }> => {
    try {
      console.log(`🏆 Awarding ${amount} SquashCred to user ${userId}: ${reason}`);
      
      const { data, error } = await supabase.rpc('award_squashcred', {
        p_user_id: userId,
        p_amount: amount,
        p_reason: reason
      });

      if (error) {
        console.error('❌ Error awarding SquashCred:', error);
        return { newBalance: 0, error: error.message };
      }

      console.log(`✅ SquashCred awarded. New balance: ${data}`);
      
      // Check for SquashCred-related achievements
      try {
        const { generalAchievementsService } = await import('./generalAchievements');
        
        // Check if points are negative
        const hasNegativePoints = data < 0;
        
        // Check if this was a comeback (from negative to positive)
        const hasComeback = amount > 0 && data > 0 && (data - amount) < 0;
        
        await generalAchievementsService.checkAndUnlockAchievements(userId, {
          squashCredPoints: data,
          hasNegativePoints: hasNegativePoints && data <= -50,
          hasComeback
        });
      } catch (error) {
        console.error('Error checking SquashCred achievements:', error);
      }
      
      return { newBalance: data };
    } catch (error) {
      console.error('❌ Error in awardPoints:', error);
      return { 
        newBalance: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  // Get user's current balance
  getUserBalance: async (userId: string): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('get_user_squashcred', {
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Error getting SquashCred balance:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('❌ Error in getUserBalance:', error);
      return 0;
    }
  },

  // Get user's points with tier information
  getUserPointsWithTier: async (userId: string): Promise<UserPointsWithTier | null> => {
    try {
      const { data, error } = await supabase.rpc('get_user_points_with_tier', {
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Error getting user points with tier:', error);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('❌ Error in getUserPointsWithTier:', error);
      return null;
    }
  },

  // Get tier info for a specific points amount
  getTierInfo: async (points: number): Promise<SquashCredTier | null> => {
    try {
      const { data, error } = await supabase.rpc('get_squashcred_tier', {
        p_points: points
      });

      if (error) {
        console.error('❌ Error getting tier info:', error);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('❌ Error in getTierInfo:', error);
      return null;
    }
  },

  // Get user's SquashCred event history
  getUserEvents: async (userId: string, limit: number = 50): Promise<SquashCredEvent[]> => {
    try {
      const { data, error } = await supabase
        .from('squashcred_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error getting SquashCred events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getUserEvents:', error);
      return [];
    }
  },

  // Helper functions for common actions
  awardForAction: async (userId: string, actionKey: keyof typeof SQUASHCRED_ACTIONS): Promise<{ newBalance: number; error?: string }> => {
    const action = SQUASHCRED_ACTIONS[actionKey];
    return squashCredService.awardPoints(userId, action.points, action.reason);
  },

  // Format points for display
  formatPoints: (points: number): string => {
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}k`;
    }
    return points.toString();
  },

  // Get color class for points display
  getPointsColorClass: (points: number): string => {
    if (points <= -51) return 'text-red-600';
    if (points <= -1) return 'text-orange-600';
    if (points === 0) return 'text-gray-600';
    if (points <= 99) return 'text-green-600';
    if (points <= 999) return 'text-blue-600';
    if (points <= 9999) return 'text-purple-600';
    return 'text-yellow-600';
  }
};