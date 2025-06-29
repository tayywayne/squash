import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ThumbsUp, Users, Crown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Debate } from '../types/debate';
import UserDisplayName from './UserDisplayName';
import { debatesService } from '../utils/debates';
import Toast from './Toast';

interface DebateCardProps {
  debate: Debate;
  showVotes?: boolean;
  onVoteCast?: () => void;
}

const DebateCard: React.FC<DebateCardProps> = ({ 
  debate, 
  showVotes = true,
  onVoteCast 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const isCreator = user?.id === debate.creator_id;
  const isOpponent = user?.id === debate.opponent_id;
  const canVote = !isCreator && !isOpponent && debate.status === 'active';
  const hasVoted = !!debate.user_vote_for_id;
  const votedForCreator = debate.user_vote_for_id === debate.creator_id;
  const votedForOpponent = debate.user_vote_for_id === debate.opponent_id;
  
  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h remaining`;
    } else if (diffHours > 0) {
      return `${diffHours}h remaining`;
    } else {
      return 'Ending soon';
    }
  };
  
  const handleVote = async (voteForId: string) => {
    if (!canVote || loading) return;
    
    setLoading(true);
    try {
      const success = await debatesService.castVote(debate.id, voteForId);
      
      if (success) {
        setToast({ message: 'Vote cast successfully!', type: 'success' });
        if (onVoteCast) onVoteCast();
      } else {
        setToast({ message: 'Failed to cast vote', type: 'error' });
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      setToast({ message: 'An error occurred while voting', type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white border-3 border-black shadow-brutal mb-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Debate Header */}
      <div className="p-4 border-b-3 border-black bg-dark-teal">
        <h3 className="text-xl font-black text-white text-center">{debate.title}</h3>
      </div>
      
      {/* Debate Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y-3 md:divide-y-0 md:divide-x-3 divide-black">
        {/* Creator Side */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="bg-lime-chartreuse text-dark-teal px-2 py-1 border-2 border-black font-black text-sm">
                {debate.creator_side}
              </div>
              <button
                onClick={() => navigate(`/user-profile/${debate.creator_id}`)}
                className="text-vivid-orange hover:text-orange-600 font-black text-sm"
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
              <div className="text-2xl" title="Winner">👑</div>
            )}
          </div>
          
          <div className="bg-gray-100 p-3 border-2 border-black mb-3 min-h-[100px]">
            <p className="text-dark-teal font-bold">{debate.creator_position}</p>
          </div>
          
          {showVotes && (
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-sm text-dark-teal font-bold">
                <ThumbsUp size={16} />
                <span>{debate.creator_votes} votes</span>
              </div>
              
              {canVote && (
                <button
                  onClick={() => handleVote(debate.creator_id)}
                  disabled={loading}
                  className={`px-3 py-1 text-sm font-black border-2 transition-colors ${
                    votedForCreator
                      ? 'bg-lime-chartreuse border-black text-dark-teal'
                      : 'bg-white border-black hover:bg-lime-chartreuse/20 text-dark-teal'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {votedForCreator ? '✓ VOTED' : 'VOTE'}
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Opponent Side */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="bg-vivid-orange text-white px-2 py-1 border-2 border-black font-black text-sm">
                {debate.opponent_side}
              </div>
              {debate.opponent_id ? (
                <button
                  onClick={() => navigate(`/user-profile/${debate.opponent_id}`)}
                  className="text-vivid-orange hover:text-orange-600 font-black text-sm"
                >
                  <UserDisplayName 
                    username={debate.opponent_username}
                    archetypeEmoji={debate.opponent_archetype_emoji}
                    supporterEmoji={debate.opponent_supporter_emoji}
                    fallback="Opponent"
                  />
                </button>
              ) : (
                <span className="text-dark-teal font-bold text-sm">Waiting for response...</span>
              )}
            </div>
            {debate.status === 'complete' && debate.winner_id === debate.opponent_id && (
              <div className="text-2xl" title="Winner">👑</div>
            )}
          </div>
          
          <div className="bg-gray-100 p-3 border-2 border-black mb-3 min-h-[100px]">
            {debate.opponent_position ? (
              <p className="text-dark-teal font-bold">{debate.opponent_position}</p>
            ) : (
              <p className="text-gray-500 italic">Waiting for opponent's response...</p>
            )}
          </div>
          
          {showVotes && (
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-sm text-dark-teal font-bold">
                <ThumbsUp size={16} />
                <span>{debate.opponent_votes} votes</span>
              </div>
              
              {canVote && debate.opponent_id && (
                <button
                  onClick={() => handleVote(debate.opponent_id)}
                  disabled={loading}
                  className={`px-3 py-1 text-sm font-black border-2 transition-colors ${
                    votedForOpponent
                      ? 'bg-lime-chartreuse border-black text-dark-teal'
                      : 'bg-white border-black hover:bg-lime-chartreuse/20 text-dark-teal'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {votedForOpponent ? '✓ VOTED' : 'VOTE'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Debate Footer */}
      <div className="p-3 border-t-3 border-black bg-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-dark-teal">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Users size={14} />
              <span className="font-bold">
                {debate.creator_votes + debate.opponent_votes} votes
              </span>
            </div>
            
            {debate.status === 'active' && debate.expires_at && (
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span className="font-bold">{formatTimeRemaining(debate.expires_at)}</span>
              </div>
            )}
            
            {debate.status === 'complete' && (
              <div className="flex items-center space-x-1">
                <Crown size={14} />
                <span className="font-bold">
                  {debate.winner_id 
                    ? `Winner: ${debate.winner_id === debate.creator_id 
                        ? debate.creator_username || 'Creator' 
                        : debate.opponent_username || 'Opponent'}`
                    : 'Tied debate'}
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={() => navigate(`/debates/${debate.id}`)}
            className="text-vivid-orange hover:text-orange-600 font-black"
          >
            VIEW DETAILS →
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebateCard;