import { supabase } from './supabase';
import { generalAchievementsService } from './generalAchievements';

// Function to check and update achievement progress
export const achievementTracker = {
  // Track achievement progress and check for unlocks
  trackAchievementProgress: async (userId: string): Promise<void> => {
    try {
      if (!userId) return;
      
      // Get user's current achievements
      const userAchievements = await generalAchievementsService.getUserAchievements(userId);
      const achievementCount = userAchievements.length;
      
      // Check for achievement hunter and completionist achievements
      if (achievementCount >= 25 || achievementCount >= 50) {
        await generalAchievementsService.checkAndUnlockAchievements(userId, {
          achievementCount
        });
      }
    } catch (error) {
      console.error('Error tracking achievement progress:', error);
    }
  },
  
  // Check for time-based achievements (can be called periodically)
  checkTimeBasedAchievements: async (userId: string): Promise<void> => {
    try {
      if (!userId) return;
      
      // Get user's conflicts
      const { data: conflicts } = await supabase
        .from('conflicts')
        .select('created_at, resolved_at, status')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
      
      if (!conflicts || conflicts.length === 0) return;
      
      // Calculate days since last conflict
      const lastConflictDate = conflicts
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        .created_at;
      
      const now = new Date();
      const lastDate = new Date(lastConflictDate);
      const daysSinceLastConflict = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check for no conflicts in 30 days
      if (daysSinceLastConflict >= 30) {
        await generalAchievementsService.checkAndUnlockAchievements(userId, {
          daysSinceLastConflict
        });
      }
      
      // Check for comeback kid (returned after 30+ days)
      const hasRecentActivity = conflicts.some(c => {
        const activityDate = c.resolved_at || c.created_at;
        const daysSince = Math.floor((now.getTime() - new Date(activityDate).getTime()) / (1000 * 60 * 60 * 24));
        return daysSince <= 7; // Activity within the last week
      });
      
      const hasOldActivity = conflicts.some(c => {
        const activityDate = c.resolved_at || c.created_at;
        const daysSince = Math.floor((now.getTime() - new Date(activityDate).getTime()) / (1000 * 60 * 60 * 24));
        return daysSince >= 30; // Activity from more than 30 days ago
      });
      
      if (hasRecentActivity && hasOldActivity) {
        await generalAchievementsService.checkAndUnlockAchievements(userId, {
          hasReturnedAfterBreak: true
        });
      }
    } catch (error) {
      console.error('Error checking time-based achievements:', error);
    }
  },
  
  // Check for special date achievements (birthday, holidays)
  checkSpecialDateAchievements: async (userId: string, date: Date = new Date()): Promise<void> => {
    try {
      if (!userId) return;
      
      // Check if it's a holiday
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      // Major US holidays (simplified check)
      const isHoliday = (
        (month === 1 && day === 1) || // New Year's
        (month === 2 && day === 14) || // Valentine's
        (month === 7 && day === 4) || // Independence Day
        (month === 10 && day === 31) || // Halloween
        (month === 11 && (day === 24 || day === 25)) || // Thanksgiving (approx)
        (month === 12 && (day === 24 || day === 25 || day === 31)) // Christmas/New Year's Eve
      );
      
      // Get conflicts created today
      const today = date.toISOString().split('T')[0];
      const { data: todaysConflicts } = await supabase
        .from('conflicts')
        .select('id')
        .eq('user1_id', userId) // Only count conflicts the user started
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);
      
      if (todaysConflicts && todaysConflicts.length > 0) {
        // Check for holiday conflicts
        if (isHoliday) {
          await generalAchievementsService.checkAndUnlockAchievements(userId, {
            isHoliday: true
          });
        }
        
        // Birthday would require user's birth date from profile
        // This is a placeholder for future implementation
      }
    } catch (error) {
      console.error('Error checking special date achievements:', error);
    }
  }
};