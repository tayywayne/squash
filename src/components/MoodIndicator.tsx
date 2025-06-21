import React from 'react';
import { MoodLevel } from '../types';

interface MoodIndicatorProps {
  mood: MoodLevel;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onMoodChange?: (mood: MoodLevel) => void;
}

const MoodIndicator: React.FC<MoodIndicatorProps> = ({ 
  mood, 
  size = 'md', 
  interactive = false, 
  onMoodChange 
}) => {
  const moods: { level: MoodLevel; emoji: string; label: string; color: string }[] = [
    { level: 'rage', emoji: '😡', label: 'Rage Mode', color: 'text-red-500' },
    { level: 'annoyed', emoji: '😤', label: 'Annoyed AF', color: 'text-orange-500' },
    { level: 'meh', emoji: '😐', label: 'Meh', color: 'text-gray-500' },
    { level: 'chill', emoji: '😌', label: 'Chill Vibes', color: 'text-teal-500' },
    { level: 'zen', emoji: '🧘', label: 'Zen Master', color: 'text-green-500' },
  ];

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const currentMood = moods.find(m => m.level === mood);

  if (interactive) {
    return (
      <div className="flex items-center space-x-2">
        {moods.map((moodOption) => (
          <button
            key={moodOption.level}
            onClick={() => onMoodChange?.(moodOption.level)}
            className={`${sizeClasses[size]} p-2 rounded-lg transition-all hover:scale-110 ${
              mood === moodOption.level 
                ? 'bg-gray-100 scale-110' 
                : 'hover:bg-gray-50'
            }`}
            title={moodOption.label}
          >
            {moodOption.emoji}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${currentMood?.color}`}>
      <span className={sizeClasses[size]}>{currentMood?.emoji}</span>
      <span className="font-medium text-sm">{currentMood?.label}</span>
    </div>
  );
};

export default MoodIndicator;