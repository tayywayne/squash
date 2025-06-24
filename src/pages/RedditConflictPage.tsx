import React, { useState, useEffect } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Calendar, User, MessageSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { redditConflictsService, RedditConflict, RedditVoteType, REDDIT_VOTE_OPTIONS } from '../utils/redditConflicts';
import Toast from '../components/Toast';

const RedditConflictPage: React.FC = () => {
  const { user } = useAuth();
  const [conflict, setConflict] = useState<RedditConflict | null>(null);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [votingLoading, setVotingLoading] = useState<string | null>(null);
  const [showOriginalText, setShowOriginalText] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load current conflict
  useEffect(() => {
    const loadConflict = async () => {
      try {
        const currentConflict = await redditConflictsService.getCurrentConflict();
        setConflict(currentConflict);

        // Load user's vote if authenticated and conflict exists
        if (user?.id && currentConflict) {
          const vote = await redditConflictsService.getUserVote(currentConflict.id, user.id);
          setUserVote(vote?.vote_type || null);
        }
      } catch (error) {
        console.error('Error loading Reddit conflict:', error);
        setToast({ message: 'Failed to load daily conflict', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadConflict();
  }, [user?.id]);

  const handleVote = async (voteType: RedditVoteType) => {
    if (!user?.id || !conflict) {
      setToast({ message: 'Please log in to vote', type: 'error' });
      return;
    }

    setVotingLoading(voteType);

    try {
      const { success, error } = await redditConflictsService.castVote(conflict.id, voteType, user.id);
      
      if (success) {
        // Update local state optimistically
        setUserVote(voteType);
        
        // Reload conflict to get updated vote counts
        const updatedConflict = await redditConflictsService.getCurrentConflict();
        if (updatedConflict) {
          setConflict(updatedConflict);
        }
        
        setToast({ message: 'Vote cast successfully! +5 SquashCred earned', type: 'success' });
      } else {
        setToast({ message: error || 'Failed to cast vote', type: 'error' });
      }
    } catch (error) {
      console.error('Error voting:', error);
      setToast({ message: 'Failed to cast vote', type: 'error' });
    } finally {
      setVotingLoading(null);
    }
  };

  const getVoteCount = (voteType: string): number => {
    return conflict?.vote_counts[voteType] || 0;
  };

  const getTotalVotes = (): number => {
    if (!conflict?.vote_counts) return 0;
    return Object.values(conflict.vote_counts).reduce((sum, count) => sum + count, 0);
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
          <div className="text-6xl">🤔</div>
        </div>
        <p className="text-gray-600">Loading today's Reddit conflict...</p>
      </div>
    );
  }

  if (!conflict) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No Daily Conflict Available</h1>
        <p className="text-gray-600 mb-6">
          Today's conflict from r/AmItheAsshole hasn't been posted yet. Check back later!
        </p>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 max-w-md mx-auto">
          <p className="text-sm text-yellow-800">
            💡 New conflicts are automatically posted daily. The system updates once per day with fresh drama from Reddit!
          </p>
        </div>
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
          <div className="text-6xl mb-4">🤔</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Reddit Conflict of the Day
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Fresh drama from r/AmItheAsshole, processed through Squashie's AI for your judgment.
          </p>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 sm:p-6 rounded-lg border border-orange-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{getTotalVotes()}</div>
              <div className="text-sm text-gray-600">Total Votes</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-red-600">r/AmItheAsshole</div>
              <div className="text-sm text-gray-600">Source Subreddit</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">Daily</div>
              <div className="text-sm text-gray-600">Fresh Content</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Conflict Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6 overflow-hidden">
        {/* Conflict Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 break-words">
                {conflict.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <User size={16} />
                  <span className="break-all">u/{conflict.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>{formatTimeAgo(conflict.created_at)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare size={16} />
                  <span>{getTotalVotes()} votes</span>
                </div>
              </div>
            </div>
            
            <a
              href={`https://reddit.com/r/${conflict.subreddit}/comments/${conflict.reddit_post_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm flex-shrink-0"
            >
              <span className="hidden sm:inline">View on Reddit</span>
              <span className="sm:hidden">Reddit</span>
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {/* AI Summary */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🤖 Squashie's Summary
          </h3>
          <p className="text-gray-700 leading-relaxed mb-4 break-words">
            {conflict.ai_summary}
          </p>
          
          <h4 className="text-md font-semibold text-gray-900 mb-2">
            💡 Suggested Resolution
          </h4>
          <p className="text-gray-700 leading-relaxed break-words">
            {conflict.ai_suggestion}
          </p>
        </div>

        {/* Original Text (Expandable) */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <button
            onClick={() => setShowOriginalText(!showOriginalText)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              📜 Original Reddit Post
            </h3>
            {showOriginalText ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {showOriginalText && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed break-words">
                {conflict.original_text}
              </p>
            </div>
          )}
        </div>

        {/* Voting Section */}
        <div className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🗳️ Cast Your Judgment
          </h3>
          
          {!user ? (
            <div className="text-center py-4 px-2">
              <p className="text-gray-600 mb-4">Log in to cast your vote and earn SquashCred</p>
              <button
                onClick={() => window.location.href = '/login'}
                className="bg-coral-500 hover:bg-coral-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Log In to Vote
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REDDIT_VOTE_OPTIONS.map((option) => {
                const voteCount = getVoteCount(option.type);
                const isSelected = userVote === option.type;
                const isLoading = votingLoading === option.type;
                
                return (
                  <button
                    key={option.type}
                    onClick={() => handleVote(option.type)}
                    disabled={isLoading || userVote !== null}
                    className={`flex items-center justify-between p-3 sm:p-4 rounded-lg border-2 transition-all text-sm ${
                      isSelected
                        ? 'border-coral-500 bg-coral-50 text-coral-700'
                        : userVote !== null
                        ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'border-gray-200 hover:border-coral-300 hover:bg-coral-50'
                    } ${isLoading || userVote !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="text-left min-w-0 flex-1">
                        <div className="font-bold text-base sm:text-lg">{option.label}</div>
                        <div className="text-xs sm:text-sm text-gray-600 break-words">{option.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isSelected && <span className="text-xs text-coral-600">✓</span>}
                      <span className="bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0">
                        {voteCount}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          
          {/* Show message if user has already voted */}
          {user && userVote && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
              <p className="text-sm text-blue-800">
                ✅ You've already cast your vote! Votes cannot be changed to maintain fairness.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center">
        <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            📢 About Reddit Conflicts
          </h3>
          <p className="text-sm text-blue-800 leading-relaxed">
            These conflicts are sourced from r/AmItheAsshole and processed through Squashie's AI for educational purposes. 
            Vote responsibly and remember: everyone's just trying to figure out how to be a decent human.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RedditConflictPage;