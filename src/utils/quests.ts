import { supabase } from './supabase';

export interface Quest {
  quest_id: string;
  title: string;
  description: string;
  emoji: string;
  reward_cred: number;
  unlocks_tool: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  theme: string;
  is_started: boolean;
  is_completed: boolean;
  current_step: number;
  total_steps: number;
  progress_percentage: number;
}

export interface QuestStep {
  id: string;
  step_number: number;
  title: string;
  instruction: string;
  step_type: 'quiz' | 'rewrite' | 'choice';
  options?: Array<{ id: string; text: string }>;
  user_response?: string;
  is_correct?: boolean;
  completed_at?: string;
  is_completed: boolean;
}

export interface QuestDetails {
  quest: {
    id: string;
    title: string;
    description: string;
    emoji: string;
    reward_cred: number;
    unlocks_tool: string | null;
    difficulty: 'easy' | 'medium' | 'hard';
    theme: string;
  };
  user_progress: {
    is_started: boolean;
    is_completed: boolean;
    current_step: number;
    started_at: string | null;
    completed_at: string | null;
  };
  steps: QuestStep[];
}

export interface StepSubmissionResult {
  is_correct: boolean;
  feedback: string;
  quest_completed: boolean;
  next_step: number;
  total_steps: number;
}

export const questsService = {
  getAvailableQuests: async (): Promise<Quest[]> => {
    try {
      const { data, error } = await supabase.rpc('get_available_quests', {
        p_user_id: supabase.auth.getUser().then(res => res.data.user?.id)
      });

      if (error) {
        console.error('Error in getAvailableQuests:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAvailableQuests:', error);
      return [];
    }
  },

  getQuestDetails: async (questId: string): Promise<QuestDetails | null> => {
    try {
      const { data, error } = await supabase.rpc('get_quest_details', {
        p_quest_id: questId,
        p_user_id: supabase.auth.getUser().then(res => res.data.user?.id)
      });

      if (error) {
        console.error('Error in getQuestDetails:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getQuestDetails:', error);
      return null;
    }
  },

  startQuest: async (questId: string): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('start_quest', {
        p_user_id: user.id,
        p_quest_id: questId
      });

      if (error) {
        console.error('Error in startQuest:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error in startQuest:', error);
      return null;
    }
  },

  submitQuestStep: async (
    userQuestId: string,
    stepId: string,
    userResponse: string
  ): Promise<StepSubmissionResult | null> => {
    try {
      const { data, error } = await supabase.rpc('submit_quest_step', {
        p_user_quest_id: userQuestId,
        p_step_id: stepId,
        p_user_response: userResponse
      });

      if (error) {
        console.error('Error in submitQuestStep:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error in submitQuestStep:', error);
      return null;
    }
  }
};