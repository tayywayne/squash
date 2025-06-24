import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { squashCredService, UserPointsWithTier } from '../utils/squashcred';

interface SquashCredDisplayProps {
  userId: string;
  showTier?: boolean;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SquashCredDisplay: React.FC<SquashCredDisplayProps> = ({
  userId,
  showTier = true,
  showTooltip = true,
  size = 'md',
  className = ''
}) => {
  const [pointsData, setPointsData] = useState<UserPointsWithTier | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTooltipModal, setShowTooltipModal] = useState(false);

  useEffect(() => {
    const loadPointsData = async () => {
      try {
        const data = await squashCredService.getUserPointsWithTier(userId);
        setPointsData(data);
      } catch (error) {
        console.error('Error loading SquashCred data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPointsData();
  }, [userId]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'text-xs',
          icon: 'h-3 w-3',
          points: 'text-sm font-semibold',
          tier: 'text-xs'
        };
      case 'lg':
        return {
          container: 'text-base',
          icon: 'h-5 w-5',
          points: 'text-xl font-bold',
          tier: 'text-sm'
        };
      default:
        return {
          container: 'text-sm',
          icon: 'h-4 w-4',
          points: 'text-base font-semibold',
          tier: 'text-xs'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (loading) {
    return (
      <div className={`flex items-center space-x-1 animate-pulse ${className}`}>
        <div className="h-4 w-4 bg-gray-200 rounded"></div>
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!pointsData) {
    return (
      <div className={`flex items-center space-x-1 text-gray-500 ${sizeClasses.container} ${className}`}>
        <Coins className={sizeClasses.icon} />
        <span>0 SquashCred</span>
      </div>
    );
  }

  const { squashcred, tier_emoji, tier_title } = pointsData;
  const pointsColorClass = squashCredService.getPointsColorClass(squashcred);

  return (
    <div className={`flex items-center space-x-2 ${sizeClasses.container} ${className}`}>
      {/* Points Display */}
      <div className="flex items-center space-x-1">
        <Coins className={`${sizeClasses.icon} ${pointsColorClass}`} />
        <span className={`${sizeClasses.points} ${pointsColorClass}`}>
          {squashCredService.formatPoints(squashcred)}
        </span>
        <span className="text-gray-600">SquashCred</span>
      </div>

      {/* Tier Display */}
      {showTier && (
        <div className="flex items-center space-x-1">
          <span className="text-lg">{tier_emoji}</span>
          <span className={`${sizeClasses.tier} text-gray-700 font-medium`}>
            {tier_title}
          </span>
        </div>
      )}

      {/* Tooltip */}
{showTooltip && (
          </div>
          <div className="text-gray-400 hover:text-gray-600 transition-colors cursor-help">
          {/* Hover tooltip */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-[9999] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-gray-900 text-white text-xs rounded-lg p-4 shadow-xl w-80 max-w-sm">
              <div className="font-semibold mb-1">
                {tier_emoji} {tier_title}
              </div>
              <div className="text-gray-300 mb-3">
                {pointsData.tier_range}
              </div>
              <div className="text-gray-400 text-xs leading-relaxed">
                Earn SquashCred by resolving conflicts, being helpful, and maintaining good behavior. 
                Lose points for ghosting, spam, or excessive drama. Stay spicy — but not toxic.
          </div>
              {/* Tooltip arrow pointing up */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
)}
    </div>
  );
};

export default SquashCredDisplay;