import { supabase } from './supabase';

export interface UserLookupResult {
  exists: boolean;
  userId?: string;
  error?: string;
}

export const userLookupService = {
  checkUserExists: async (email: string): Promise<UserLookupResult> => {
    try {
      console.log('🔍 userLookupService.checkUserExists: Starting check for email:', email);
      
      // Use the admin API to check if a user exists with this email
      const { data, error } = await supabase.rpc('check_user_exists_by_email', {
        email_to_check: email
      });

      console.log('🔍 userLookupService.checkUserExists: Raw Supabase response:');
      console.log('  - data:', data);
      console.log('  - error:', error);
      console.log('  - data type:', typeof data);
      console.log('  - error type:', typeof error);

      if (error) {
        console.error('Error checking user existence:', error);
        console.log('🔍 userLookupService.checkUserExists: Returning error result');
        return { exists: false, error: error.message };
      }

      console.log('🔍 userLookupService.checkUserExists: Processing data...');
      console.log('  - data?.user_exists:', data?.user_exists);
      console.log('  - data?.user_id:', data?.user_id);
      
      const result = {
        exists: data?.user_exists || false,
        userId: data?.user_id || undefined
      };
      
      console.log('🔍 userLookupService.checkUserExists: Final result:', result);
      return {
        exists: data?.user_exists || false,
        userId: data?.user_id || undefined
      };
    } catch (error) {
      console.error('Error in checkUserExists:', error);
      console.log('🔍 userLookupService.checkUserExists: Caught exception:', error);
      return { 
        exists: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
};