import { supabase } from './supabase';
import { generalAchievementsService } from './generalAchievements';
import { squashCredService } from './squashcred';
import { useAuth } from '../hooks/useAuth';

export interface Quest {
  id: string;
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
  is_quest_achievement_unlocked: boolean;
  quest_id: string;
  quest_title?: string;
  quest_difficulty?: string;
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
        p_quest_id: questId,
        p_user_id: userId
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
        p_user_id: userData.user.id,
        p_quest_id: questId
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
    userId: string,
    userQuestId: string,
    stepId: string,
    userResponse: string
  ): Promise<StepSubmissionResult> => {
    try {
      const { data, error } = await supabase.rpc('submit_quest_step', {
        p_user_quest_id: userQuestId,
        p_step_id: stepId,
        p_user_response: userResponse,
      });

      if (error) {
        console.error('Error in submitQuestStep:', error);
        throw error;
      }

      // If quest is completed, trigger achievement
      if (data.quest_completed) {
        try {
          // If the quest achievement was newly unlocked, trigger the client-side notification
          if (data.is_quest_achievement_unlocked) {
            // Trigger the achievement notification
            await generalAchievementsService.unlockAchievement(userId, 'quest_' + data.quest_id);
            
            // Also check for general quest-related achievements
            const { data: userQuests } = await supabase
              .from('user_quests')
              .select('id')
              .eq('user_id', userId)
              .eq('is_completed', true);
              
            const questsCompleted = userQuests?.length || 0;
            
            // Check for perfect score
            const { data: questSteps } = await supabase
              .from('user_quest_steps')
              .select('is_correct')
              .eq('user_quest_id', userQuestId);
              
            const allCorrect = questSteps?.every(step => step.is_correct) || false;
            
            // Check for all difficulty levels
            const { data: completedQuestDifficulties } = await supabase
              .from('user_quests')
              .select('quests(difficulty)')
              .eq('user_id', userId)
              .eq('is_completed', true);
              
            const difficulties = new Set(completedQuestDifficulties?.map(q => q.quests?.difficulty).filter(Boolean));
            const hasAllDifficulties = difficulties.size === 3; // easy, medium, hard
            
            // Check for general quest-related achievements
            await generalAchievementsService.checkAndUnlockAchievements(userId, {
              hasStartedFirstQuest: questsCompleted === 1,
              questsCompleted,
              questPerfectScore: allCorrect,
              hasCompletedAllDifficulties: hasAllDifficulties
            });
          }
        } catch (error) {
          console.error('Error processing quest completion achievements:', error);
        }
      }

      return data;
    } catch (error) {
      console.error('Error submitting quest step:', error);
      throw error;
    }
  }
};