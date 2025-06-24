import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Star } from 'lucide-react';
import { generalAchievementsService, UserAchievement } from '../utils/generalAchievements';

interface GeneralAchievementsProps {
  userId: string;
  className?: string;
}

const GeneralAchievements: React.FC<GeneralAchievementsProps> = ({ userId, className = '' }) => {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const userAchievements = await generalAchievementsService.getUserAchievements(userId);
        setAchievements(userAchievements);
      } catch (error) {
        console.error('Error loading general achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, [userId]);

  const formatUnlockDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Star className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">🏆 Achievements</h3>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Star className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">🏆 Achievements</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-gray-600 text-sm">
            No achievements unlocked yet. Start resolving conflicts to earn your first badges!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">🏆 Achievements</h3>
        </div>
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Trophy size={16} />
          <span>{achievements.length} unlocked</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {achievements.map((achievement, index) => (
          <div
            key={`${achievement.code}-${index}`}
            className="group relative bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200 hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            {/* Achievement Badge */}
            <div className="text-center">
              <div className="text-2xl mb-2">{achievement.emoji}</div>
              <div className="text-xs font-medium text-yellow-900 leading-tight">
                {achievement.name}
              </div>
            </div>

            {/* Unlock Date */}
            <div className="flex items-center justify-center mt-2 text-xs text-yellow-600">
              <Calendar size={10} className="mr-1" />
              <span>{formatUnlockDate(achievement.unlocked_at)}</span>
            </div>

            {/* Tooltip on Hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg max-w-48">
                <div className="font-semibold mb-1">
                  {achievement.name}
                </div>
                <div className="text-gray-300 mb-2">
                  {achievement.description}
                </div>
                <div className="text-gray-400 text-xs">
                  Unlocked: {formatUnlockDate(achievement.unlocked_at)}
                </div>
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Achievement Progress Hint */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Keep resolving conflicts to unlock more achievements! 🎯
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeneralAchievements;