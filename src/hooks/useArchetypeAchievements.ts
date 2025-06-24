import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { achievementsService } from '../utils/achievements';
import { archetypeService } from '../utils/archetypes';

interface ArchetypeAchievementNotification {
  title: string;
  emoji: string;
  description: string;
}

export const useArchetypeAchievements = () => {
  const { user } = useAuth();
  const [pendingNotification, setPendingNotification] = useState<ArchetypeAchievementNotification | null>(null);

  // Check for new archetype achievements when user's archetype changes
  useEffect(() => {
    const checkForNewAchievement = async () => {
      if (!user?.id || !user?.conflict_archetype || !user?.archetype_emoji) {
        return;
      }

      try {
        const { isNewAchievement } = await achievementsService.unlockArchetypeAchievement(
          user.id,
          user.conflict_archetype,
          user.archetype_emoji
        );

        if (isNewAchievement) {
          const archetypeInfo = archetypeService.getArchetypeInfo(user.conflict_archetype);
          
          if (archetypeInfo) {
            setPendingNotification({
              title: archetypeInfo.title,
              emoji: archetypeInfo.emoji,
              description: archetypeInfo.description
            });
          }
        }
      } catch (error) {
        console.error('Error checking for new archetype achievement:', error);
      }
    };

    checkForNewAchievement();
  }, [user?.conflict_archetype, user?.archetype_emoji, user?.id]);

  const clearNotification = useCallback(() => {
    setPendingNotification(null);
  }, []);

  return {
    pendingNotification,
    clearNotification
  };
};