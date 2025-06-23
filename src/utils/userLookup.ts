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
      console.log('  - data is array:', Array.isArray(data));
      console.log('  - data length:', data?.length);

      if (error) {
        console.error('Error checking user existence:', error);
        console.log('🔍 userLookupService.checkUserExists: Returning error result');
        return { exists: false, error: error.message };
      }

      // Check if data is an array and has at least one element
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.log('🔍 userLookupService.checkUserExists: No data returned or empty array');
        return { exists: false };
      }

      // Get the first (and should be only) result from the array
      const result = data[0];
      
      console.log('🔍 userLookupService.checkUserExists: Processing first result...');
      console.log('  - result:', result);
      console.log('  - result.user_exists:', result?.user_exists);
      console.log('  - result.user_id:', result?.user_id);
      
      const finalResult = {
        exists: result?.user_exists || false,
        userId: result?.user_id || undefined
      };
      
      console.log('🔍 userLookupService.checkUserExists: Final result:', finalResult);
      return finalResult;
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