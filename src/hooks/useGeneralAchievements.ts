import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { generalAchievementsService, ACHIEVEMENTS } from '../utils/generalAchievements';

interface GeneralAchievementNotification {
  name: string;
  emoji: string;
  description: string;
}

// Global state for achievement notifications
let pendingAchievementNotifications: GeneralAchievementNotification[] = [];
let notificationListeners: ((notification: GeneralAchievementNotification | null) => void)[] = [];

// Function to add a new achievement notification
export const triggerAchievementNotification = (achievementCode: string) => {
  const achievement = ACHIEVEMENTS[achievementCode];
  if (achievement) {
    const notification = {
      name: achievement.name,
      emoji: achievement.emoji,
      description: achievement.description
    };
    
    pendingAchievementNotifications.push(notification);
    
    // Notify all listeners
    notificationListeners.forEach(listener => {
      if (pendingAchievementNotifications.length > 0) {
        listener(pendingAchievementNotifications[0]);
      }
    });
  }
};

export const useGeneralAchievements = () => {
  const { user } = useAuth();
  const [pendingNotification, setPendingNotification] = useState<GeneralAchievementNotification | null>(null);

  // Subscribe to achievement notifications
  useEffect(() => {
    const handleNotification = (notification: GeneralAchievementNotification | null) => {
      if (notification && !pendingNotification) {
        setPendingNotification(notification);
      }
    };

    notificationListeners.push(handleNotification);

    // Check if there are any pending notifications when component mounts
    if (pendingAchievementNotifications.length > 0 && !pendingNotification) {
      setPendingNotification(pendingAchievementNotifications[0]);
    }

    return () => {
      const index = notificationListeners.indexOf(handleNotification);
      if (index > -1) {
        notificationListeners.splice(index, 1);
      }
    };
  }, [pendingNotification]);

  const clearNotification = useCallback(() => {
    // Remove the current notification from the queue
    if (pendingAchievementNotifications.length > 0) {
      pendingAchievementNotifications.shift();
    }
    
    setPendingNotification(null);
    
    // Show next notification if any
    setTimeout(() => {
      if (pendingAchievementNotifications.length > 0) {
        setPendingNotification(pendingAchievementNotifications[0]);
      }
    }, 500); // Small delay between notifications
  }, []);

  return {
    pendingNotification,
    clearNotification
  };
};