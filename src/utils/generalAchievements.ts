import { supabase } from './supabase';

export interface Achievement {
  code: string;
  name: string;
  emoji: string;
  description: string;
}

export interface UserAchievement extends Achievement {
  unlocked_at: string;
}

// Define all available achievements
export const ACHIEVEMENTS: Record<string, Achievement> = {
  first_conflict: {
    code: 'first_conflict',
    name: 'First Conflict Sent',
    emoji: '📬',
    description: 'You bravely hit send on your first conflict.'
  },
  solved_stage_1: {
    code: 'solved_stage_1',
    name: 'Solved in Stage 1',
    emoji: '🤝',
    description: 'Resolved a conflict before any rehashing.'
  },
  first_rehash: {
    code: 'first_rehash',
    name: 'Rehashed Reality',
    emoji: '🔁',
    description: 'You triggered a rehash after round one.'
  },
  wrote_core_issue: {
    code: 'wrote_core_issue',
    name: 'Core Issue Unlocked',
    emoji: '🧠',
    description: 'You reflected deeply on your inner drama.'
  },
  ai_judged: {
    code: 'ai_judged',
    name: 'Resolved by AI',
    emoji: '✨',
    description: 'The almighty AI stepped in and judged.'
  },
  first_i_feel: {
    code: 'first_i_feel',
    name: 'Shared Your Feelings',
    emoji: '💌',
    description: 'You vulnerably said "I feel…" (and meant it).'
  },
  first_vote: {
    code: 'first_vote',
    name: 'Voted on a Drama',
    emoji: '🎭',
    description: 'You joined the crowd and cast your vote.'
  },
  five_conflicts: {
    code: 'five_conflicts',
    name: '5 Conflicts Sent',
    emoji: '🎉',
    description: 'Drama magnet: you\'ve started 5 conflicts.'
  },
  sent_long_message: {
    code: 'sent_long_message',
    name: 'Over-Packer',
    emoji: '📦',
    description: 'You sent a conflict with over 900 characters.'
  },
  unlocked_5_archetypes: {
    code: 'unlocked_5_archetypes',
    name: 'Drama Historian',
    emoji: '📖',
    description: 'You\'ve collected 5 different archetypes.'
  },
  ten_conflicts_private: {
    code: 'ten_conflicts_private',
    name: 'Drama Vault',
    emoji: '🔐',
    description: 'You kept 10 conflicts out of the public eye by resolving them before they had to be resolved by the AI judge.'
  },
  voted_ai_right: {
    code: 'voted_ai_right',
    name: 'Judge Judy Vibes',
    emoji: '🧑‍⚖️',
    description: 'You agreed with the AI\'s final ruling and voted "The AI was right" on at least 1 conflict.'
  },
  long_conflict: {
    code: 'long_conflict',
    name: 'Took Forever',
    emoji: '🐢',
    description: 'Conflict lasted more than 14 days.'
  },
  delayed_response: {
    code: 'delayed_response',
    name: 'Slow to Start',
    emoji: '🦥',
    description: 'Took over a week to respond.'
  },
  voted_therapy: {
    code: 'voted_therapy',
    name: '"Get Therapy" Voted',
    emoji: '🛋️',
    description: 'You clicked the most iconic button.'
  },
  conflict_with_10_votes: {
    code: 'conflict_with_10_votes',
    name: 'Drama Storm Survivor',
    emoji: '🌪️',
    description: 'A conflict you were in went viral.'
  },
  conflicted_out: {
    code: 'conflicted_out',
    name: 'Too Much Drama',
    emoji: '😵‍💫',
    description: 'You triggered 10+ conflicts in one week.'
  },
  conflict_closed_quick: {
    code: 'conflict_closed_quick',
    name: 'Not That Deep',
    emoji: '🥱',
    description: 'Conflict was solved in under 10 minutes.'
  },
  no_conflicts_30_days: {
    code: 'no_conflicts_30_days',
    name: 'Drama-Free Since...',
    emoji: '🕊️',
    description: 'You stayed peaceful for 30+ days.'
  }
};

export const generalAchievementsService = {
  unlockAchievement: async (
    userId: string,
    achievementCode: string
  ): Promise<{ isNewAchievement: boolean; error?: string }> => {
    try {
      const achievement = ACHIEVEMENTS[achievementCode];
      if (!achievement) {
        return { isNewAchievement: false, error: 'Achievement not found' };
      }

      console.log(`🏆 Attempting to unlock achievement: ${achievementCode} for user ${userId}`);
      
      const { data, error } = await supabase.rpc('unlock_user_achievement', {
        p_user_id: userId,
        p_code: achievement.code,
        p_name: achievement.name,
        p_emoji: achievement.emoji,
        p_description: achievement.description
      });

      if (error) {
        console.error('❌ Error unlocking achievement:', error);
        return { isNewAchievement: false, error: error.message };
      }

      const isNewAchievement = data === true;
      
      if (isNewAchievement) {
        console.log(`✅ New achievement unlocked: ${achievement.name} ${achievement.emoji}`);
        
        // Trigger notification for new achievement
        if (typeof window !== 'undefined') {
          // Dynamically import to avoid SSR issues
          import('../hooks/useGeneralAchievements').then(({ triggerAchievementNotification }) => {
            triggerAchievementNotification(achievementCode);
          });
        }
      } else {
        console.log(`ℹ️ Achievement already existed: ${achievement.name}`);
      }

      return { isNewAchievement };
    } catch (error) {
      console.error('❌ Error in unlockAchievement:', error);
      return { 
        isNewAchievement: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  getUserAchievements: async (userId: string): Promise<UserAchievement[]> => {
    try {
      console.log(`🏆 Fetching achievements for user ${userId}`);
      
      const { data, error } = await supabase.rpc('get_user_achievements', {
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Error fetching achievements:', error);
        throw error;
      }

      console.log(`✅ Found ${data?.length || 0} achievements for user ${userId}`);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getUserAchievements:', error);
      return [];
    }
  },

  checkUserHasAchievement: async (userId: string, achievementCode: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('user_has_achievement', {
        p_user_id: userId,
        p_code: achievementCode
      });

      if (error) {
        console.error('❌ Error checking achievement:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('❌ Error in checkUserHasAchievement:', error);
      return false;
    }
  },

  // Helper function to check and unlock multiple achievements based on user stats
  checkAndUnlockAchievements: async (userId: string, context: {
    totalConflicts?: number;
    resolvedConflicts?: number;
    archetypeCount?: number;
    hasVotedOnConflict?: boolean;
    hasVotedAiRight?: boolean;
    hasVotedTherapy?: boolean;
    hasWrittenCoreIssue?: boolean;
    hasLongMessage?: boolean;
    hasQuickResolution?: boolean;
    hasLongConflict?: boolean;
    hasDelayedResponse?: boolean;
    hasAiJudgment?: boolean;
    hasRehash?: boolean;
    hasIFeelMessage?: boolean;
    conflictsThisWeek?: number;
    daysSinceLastConflict?: number;
    hasViralConflict?: boolean;
  }): Promise<string[]> => {
    const newAchievements: string[] = [];

    try {
      // Check first conflict
      if (context.totalConflicts === 1) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'first_conflict');
        if (isNewAchievement) newAchievements.push('first_conflict');
      }

      // Check 5 conflicts
      if (context.totalConflicts === 5) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'five_conflicts');
        if (isNewAchievement) newAchievements.push('five_conflicts');
      }

      // Check 10 resolved conflicts (drama vault)
      if (context.resolvedConflicts === 10) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'ten_conflicts_private');
        if (isNewAchievement) newAchievements.push('ten_conflicts_private');
      }

      // Check 5 archetypes
      if (context.archetypeCount === 5) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'unlocked_5_archetypes');
        if (isNewAchievement) newAchievements.push('unlocked_5_archetypes');
      }

      // Check first vote
      if (context.hasVotedOnConflict) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'first_vote');
        if (isNewAchievement) newAchievements.push('first_vote');
      }

      // Check voted AI right
      if (context.hasVotedAiRight) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'voted_ai_right');
        if (isNewAchievement) newAchievements.push('voted_ai_right');
      }

      // Check voted therapy
      if (context.hasVotedTherapy) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'voted_therapy');
        if (isNewAchievement) newAchievements.push('voted_therapy');
      }

      // Check core issue
      if (context.hasWrittenCoreIssue) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'wrote_core_issue');
        if (isNewAchievement) newAchievements.push('wrote_core_issue');
      }

      // Check long message
      if (context.hasLongMessage) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'sent_long_message');
        if (isNewAchievement) newAchievements.push('sent_long_message');
      }

      // Check quick resolution
      if (context.hasQuickResolution) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'conflict_closed_quick');
        if (isNewAchievement) newAchievements.push('conflict_closed_quick');
      }

      // Check long conflict
      if (context.hasLongConflict) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'long_conflict');
        if (isNewAchievement) newAchievements.push('long_conflict');
      }

      // Check delayed response
      if (context.hasDelayedResponse) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'delayed_response');
        if (isNewAchievement) newAchievements.push('delayed_response');
      }

      // Check AI judgment
      if (context.hasAiJudgment) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'ai_judged');
        if (isNewAchievement) newAchievements.push('ai_judged');
      }

      // Check rehash
      if (context.hasRehash) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'first_rehash');
        if (isNewAchievement) newAchievements.push('first_rehash');
      }

      // Check I feel message
      if (context.hasIFeelMessage) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'first_i_feel');
        if (isNewAchievement) newAchievements.push('first_i_feel');
      }

      // Check too much drama (10+ conflicts in one week)
      if (context.conflictsThisWeek && context.conflictsThisWeek >= 10) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'conflicted_out');
        if (isNewAchievement) newAchievements.push('conflicted_out');
      }

      // Check drama-free (30+ days without conflicts)
      if (context.daysSinceLastConflict && context.daysSinceLastConflict >= 30) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'no_conflicts_30_days');
        if (isNewAchievement) newAchievements.push('no_conflicts_30_days');
      }

      // Check viral conflict
      if (context.hasViralConflict) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'conflict_with_10_votes');
        if (isNewAchievement) newAchievements.push('conflict_with_10_votes');
      }

    } catch (error) {
      console.error('❌ Error checking achievements:', error);
    }

    return newAchievements;
  }
};