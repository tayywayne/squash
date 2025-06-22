import { supabase } from './supabase';
import { Profile } from '../types';

export const profileService = {
  getProfileById: async (userId: string): Promise<Profile | null> => {
    try {
      console.log('🔍 profileService.getProfileById: Fetching profile for userId:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ profileService.getProfileById: Supabase error:', error);
        throw error;
      }

      console.log('✅ profileService.getProfileById: Profile data received:', data);
      return data;
    } catch (error) {
      console.error('❌ profileService.getProfileById: Error fetching profile:', error);
      return null;
    }
  },

  getProfileByEmail: async (email: string): Promise<Profile | null> => {
    try {
      console.log('🔍 profileService.getProfileByEmail: Fetching profile for email:', email);
      
      // First get the user ID from auth.users table via a function or direct query
      // Since we can't directly query auth.users, we'll need to use the profiles table
      // and match by email through the auth system
      
      // For now, return null as we can't easily query by email without additional setup
      console.log('ℹ️ profileService.getProfileByEmail: Email-based lookup not implemented yet');
      return null;
    } catch (error) {
      console.error('❌ profileService.getProfileByEmail: Error fetching profile:', error);
      return null;
    }
  }
};