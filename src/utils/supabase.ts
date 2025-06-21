import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Mock functions for development (replace with actual Supabase calls)
export const mockAuth = {
  signIn: async (email: string, password: string) => {
    // Mock successful login
    return { data: { user: { id: '1', email } }, error: null };
  },
  signUp: async (email: string, password: string) => {
    // Mock successful signup
    return { data: { user: { id: '1', email } }, error: null };
  },
  signOut: async () => {
    return { error: null };
  },
  getUser: async () => {
    // Mock user session
    return { data: { user: { id: '1', email: 'demo@example.com' } }, error: null };
  }
};