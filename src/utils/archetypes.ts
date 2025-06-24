import { supabase } from './supabase';
import { conflictService } from './conflicts';
import { achievementsService } from './achievements';

export interface Archetype {
  title: string;
  emoji: string;
  description: string;
}

export const ARCHETYPES: Record<string, Archetype> = {
  'the-fixer': {
    title: 'The Fixer',
    emoji: '🛠️',
    description: 'Resolves conflicts as the responder with care and dedication'
  },
  'the-rehasher': {
    title: 'The Rehasher',
    emoji: '♻️',
    description: 'Thoughtfully seeks better solutions when first attempts don\'t work'
  },
  'the-drama-generator': {
    title: 'The Drama Generator',
    emoji: '🎭',
    description: 'Frequently initiates conflicts - maybe needs some chill time'
  },
  'the-swift-fixer': {
    title: 'The Swift Fixer',
    emoji: '⚡',
    description: 'Lightning-fast conflict resolution skills'
  },
  'the-passive-ghost': {
    title: 'The Passive Ghost',
    emoji: '👻',
    description: 'Starts conflicts but vanishes when it\'s time to engage'
  },
  'the-emotional-diplomat': {
    title: 'The Emotional Diplomat',
    emoji: '🕊️',
    description: 'Masters the art of balanced, thoughtful communication'
  },
  'the-petty-picasso': {
    title: 'The Petty Picasso',
    emoji: '🎨',
    description: 'Creates dramatic masterpieces out of everyday conflicts'
  },
  'the-chaos-goblin': {
    title: 'The Chaos Goblin',
    emoji: '💣',
    description: 'Leaves a trail of unresolved conflicts in their wake'
  },
  'the-cooldown-king': {
    title: 'The Cooldown King/Queen',
    emoji: '🧊',
    description: 'Takes their sweet time to respond - patience is a virtue'
  },
  'the-unread-receipt': {
    title: 'The Unread Receipt',
    emoji: '📪',
    description: 'Receives conflicts but never responds - the ultimate ghost'
  },
  'the-firestarter': {
    title: 'The Firestarter',
    emoji: '🔥',
    description: 'Messages tend to escalate situations rather than resolve them'
  },
  'the-harmony-seeker': {
    title: 'The Harmony Seeker',
    emoji: '🌈',
    description: 'Consistently achieves mutual satisfaction in conflict resolution'
  },
  'the-accountability-champ': {
    title: 'The Accountability Champ',
    emoji: '📓',
    description: 'Always follows through with the core issues clarification step'
  },
  'the-polite-avenger': {
    title: 'The Polite Avenger',
    emoji: '🧐',
    description: 'Formal language with emotionally sharp undertones'
  },
  'the-empath': {
    title: 'The Empath',
    emoji: '🌊',
    description: 'Frequently validates and acknowledges others\' feelings'
  },
  'the-disappearing-diplomat': {
    title: 'The Disappearing Diplomat',
    emoji: '🕵️‍♂️',
    description: 'Has a habit of abandoning conflicts mid-resolution'
  },
  'the-spreadsheet-warrior': {
    title: 'The Spreadsheet Warrior',
    emoji: '📊',
    description: 'Conflicts often involve planning, schedules, and organizational tasks'
  },
  'the-side-eye-sender': {
    title: 'The Side-Eye Sender',
    emoji: '👀',
    description: 'Master of short, snarky one-line responses'
  },
  'the-chronic-clarifier': {
    title: 'The Chronic Clarifier',
    emoji: '❓',
    description: 'Uses the core issues step multiple times - loves to dig deep'
  },
  'the-peaceful-observer': {
    title: 'The Peaceful Observer',
    emoji: '🧘‍♀️',
    description: 'Never starts or responds to conflicts - the zen master'
  }
};

interface UserConflictStats {
  totalConflicts: number;
  resolvedConflicts: number;
  conflictsAsResponder: number;
  resolvedAsResponder: number;
  conflictsStartedThisMonth: number;
  rehashVotes: number;
  fastResolutions: number; // resolved in under 1 hour
  ghostedConflicts: number; // started but never replied
  slowResponses: number; // >24h response time
  receivedNeverResponded: number;
  mutualSatisfactionCount: number;
  coreIssueCompletions: number;
  coreIssueMultipleUses: number;
  abandonedConflicts: number;
}

export const archetypeService = {
  getUserConflictStats: async (userId: string): Promise<UserConflictStats> => {
    try {
      // Get all conflicts where user is involved
      const { data: conflicts, error } = await supabase
        .from('conflicts')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const oneHourInMs = 60 * 60 * 1000;
      const oneDayInMs = 24 * 60 * 60 * 1000;

      let stats: UserConflictStats = {
        totalConflicts: conflicts?.length || 0,
        resolvedConflicts: 0,
        conflictsAsResponder: 0,
        resolvedAsResponder: 0,
        conflictsStartedThisMonth: 0,
        rehashVotes: 0,
        fastResolutions: 0,
        ghostedConflicts: 0,
        slowResponses: 0,
        receivedNeverResponded: 0,
        mutualSatisfactionCount: 0,
        coreIssueCompletions: 0,
        coreIssueMultipleUses: 0,
        abandonedConflicts: 0
      };

      if (!conflicts) return stats;

      for (const conflict of conflicts) {
        const isUser1 = conflict.user1_id === userId;
        const isUser2 = conflict.user2_id === userId;
        const createdAt = new Date(conflict.created_at);
        const resolvedAt = conflict.resolved_at ? new Date(conflict.resolved_at) : null;

        // Basic counts
        if (conflict.status === 'resolved') {
          stats.resolvedConflicts++;
        }

        // Conflicts started this month
        if (isUser1 && createdAt >= oneMonthAgo) {
          stats.conflictsStartedThisMonth++;
        }

        // Conflicts as responder (user2)
        if (isUser2) {
          stats.conflictsAsResponder++;
          if (conflict.status === 'resolved') {
            stats.resolvedAsResponder++;
          }
        }

        // Rehash votes (voted not satisfied)
        if ((isUser1 && conflict.user1_satisfaction === false) || 
            (isUser2 && conflict.user2_satisfaction === false)) {
          stats.rehashVotes++;
        }

        // Fast resolutions (under 1 hour)
        if (resolvedAt && (resolvedAt.getTime() - createdAt.getTime()) < oneHourInMs) {
          stats.fastResolutions++;
        }

        // Ghosted conflicts (started but never replied)
        if (isUser1 && !conflict.user2_raw_message) {
          stats.ghostedConflicts++;
        }

        // Received but never responded
        if (isUser2 && !conflict.user2_raw_message) {
          stats.receivedNeverResponded++;
        }

        // Mutual satisfaction
        if (conflict.user1_satisfaction === true && conflict.user2_satisfaction === true) {
          stats.mutualSatisfactionCount++;
        }

        // Core issue completions
        if ((isUser1 && conflict.user1_core_issue) || (isUser2 && conflict.user2_core_issue)) {
          stats.coreIssueCompletions++;
        }

        // Abandoned conflicts
        if (conflict.status === 'abandoned') {
          stats.abandonedConflicts++;
        }

        // Note: Some metrics like slow responses, multiple core issue uses, 
        // message tone analysis would require more detailed tracking
        // For now, we'll implement the basic rule-based archetypes
      }

      return stats;
    } catch (error) {
      console.error('Error getting user conflict stats:', error);
      return {
        totalConflicts: 0,
        resolvedConflicts: 0,
        conflictsAsResponder: 0,
        resolvedAsResponder: 0,
        conflictsStartedThisMonth: 0,
        rehashVotes: 0,
        fastResolutions: 0,
        ghostedConflicts: 0,
        slowResponses: 0,
        receivedNeverResponded: 0,
        mutualSatisfactionCount: 0,
        coreIssueCompletions: 0,
        coreIssueMultipleUses: 0,
        abandonedConflicts: 0
      };
    }
  },

  determineArchetype: (stats: UserConflictStats): { key: string; archetype: Archetype } => {
    // Priority-based archetype assignment (higher priority rules first)
    
    // The Peaceful Observer - Never starts or responds to any conflicts
    if (stats.totalConflicts === 0) {
      return { key: 'the-peaceful-observer', archetype: ARCHETYPES['the-peaceful-observer'] };
    }

    // The Chaos Goblin - 5+ unresolved or rehashed conflicts
    if (stats.totalConflicts - stats.resolvedConflicts >= 5 || stats.rehashVotes >= 5) {
      return { key: 'the-chaos-goblin', archetype: ARCHETYPES['the-chaos-goblin'] };
    }

    // The Drama Generator - Starts 3+ conflicts in one month
    if (stats.conflictsStartedThisMonth >= 3) {
      return { key: 'the-drama-generator', archetype: ARCHETYPES['the-drama-generator'] };
    }

    // The Swift Fixer - Resolves 2+ conflicts in under 1 hour
    if (stats.fastResolutions >= 2) {
      return { key: 'the-swift-fixer', archetype: ARCHETYPES['the-swift-fixer'] };
    }

    // The Fixer - Resolves 3+ conflicts as the responder
    if (stats.resolvedAsResponder >= 3) {
      return { key: 'the-fixer', archetype: ARCHETYPES['the-fixer'] };
    }

    // The Harmony Seeker - 3+ mutually satisfied conflict outcomes
    if (stats.mutualSatisfactionCount >= 3) {
      return { key: 'the-harmony-seeker', archetype: ARCHETYPES['the-harmony-seeker'] };
    }

    // The Accountability Champ - Always completes the "core issue" step
    if (stats.coreIssueCompletions >= 3 && stats.totalConflicts > 0) {
      return { key: 'the-accountability-champ', archetype: ARCHETYPES['the-accountability-champ'] };
    }

    // The Rehasher - Votes "not resolved" in 2+ conflicts
    if (stats.rehashVotes >= 2) {
      return { key: 'the-rehasher', archetype: ARCHETYPES['the-rehasher'] };
    }

    // The Passive Ghost - Starts a conflict and never replies
    if (stats.ghostedConflicts >= 1) {
      return { key: 'the-passive-ghost', archetype: ARCHETYPES['the-passive-ghost'] };
    }

    // The Unread Receipt - Receives conflicts, never responds
    if (stats.receivedNeverResponded >= 2) {
      return { key: 'the-unread-receipt', archetype: ARCHETYPES['the-unread-receipt'] };
    }

    // Default archetype for users who don't fit other categories
    if (stats.totalConflicts >= 1) {
      return { key: 'the-emotional-diplomat', archetype: ARCHETYPES['the-emotional-diplomat'] };
    }

    // Fallback
    return { key: 'the-peaceful-observer', archetype: ARCHETYPES['the-peaceful-observer'] };
  },

  assignArchetype: async (userId: string): Promise<void> => {
    try {
      console.log(`🎭 Assigning archetype for user ${userId}`);
      
      // Get user's conflict statistics
      const stats = await archetypeService.getUserConflictStats(userId);
      console.log(`📊 User stats:`, stats);
      
      // Determine the appropriate archetype
      const { key, archetype } = archetypeService.determineArchetype(stats);
      console.log(`🎯 Determined archetype: ${key} - ${archetype.title}`);
      
      // Check if archetype has changed
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('conflict_archetype, archetype_emoji')
        .eq('id', userId)
        .single();

      const currentArchetypeKey = currentProfile?.conflict_archetype;
      
      // Only update if archetype has changed
      if (currentArchetypeKey !== key) {
        // First, try to unlock the achievement for this archetype
        try {
          const { isNewAchievement } = await achievementsService.unlockArchetypeAchievement(
            userId,
            key,
            archetype.emoji
          );
          
          // If this is a new achievement, we'll let the UI handle the notification
          if (isNewAchievement) {
            console.log(`🎉 New archetype achievement unlocked: ${archetype.title} ${archetype.emoji}`);
          }
        } catch (error) {
          console.error('❌ Error unlocking archetype achievement:', error);
          // Don't fail the archetype assignment if achievement unlock fails
        }
        
        const { error } = await supabase
          .from('profiles')
          .update({
            conflict_archetype: key,
            archetype_emoji: archetype.emoji,
            archetype_assigned_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) {
          console.error(`❌ Error updating archetype for user ${userId}:`, error);
          throw error;
        }

        console.log(`✅ Updated archetype for user ${userId}: ${archetype.title} ${archetype.emoji}`);
      } else {
        console.log(`ℹ️ Archetype unchanged for user ${userId}: ${archetype.title}`);
      }
    } catch (error) {
      console.error(`❌ Error assigning archetype for user ${userId}:`, error);
      throw error;
    }
  },

  assignArchetypesForAllUsers: async (): Promise<void> => {
    try {
      console.log('🎭 Starting archetype assignment for all users...');
      
      // Get all user IDs from profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id');

      if (error) {
        console.error('❌ Error fetching user profiles:', error);
        throw error;
      }

      if (!profiles || profiles.length === 0) {
        console.log('ℹ️ No users found for archetype assignment');
        return;
      }

      console.log(`📋 Found ${profiles.length} users for archetype assignment`);

      // Process each user
      for (const profile of profiles) {
        try {
          await archetypeService.assignArchetype(profile.id);
          // Add a small delay to avoid overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ Failed to assign archetype for user ${profile.id}:`, error);
          // Continue with other users even if one fails
        }
      }

      console.log('✅ Completed archetype assignment for all users');
    } catch (error) {
      console.error('❌ Error in bulk archetype assignment:', error);
      throw error;
    }
  },

  getArchetypeInfo: (archetypeKey: string): Archetype | null => {
    return ARCHETYPES[archetypeKey] || null;
  }
};