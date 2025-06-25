import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, User, TrendingUp, TrendingDown, Calendar, Clock, Crown, Star } from 'lucide-react';
import { leaderboardService, LeaderboardUser } from '../utils/leaderboard';
import { useNavigate } from 'react-router-dom';
import UserDisplayName from '../components/UserDisplayName';
import Toast from '../components/Toast';

type TimeFrame = 'all-time' | 'weekly';
type Category = 'least-problematic' | 'most-problematic';

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('all-time');
  const [category, setCategory] = useState<Category>('least-problematic');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboardData = async () => {
      setLoading(true);
      try {
        const data = timeFrame === 'all-time' 
          ? await leaderboardService.getLeaderboardStatsAllTime()
          : await leaderboardService.getLeaderboardStatsWeekly();
        
        setLeaderboardData(data);
      } catch (error) {
        console.error('Error loading leaderboard data:', error);
        setToast({ message: 'Failed to load leaderboard data', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboardData();
  }, [timeFrame]);

  // Sort data based on category
  const sortedData = React.useMemo(() => {
    const sorted = [...leaderboardData].sort((a, b) => {
      if (category === 'least-problematic') {
        // Sort by resolution rate descending, then by total conflicts descending
        if (a.resolution_rate !== b.resolution_rate) {
          return b.resolution_rate - a.resolution_rate;
        }
        return b.total_conflicts - a.total_conflicts;
      } else {
        // Sort by resolution rate ascending, then by total conflicts descending
        if (a.resolution_rate !== b.resolution_rate) {
          return a.resolution_rate - b.resolution_rate;
        }
        return b.total_conflicts - a.total_conflicts;
      }
    });
    
    return sorted;
  }, [leaderboardData, category]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-black text-dark-teal">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 text-yellow-900 border-yellow-600 shadow-lg';
      case 2:
        return 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-gray-900 border-gray-600 shadow-lg';
      case 3:
        return 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-amber-900 border-amber-700 shadow-lg';
      default:
        return 'bg-white text-dark-teal';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-dark-teal mb-4 border-b-3 border-black pb-2 flex items-center">
          <Trophy className="h-8 w-8 text-vivid-orange mr-3" />
          CONFLICT RESOLUTION LEADERBOARD
        </h1>
        <p className="text-dark-teal font-bold text-lg">
          Yay for public shame! See who ranks the least and most problematic!
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 border-3 border-black shadow-brutal mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Time Frame Selector */}
          <div>
            <label className="block text-sm font-black text-dark-teal mb-3 uppercase">
              <Clock className="inline h-4 w-4 mr-1" />
              Time Frame
            </label>
            <div className="flex bg-gray-100 p-1 border-3 border-black">
              <button
                onClick={() => setTimeFrame('all-time')}
                className={`flex-1 py-2 px-4 text-sm font-black transition-colors flex items-center justify-center ${
                  timeFrame === 'all-time'
                    ? 'bg-lime-chartreuse text-dark-teal border-2 border-black'
                    : 'text-dark-teal hover:text-vivid-orange'
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                ALL TIME
              </button>
              <button
                onClick={() => setTimeFrame('weekly')}
                className={`flex-1 py-2 px-4 text-sm font-black transition-colors flex items-center justify-center ${
                  timeFrame === 'weekly'
                    ? 'bg-lime-chartreuse text-dark-teal border-2 border-black'
                    : 'text-dark-teal hover:text-vivid-orange'
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                THIS WEEK
              </button>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-sm font-black text-dark-teal mb-3 uppercase">
              <Award className="inline h-4 w-4 mr-1" />
              Category
            </label>
            <div className="flex bg-gray-100 p-1 border-3 border-black">
              <button
                onClick={() => setCategory('least-problematic')}
                className={`flex-1 py-2 px-4 text-sm font-black transition-colors flex items-center justify-center ${
                  category === 'least-problematic'
                    ? 'bg-lime-chartreuse text-dark-teal border-2 border-black'
                    : 'text-dark-teal hover:text-vivid-orange'
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                LEAST PROBLEMATIC
              </button>
              <button
                onClick={() => setCategory('most-problematic')}
                className={`flex-1 py-2 px-4 text-sm font-black transition-colors flex items-center justify-center ${
                  category === 'most-problematic'
                    ? 'bg-lime-chartreuse text-dark-teal border-2 border-black'
                    : 'text-dark-teal hover:text-vivid-orange'
                }`}
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                MOST PROBLEMATIC
              </button>
            </div>
          </div>
        </div>

        {/* Category Description */}
        <div className="mt-4 p-3 bg-dark-teal text-white border-2 border-black">
          <p className="text-sm font-bold">
            {category === 'least-problematic' 
              ? '🏆 Ranked by highest resolution rate, then by most conflicts resolved. These users are conflict resolution champions!'
              : '🔥 Ranked by lowest resolution rate, then by most conflicts. These users might be problematic....'
            }
          </p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white border-3 border-black shadow-brutal overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse-slow mb-4">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto" />
            </div>
            <p className="text-dark-teal font-bold">Loading leaderboard...</p>
          </div>
        ) : sortedData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤷</div>
            <h3 className="text-xl font-black text-dark-teal mb-2">NO DATA AVAILABLE</h3>
            <p className="text-dark-teal font-bold">
              {timeFrame === 'weekly' 
                ? 'No conflicts have been created this week yet.'
                : 'No users have participated in conflicts yet.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-lime-chartreuse border-b-3 border-black">
                <tr>
                  <th className="px-3 sm:px-6 py-4 text-left text-sm font-black text-dark-teal">RANK</th>
                  <th className="px-3 sm:px-6 py-4 text-left text-sm font-black text-dark-teal">USER</th>
                  <th className="px-3 sm:px-6 py-4 text-center text-sm font-black text-dark-teal">
                    <span className="hidden sm:inline">TOTAL CONFLICTS</span>
                    <span className="sm:hidden">TOTAL</span>
                  </th>
                  <th className="px-3 sm:px-6 py-4 text-center text-sm font-black text-dark-teal">
                    <span className="hidden sm:inline">RESOLVED</span>
                    <span className="sm:hidden">DONE</span>
                  </th>
                  <th className="px-3 sm:px-6 py-4 text-center text-sm font-black text-dark-teal">
                    <span className="hidden sm:inline">RESOLUTION RATE</span>
                    <span className="sm:hidden">RATE</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-3 divide-black">
                {sortedData.map((user, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={user.user_id} className="hover:bg-lime-chartreuse/10 transition-colors">
                      <td className="px-3 sm:px-6 py-4">
                        <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 border-3 ${rank <= 3 ? 'border-black' : 'border-black'} ${getRankBadgeColor(rank)} ${rank <= 3 ? 'transform rotate-3 hover:rotate-0 transition-transform duration-200' : ''}`}>
                          {getRankIcon(rank)}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={`${user.username || user.first_name || 'Anonymous User'}'s avatar`}
                              className="w-8 h-8 sm:w-10 sm:h-10 object-cover border-3 border-black flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-dark-teal border-3 border-black flex items-center justify-center flex-shrink-0">
                              <User size={16} className="text-white sm:w-5 sm:h-5" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <button
                              onClick={() => navigate(`/user-profile/${user.user_id}`)}
                              className="font-black text-dark-teal hover:text-vivid-orange transition-colors text-sm sm:text-base truncate block"
                            >
                              <UserDisplayName 
                                username={user.username}
                                archetypeEmoji={user.archetype_emoji}
                                fallback="Anonymous User"
                              />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-center">
                        <span className="text-base sm:text-lg font-black text-dark-teal">
                          {user.total_conflicts}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-center">
                        <span className="text-base sm:text-lg font-black text-green-teal">
                          {user.resolved_conflicts}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className={`px-3 py-1 text-sm font-black border-2 border-black ${
                            user.resolution_rate >= 80 
                              ? 'bg-green-teal text-white'
                              : user.resolution_rate >= 60
                                ? 'bg-lime-chartreuse text-dark-teal'
                                : user.resolution_rate >= 40
                                  ? 'bg-vivid-orange text-white'
                                  : 'bg-red-500 text-white'
                          }`}>
                            {user.resolution_rate}%
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {sortedData.length > 0 && (
        <div className="mt-6 bg-dark-teal p-6 border-3 border-black shadow-brutal">
          <h3 className="text-lg font-black text-white mb-3 border-b-2 border-lime-chartreuse pb-2">
            {timeFrame === 'all-time' ? 'ALL-TIME' : 'THIS WEEK\'S'} LEADERBOARD STATS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-white border-2 border-black p-4">
              <div className="text-2xl font-black text-vivid-orange">
                {sortedData.reduce((sum, user) => sum + user.total_conflicts, 0)}
              </div>
              <div className="text-sm text-dark-teal font-bold">TOTAL CONFLICTS</div>
            </div>
            <div className="bg-white border-2 border-black p-4">
              <div className="text-2xl font-black text-green-teal">
                {sortedData.reduce((sum, user) => sum + user.resolved_conflicts, 0)}
              </div>
              <div className="text-sm text-dark-teal font-bold">TOTAL RESOLVED</div>
            </div>
            <div className="bg-white border-2 border-black p-4">
              <div className="text-2xl font-black text-lime-chartreuse">
                {sortedData.length > 0 
                  ? Math.round(
                      (sortedData.reduce((sum, user) => sum + user.resolved_conflicts, 0) /
                       sortedData.reduce((sum, user) => sum + user.total_conflicts, 0)) * 100
                    )
                  : 0
                }%
              </div>
              <div className="text-sm text-dark-teal font-bold">OVERALL RESOLUTION RATE</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;