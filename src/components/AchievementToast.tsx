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
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    const closeTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300);
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
      <div className="bg-primary-teal text-background-white border-brutal border-border-black overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2 border-b-brutal border-background-white">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span className="font-black text-sm uppercase">ACHIEVEMENT UNLOCKED!</span>
          </div>
          <button
            onClick={handleClose}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="text-4xl">{archetype.emoji}</div>
            <div className="flex-1">
              <h3 className="font-black text-lg uppercase mb-1">
                {archetype.title}
              </h3>
              <p className="text-sm font-medium leading-relaxed opacity-90">
                {archetype.description}
              </p>
            </div>
          </div>
        </div>

        {/* Animated border */}
        <div className="h-1 bg-primary-orange"></div>
      </div>

      {/* Effects */}
      <div className="absolute -top-2 -right-2 text-primary-orange animate-bounce">
        ✨
      </div>
      <div className="absolute -top-1 -left-1 text-primary-orange animate-bounce delay-150">
        ⭐
      </div>
    </div>
  );
};

export default AchievementToast;