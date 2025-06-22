import { supabase } from './supabase';
import { openAI } from './openai';

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
  status: 'pending' | 'active' | 'resolved' | 'abandoned';
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

  getGlobalConflictStats: async (): Promise<{ totalConflicts: number; resolvedConflicts: number; resolutionRate: number }> => {
    try {
      // Get total conflicts count
      const { count: totalCount, error: totalError } = await supabase
        .from('conflicts')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        throw totalError;
      }

      // Get resolved conflicts count
      const { count: resolvedCount, error: resolvedError } = await supabase
        .from('conflicts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved');

      if (resolvedError) {
        throw resolvedError;
      }

      const totalConflicts = totalCount || 0;
      const resolvedConflicts = resolvedCount || 0;
      const resolutionRate = totalConflicts > 0 ? Math.round((resolvedConflicts / totalConflicts) * 100) : 0;

      return {
        totalConflicts,
        resolvedConflicts,
        resolutionRate
      };
    } catch (error) {
      console.error('Error fetching global conflict stats:', error);
      throw error;
    }
  }
};