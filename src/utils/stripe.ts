import { supabase } from './supabase';

export interface CreateCheckoutSessionData {
  user_id: string;
  tip_level: 'tip_1' | 'tip_2' | 'tip_3';
}

export const stripeService = {
  createCheckoutSession: async (data: CreateCheckoutSessionData): Promise<{ url: string | null; error: string | null }> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/create-checkout-session`;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        return { url: null, error: 'Authentication required' };
      }

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { url: null, error: errorData.error || 'Failed to create checkout session' };
      }

      const result = await response.json();
      return { url: result.url, error: null };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return { url: null, error: 'Network error occurred' };
    }
  },
};