import React, { useState, useEffect } from 'react';
import { Award, Calendar, Trophy } from 'lucide-react';
import { achievementsService, ArchetypeAchievement } from '../utils/achievements';
import { archetypeService } from '../utils/archetypes';

interface ArchetypeAchievementsProps {
  userId: string;
  className?: string;
}

const ArchetypeAchievements: React.FC<ArchetypeAchievementsProps> = ({ userId, className = '' }) => {
  const [achievements, setAchievements] = useState<ArchetypeAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const userAchievements = await achievementsService.getUserArchetypeAchievements(userId);
        setAchievements(userAchievements);
      } catch (error) {
        console.error('Error loading archetype achievements:', error);
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

  const getArchetypeInfo = (archetypeName: string) => {
    return archetypeService.getArchetypeInfo(archetypeName);
  };

  if (loading) {
    return (
      <div className={`bg-white p-6 border-3 border-black shadow-brutal ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Trophy className="h-5 w-5 text-vivid-orange" />
          <h3 className="text-lg font-black text-dark-teal">ARCHETYPE COLLECTION</h3>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 border-2 border-black"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className={`bg-white p-6 border-3 border-black shadow-brutal ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Trophy className="h-5 w-5 text-vivid-orange" />
          <h3 className="text-lg font-black text-dark-teal">ARCHETYPE COLLECTION</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎭</div>
          <p className="text-dark-teal font-bold">
            No archetypes unlocked yet. Start resolving conflicts to discover your conflict personality!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 border-3 border-black shadow-brutal ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-vivid-orange" />
          <h3 className="text-lg font-black text-dark-teal">ARCHETYPE COLLECTION</h3>
        </div>
        <div className="flex items-center space-x-1 text-sm text-dark-teal">
          <Award size={16} />
          <span className="font-bold">{achievements.length} UNLOCKED</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {achievements.map((achievement, index) => {
          const archetypeInfo = getArchetypeInfo(achievement.archetype_name);
          
          return (
            <div
              key={`${achievement.archetype_name}-${index}`}
              className="group relative bg-lime-chartreuse border-3 border-black cursor-pointer aspect-square"
            >
              {/* Achievement Badge */}
              <div className="text-center p-3 flex flex-col items-center justify-between h-full">
                <div className="text-2xl">{achievement.emoji}</div>
                <div className="text-xs font-black text-dark-teal leading-tight mt-2">
                  {archetypeInfo?.title || achievement.archetype_name}
                </div>

                {/* Unlock Date */}
                <div className="flex items-center justify-center mt-auto text-xs text-dark-teal">
                  <Calendar size={10} className="mr-1" />
                  <span className="font-bold">{formatUnlockDate(achievement.unlocked_at)}</span>
                </div>
              </div>

              {/* Tooltip on Hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="bg-dark-teal text-white text-xs border-3 border-black p-4 shadow-brutal w-80 max-w-sm">
                  <div className="font-black mb-1 text-lime-chartreuse">
                    {archetypeInfo?.title || achievement.archetype_name}
                  </div>
                  <div className="text-white mb-2">
                    {archetypeInfo?.description || 'A unique conflict resolution style'}
                  </div>
                  <div className="text-lime-chartreuse text-xs font-bold">
                    Unlocked: {formatUnlockDate(achievement.unlocked_at)}
                  </div>
                  {/* Tooltip arrow */}
              <p className="text-dark-teal font-bold px-4">
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArchetypeAchievements;