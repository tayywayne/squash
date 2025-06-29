import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { debatesService } from '../utils/debates';
import { Debate } from '../types/debate';
import UserDisplayName from '../components/UserDisplayName';
import Toast from '../components/Toast';

const RespondToDebatePage: React.FC = () => {
  const { debateId } = useParams<{ debateId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [debate, setDebate] = useState<Debate | null>(null);
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
        
        // Check if user is the invited opponent
        if (user?.email !== debateData.opponent_email) {
          setToast({ message: 'You are not authorized to respond to this debate', type: 'error' });
          navigate('/debates');
          return;
        }
        
        // Check if debate is still pending
        if (debateData.status !== 'pending') {
          setToast({ message: 'This debate is no longer pending', type: 'error' });
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
  }, [debateId, navigate, user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!debateId || !position.trim()) {
      setToast({ message: 'Please enter your argument', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const success = await debatesService.respondToDebate({
        debate_id: debateId,
        position: position.trim()
      });
      
      if (success) {
        setToast({ message: 'Response submitted successfully!', type: 'success' });
        setTimeout(() => navigate('/debates'), 1500);
      } else {
        setToast({ message: 'Failed to submit response', type: 'error' });
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      setToast({ message: 'An error occurred while submitting your response', type: 'error' });
    } finally {
      setSubmitting(false);
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
        
        <h1 className="text-4xl font-black text-dark-teal mb-4 border-b-3 border-black pb-2">
          RESPOND TO DEBATE
        </h1>
        <p className="text-dark-teal font-bold text-lg">
          You've been invited to take the opposing side in this debate. Make your case!
        </p>
      </div>

      {/* Debate Details */}
      <div className="bg-white border-3 border-black shadow-brutal mb-6">
        <div className="p-4 border-b-3 border-black bg-dark-teal">
          <h2 className="text-xl font-black text-white text-center">{debate.title}</h2>
        </div>
        
        <div className="p-6 border-b-3 border-black">
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
          </div>
          
          <div className="bg-gray-100 p-4 border-3 border-black">
            <p className="text-dark-teal font-bold">{debate.creator_position}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-vivid-orange text-white px-3 py-1 border-2 border-black font-black">
                  {debate.opponent_side}
                </div>
                <span className="text-dark-teal font-bold">YOUR SIDE</span>
              </div>
            </div>
            
            <label htmlFor="position" className="block text-sm font-black text-dark-teal mb-2">
              YOUR ARGUMENT
            </label>
            <textarea
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              rows={6}
              className="w-full p-4 border-3 border-black font-bold text-dark-teal resize-none focus:outline-none focus:border-vivid-orange transition-colors"
              placeholder={`Make your case for ${debate.opponent_side}...`}
              maxLength={500}
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-dark-teal font-bold">
                {position.length}/500
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate('/debates')}
              className="flex-1 bg-white hover:bg-gray-100 text-dark-teal font-black py-3 px-4 border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={submitting || !position.trim()}
              className="flex-1 bg-vivid-orange hover:bg-orange-600 text-white font-black py-3 px-4 border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-3 border-white border-t-transparent"></div>
                  <span>SUBMITTING...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>SUBMIT RESPONSE</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Guidelines */}
      <div className="bg-lime-chartreuse p-6 border-3 border-black shadow-brutal">
        <h3 className="text-lg font-black text-dark-teal mb-3 flex items-center">
          <span className="text-2xl mr-2">💡</span> DEBATE GUIDELINES
        </h3>
        <ul className="space-y-3 text-sm text-dark-teal font-bold">
          <li className="flex items-start border-2 border-black bg-white p-2">
            <span className="text-xl mr-2">⏱️</span>
            <span>Once you respond, the debate will be active for 7 days.</span>
          </li>
          <li className="flex items-start border-2 border-black bg-white p-2">
            <span className="text-xl mr-2">🗳️</span>
            <span>Community members will vote on which side made the better case.</span>
          </li>
          <li className="flex items-start border-2 border-black bg-white p-2">
            <span className="text-xl mr-2">👑</span>
            <span>The winner gets a crown on their profile and SquashCred points.</span>
          </li>
          <li className="flex items-start border-2 border-black bg-white p-2">
            <span className="text-xl mr-2">🤝</span>
            <span>Keep it friendly and respectful - this is for fun!</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RespondToDebatePage;