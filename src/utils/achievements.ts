import { supabase } from './supabase';

export interface ArchetypeAchievement {
  archetype_name: string;
  emoji: string;
  unlocked_at: string;
}

export const achievementsService = {
  unlockArchetypeAchievement: async (
    userId: string, 
    archetypeName: string, 
    emoji: string
  ): Promise<{ isNewAchievement: boolean; error?: string }> => {
    try {
      console.log(`🏆 Attempting to unlock archetype achievement: ${archetypeName} for user ${userId}`);
      
      const { data, error } = await supabase.rpc('unlock_archetype_achievement', {
        p_user_id: userId,
        p_archetype_name: archetypeName,
        p_emoji: emoji
      });

      if (error) {
        console.error('❌ Error unlocking archetype achievement:', error);
        return { isNewAchievement: false, error: error.message };
      }

      const isNewAchievement = data === true;
      
      if (isNewAchievement) {
        console.log(`✅ New archetype achievement unlocked: ${archetypeName} ${emoji}`);
      } else {
        console.log(`ℹ️ Archetype achievement already existed: ${archetypeName}`);
      }

      return { isNewAchievement };
    } catch (error) {
      console.error('❌ Error in unlockArchetypeAchievement:', error);
      return { 
        isNewAchievement: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  getUserArchetypeAchievements: async (userId: string): Promise<ArchetypeAchievement[]> => {
    try {
      console.log(`🏆 Fetching archetype achievements for user ${userId}`);
      
      const { data, error } = await supabase.rpc('get_user_archetype_achievements', {
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Error fetching archetype achievements:', error);
        throw error;
      }

      console.log(`✅ Found ${data?.length || 0} archetype achievements for user ${userId}`);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getUserArchetypeAchievements:', error);
      return [];
    }
  }
};