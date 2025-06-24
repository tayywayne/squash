import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, MessageSquare, Users, Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { aiJudgmentFeedService, PublicAIRuling, VoteCount, VOTE_OPTIONS, VoteType } from '../utils/aiJudgmentFeed';
import UserDisplayName from '../components/UserDisplayName';
import Toast from '../components/Toast';

const AIJudgmentFeedPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rulings, setRulings] = useState<PublicAIRulFaiing[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRuling, setExpandedRuling] = useState<string | null>(null);
  const [voteCounts, setVoteCounts] = useState<Record<string, VoteCount[]>>({});
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [votingLoading, setVotingLoading] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load public AI rulings
  useEffect(() => {
    const loadRulings = async () => {
      try {
        const data = await aiJudgmentFeedService.getPublicAIRulings();
        setRulings(data);
      } catch (error) {
        console.error('Error loading AI rulings:', error);
        setToast({ message: 'Failed to load AI rulings', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadRulings();
  }, []);

  // Load vote counts and user votes when a ruling is expanded
  useEffect(() => {
    const loadVoteData = async (conflictId: string) => {
      try {
        // Load vote counts
        const counts = await aiJudgmentFeedService.getConflictVoteCounts(conflictId);
        setVoteCounts(prev => ({ ...prev, [conflictId]: counts }));

        // Load user's vote if authenticated
        if (user?.id) {
          const userVote = await aiJudgmentFeedService.getUserVoteForConflict(conflictId, user.id);
          if (userVote) {
            setUserVotes(prev => ({ ...prev, [conflictId]: userVote.vote_type }));
          }
        }
      } catch (error) {
        console.error('Error loading vote data:', error);
      }
    };

    if (expandedRuling) {
      loadVoteData(expandedRuling);
    }
  }, [expandedRuling, user?.id]);

  const handleToggleExpand = (conflictId: string) => {
    setExpandedRuling(expandedRuling === conflictId ? null : conflictId);
  };

  const handleVote = async (conflictId: string, voteType: VoteType) => {
    if (!user?.id) {
      setToast({ message: 'Please log in to vote', type: 'error' });
      return;
    }

    // Find the ruling to get user IDs
    const ruling = rulings.find(r => r.conflict_id === conflictId);
    if (!ruling) {
      setToast({ message: 'Conflict not found', type: 'error' });
      return;
    }

    // Check if user can vote
    const { canVote, reason } = await aiJudgmentFeedService.checkCanVote(conflictId, user.id, ruling.user1_id, ruling.user2_id);
    if (!canVote) {
      setToast({ message: reason || 'Cannot vote on this conflict', type: 'error' });
      return;
    }

    setVotingLoading(prev => ({ ...prev, [conflictId]: true }));

    try {
      const { success, error } = await aiJudgmentFeedService.castVote(conflictId, voteType, user.id);
      
      if (success) {
        // Update local state optimistically
        setUserVotes(prev => ({ ...prev, [conflictId]: voteType }));
        
        // Reload vote counts
        const counts = await aiJudgmentFeedService.getConflictVoteCounts(conflictId);
        setVoteCounts(prev => ({ ...prev, [conflictId]: counts }));
        
        setToast({ message: 'Vote cast successfully!', type: 'success' });
      } else {
        setToast({ message: error || 'Failed to cast vote', type: 'error' });
      }
    } catch (error) {
      console.error('Error voting:', error);
      setToast({ message: 'Failed to cast vote', type: 'error' });
    } finally {
      setVotingLoading(prev => ({ ...prev, [conflictId]: false }));
    }
  };

  const getVoteCountForType = (conflictId: string, voteType: string): number => {
    const counts = voteCounts[conflictId] || [];
    const count = counts.find(c => c.vote_type === voteType);
    return count ? Number(count.vote_count) : 0;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return `${Math.floor(diffInDays / 7)} weeks ago`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-pulse-slow mb-4">
          <div className="text-6xl">⚖️</div>
        </div>
        <p className="text-gray-600">Loading the wall of shame...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⚖️</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Judgment Feed
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            The public wall of shame. When people can't figure their shit out, 
            Judge AI steps in with the final word. Vote on who you think was wrong.
          </p>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-red-50 to-purple-50 p-4 sm:p-6 rounded-lg border border-red-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-red-600">{rulings.length}</div>
              <div className="text-sm text-gray-600">Total AI Rulings</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {rulings.reduce((sum, r) => {
                  const totalVotes = Object.values(r.vote_counts || {}).reduce((voteSum, count) => voteSum + count, 0);
                  return sum + totalVotes;
                }, 0)}
              </div>
              <div className="text-sm text-gray-600">Public Votes Cast</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-orange-600">100%</div>
              <div className="text-sm text-gray-600">Failure Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rulings List */}
      {rulings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤷</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No AI Rulings Yet</h2>
          <p className="text-gray-600">
            Surprisingly, people are actually resolving their conflicts! 
            Check back later for some drama.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rulings.map((ruling) => (
            <div key={ruling.conflict_id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {/* Ruling Header */}
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words">
                      {ruling.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 break-words">
                      {ruling.ai_final_summary}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Users size={16} />
                        <span className="break-all">
                          {ruling.user1_id ? (
                            <button
                              onClick={() => navigate(`/user-profile/${ruling.user1_id}`)}
                              className="text-coral-500 hover:text-coral-600 font-medium underline"
                            >
                              <UserDisplayName 
                                username={ruling.user1_username}
                                archetypeEmoji={ruling.user1_archetype_emoji}
                                supporterEmoji={ruling.user1_supporter_emoji}
                                fallback="User 1"
                              />
                            </button>
                          ) : (
                            <UserDisplayName 
                              username={ruling.user1_username}
                              archetypeEmoji={ruling.user1_archetype_emoji}
                              supporterEmoji={ruling.user1_supporter_emoji}
                              fallback="User 1"
                            />
                          )}
                          {' vs '}
                          {ruling.user2_id ? (
                            <button
                              onClick={() => navigate(`/user-profile/${ruling.user2_id}`)}
                              className="text-coral-500 hover:text-coral-600 font-medium underline"
                            >
                              <UserDisplayName 
                                username={ruling.user2_username}
                                archetypeEmoji={ruling.user2_archetype_emoji}
                                supporterEmoji={ruling.user2_supporter_emoji}
                                fallback="User 2"
                              />
                            </button>
                          ) : (
                            <UserDisplayName 
                              username={ruling.user2_username}
                              archetypeEmoji={ruling.user2_archetype_emoji}
                              supporterEmoji={ruling.user2_supporter_emoji}
                              fallback="User 2"
                            />
                          )}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={16} />
                        <span>{formatTimeAgo(ruling.final_ruling_issued_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare size={16} />
                        <span>
                          {Object.values(ruling.vote_counts || {}).reduce((sum, count) => sum + count, 0)} votes
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleToggleExpand(ruling.conflict_id)}
                    className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm flex-shrink-0"
                  >
                    <span className="hidden sm:inline">💬 View Ruling</span>
                    <span className="sm:hidden">💬</span>
                    {expandedRuling === ruling.conflict_id ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Ruling Details */}
              {expandedRuling === ruling.conflict_id && (
                <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
                  {/* Full AI Ruling */}
                  <div className="bg-gradient-to-r from-purple-900 via-red-900 to-purple-900 p-4 sm:p-6 rounded-lg border-2 border-yellow-400 text-white mb-6">
                    <div className="text-center mb-4">
                      <h4 className="text-lg sm:text-xl font-bold text-yellow-300">⚖️ JUDGE AI'S FINAL RULING ⚖️</h4>
                    </div>
                    <div className="bg-black/30 p-4 rounded-lg border border-yellow-400/50">
                      <p className="text-gray-100 whitespace-pre-wrap leading-relaxed text-sm sm:text-base break-words">
                        {ruling.final_ai_ruling}
                      </p>
                    </div>
                  </div>

                  {/* Voting Section */}
                  <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      🗳️ What do you think? Cast your judgment!
                    </h4>
                    
                    {!user ? (
                      <div className="text-center py-4 px-2">
                        <p className="text-gray-600 mb-4">Log in to cast your vote on this conflict</p>
                        <button
                          onClick={() => window.location.href = '/login'}
                          className="bg-coral-500 hover:bg-coral-600 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          Log In to Vote
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {VOTE_OPTIONS.map((option) => {
                          const voteCount = getVoteCountForType(ruling.conflict_id, option.type);
                          const isSelected = userVotes[ruling.conflict_id] === option.type;
                          const isLoading = votingLoading[ruling.conflict_id];
                          
                          return (
                            <button
                              key={option.type}
                              onClick={() => handleVote(ruling.conflict_id, option.type)}
                              disabled={isLoading}
                              className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all text-sm ${
                                isSelected
                                  ? 'border-coral-500 bg-coral-50 text-coral-700'
                                  : 'border-gray-200 hover:border-coral-300 hover:bg-coral-50'
                              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{option.emoji}</span>
                                <span className="font-medium text-sm">{option.label}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {isSelected && <span className="text-xs text-coral-600">✓</span>}
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                                  {voteCount}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center">
        <div className="bg-yellow-50 p-4 sm:p-6 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            📢 Public Service Announcement
          </h3>
          <p className="text-sm text-yellow-800 leading-relaxed">
            These conflicts are displayed publicly because the participants couldn't resolve them through normal mediation. 
            Vote responsibly and remember: we're all just trying to figure out how to be decent humans.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIJudgmentFeedPage;