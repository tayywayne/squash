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
          points: 'text-sm font-black',
          tier: 'text-xs'
        };
      case 'lg':
        return {
          container: 'text-base',
          icon: 'h-5 w-5',
          points: 'text-xl font-black',
          tier: 'text-sm'
        };
      default:
        return {
          container: 'text-sm',
          icon: 'h-4 w-4',
          points: 'text-base font-black',
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
      <div className={`flex items-center space-x-1 text-white ${sizeClasses.container} ${className}`}>
        <Coins className={sizeClasses.icon} />
        <span className="font-bold">0 CRED</span>
      </div>
    );
  }

  const { squashcred, tier_emoji, tier_title } = pointsData;
  const pointsColorClass = squashCredService.getPointsColorClass(squashcred);

  return (
    <div className={`flex items-center space-x-2 ${sizeClasses.container} ${className}`}>
      {/* Points Display */}
      <div className="flex items-center space-x-1 bg-dark-teal border-2 border-black px-2 py-1">
        <Coins className={`${sizeClasses.icon} text-lime-chartreuse`} />
        <span className={`${sizeClasses.points} text-white`}>
          {squashCredService.formatPoints(squashcred)}
        </span>
        <span className="text-lime-chartreuse font-bold">CRED</span>
      </div>

      {/* Tier Display */}
      {showTier && (
        <div className="flex items-center space-x-1 bg-lime-chartreuse px-2 py-1">
          <span className="text-lg">{tier_emoji}</span>
          <span className={`${sizeClasses.tier} text-dark-teal font-bold`}>
            {tier_title}
          </span>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="relative group">
          <div className="text-white hover:text-lime-chartreuse transition-colors cursor-help">
            <Info className={sizeClasses.icon} />
          </div>
          {/* Hover tooltip */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-[9999] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-dark-teal text-white text-xs rounded-none border-3 border-black p-4 shadow-brutal w-80 max-w-sm">
              <div className="font-black mb-1 text-lime-chartreuse">
                {tier_emoji} {tier_title}
              </div>
              <div className="text-white mb-3 font-bold">
                {pointsData.tier_range}
              </div>
              <div className="text-lime-chartreuse text-xs leading-relaxed">
                Earn SquashCred by resolving conflicts, being helpful, and maintaining good behavior. 
                Lose points for ghosting, spam, or excessive drama. Stay spicy — but not toxic.
              </div>
              {/* Tooltip arrow pointing up */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-black"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SquashCredDisplay;