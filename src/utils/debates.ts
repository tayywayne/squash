import { supabase } from './supabase';
import { Debate, DebateInvite, CompletedDebate, CreateDebateData, RespondToDebateData } from '../types/debate';
import { inviteService } from './invites';
import { squashCredService } from './squashcred';

export const debatesService = {
  createDebate: async (data: CreateDebateData, userId: string): Promise<string> => {
    try {
      // Insert the debate into the database
      const { data: debate, error } = await supabase
        .from('public_debates')
        .insert({
          title: data.title,
          creator_id: userId,
          creator_side: data.creator_side,
          creator_position: data.creator_position,
          opponent_side: data.opponent_side,
          opponent_email: data.opponent_email,
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating debate:', error);
        throw error;
      }

      // TODO: Send email notification to opponent_email
      // This would typically be done via a Supabase Edge Function or webhook
      try {
        await inviteService.sendDebateInvite({
          to_email: data.opponent_email,
          debate_id: debate.id,
          inviter_name: 'Someone', // This should be replaced with actual username
          debate_title: data.title
        });
      } catch (inviteError) {
        console.error('Error sending debate invite:', inviteError);
        // Don't fail the debate creation if invite sending fails
      }

      // Award SquashCred for starting a debate
      try {
        await squashCredService.awardForAction(userId, 'START_DEBATE');
      } catch (error) {
        console.error('Error awarding SquashCred for debate creation:', error);
      }

      return debate.id;
    } catch (error) {
      console.error('Error in createDebate:', error);
      throw error;
    }
  },

  getActiveDebates: async (): Promise<Debate[]> => {
    try {
      const { data, error } = await supabase.rpc('get_active_debates');

      if (error) {
        console.error('Error fetching active debates:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveDebates:', error);
      return [];
    }
  },

  getDebateById: async (debateId: string): Promise<Debate | null> => {
    try {
      const { data, error } = await supabase.rpc('get_debate_by_id', {
        p_debate_id: debateId
      });

      if (error) {
        console.error('Error fetching debate:', error);
        throw error;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error in getDebateById:', error);
      return null;
    }
  },

  getPendingDebateInvites: async (): Promise<DebateInvite[]> => {
    try {
      const { data, error } = await supabase.rpc('get_pending_debate_invites');

      if (error) {
        console.error('Error fetching pending debate invites:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPendingDebateInvites:', error);
      return [];
    }
  },

  getCompletedDebates: async (): Promise<CompletedDebate[]> => {
    try {
      const { data, error } = await supabase.rpc('get_completed_debates');

      if (error) {
        console.error('Error fetching completed debates:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCompletedDebates:', error);
      return [];
    }
  },

  respondToDebate: async (data: RespondToDebateData): Promise<boolean> => {
    try {
      const { error } = await supabase.rpc('respond_to_debate_invite', {
        p_debate_id: data.debate_id,
        p_position: data.position
      });

      if (error) {
        console.error('Error responding to debate:', error);
        throw error;
      }

      // Award SquashCred for responding to a debate
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user?.id) {
          await squashCredService.awardForAction(userData.user.id, 'RESPOND_TO_DEBATE');
        }
      } catch (error) {
        console.error('Error awarding SquashCred for debate response:', error);
      }

      return true;
    } catch (error) {
      console.error('Error in respondToDebate:', error);
      return false;
    }
  },

  castVote: async (debateId: string, voteForId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.rpc('cast_debate_vote', {
        p_debate_id: debateId,
        p_vote_for_id: voteForId
      });

      if (error) {
        console.error('Error casting vote:', error);
        throw error;
      }

      // Award SquashCred for voting
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user?.id) {
          await squashCredService.awardForAction(userData.user.id, 'VOTE_ON_DEBATE');
        }
      } catch (error) {
        console.error('Error awarding SquashCred for debate vote:', error);
      }

      return true;
    } catch (error) {
      console.error('Error in castVote:', error);
      return false;
    }
  },

  getUserDebateStats: async (userId: string): Promise<{ wins: number; participations: number }> => {
    try {
      // Get debates where user is creator or opponent
      const { data: debates, error } = await supabase
        .from('public_debates')
        .select('id, status, winner_id')
        .or(`creator_id.eq.${userId},opponent_id.eq.${userId}`);

      if (error) {
        console.error('Error fetching user debate stats:', error);
        throw error;
      }

      const wins = debates?.filter(d => d.winner_id === userId).length || 0;
      const participations = debates?.length || 0;

      return { wins, participations };
    } catch (error) {
      console.error('Error in getUserDebateStats:', error);
      return { wins: 0, participations: 0 };
    }
  }
};