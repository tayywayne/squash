import React, { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';

interface GeneralAchievementToastProps {
  achievement: {
    name: string;
    emoji: string;
    description: string;
  };
  onClose: () => void;
  duration?: number;
}

const GeneralAchievementToast: React.FC<GeneralAchievementToastProps> = ({ 
  achievement, 
  onClose, 
  duration = 6000 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-close after duration
    const closeTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300); // Allow exit animation
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
        isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg shadow-2xl border border-yellow-400 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-200" />
            <span className="font-bold text-sm">Achievement Unlocked!</span>
          </div>
          <button
            onClick={handleClose}
            className="text-yellow-200 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          <div className="flex items-start space-x-3">
            <div className="text-3xl">{achievement.emoji}</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-yellow-100 mb-1">
                {achievement.name}
              </h3>
              <p className="text-yellow-200 text-sm leading-relaxed">
                {achievement.description}
              </p>
            </div>
          </div>
        </div>

        {/* Animated border */}
        <div className="h-1 bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 animate-pulse"></div>
      </div>

      {/* Sparkle effects */}
      <div className="absolute -top-2 -right-2 text-yellow-200 animate-bounce">
        🏆
      </div>
      <div className="absolute -top-1 -left-1 text-yellow-200 animate-bounce delay-150">
        ⭐
      </div>
    </div>
  );
};

export default GeneralAchievementToast;