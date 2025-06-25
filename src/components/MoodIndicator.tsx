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
    { level: 'rage', emoji: '😡', label: 'RAGE MODE', color: 'text-vivid-orange' },
    { level: 'annoyed', emoji: '😤', label: 'ANNOYED AF', color: 'text-vivid-orange' },
    { level: 'meh', emoji: '😐', label: 'MEH', color: 'text-dark-teal' },
    { level: 'chill', emoji: '😌', label: 'CHILL VIBES', color: 'text-green-teal' },
    { level: 'zen', emoji: '🧘', label: 'ZEN MASTER', color: 'text-green-teal' },
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
            className={`${sizeClasses[size]} p-2 border-3 transition-all hover:scale-110 ${
              mood === moodOption.level 
                ? 'bg-lime-chartreuse border-black scale-110 shadow-brutal-sm' 
                : 'border-transparent hover:border-black'
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
      <span className={`${sizeClasses[size]} p-1`}>{currentMood?.emoji}</span>
      <span className="font-black text-sm">{currentMood?.label}</span>
    </div>
  );
};

export default MoodIndicator;