import { supabase } from './supabase';
import { squashCredService } from './squashcred';
import { generalAchievementsService } from './generalAchievements';

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
  options?: Array<{
    id: string;
    text: string;
  }>;
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
    started_at?: string;
    completed_at?: string;
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
  getAvailableQuests: async (userId: string): Promise<Quest[]> => {
    try {
      const { data, error } = await supabase.rpc('get_available_quests', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error fetching quests:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAvailableQuests:', error);
      return [];
    }
  },

  getQuestDetails: async (questId: string, userId: string): Promise<QuestDetails | null> => {
    try {
      const { data, error } = await supabase.rpc('get_quest_details', {
        p_quest_id: questId,
        p_user_id: userId
      });

      if (error) {
        console.error('Error fetching quest details:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getQuestDetails:', error);
      return null;
    }
  },

  startQuest: async (questId: string, userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('start_quest', {
        p_user_id: userId,
        p_quest_id: questId
      });

      if (error) {
        console.error('Error starting quest:', error);
        throw error;
      }

      // Check for first quest achievement
      try {
        const { data: userQuests } = await supabase
          .from('user_quests')
          .select('id')
          .eq('user_id', userId);
        
        if (userQuests && userQuests.length === 1) {
          // This is their first quest
          await generalAchievementsService.checkAndUnlockAchievements(userId, {
            hasStartedFirstQuest: true
          });
          
          // Award SquashCred for starting first quest
          await squashCredService.awardForAction(userId, 'FIRST_QUEST_STARTED');
        }
      } catch (achievementError) {
        console.error('Error checking quest achievements:', achievementError);
      }

      return data;
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
        console.error('Error submitting quest step:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in submitQuestStep:', error);
      return null;
    }
  },

  // Helper function to get difficulty badge color
  getDifficultyColor: (difficulty: string): string => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-teal text-white';
      case 'medium':
        return 'bg-vivid-orange text-white';
      case 'hard':
        return 'bg-dark-teal text-white';
      default:
        return 'bg-lime-chartreuse text-dark-teal';
    }
  },

  // Helper function to get step type icon
  getStepTypeIcon: (stepType: string): string => {
    switch (stepType) {
      case 'quiz':
        return '❓';
      case 'rewrite':
        return '✍️';
      case 'choice':
        return '🔄';
      default:
        return '📝';
    }
  }
};