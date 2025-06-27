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
        <p className="text-dark-teal font-bold">Loading today's Reddit conflict...</p>
      </div>
    );
  }

  if (!conflict) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h1 className="text-2xl font-black text-dark-teal mb-2">NO DAILY CONFLICT AVAILABLE</h1>
        <p className="text-dark-teal font-bold mb-6">
          Today's conflict from r/AmItheAsshole hasn't been posted yet. Check back later!
        </p>
        <div className="bg-lime-chartreuse p-4 border-3 border-black shadow-brutal max-w-md mx-auto">
          <p className="text-sm text-dark-teal font-bold">
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
          <h1 className="text-4xl font-black text-dark-teal mb-2 border-b-3 border-black pb-2">
            PUBLIC SPECTACLE
          </h1>
          <p className="text-xl text-dark-teal font-bold max-w-2xl mx-auto leading-relaxed">
            Fresh drama from r/AmItheAsshole, processed through Squashie's AI for your judgment.
          </p>
        </div>

        {/* Stats */}
        <div className="bg-vivid-orange p-6 border-3 border-black shadow-brutal">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-white border-2 border-black p-3">
              <div className="text-2xl font-black text-vivid-orange">{getTotalVotes()}</div>
              <div className="text-sm text-dark-teal font-bold">TOTAL VOTES</div>
            </div>
            <div className="bg-white border-2 border-black p-3">
              <div className="text-lg sm:text-2xl font-black text-vivid-orange">r/AmItheAsshole</div>
              <div className="text-sm text-dark-teal font-bold">SOURCE SUBREDDIT</div>
            </div>
            <div className="bg-white border-2 border-black p-3">
              <div className="text-2xl font-black text-vivid-orange">DAILY</div>
              <div className="text-sm text-dark-teal font-bold">FRESH CONTENT</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Conflict Card */}
      <div className="bg-white border-3 border-black shadow-brutal mb-6">
        {/* Conflict Header */}
        <div className="p-6 border-b-3 border-black">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-2xl font-black text-dark-teal mb-3 break-words">
                {conflict.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-dark-teal font-bold">
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
              className="bg-vivid-orange hover:bg-orange-600 text-white px-4 py-2 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 flex items-center space-x-2 flex-shrink-0"
            >
              <span className="hidden sm:inline">VIEW ON REDDIT</span>
              <span className="sm:hidden">REDDIT</span>
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {/* AI Summary */}
        <div className="p-6 border-b-3 border-black">
          <h3 className="text-lg font-black text-dark-teal mb-3 flex items-center">
            <span className="text-2xl mr-2">🤖</span> SQUASHIE'S SUMMARY
          </h3>
          <p className="text-dark-teal font-bold leading-relaxed mb-4 break-words border-l-3 border-lime-chartreuse pl-3">
            {conflict.ai_summary}
          </p>
          
          <h4 className="text-md font-black text-dark-teal mb-2 flex items-center">
            <span className="text-xl mr-2">💡</span> SUGGESTED RESOLUTION
          </h4>
          <p className="text-dark-teal font-bold leading-relaxed break-words border-l-3 border-vivid-orange pl-3">
            {conflict.ai_suggestion}
          </p>
        </div>

        {/* Original Text (Expandable) */}
        <div className="p-6 border-b-3 border-black">
          <button
            onClick={() => setShowOriginalText(!showOriginalText)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-black text-dark-teal flex items-center">
              <span className="text-2xl mr-2">📜</span> ORIGINAL REDDIT POST
            </h3>
            <div className="bg-lime-chartreuse border-2 border-black p-1">
              {showOriginalText ? (
                <ChevronUp className="h-5 w-5 text-dark-teal" />
              ) : (
                <ChevronDown className="h-5 w-5 text-dark-teal" />
              )}
            </div>
          </button>
          
          {showOriginalText && (
            <div className="mt-4 p-4 bg-gray-100 border-3 border-black">
              <p className="text-dark-teal whitespace-pre-wrap leading-relaxed break-words">
                {conflict.original_text}
              </p>
            </div>
          )}
        </div>

        {/* Voting Section */}
        <div className="p-6">
          <h3 className="text-lg font-black text-dark-teal mb-4 flex items-center">
            <span className="text-2xl mr-2">🗳️</span> CAST YOUR JUDGMENT
          </h3>
          
          {!user ? (
            <div className="text-center py-4 px-2 border-3 border-black bg-lime-chartreuse">
              <p className="text-dark-teal font-bold mb-4">Log in to cast your vote and earn SquashCred</p>
              <button
                onClick={() => window.location.href = '/login'}
                className="bg-vivid-orange hover:bg-orange-600 text-white px-6 py-2 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1"
              >
                LOG IN TO VOTE
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
                    className={`flex items-center justify-between p-4 border-3 transition-all ${
                      isSelected
                        ? 'bg-lime-chartreuse border-black shadow-brutal'
                        : userVote !== null
                        ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-white border-black hover:bg-lime-chartreuse/20'
                    } ${isLoading || userVote !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="text-left min-w-0 flex-1">
                        <div className="font-black text-lg text-dark-teal">{option.label}</div>
                        <div className="text-xs text-dark-teal break-words font-bold">{option.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isSelected && <span className="text-xs text-vivid-orange font-black">✓</span>}
                      <span className="bg-dark-teal text-white px-3 py-1 text-xs font-black border-2 border-black flex-shrink-0">
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
            <div className="mt-4 p-3 bg-lime-chartreuse border-3 border-black">
              <p className="text-dark-teal font-bold">
                ✅ You've already cast your vote! Votes cannot be changed to maintain fairness.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center">
        <div className="bg-dark-teal p-6 border-3 border-black shadow-brutal">
          <h3 className="text-lg font-black text-white mb-2 flex items-center justify-center">
            <span className="text-2xl mr-2">📢</span> ABOUT REDDIT CONFLICTS
          </h3>
          <p className="text-lime-chartreuse font-bold leading-relaxed">
            These conflicts are sourced from r/AmItheAsshole and processed through Squashie's AI for educational purposes. 
            Vote responsibly and remember: everyone's just trying to figure out how to be a decent human.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RedditConflictPage;