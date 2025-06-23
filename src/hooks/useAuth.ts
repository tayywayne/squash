import { useState, useEffect } from 'react';
import { auth } from '../utils/supabase';
import { supabase } from '../utils/supabase';
import { Profile } from '../types';

interface AuthUser {
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
    //console.log('🔍 fetchUserProfile: Starting profile fetch for userId:', userId);
    try {
      //console.log('🔍 fetchUserProfile: Executing Supabase query for profile...');
      
      // Create a timeout promise that rejects after 10 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Profile fetch timeout - query took longer than 2 seconds'));
        }, 2000);
      });
      
      // Race the Supabase query against the timeout
      const supabaseQuery = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      const { data, error } = await Promise.race([supabaseQuery, timeoutPromise]) as any;
      
      // Log the raw Supabase response
      //console.log('🔍 fetchUserProfile: Raw Supabase response:');
      //console.log('  - data:', data);
      //console.log('  - error:', error);
     // console.log('  - data type:', typeof data);
     // console.log('  - error type:', typeof error);
     // console.log('🔍 fetchUserProfile: Supabase query completed.');

      if (error) {
        console.error('❌ fetchUserProfile: Supabase error:', error);
        console.error('❌ fetchUserProfile: Full error details:', JSON.stringify(error, null, 2));
        console.error('Error fetching profile:', error);
        return null;
      }

      //console.log('✅ fetchUserProfile: Profile data received:', data);
      return data;
    } catch (error) {
      // Check if this is a timeout error
      if (error instanceof Error && error.message.includes('Profile fetch timeout')) {
        console.warn('⚠️ fetchUserProfile: Profile fetch timed out, continuing without profile data');
      } else {
        console.error('❌ fetchUserProfile: Unexpected error:', error);
        console.error('❌ fetchUserProfile: Error type:', typeof error);
        console.error('❌ fetchUserProfile: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        console.error('Error fetching profile:', error);
      }
      return null;
    }
  };

  const setUserWithProfile = async (authUser: any) => {
    //console.log('👤 setUserWithProfile: Starting with authUser:', authUser);
    
    try {
      if (!authUser) {
     //   console.log('👤 setUserWithProfile: No authUser provided, setting user to null');
        setUser(null);
        return;
      }

     // console.log('👤 setUserWithProfile: Fetching profile for user ID:', authUser.id);
      const profile = await fetchUserProfile(authUser.id);
    //  console.log('👤 setUserWithProfile: Profile fetched:', profile);
      
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        username: profile?.username,
        first_name: profile?.first_name,
        last_name: profile?.last_name,
        avatar_url: profile?.avatar_url,
      });
    //  console.log('👤 setUserWithProfile: User state updated successfully');
    } catch (error) {
   //   console.error('❌ setUserWithProfile: Error setting user with profile:', error);
      // Set user to null as fallback to prevent stuck states
      setUser(null);
    }
  };

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
    //  console.log('🚀 checkUser: Starting authentication check');
      try {
     //   console.log('🚀 checkUser: Calling auth.getSession()');
        const { data, error } = await auth.getSession();
      //  console.log('🚀 checkUser: getSession result - data:', data, 'error:', error);
        if (error) {
         // console.error('❌ checkUser: Session check failed:', error);
         // console.error('Session check failed:', error);
        } else if (data.session?.user) {
         // console.log('✅ checkUser: Valid session found, setting user with profile');
          await setUserWithProfile(data.session.user);
         // console.log('✅ checkUser: User profile set successfully');
        } else {
         // console.log('ℹ️ checkUser: No valid session found');
        }
      } catch (error) {
        console.error('❌ checkUser: Unexpected error during auth check:', error);
        console.error('Auth check failed:', error);
      } finally {
     //   console.log('🏁 checkUser: Setting loading to false');
        setLoading(false);
      }
    };

    console.log('🎬 useAuth: useEffect triggered, calling checkUser');
    checkUser();

    // Listen for auth state changes
   // console.log('👂 useAuth: Setting up auth state change listener');
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
   //   console.log('🔄 useAuth: Auth state change detected - event:', event, 'session:', session);
      
      try {
        if (event === 'SIGNED_IN' && session?.user) {
         // console.log('✅ useAuth: User signed in, setting user with profile');
          await setUserWithProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 useAuth: User signed out, clearing user state');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ useAuth: Error in auth state change handler:', error);
        // Ensure user state is cleared on any error to prevent stuck states
        setUser(null);
      } finally {
        // CRITICAL: Always set loading to false, regardless of success or failure
        console.log('🏁 useAuth: Auth state change processed, setting loading to false');
        setLoading(false);
      }
    });

    return () => {
      console.log('🧹 useAuth: Cleaning up auth state change subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await auth.signIn(email, password);
    if (data.user) {
      await setUserWithProfile(data.user);
    }
    return { error };
  };

  const signUp = async (
    email: string, 
    password: string, 
    firstName?: string, 
    lastName?: string, 
    username?: string
  ) => {
    const { data, error } = await auth.signUp(email, password);
    
    if (data.user && !error) {
      // Update the profile with additional information
      if (firstName || lastName || username) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              first_name: firstName?.trim() || null,
              last_name: lastName?.trim() || null,
              username: username?.trim() || null,
            })
            .eq('id', data.user.id);

          if (profileError) {
            console.error('Error updating profile:', profileError);
            // Don't fail the signup if profile update fails
          }
        } catch (profileError) {
          console.error('Error updating profile:', profileError);
        }
      }
      
      await setUserWithProfile(data.user);
    }
    return { error };
  };

  const signOut = async () => {
    const { error } = await auth.signOut();
    if (!error) {
      setUser(null);
    }
    return { error };
  };

  const updateProfile = async (updates: { 
    username?: string; 
    first_name?: string; 
    last_name?: string; 
    avatar_url?: string 
  }) => {
    if (!user?.id) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      
      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error };
    }
  };

  return { user, loading, signIn, signUp, signOut, updateProfile };
};