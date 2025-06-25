import React, { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';

interface AchievementToastProps {
  archetype: {
    title: string;
    emoji: string;
    description: string;
  };
  onClose: () => void;
  duration?: number;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ 
  archetype, 
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
      <div className="bg-dark text-text border-3 border-black shadow-brutal overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2 border-b-2 border-black">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-warning" />
            <span className="font-black text-sm">ACHIEVEMENT UNLOCKED!</span>
          </div>
          <button
            onClick={handleClose}
            className="text-text hover:text-warning transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          <div className="flex items-start space-x-3">
            <div className="text-3xl">{archetype.emoji}</div>
            <div className="flex-1">
              <h3 className="font-black text-lg text-warning mb-1">
                {archetype.title}
              </h3>
              <p className="text-text text-sm leading-relaxed">
                {archetype.description}
              </p>
            </div>
          </div>
        </div>

        {/* Animated border */}
        <div className="h-2 bg-warning"></div>
      </div>

      {/* Sparkle effects */}
      <div className="absolute -top-2 -right-2 text-warning animate-bounce">
        ✨
      </div>
      <div className="absolute -top-1 -left-1 text-warning animate-bounce delay-150">
        ⭐
      </div>
    </div>
  );
};

export default AchievementToast;