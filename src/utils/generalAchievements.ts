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
  // New achievements (50 additional)
  weekend_warrior: {
    code: 'weekend_warrior',
    name: 'Weekend Warrior',
    emoji: '🏖️',
    description: 'Started 3+ conflicts on weekends. Even your downtime is dramatic.'
  },
  midnight_mediator: {
    code: 'midnight_mediator',
    name: 'Midnight Mediator',
    emoji: '🌙',
    description: 'Resolved a conflict between 11 PM and 5 AM. Insomnia has its benefits.'
  },
  emoji_enthusiast: {
    code: 'emoji_enthusiast',
    name: 'Emoji Enthusiast',
    emoji: '😍',
    description: 'Used 10+ emojis in a single conflict message. Very expressive.'
  },
  caps_lock_crusader: {
    code: 'caps_lock_crusader',
    name: 'CAPS LOCK CRUSADER',
    emoji: '📢',
    description: 'Wrote a message with 50%+ capital letters. WE HEARD YOU.'
  },
  question_mark_addict: {
    code: 'question_mark_addict',
    name: 'Question Mark Addict',
    emoji: '❓',
    description: 'Used 5+ question marks in one message. Really??? Are you sure???'
  },
  exclamation_explosion: {
    code: 'exclamation_explosion',
    name: 'Exclamation Explosion',
    emoji: '❗',
    description: 'Used 10+ exclamation points in one message. So much energy!!!'
  },
  sorry_not_sorry: {
    code: 'sorry_not_sorry',
    name: 'Sorry Not Sorry',
    emoji: '🤷',
    description: 'Said "sorry" 3+ times in one conflict message. Apologetic much?'
  },
  literally_obsessed: {
    code: 'literally_obsessed',
    name: 'Literally Obsessed',
    emoji: '📚',
    description: 'Used "literally" 5+ times in conflict messages. Literally can\'t stop.'
  },
  obviously_obvious: {
    code: 'obviously_obvious',
    name: 'Obviously Obvious',
    emoji: '🙄',
    description: 'Used "obviously" 3+ times in one message. Obviously you have opinions.'
  },
  whatever_warrior: {
    code: 'whatever_warrior',
    name: 'Whatever Warrior',
    emoji: '🤨',
    description: 'Used "whatever" in a conflict message. Peak dismissive energy.'
  },
  fine_collector: {
    code: 'fine_collector',
    name: 'Fine Collector',
    emoji: '😤',
    description: 'Said "fine" 3+ times in conflict messages. Everything is NOT fine.'
  },
  birthday_drama: {
    code: 'birthday_drama',
    name: 'Birthday Drama',
    emoji: '🎂',
    description: 'Started a conflict on your birthday. Even celebrations need conflict resolution.'
  },
  holiday_havoc: {
    code: 'holiday_havoc',
    name: 'Holiday Havoc',
    emoji: '🎄',
    description: 'Started a conflict during major holidays. Family gatherings hit different.'
  },
  monday_meltdown: {
    code: 'monday_meltdown',
    name: 'Monday Meltdown',
    emoji: '😩',
    description: 'Started 3+ conflicts on Mondays. Case of the Mondays is real.'
  },
  friday_feelings: {
    code: 'friday_feelings',
    name: 'Friday Feelings',
    emoji: '🍻',
    description: 'Resolved 3+ conflicts on Fridays. Weekend prep includes conflict cleanup.'
  },
  early_bird_drama: {
    code: 'early_bird_drama',
    name: 'Early Bird Drama',
    emoji: '🐦',
    description: 'Started a conflict before 7 AM. The early bird catches the beef.'
  },
  night_owl_nonsense: {
    code: 'night_owl_nonsense',
    name: 'Night Owl Nonsense',
    emoji: '🦉',
    description: 'Started a conflict after 11 PM. Late night thoughts hit different.'
  },
  lunch_break_beef: {
    code: 'lunch_break_beef',
    name: 'Lunch Break Beef',
    emoji: '🥪',
    description: 'Started a conflict between 11 AM and 2 PM. Hangry much?'
  },
  same_day_resolver: {
    code: 'same_day_resolver',
    name: 'Same Day Resolver',
    emoji: '⚡',
    description: 'Resolved 5+ conflicts on the same day they were created. Efficiency expert.'
  },
  procrastination_station: {
    code: 'procrastination_station',
    name: 'Procrastination Station',
    emoji: '⏰',
    description: 'Took 72+ hours to respond to a conflict. Time is a construct.'
  },
  speed_demon: {
    code: 'speed_demon',
    name: 'Speed Demon',
    emoji: '🏎️',
    description: 'Responded to a conflict in under 5 minutes. Lightning fast reflexes.'
  },
  multi_tasker: {
    code: 'multi_tasker',
    name: 'Multi-Tasker',
    emoji: '🤹',
    description: 'Had 5+ active conflicts at the same time. Juggling drama like a pro.'
  },
  conflict_collector: {
    code: 'conflict_collector',
    name: 'Conflict Collector',
    emoji: '🗂️',
    description: 'Participated in 25+ conflicts total. Building quite the portfolio.'
  },
  resolution_rookie: {
    code: 'resolution_rookie',
    name: 'Resolution Rookie',
    emoji: '🔰',
    description: 'Resolved your first conflict. Everyone starts somewhere.'
  },
  mediator_in_training: {
    code: 'mediator_in_training',
    name: 'Mediator in Training',
    emoji: '🎓',
    description: 'Resolved 5+ conflicts as the responder. Learning the ropes.'
  },
  conflict_veteran: {
    code: 'conflict_veteran',
    name: 'Conflict Veteran',
    emoji: '🎖️',
    description: 'Participated in 50+ conflicts. You\'ve seen it all.'
  },
  drama_magnet: {
    code: 'drama_magnet',
    name: 'Drama Magnet',
    emoji: '🧲',
    description: 'Started 20+ conflicts. Trouble finds you everywhere.'
  },
  peace_keeper: {
    code: 'peace_keeper',
    name: 'Peace Keeper',
    emoji: '☮️',
    description: 'Achieved 90%+ resolution rate with 10+ conflicts. Natural mediator.'
  },
  chaos_coordinator: {
    code: 'chaos_coordinator',
    name: 'Chaos Coordinator',
    emoji: '🌀',
    description: 'Had 10+ conflicts go to final AI judgment. Organized chaos.'
  },
  comeback_kid: {
    code: 'comeback_kid',
    name: 'Comeback Kid',
    emoji: '🔄',
    description: 'Returned to resolve conflicts after 30+ days of inactivity.'
  },
  serial_rehash: {
    code: 'serial_rehash',
    name: 'Serial Rehasher',
    emoji: '🔁',
    description: 'Triggered rehashes in 5+ different conflicts. Never satisfied with round one.'
  },
  core_issue_champion: {
    code: 'core_issue_champion',
    name: 'Core Issue Champion',
    emoji: '🎯',
    description: 'Completed core issue step in 10+ conflicts. Deep dive specialist.'
  },
  satisfaction_seeker: {
    code: 'satisfaction_seeker',
    name: 'Satisfaction Seeker',
    emoji: '✅',
    description: 'Voted "satisfied" on 20+ AI suggestions. Easy to please.'
  },
  never_satisfied: {
    code: 'never_satisfied',
    name: 'Never Satisfied',
    emoji: '🚫',
    description: 'Voted "not satisfied" on 10+ AI suggestions. High standards.'
  },
  voting_enthusiast: {
    code: 'voting_enthusiast',
    name: 'Voting Enthusiast',
    emoji: '🗳️',
    description: 'Cast 25+ votes on public conflicts. Democracy in action.'
  },
  reddit_judge: {
    code: 'reddit_judge',
    name: 'Reddit Judge',
    emoji: '👨‍⚖️',
    description: 'Voted on 10+ Reddit conflicts. Judging strangers is fun.'
  },
  therapy_advocate: {
    code: 'therapy_advocate',
    name: 'Therapy Advocate',
    emoji: '🛋️',
    description: 'Voted "get therapy" 5+ times. Sometimes professional help is needed.'
  },
  ai_believer: {
    code: 'ai_believer',
    name: 'AI Believer',
    emoji: '🤖',
    description: 'Voted "AI was right" 10+ times. Trust in artificial wisdom.'
  },
  both_wrong_voter: {
    code: 'both_wrong_voter',
    name: 'Both Wrong Voter',
    emoji: '🤦',
    description: 'Voted "both wrong" 5+ times. Sometimes everyone needs perspective.'
  },
  reset_enthusiast: {
    code: 'reset_enthusiast',
    name: 'Reset Enthusiast',
    emoji: '🔄',
    description: 'Voted "reset conflict" 3+ times. Fresh starts are good.'
  },
  profile_perfectionist: {
    code: 'profile_perfectionist',
    name: 'Profile Perfectionist',
    emoji: '✨',
    description: 'Updated your profile 10+ times. Getting that perfect look.'
  },
  username_changer: {
    code: 'username_changer',
    name: 'Username Changer',
    emoji: '🏷️',
    description: 'Changed your username. New identity, same drama.'
  },
  avatar_artist: {
    code: 'avatar_artist',
    name: 'Avatar Artist',
    emoji: '🎨',
    description: 'Uploaded a custom avatar. Looking good for the drama.'
  },
  leaderboard_lurker: {
    code: 'leaderboard_lurker',
    name: 'Leaderboard Lurker',
    emoji: '👀',
    description: 'Checked the leaderboard 20+ times. Competitive spirit.'
  },
  top_ten_achiever: {
    code: 'top_ten_achiever',
    name: 'Top Ten Achiever',
    emoji: '🔟',
    description: 'Reached top 10 on the leaderboard. Elite status achieved.'
  },
  supporter_status: {
    code: 'supporter_status',
    name: 'Supporter Status',
    emoji: '💎',
    description: 'Became a Squashie supporter. Thanks for keeping the lights on.'
  },
  archetype_collector: {
    code: 'archetype_collector',
    name: 'Archetype Collector',
    emoji: '🎭',
    description: 'Unlocked 10+ different archetypes. Personality chameleon.'
  },
  achievement_hunter: {
    code: 'achievement_hunter',
    name: 'Achievement Hunter',
    emoji: '🏆',
    description: 'Unlocked 25+ achievements. Gotta catch \'em all.'
  },
  completionist: {
    code: 'completionist',
    name: 'Completionist',
    emoji: '💯',
    description: 'Unlocked 50+ achievements. Dedication level: maximum.'
  },
  squashcred_millionaire: {
    code: 'squashcred_millionaire',
    name: 'SquashCred Millionaire',
    emoji: '💰',
    description: 'Reached 10,000+ SquashCred points. Virtual wealth achieved.'
  },
  negative_nancy: {
    code: 'negative_nancy',
    name: 'Negative Nancy',
    emoji: '📉',
    description: 'Reached -50 SquashCred points. Maybe work on that attitude.'
  },
  comeback_story: {
    code: 'comeback_story',
    name: 'Comeback Story',
    emoji: '📈',
    description: 'Went from negative to positive SquashCred. Redemption arc complete.'
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
    // New context fields for expanded achievements
    weekendConflicts?: number;
    isMidnightActivity?: boolean;
    emojiCount?: number;
    capsPercentage?: number;
    questionMarkCount?: number;
    exclamationCount?: number;
    sorryCount?: number;
    literallyCount?: number;
    obviouslyCount?: number;
    hasWhatever?: boolean;
    fineCount?: number;
    isBirthday?: boolean;
    isHoliday?: boolean;
    mondayConflicts?: number;
    fridayResolutions?: number;
    isEarlyMorning?: boolean;
    isLateNight?: boolean;
    isLunchTime?: boolean;
    sameDayResolutions?: number;
    responseTimeHours?: number;
    activeConflictCount?: number;
    isFirstResolution?: boolean;
    responderResolutions?: number;
    hasHighResolutionRate?: boolean;
    aiJudgmentCount?: number;
    hasReturnedAfterBreak?: boolean;
    rehashCount?: number;
    coreIssueCount?: number;
    satisfiedVotes?: number;
    notSatisfiedVotes?: number;
    publicVoteCount?: number;
    redditVoteCount?: number;
    therapyVotes?: number;
    aiRightVotes?: number;
    bothWrongVotes?: number;
    resetVotes?: number;
    profileUpdateCount?: number;
    hasChangedUsername?: boolean;
    hasCustomAvatar?: boolean;
    leaderboardViews?: number;
    isTopTen?: boolean;
    isSupporter?: boolean;
    achievementCount?: number;
    squashCredPoints?: number;
    hasNegativePoints?: boolean;
    hasComeback?: boolean;
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

      // NEW ACHIEVEMENT CHECKS
      
      // Weekend warrior
      if (context.weekendConflicts && context.weekendConflicts >= 3) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'weekend_warrior');
        if (isNewAchievement) newAchievements.push('weekend_warrior');
      }

      // Midnight mediator
      if (context.isMidnightActivity) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'midnight_mediator');
        if (isNewAchievement) newAchievements.push('midnight_mediator');
      }

      // Emoji enthusiast
      if (context.emojiCount && context.emojiCount >= 10) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'emoji_enthusiast');
        if (isNewAchievement) newAchievements.push('emoji_enthusiast');
      }

      // Caps lock crusader
      if (context.capsPercentage && context.capsPercentage >= 50) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'caps_lock_crusader');
        if (isNewAchievement) newAchievements.push('caps_lock_crusader');
      }

      // Question mark addict
      if (context.questionMarkCount && context.questionMarkCount >= 5) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'question_mark_addict');
        if (isNewAchievement) newAchievements.push('question_mark_addict');
      }

      // Exclamation explosion
      if (context.exclamationCount && context.exclamationCount >= 10) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'exclamation_explosion');
        if (isNewAchievement) newAchievements.push('exclamation_explosion');
      }

      // Sorry not sorry
      if (context.sorryCount && context.sorryCount >= 3) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'sorry_not_sorry');
        if (isNewAchievement) newAchievements.push('sorry_not_sorry');
      }

      // Literally obsessed
      if (context.literallyCount && context.literallyCount >= 5) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'literally_obsessed');
        if (isNewAchievement) newAchievements.push('literally_obsessed');
      }

      // Obviously obvious
      if (context.obviouslyCount && context.obviouslyCount >= 3) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'obviously_obvious');
        if (isNewAchievement) newAchievements.push('obviously_obvious');
      }

      // Whatever warrior
      if (context.hasWhatever) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'whatever_warrior');
        if (isNewAchievement) newAchievements.push('whatever_warrior');
      }

      // Fine collector
      if (context.fineCount && context.fineCount >= 3) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'fine_collector');
        if (isNewAchievement) newAchievements.push('fine_collector');
      }

      // Birthday drama
      if (context.isBirthday) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'birthday_drama');
        if (isNewAchievement) newAchievements.push('birthday_drama');
      }

      // Holiday havoc
      if (context.isHoliday) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'holiday_havoc');
        if (isNewAchievement) newAchievements.push('holiday_havoc');
      }

      // Monday meltdown
      if (context.mondayConflicts && context.mondayConflicts >= 3) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'monday_meltdown');
        if (isNewAchievement) newAchievements.push('monday_meltdown');
      }

      // Friday feelings
      if (context.fridayResolutions && context.fridayResolutions >= 3) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'friday_feelings');
        if (isNewAchievement) newAchievements.push('friday_feelings');
      }

      // Early bird drama
      if (context.isEarlyMorning) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'early_bird_drama');
        if (isNewAchievement) newAchievements.push('early_bird_drama');
      }

      // Night owl nonsense
      if (context.isLateNight) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'night_owl_nonsense');
        if (isNewAchievement) newAchievements.push('night_owl_nonsense');
      }

      // Lunch break beef
      if (context.isLunchTime) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'lunch_break_beef');
        if (isNewAchievement) newAchievements.push('lunch_break_beef');
      }

      // Same day resolver
      if (context.sameDayResolutions && context.sameDayResolutions >= 5) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'same_day_resolver');
        if (isNewAchievement) newAchievements.push('same_day_resolver');
      }

      // Procrastination station
      if (context.responseTimeHours && context.responseTimeHours >= 72) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'procrastination_station');
        if (isNewAchievement) newAchievements.push('procrastination_station');
      }

      // Speed demon
      if (context.responseTimeHours && context.responseTimeHours < 0.083) { // 5 minutes
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'speed_demon');
        if (isNewAchievement) newAchievements.push('speed_demon');
      }

      // Multi-tasker
      if (context.activeConflictCount && context.activeConflictCount >= 5) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'multi_tasker');
        if (isNewAchievement) newAchievements.push('multi_tasker');
      }

      // Conflict collector
      if (context.totalConflicts === 25) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'conflict_collector');
        if (isNewAchievement) newAchievements.push('conflict_collector');
      }

      // Resolution rookie
      if (context.isFirstResolution) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'resolution_rookie');
        if (isNewAchievement) newAchievements.push('resolution_rookie');
      }

      // Mediator in training
      if (context.responderResolutions && context.responderResolutions >= 5) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'mediator_in_training');
        if (isNewAchievement) newAchievements.push('mediator_in_training');
      }

      // Conflict veteran
      if (context.totalConflicts === 50) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'conflict_veteran');
        if (isNewAchievement) newAchievements.push('conflict_veteran');
      }

      // Drama magnet
      if (context.totalConflicts === 20) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'drama_magnet');
        if (isNewAchievement) newAchievements.push('drama_magnet');
      }

      // Peace keeper
      if (context.hasHighResolutionRate) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'peace_keeper');
        if (isNewAchievement) newAchievements.push('peace_keeper');
      }

      // Chaos coordinator
      if (context.aiJudgmentCount && context.aiJudgmentCount >= 10) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'chaos_coordinator');
        if (isNewAchievement) newAchievements.push('chaos_coordinator');
      }

      // Comeback kid
      if (context.hasReturnedAfterBreak) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'comeback_kid');
        if (isNewAchievement) newAchievements.push('comeback_kid');
      }

      // Serial rehasher
      if (context.rehashCount && context.rehashCount >= 5) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'serial_rehash');
        if (isNewAchievement) newAchievements.push('serial_rehash');
      }

      // Core issue champion
      if (context.coreIssueCount && context.coreIssueCount >= 10) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'core_issue_champion');
        if (isNewAchievement) newAchievements.push('core_issue_champion');
      }

      // Satisfaction seeker
      if (context.satisfiedVotes && context.satisfiedVotes >= 20) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'satisfaction_seeker');
        if (isNewAchievement) newAchievements.push('satisfaction_seeker');
      }

      // Never satisfied
      if (context.notSatisfiedVotes && context.notSatisfiedVotes >= 10) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'never_satisfied');
        if (isNewAchievement) newAchievements.push('never_satisfied');
      }

      // Voting enthusiast
      if (context.publicVoteCount && context.publicVoteCount >= 25) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'voting_enthusiast');
        if (isNewAchievement) newAchievements.push('voting_enthusiast');
      }

      // Reddit judge
      if (context.redditVoteCount && context.redditVoteCount >= 10) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'reddit_judge');
        if (isNewAchievement) newAchievements.push('reddit_judge');
      }

      // Therapy advocate
      if (context.therapyVotes && context.therapyVotes >= 5) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'therapy_advocate');
        if (isNewAchievement) newAchievements.push('therapy_advocate');
      }

      // AI believer
      if (context.aiRightVotes && context.aiRightVotes >= 10) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'ai_believer');
        if (isNewAchievement) newAchievements.push('ai_believer');
      }

      // Both wrong voter
      if (context.bothWrongVotes && context.bothWrongVotes >= 5) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'both_wrong_voter');
        if (isNewAchievement) newAchievements.push('both_wrong_voter');
      }

      // Reset enthusiast
      if (context.resetVotes && context.resetVotes >= 3) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'reset_enthusiast');
        if (isNewAchievement) newAchievements.push('reset_enthusiast');
      }

      // Profile perfectionist
      if (context.profileUpdateCount && context.profileUpdateCount >= 10) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'profile_perfectionist');
        if (isNewAchievement) newAchievements.push('profile_perfectionist');
      }

      // Username changer
      if (context.hasChangedUsername) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'username_changer');
        if (isNewAchievement) newAchievements.push('username_changer');
      }

      // Avatar artist
      if (context.hasCustomAvatar) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'avatar_artist');
        if (isNewAchievement) newAchievements.push('avatar_artist');
      }

      // Leaderboard lurker
      if (context.leaderboardViews && context.leaderboardViews >= 20) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'leaderboard_lurker');
        if (isNewAchievement) newAchievements.push('leaderboard_lurker');
      }

      // Top ten achiever
      if (context.isTopTen) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'top_ten_achiever');
        if (isNewAchievement) newAchievements.push('top_ten_achiever');
      }

      // Supporter status
      if (context.isSupporter) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'supporter_status');
        if (isNewAchievement) newAchievements.push('supporter_status');
      }

      // Archetype collector
      if (context.archetypeCount === 10) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'archetype_collector');
        if (isNewAchievement) newAchievements.push('archetype_collector');
      }

      // Achievement hunter
      if (context.achievementCount === 25) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'achievement_hunter');
        if (isNewAchievement) newAchievements.push('achievement_hunter');
      }

      // Completionist
      if (context.achievementCount === 50) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'completionist');
        if (isNewAchievement) newAchievements.push('completionist');
      }

      // SquashCred millionaire
      if (context.squashCredPoints && context.squashCredPoints >= 10000) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'squashcred_millionaire');
        if (isNewAchievement) newAchievements.push('squashcred_millionaire');
      }

      // Negative Nancy
      if (context.hasNegativePoints) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'negative_nancy');
        if (isNewAchievement) newAchievements.push('negative_nancy');
      }

      // Comeback story
      if (context.hasComeback) {
        const { isNewAchievement } = await generalAchievementsService.unlockAchievement(userId, 'comeback_story');
        if (isNewAchievement) newAchievements.push('comeback_story');
      }
    } catch (error) {
      console.error('❌ Error checking achievements:', error);
    }

    return newAchievements;
  }
};