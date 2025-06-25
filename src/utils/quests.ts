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
  options: QuestStepOption[] | null;
  user_response: string | null;
  is_correct: boolean | null;
  completed_at: string | null;
  is_completed: boolean;
}

export interface QuestStepOption {
  id: string;
  text: string;
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
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id || null;

      const { data, error } = await supabase.rpc('get_available_quests', {
        user_id_param: userId
      });

      if (error) {
        console.error('Error in getAvailableQuests:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching available quests:', error);
      throw error;
    }
  },

  getQuestDetails: async (questId: string): Promise<QuestDetails> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id || null;

      const { data, error } = await supabase.rpc('get_quest_details', {
        quest_id_param: questId,
        user_id_param: userId
      });

      if (error) {
        console.error('Error in getQuestDetails:', error);
        throw error;
      }

      return data || {
        quest: {
          id: '',
          title: '',
          description: '',
          emoji: '',
          reward_cred: 0,
          unlocks_tool: null,
          difficulty: 'easy',
          theme: ''
        },
        user_progress: {
          is_started: false,
          is_completed: false,
          current_step: 1,
          started_at: null,
          completed_at: null
        },
        steps: []
      };
    } catch (error) {
      console.error('Error fetching quest details:', error);
      throw error;
    }
  },

  startQuest: async (questId: string): Promise<string> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('start_quest', {
        user_id_param: userData.user.id,
        quest_id_param: questId
      });

      if (error) {
        console.error('Error in startQuest:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error starting quest:', error);
      throw error;
    }
  },

  submitQuestStep: async (
    userQuestId: string,
    stepId: string,
    userResponse: string
  ): Promise<StepSubmissionResult> => {
    try {
      const { data, error } = await supabase.rpc('submit_quest_step', {
        user_quest_id_param: userQuestId,
        step_id_param: stepId,
        user_response_param: userResponse
      });

      if (error) {
        console.error('Error in submitQuestStep:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error submitting quest step:', error);
      throw error;
    }
  }
};