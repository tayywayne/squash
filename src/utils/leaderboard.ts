import { supabase } from './supabase';

export interface LeaderboardUser {
  user_id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  total_conflicts: number;
  resolved_conflicts: number;
  resolution_rate: number;
}

export const leaderboardService = {
  getLeaderboardStatsAllTime: async (): Promise<LeaderboardUser[]> => {
    try {
      console.log('🏆 Fetching all-time leaderboard stats...');
      
      const { data, error } = await supabase
        .rpc('get_user_conflict_stats', { start_date: null });

      if (error) {
        console.error('❌ Error fetching all-time leaderboard stats:', error);
        throw error;
      }

      console.log('✅ All-time leaderboard stats fetched:', data?.length || 0, 'users');
      return data || [];
    } catch (error) {
      console.error('❌ Error in getLeaderboardStatsAllTime:', error);
      return [];
    }
  },

  getLeaderboardStatsWeekly: async (): Promise<LeaderboardUser[]> => {
    try {
      console.log('🏆 Fetching weekly leaderboard stats...');
      
      // Calculate start of current week (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so 6 days back to Monday
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - daysToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      console.log('📅 Week starts at:', startOfWeek.toISOString());

      const { data, error } = await supabase
        .rpc('get_user_conflict_stats', { start_date: startOfWeek.toISOString() });

      if (error) {
        console.error('❌ Error fetching weekly leaderboard stats:', error);
        throw error;
      }

      console.log('✅ Weekly leaderboard stats fetched:', data?.length || 0, 'users');
      return data || [];
    } catch (error) {
      console.error('❌ Error in getLeaderboardStatsWeekly:', error);
      return [];
    }
  }
};