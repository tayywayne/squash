import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ThumbsUp, Users, Crown, Share2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { debatesService } from '../utils/debates';
import { Debate } from '../types/debate';
import UserDisplayName from '../components/UserDisplayName';
import Toast from '../components/Toast';

const DebateDetailPage: React.FC = () => {
  const { debateId } = useParams<{ debateId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [debate, setDebate] = useState<Debate | null>(null);
  const [loading, setLoading] = useState(true);
  const [voteLoading, setVoteLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const loadDebate = async () => {
      if (!debateId) {
        setToast({ message: 'Invalid debate ID', type: 'error' });
        navigate('/debates');
        return;
      }

      try {
        setLoading(true);
        const debateData = await debatesService.getDebateById(debateId);
        if (!debateData) {
          setToast({ message: 'Debate not found', type: 'error' });
          navigate('/debates');
          return;
        }
        setDebate(debateData);
      } catch (error) {
        console.error('Error loading debate:', error);
        setToast({ message: 'Failed to load debate', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadDebate();
  }, [debateId, navigate]);

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} days, ${diffHours} hours remaining`;
    } else if (diffHours > 0) {
      return `${diffHours} hours remaining`;
    } else {
      return 'Ending soon';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleVote = async (voteForId: string) => {
    if (!debate || voteLoading) return;
    
    const isCreator = user?.id === debate.creator_id;
    const isOpponent = user?.id === debate.opponent_id;
    
    if (isCreator || isOpponent) {
      setToast({ message: 'You cannot vote on your own debate', type: 'error' });
      return;
    }
    
    setVoteLoading(true);
    try {
      const success = await debatesService.castVote(debate.id, voteForId);
      
      if (success) {
        setToast({ message: 'Vote cast successfully!', type: 'success' });
        
        // Reload debate to get updated vote counts
        const updatedDebate = await debatesService.getDebateById(debate.id);
        if (updatedDebate) {
          setDebate(updatedDebate);
        }
      } else {
        setToast({ message: 'Failed to cast vote', type: 'error' });
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      setToast({ message: 'An error occurred while voting', type: 'error' });
    } finally {
      setVoteLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share && debate) {
      navigator.share({
        title: debate.title,
        text: `Check out this debate: ${debate.title}`,
        url: window.location.href
      })
      .then(() => console.log('Shared successfully'))
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href)
        .then(() => setToast({ message: 'Link copied to clipboard!', type: 'success' }))
        .catch(() => setToast({ message: 'Failed to copy link', type: 'error' }));
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-pulse-slow mb-4">
          <div className="text-6xl">⏳</div>
        </div>
        <p className="text-dark-teal font-bold">Loading debate details...</p>
      </div>
    );
  }

  if (!debate) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="text-6xl mb-4">🤷</div>
        <h1 className="text-2xl font-black text-dark-teal mb-2">DEBATE NOT FOUND</h1>
        <p className="text-dark-teal font-bold">This debate doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  const isCreator = user?.id === debate.creator_id;
  const isOpponent = user?.id === debate.opponent_id;
  const canVote = !isCreator && !isOpponent && debate.status === 'active';
  const hasVoted = !!debate.user_vote_for_id;
  const votedForCreator = debate.user_vote_for_id === debate.creator_id;
  const votedForOpponent = debate.user_vote_for_id === debate.opponent_id;
  const totalVotes = debate.creator_votes + debate.opponent_votes;
  
  // Calculate vote percentages
  const creatorPercentage = totalVotes > 0 ? Math.round((debate.creator_votes / totalVotes) * 100) : 0;
  const opponentPercentage = totalVotes > 0 ? Math.round((debate.opponent_votes / totalVotes) * 100) : 0;

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
        <button
          onClick={() => navigate('/debates')}
          className="flex items-center space-x-2 text-dark-teal hover:text-vivid-orange mb-6 transition-colors font-black"
        >
          <ArrowLeft size={20} />
          <span>BACK TO DEBATES</span>
        </button>
        
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <h1 className="text-4xl font-black text-dark-teal mb-4 border-b-3 border-black pb-2 break-words">
              {debate.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-dark-teal font-bold">
              <div className="flex items-center space-x-2">
                <Users size={16} />
                <span>Total votes: {totalVotes}</span>
              </div>
              {debate.status === 'active' && debate.expires_at && (
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>{formatTimeRemaining(debate.expires_at)}</span>
                </div>
              )}
              {debate.status === 'complete' && (
                <div className="flex items-center space-x-2">
                  <Crown size={16} />
                  <span>
                    {debate.winner_id 
                      ? `Winner: ${debate.winner_id === debate.creator_id 
                          ? debate.creator_username || 'Creator' 
                          : debate.opponent_username || 'Opponent'}`
                      : 'Tied debate'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleShare}
            className="bg-dark-teal hover:bg-teal-800 text-white px-4 py-2 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 flex items-center space-x-2 flex-shrink-0"
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">SHARE</span>
          </button>
        </div>
      </div>

      {/* Main Debate Content */}
      <div className="bg-white border-3 border-black shadow-brutal mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y-3 md:divide-y-0 md:divide-x-3 divide-black">
          {/* Creator Side */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-lime-chartreuse text-dark-teal px-3 py-1 border-2 border-black font-black">
                  {debate.creator_side}
                </div>
                <button
                  onClick={() => navigate(`/user-profile/${debate.creator_id}`)}
                  className="text-vivid-orange hover:text-orange-600 font-black"
                >
                  <UserDisplayName 
                    username={debate.creator_username}
                    archetypeEmoji={debate.creator_archetype_emoji}
                    supporterEmoji={debate.creator_supporter_emoji}
                    fallback="User"
                  />
                </button>
              </div>
              {debate.status === 'complete' && debate.winner_id === debate.creator_id && (
                <div className="text-3xl" title="Winner">👑</div>
              )}
            </div>
            
            <div className="bg-gray-100 p-4 border-3 border-black mb-6 min-h-[150px]">
              <p className="text-dark-teal font-bold whitespace-pre-wrap">{debate.creator_position}</p>
            </div>
            
            {/* Vote Button */}
            {canVote && (
              <button
                onClick={() => handleVote(debate.creator_id)}
                disabled={voteLoading}
                className={`w-full py-3 font-black border-3 transition-colors ${
                  votedForCreator
                    ? 'bg-lime-chartreuse border-black text-dark-teal'
                    : 'bg-white border-black hover:bg-lime-chartreuse/20 text-dark-teal'
                } ${voteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {votedForCreator ? '✓ VOTED FOR THIS SIDE' : `VOTE FOR ${debate.creator_side.toUpperCase()}`}
              </button>
            )}
            
            {/* Vote Results */}
            {(hasVoted || debate.status === 'complete') && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <ThumbsUp size={16} className="text-dark-teal" />
                    <span className="text-dark-teal font-bold">{debate.creator_votes} votes</span>
                  </div>
                  <span className="text-dark-teal font-black">{creatorPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 h-4 border-2 border-black">
                  <div 
                    className="bg-lime-chartreuse h-full" 
                    style={{ width: `${creatorPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Opponent Side */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-vivid-orange text-white px-3 py-1 border-2 border-black font-black">
                  {debate.opponent_side}
                </div>
                {debate.opponent_id ? (
                  <button
                    onClick={() => navigate(`/user-profile/${debate.opponent_id}`)}
                    className="text-vivid-orange hover:text-orange-600 font-black"
                  >
                    <UserDisplayName 
                      username={debate.opponent_username}
                      archetypeEmoji={debate.opponent_archetype_emoji}
                      supporterEmoji={debate.opponent_supporter_emoji}
                      fallback="Opponent"
                    />
                  </button>
                ) : (
                  <span className="text-dark-teal font-bold">Waiting for response...</span>
                )}
              </div>
              {debate.status === 'complete' && debate.winner_id === debate.opponent_id && (
                <div className="text-3xl" title="Winner">👑</div>
              )}
            </div>
            
            <div className="bg-gray-100 p-4 border-3 border-black mb-6 min-h-[150px]">
              {debate.opponent_position ? (
                <p className="text-dark-teal font-bold whitespace-pre-wrap">{debate.opponent_position}</p>
              ) : (
                <p className="text-gray-500 italic">Waiting for opponent's response...</p>
              )}
            </div>
            
            {/* Vote Button */}
            {canVote && debate.opponent_id && (
              <button
                onClick={() => handleVote(debate.opponent_id)}
                disabled={voteLoading}
                className={`w-full py-3 font-black border-3 transition-colors ${
                  votedForOpponent
                    ? 'bg-lime-chartreuse border-black text-dark-teal'
                    : 'bg-white border-black hover:bg-lime-chartreuse/20 text-dark-teal'
                } ${voteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {votedForOpponent ? '✓ VOTED FOR THIS SIDE' : `VOTE FOR ${debate.opponent_side.toUpperCase()}`}
              </button>
            )}
            
            {/* Vote Results */}
            {(hasVoted || debate.status === 'complete') && debate.opponent_id && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <ThumbsUp size={16} className="text-dark-teal" />
                    <span className="text-dark-teal font-bold">{debate.opponent_votes} votes</span>
                  </div>
                  <span className="text-dark-teal font-black">{opponentPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 h-4 border-2 border-black">
                  <div 
                    className="bg-vivid-orange h-full" 
                    style={{ width: `${opponentPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Debate Footer */}
        <div className="p-4 border-t-3 border-black bg-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-dark-teal font-bold">
              {debate.status === 'active' ? (
                <>
                  <span>Debate ends: {debate.expires_at ? formatDate(debate.expires_at) : 'Unknown'}</span>
                  {debate.expires_at && (
                    <span className="ml-2 text-vivid-orange">({formatTimeRemaining(debate.expires_at)})</span>
                  )}
                </>
              ) : debate.status === 'complete' ? (
                <>
                  <span>Debate ended: {debate.expires_at ? formatDate(debate.expires_at) : 'Unknown'}</span>
                  {debate.winner_id && (
                    <span className="ml-2 text-vivid-orange">
                      Winner: {debate.winner_id === debate.creator_id 
                        ? debate.creator_username || 'Creator' 
                        : debate.opponent_username || 'Opponent'}
                    </span>
                  )}
                </>
              ) : (
                <span>Debate created: {formatDate(debate.created_at)}</span>
              )}
            </div>
            
            {isCreator && debate.status === 'pending' && (
              <div className="bg-lime-chartreuse px-3 py-1 border-2 border-black">
                <span className="text-dark-teal font-bold text-sm">Waiting for opponent to respond</span>
              </div>
            )}
            
            {isOpponent && debate.status === 'active' && (
              <div className="bg-lime-chartreuse px-3 py-1 border-2 border-black">
                <span className="text-dark-teal font-bold text-sm">You're participating in this debate</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Voting Rules */}
      {debate.status === 'active' && (
        <div className="bg-dark-teal p-6 border-3 border-black shadow-brutal mb-6">
          <h3 className="text-lg font-black text-lime-chartreuse mb-3">VOTING RULES</h3>
          <ul className="space-y-2 text-white font-bold">
            <li className="flex items-start space-x-2">
              <span>•</span>
              <span>Vote for the side that makes the better argument</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>•</span>
              <span>You can't vote in debates you're participating in</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>•</span>
              <span>Voting earns you SquashCred points</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>•</span>
              <span>The side with the most votes after 7 days wins</span>
            </li>
          </ul>
        </div>
      )}
      
      {/* Winner Announcement */}
      {debate.status === 'complete' && debate.winner_id && (
        <div className="bg-lime-chartreuse p-6 border-3 border-black shadow-brutal text-center">
          <div className="text-5xl mb-4">👑</div>
          <h3 className="text-2xl font-black text-dark-teal mb-2">
            {debate.winner_id === debate.creator_id 
              ? debate.creator_side 
              : debate.opponent_side} WINS!
          </h3>
          <p className="text-dark-teal font-bold">
            {debate.winner_id === debate.creator_id 
              ? debate.creator_username || 'Creator' 
              : debate.opponent_username || 'Opponent'} made the better case with {
                debate.winner_id === debate.creator_id 
                  ? debate.creator_votes 
                  : debate.opponent_votes
              } votes ({
                debate.winner_id === debate.creator_id 
                  ? creatorPercentage 
                  : opponentPercentage
              }% of total votes).
          </p>
        </div>
      )}
      
      {/* Tie Announcement */}
      {debate.status === 'complete' && !debate.winner_id && (
        <div className="bg-dark-teal p-6 border-3 border-black shadow-brutal text-center">
          <div className="text-5xl mb-4">🤝</div>
          <h3 className="text-2xl font-black text-lime-chartreuse mb-2">
            IT'S A TIE!
          </h3>
          <p className="text-white font-bold">
            Both sides made equally compelling arguments with {debate.creator_votes} votes each.
          </p>
        </div>
      )}
    </div>
  );
};

export default DebateDetailPage;