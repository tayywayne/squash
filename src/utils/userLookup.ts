import { supabase } from './supabase';

export interface UserLookupResult {
  exists: boolean;
  userId?: string;
  error?: string;
}

export const userLookupService = {
  checkUserExists: async (email: string): Promise<UserLookupResult> => {
    try {
      // Use the admin API to check if a user exists with this email
      const { data, error } = await supabase.rpc('check_user_exists_by_email', {
        email_to_check: email
      });

      if (error) {
        console.error('Error checking user existence:', error);
        return { exists: false, error: error.message };
      }

      return {
        exists: data?.exists || false,
        userId: data?.user_id || undefined
      };
    } catch (error) {
      console.error('Error in checkUserExists:', error);
      return { 
        exists: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
};