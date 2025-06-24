import { supabase } from './supabase';
import { openAI } from './openai';
import { generalAchievementsService } from './generalAchievements';
import { achievementsService } from './achievements';
import { squashCredService, SQUASHCRED_ACTIONS } from './squashcred';

export interface CreateConflictData {
  title: string;
  otherUserEmail: string;
  description: string;
  mood: string;
}

export interface Conflict {
  id: string;
  title: string;
  user1_id: string;
  user2_email: string;
  user2_id?: string;
  status: 'pending' | 'active' | 'resolved' | 'abandoned' | 'final_judgment';
  user1_mood: string;
  user1_raw_message: string;
  user1_translated_message?: string;
  user2_raw_message?: string;
  user2_translated_message?: string;
  ai_summary?: string;
  ai_suggestion?: string;
  user1_satisfaction?: boolean;
  user2_satisfaction?: boolean;
  created_at: string;
  resolved_at?: string;
  ai_rehash_summary?: string;
  ai_rehash_suggestion?: string;
  rehash_attempted_at?: string;
  user1_core_issue?: string;
  user2_core_issue?: string;
  ai_core_reflection?: string;
  ai_core_suggestion?: string;
  core_issues_attempted_at?: string;
  final_ai_ruling?: string;
  final_ruling_issued_at?: string;
}

export const conflictService = {
  createConflict: async (conflictData: CreateConflictData, userId: string): Promise<string> => {
    try {
      // First, translate the user's raw message using OpenAI
      const translatedMessage = await openAI.translateMessage(
        conflictData.description,
        conflictData.mood
      );

      // Insert the conflict into the database
      const { data, error } = await supabase
        .from('conflicts')
        .insert({
          title: conflictData.title,
          user1_id: userId,
          user2_email: conflictData.otherUserEmail,
          user1_mood: conflictData.mood,
          user1_raw_message: conflictData.description,
          user1_translated_message: translatedMessage,
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      // TODO: Send email notification to user2_email
      // This would typically be done via a Supabase Edge Function or webhook

      // Check for achievements after creating first conflict
      try {
        const userConflicts = await conflictService.getUserConflicts(userId, '');
        const resolvedConflicts = userConflicts.filter(c => c.status === 'resolved');
        const archetypeAchievements = await achievementsService.getUserArchetypeAchievements(userId);
        
        // Award SquashCred for starting conflict
        await squashCredService.awardForAction(userId, 'START_CONFLICT');
        
        // Award extra points for first conflict
        if (userConflicts.length === 1) {
          await squashCredService.awardForAction(userId, 'FIRST_CONFLICT');
        }
        
        await generalAchievementsService.checkAndUnlockAchievements(userId, {
          totalConflicts: userConflicts.length,
          resolvedConflicts: resolvedConflicts.length,
          archetypeCount: archetypeAchievements.length,
          hasLongMessage: conflictData.description.length > 900,
          hasIFeelMessage: conflictData.description.toLowerCase().includes('i feel')
        });
      } catch (error) {
        console.error('Error checking achievements after conflict creation:', error);
      }

      return data.id;
    } catch (error) {
      console.error('Error creating conflict:', error);
      throw error;
    }
  },

  getConflictById: async (conflictId: string): Promise<Conflict | null> => {
    try {
      const { data, error } = await supabase
        .from('conflicts')
        .select('*')
        .eq('id', conflictId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching conflict:', error);
      return null;
    }
  },

  getUserConflicts: async (userId: string, userEmail: string): Promise<Conflict[]> => {
    try {
      const { data, error } = await supabase
        .from('conflicts')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId},user2_email.eq.${userEmail}`)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user conflicts:', error);
      return [];
    }
  },

  respondToConflict: async (conflictId: string, response: string, userId: string): Promise<void> => {
    try {
      // First, get the conflict to check if user is user2
      const conflict = await conflictService.getConflictById(conflictId);
      if (!conflict) {
        throw new Error('Conflict not found');
      }

      // Translate the response using OpenAI
      const translatedResponse = await openAI.translateMessage(response, 'responsive');

      // Update the conflict with user2's response
      const { error } = await supabase
        .from('conflicts')
        .update({
          user2_id: userId,
          user2_raw_message: response,
          user2_translated_message: translatedResponse,
          status: 'active'
        })
        .eq('id', conflictId);

      if (error) {
        throw error;
      }

      // Generate AI resolution
      if (conflict.user1_translated_message) {
        const resolution = await openAI.generateResolution(
          conflict.user1_translated_message,
          translatedResponse
        );

        // Update with AI resolution
        await supabase
          .from('conflicts')
          .update({
            ai_summary: resolution.summary,
            ai_suggestion: resolution.suggestion
          })
          .eq('id', conflictId);
      }
      
      // Award SquashCred for responding to conflict
      try {
        await squashCredService.awardForAction(userId, 'RESPOND_TO_CONFLICT');
      } catch (error) {
        console.error('Error awarding SquashCred for response:', error);
      }
    } catch (error) {
      console.error('Error responding to conflict:', error);
      throw error;
    }
  },

  updateSatisfaction: async (conflictId: string, satisfaction: boolean, userId: string): Promise<void> => {
    try {
      const conflict = await conflictService.getConflictById(conflictId);
      if (!conflict) {
        throw new Error('Conflict not found');
      }

      const updateData: any = {};
      
      if (conflict.user1_id === userId) {
        updateData.user1_satisfaction = satisfaction;
      } else if (conflict.user2_id === userId) {
        updateData.user2_satisfaction = satisfaction;
      } else {
        throw new Error('User not authorized to update this conflict');
      }

      // Check if both users have responded and both are satisfied
      const otherUserSatisfied = conflict.user1_id === userId 
        ? conflict.user2_satisfaction 
        : conflict.user1_satisfaction;

      if (satisfaction && otherUserSatisfied) {
        updateData.status = 'resolved';
        updateData.resolved_at = new Date().toISOString();
        
        // Award SquashCred for resolving conflict
        try {
          await squashCredService.awardForAction(userId, 'RESOLVE_CONFLICT');
          
          // Check if it was a quick resolution (under 1 hour)
          const createdAt = new Date(conflict.created_at);
          const now = new Date();
          const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 1) {
            await squashCredService.awardForAction(userId, 'QUICK_RESOLUTION');
          }
          
          // Award extra points for mutual satisfaction
          if (satisfaction && otherUserSatisfied) {
            await squashCredService.awardForAction(userId, 'PEACEFUL_RESOLUTION');
          }
        } catch (error) {
          console.error('Error awarding SquashCred for resolution:', error);
        }
      } else if (!satisfaction || (otherUserSatisfied === false)) {
        // Conflict is unresolved - trigger rehash if we have the necessary data and haven't already rehashed
        if (conflict.user1_translated_message && 
            conflict.user2_translated_message && 
            conflict.ai_summary && 
            conflict.ai_suggestion &&
            !conflict.ai_rehash_summary) { // Only rehash if we haven't already
          
          try {
            console.log('Triggering AI rehash for unresolved conflict...');
            const rehashResult = await openAI.rehashConflict(
              conflict.user1_translated_message,
              conflict.user2_translated_message,
              conflict.ai_summary,
              conflict.ai_suggestion
            );
            
            updateData.ai_rehash_summary = rehashResult.summary;
            updateData.ai_rehash_suggestion = rehashResult.suggestion;
            updateData.rehash_attempted_at = new Date().toISOString();
            updateData.status = 'active'; // Set back to active for further mediation
            
            // Reset satisfaction votes so both users can vote on the rehashed content
            updateData.user1_satisfaction = null;
            updateData.user2_satisfaction = null;
            
            // Award SquashCred for rehashing
            try {
              await squashCredService.awardForAction(userId, 'REHASH_CONFLICT');
            } catch (error) {
              console.error('Error awarding SquashCred for rehash:', error);
            }
            
            console.log('AI rehash completed successfully');
          } catch (error) {
            console.error('Error during AI rehash:', error);
            // Continue with the satisfaction update even if rehash fails
          }
        } else if (conflict.ai_rehash_summary) {
          // If we already have rehashed content, just keep the conflict active
          updateData.status = 'active';
        }
      }

      const { error } = await supabase
        .from('conflicts')
        .update(updateData)
        .eq('id', conflictId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating satisfaction:', error);
      throw error;
    }
  },

  submitCoreIssue: async (conflictId: string, coreIssue: string, userId: string): Promise<void> => {
    try {
      const conflict = await conflictService.getConflictById(conflictId);
      if (!conflict) {
        throw new Error('Conflict not found');
      }

      const updateData: any = {};
      
      if (conflict.user1_id === userId) {
        updateData.user1_core_issue = coreIssue;
      } else if (conflict.user2_id === userId) {
        updateData.user2_core_issue = coreIssue;
      } else {
        throw new Error('User not authorized to update this conflict');
      }

      // Check if both users have now submitted their core issues
      const otherUserCoreIssue = conflict.user1_id === userId 
        ? conflict.user2_core_issue 
        : conflict.user1_core_issue;

      const currentUserCoreIssue = coreIssue;
      
      // If both core issues are now available, generate AI reflection
      if (otherUserCoreIssue && currentUserCoreIssue) {
        try {
          console.log('Both core issues submitted, generating AI reflection...');
          const coreReflection = await openAI.generateCoreIssuesReflection(
            conflict.user1_id === userId ? currentUserCoreIssue : otherUserCoreIssue,
            conflict.user2_id === userId ? currentUserCoreIssue : otherUserCoreIssue,
            conflict.user1_raw_message,
            conflict.user2_raw_message || '',
            conflict.ai_summary || '',
            conflict.ai_suggestion || '',
            conflict.ai_rehash_summary || '',
            conflict.ai_rehash_suggestion || ''
          );
          
          updateData.ai_core_reflection = coreReflection.reflection;
          updateData.ai_core_suggestion = coreReflection.suggestion;
          updateData.core_issues_attempted_at = new Date().toISOString();
          
          // Reset satisfaction votes so both users can vote on the new reflection
          updateData.user1_satisfaction = null;
          updateData.user2_satisfaction = null;
          
          // Award SquashCred for core issue reflection
          try {
            await squashCredService.awardForAction(userId, 'CORE_ISSUE_REFLECTION');
          } catch (error) {
            console.error('Error awarding SquashCred for core issue:', error);
          }
          
          console.log('AI core issues reflection completed successfully');
        } catch (error) {
          console.error('Error during AI core issues reflection:', error);
          // Continue with the core issue update even if AI reflection fails
        }
      }

      const { error } = await supabase
        .from('conflicts')
        .update(updateData)
        .eq('id', conflictId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error submitting core issue:', error);
      throw error;
    }
  },

  generateFinalRuling: async (conflictId: string): Promise<void> => {
    try {
      const conflict = await conflictService.getConflictById(conflictId);
      if (!conflict) {
        throw new Error('Conflict not found');
      }

      if (!conflict.user1_translated_message || !conflict.user2_translated_message) {
        throw new Error('Cannot generate final ruling without both user messages');
      }

      // Generate the dramatic final ruling using OpenAI
      const finalRuling = await openAI.generateFinalRuling(
        conflict.user1_translated_message,
        conflict.user2_translated_message
      );

      // Generate a short summary for the public feed
      const finalSummary = await openAI.generateFinalSummary(finalRuling);
      // Update the conflict with the final ruling
      const { error } = await supabase
        .from('conflicts')
        .update({
          final_ai_ruling: finalRuling,
          ai_final_summary: finalSummary,
          final_ruling_issued_at: new Date().toISOString(),
          status: 'final_judgment' // Mark as final judgment, not resolved
        })
        .eq('id', conflictId);

      if (error) {
        throw error;
      }
      
      // Check for AI judgment achievement
      try {
        await generalAchievementsService.checkAndUnlockAchievements(conflict.user1_id, {
          hasAiJudgment: true
        });
        if (conflict.user2_id) {
          await generalAchievementsService.checkAndUnlockAchievements(conflict.user2_id, {
            hasAiJudgment: true
          });
        }
      } catch (error) {
        console.error('Error checking achievements after final ruling:', error);
      }
    } catch (error) {
      console.error('Error generating final ruling:', error);
      throw error;
    }
  },

  deleteConflict: async (conflictId: string, userId: string): Promise<void> => {
    try {
      // First, get the conflict to verify ownership
      const conflict = await conflictService.getConflictById(conflictId);
      if (!conflict) {
        throw new Error('Conflict not found');
      }

      // Only allow the creator (user1) to delete the conflict
      if (conflict.user1_id !== userId) {
        throw new Error('Only the conflict creator can delete this conflict');
      }

      // Delete the conflict
      const { error } = await supabase
        .from('conflicts')
        .delete()
        .eq('id', conflictId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting conflict:', error);
      throw error;
    }
  },

  getGlobalConflictStats: async (): Promise<{ totalConflicts: number; resolvedConflicts: number; resolutionRate: number }> => {
    try {
      // Get stats from dedicated global_stats table
      const { data, error } = await supabase
        .from('global_stats')
        .select('total_conflicts, resolved_conflicts')
        .single();

      if (error) {
        console.error('Error fetching from global_stats:', error);
        throw error;
      }

      const totalConflicts = data?.total_conflicts || 0;
      const resolvedConflicts = data?.resolved_conflicts || 0;
      const resolutionRate = totalConflicts > 0 ? Math.round((resolvedConflicts / totalConflicts) * 100) : 0;

      return {
        totalConflicts,
        resolvedConflicts,
        resolutionRate
      };
    } catch (error) {
      console.error('Error fetching global conflict stats:', error);
      // Fallback to default values if there's an error
      return {
        totalConflicts: 247,
        resolvedConflicts: 189,
        resolutionRate: 77
      };
    }
  }
};