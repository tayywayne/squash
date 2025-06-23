import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, User, TrendingUp, TrendingDown, Calendar, Clock } from 'lucide-react';
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
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
          Conflict Resolution Leaderboard
        </h1>
        <p className="text-gray-600">
          Yay for public shame! See who ranks the least and most problematic!
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time Frame Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Clock className="inline h-4 w-4 mr-1" />
              Time Frame
            </label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setTimeFrame('all-time')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors flex items-center justify-center ${
                  timeFrame === 'all-time'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                All Time
              </button>
              <button
                onClick={() => setTimeFrame('weekly')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors flex items-center justify-center ${
                  timeFrame === 'weekly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                This Week
              </button>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Award className="inline h-4 w-4 mr-1" />
              Category
            </label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCategory('least-problematic')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors flex items-center justify-center ${
                  category === 'least-problematic'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Least Problematic
              </button>
              <button
                onClick={() => setCategory('most-problematic')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors flex items-center justify-center ${
                  category === 'most-problematic'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Most Problematic
              </button>
            </div>
          </div>
        </div>

        {/* Category Description */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {category === 'least-problematic' 
              ? '🏆 Ranked by highest resolution rate, then by most conflicts resolved. These users are conflict resolution champions!'
              : '🔥 Ranked by lowest resolution rate, then by most conflicts. These users might need some mediation tips!'
            }
          </p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse-slow mb-4">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto" />
            </div>
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        ) : sortedData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤷</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">
              {timeFrame === 'weekly' 
                ? 'No conflicts have been created this week yet.'
                : 'No users have participated in conflicts yet.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">User</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Total Conflicts</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Resolved</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Resolution Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedData.map((user, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getRankBadgeColor(rank)}`}>
                          {getRankIcon(rank)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={`${user.username || user.first_name || 'Anonymous User'}'s avatar`}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-coral-100 rounded-full flex items-center justify-center">
                              <User size={20} className="text-coral-600" />
                            </div>
                          )}
                          <div>
                            <button
                              onClick={() => navigate(`/user-profile/${user.user_id}`)}
                              className="font-medium text-gray-900 hover:text-coral-600 transition-colors"
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
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-semibold text-gray-900">
                          {user.total_conflicts}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-semibold text-teal-600">
                          {user.resolved_conflicts}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.resolution_rate >= 80 
                              ? 'bg-green-100 text-green-800'
                              : user.resolution_rate >= 60
                                ? 'bg-yellow-100 text-yellow-800'
                                : user.resolution_rate >= 40
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-red-100 text-red-800'
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
        <div className="mt-6 bg-gradient-to-r from-coral-50 to-teal-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {timeFrame === 'all-time' ? 'All-Time' : 'This Week\'s'} Leaderboard Stats
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-coral-500">
                {sortedData.reduce((sum, user) => sum + user.total_conflicts, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Conflicts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-teal-500">
                {sortedData.reduce((sum, user) => sum + user.resolved_conflicts, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Resolved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-lavender-500">
                {sortedData.length > 0 
                  ? Math.round(
                      (sortedData.reduce((sum, user) => sum + user.resolved_conflicts, 0) /
                       sortedData.reduce((sum, user) => sum + user.total_conflicts, 0)) * 100
                    )
                  : 0
                }%
              </div>
              <div className="text-sm text-gray-600">Overall Resolution Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;