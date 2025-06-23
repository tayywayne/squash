import { supabase } from './supabase';

export interface SendInviteData {
  to_email: string;
  conflict_id: string;
  inviter_name: string;
}

export const inviteService = {
  sendConflictInvite: async (data: SendInviteData): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/send-conflict-invite`;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        return { success: false, error: 'Authentication required' };
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
        return { success: false, error: errorData.error || 'Failed to send invite' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending conflict invite:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }
};