import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, MessageSquare, ThumbsUp, ThumbsDown, Send, AlertTriangle, CheckCircle, X, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { conflictService, Conflict } from '../utils/conflicts';
import { profileService } from '../utils/profiles';
import { aiJudgmentFeedService, VoteCount, VOTE_OPTIONS } from '../utils/aiJudgmentFeed';
import { generalAchievementsService } from '../utils/generalAchievements';
import { squashCredService } from '../utils/squashcred';
import MoodIndicator from '../components/MoodIndicator';
import UserDisplayName from '../components/UserDisplayName';
import Toast from '../components/Toast';
import { MoodLevel, Profile } from '../types';

const ConflictPage: React.FC = () => {
  const { conflictId } = useParams<{ conflictId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conflict, setConflict] = useState<Conflict | null>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<Profile | null>(null);
  const [voteCounts, setVoteCounts] = useState<VoteCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [coreIssueText, setCoreIssueText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load conflict data
  useEffect(() => {
    const loadConflict = async () => {
      if (!conflictId) {
        setToast({ message: 'Invalid conflict ID', type: 'error' });
        navigate('/dashboard');
        return;
      }

      try {
        const conflictData = await conflictService.getConflictById(conflictId);
        if (!conflictData) {
          setToast({ message: 'Conflict not found', type: 'error' });
          navigate('/dashboard');
          return;
        }

        setConflict(conflictData);

        // Load other user's profile
        if (user?.id) {
          const otherUserId = user.id === conflictData.user1_id ? conflictData.user2_id : conflictData.user1_id;
          if (otherUserId) {
            try {
              const profile = await profileService.getProfileById(otherUserId);
              setOtherUserProfile(profile);
            } catch (error) {
              console.error('Error loading other user profile:', error);
            }
          }
        }

        // Load vote counts if this is a final judgment
        if (conflictData.status === 'final_judgment') {
          try {
            const counts = await aiJudgmentFeedService.getConflictVoteCounts(conflictData.id);
            setVoteCounts(counts);
          } catch (error) {
            console.error('Error loading vote counts:', error);
          }
        }
      } catch (error) {
        console.error('Error loading conflict:', error);
        setToast({ message: 'Failed to load conflict', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadConflict();
  }, [conflictId, navigate, user?.id]);

  const handleResponse = async () => {
    if (!conflict || !user?.id || !responseText.trim()) return;

    setSubmitting(true);
    try {
      await conflictService.respondToConflict(conflict.id, responseText, user.id);
      setToast({ message: 'Response submitted! AI is processing...', type: 'success' });
      
      // Reload conflict data
      const updatedConflict = await conflictService.getConflictById(conflict.id);
      if (updatedConflict) {
        setConflict(updatedConflict);
      }
      setResponseText('');
    } catch (error) {
      console.error('Error submitting response:', error);
      setToast({ message: 'Failed to submit response', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSatisfactionVote = async (satisfied: boolean) => {
    if (!conflict || !user?.id) return;

    try {
      await conflictService.updateSatisfaction(conflict.id, satisfied, user.id);
      setToast({ 
        message: satisfied ? 'Marked as satisfied!' : 'Requesting better solution...', 
        type: 'success' 
      });
      
      // Reload conflict data
      const updatedConflict = await conflictService.getConflictById(conflict.id);
      if (updatedConflict) {
        setConflict(updatedConflict);
      }
    } catch (error) {
      console.error('Error updating satisfaction:', error);
      setToast({ message: 'Failed to update satisfaction', type: 'error' });
    }
  };

  const handleCoreIssueSubmit = async () => {
    if (!conflict || !user?.id || !coreIssueText.trim()) return;

    setSubmitting(true);
    try {
      await conflictService.submitCoreIssue(conflict.id, coreIssueText, user.id);
      setToast({ message: 'Core issue submitted!', type: 'success' });
      
      // Reload conflict data
      const updatedConflict = await conflictService.getConflictById(conflict.id);
      if (updatedConflict) {
        setConflict(updatedConflict);
      }
      setCoreIssueText('');
    } catch (error) {
      console.error('Error submitting core issue:', error);
      setToast({ message: 'Failed to submit core issue', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalRuling = async () => {
    if (!conflict) return;

    try {
      await conflictService.generateFinalRuling(conflict.id);
      setToast({ message: 'Final AI ruling generated!', type: 'info' });
      
      // Reload conflict data
      const updatedConflict = await conflictService.getConflictById(conflict.id);
      if (updatedConflict) {
        setConflict(updatedConflict);
        
        // Load vote counts for the new final judgment
        if (updatedConflict.status === 'final_judgment') {
          try {
            const counts = await aiJudgmentFeedService.getConflictVoteCounts(updatedConflict.id);
            setVoteCounts(counts);
          } catch (error) {
            console.error('Error loading vote counts:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error generating final ruling:', error);
      setToast({ message: 'Failed to generate final ruling', type: 'error' });
    }
  };

  const handleDeleteConflict = async () => {
    if (!conflict || !user?.id) return;

    if (window.confirm('Are you sure you want to delete this conflict? This action cannot be undone.')) {
      try {
        await conflictService.deleteConflict(conflict.id, user.id);
        setToast({ message: 'Conflict deleted successfully', type: 'success' });
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (error) {
        console.error('Error deleting conflict:', error);
        setToast({ message: 'Failed to delete conflict', type: 'error' });
      }
    }
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

  const getOtherUserDisplayName = (): string => {
    if (!conflict || !user?.id) return 'Other User';
    
    if (user.id === conflict.user1_id) {
      // Current user is user1, show user2's info
      if (otherUserProfile?.username) {
        return otherUserProfile.username;
      }
      return conflict.user2_email;
    } else {
      // Current user is user2, show user1's info
      if (otherUserProfile?.username) {
        return otherUserProfile.username;
      }
      return 'User 1';
    }
  };

  const getOtherUserProfile = (): Profile | null => {
    return otherUserProfile;
  };

  const getVoteCount = (voteType: string): number => {
    const count = voteCounts.find(c => c.vote_type === voteType);
    return count ? Number(count.vote_count) : 0;
  };

  const isUser1 = user?.id === conflict?.user1_id;
  const isUser2 = user?.id === conflict?.user2_id;
  const canRespond = isUser2 && conflict?.status === 'pending' && !conflict?.user2_raw_message;
  const canVote = conflict?.ai_summary && conflict?.ai_suggestion;
  const needsCoreIssue = conflict?.rehash_attempted_at && 
    ((isUser1 && !conflict?.user1_core_issue) || (isUser2 && !conflict?.user2_core_issue));
  const canVoteOnCoreReflection = conflict?.ai_core_reflection && conflict?.ai_core_suggestion;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-pulse-slow mb-4">
          <div className="text-6xl">⏳</div>
        </div>
        <p className="text-dark-teal font-bold">Loading conflict details...</p>
      </div>
    );
  }

  if (!conflict) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="text-6xl mb-4">🤷</div>
        <h1 className="text-2xl font-black text-dark-teal mb-2">CONFLICT NOT FOUND</h1>
        <p className="text-dark-teal font-bold">This conflict doesn't exist or you don't have access to it.</p>
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
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-dark-teal hover:text-vivid-orange mb-6 transition-colors font-black"
        >
          <ArrowLeft size={20} />
          <span>BACK TO DASHBOARD</span>
        </button>
        
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <h1 className="text-4xl font-black text-dark-teal mb-4 border-b-3 border-black pb-2 break-words">
              {conflict.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-dark-teal font-bold">
              <div className="flex items-center space-x-2">
                <User size={16} />
                <span>vs. {
                  otherUserProfile ? (
                    <UserDisplayName 
                      username={otherUserProfile.username}
                      archetypeEmoji={otherUserProfile.archetype_emoji}
                      supporterEmoji={otherUserProfile.supporter_emoji}
                      fallback={getOtherUserDisplayName()}
                    />
                  ) : (
                    getOtherUserDisplayName()
                  )
                }</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={16} />
                <span>{formatTimeAgo(conflict.created_at)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare size={16} />
                <span className={`px-3 py-1 text-xs font-black border-2 border-black ${
                  conflict.status === 'resolved' ? 'bg-green-teal text-white' :
                  conflict.status === 'final_judgment' ? 'bg-dark-teal text-white' :
                  conflict.status === 'active' ? 'bg-vivid-orange text-white' :
                  'bg-lime-chartreuse text-dark-teal'
                }`}>
                  {conflict.status.toUpperCase().replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
          
          {/* Delete button for conflict creator */}
          {isUser1 && conflict.status === 'pending' && (
            <button
              onClick={handleDeleteConflict}
              className="bg-vivid-orange hover:bg-orange-600 text-white px-4 py-2 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 flex items-center space-x-2 flex-shrink-0"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">DELETE</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Conflict Content */}
      <div className="bg-white border-3 border-black shadow-brutal mb-6">
        {/* User 1 Message */}
        <div className="p-6 border-b-3 border-black">
          <div className="bg-lime-chartreuse p-4 border-3 border-black mb-4">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">💬</span>
              <h3 className="text-lg font-black text-dark-teal">
                {isUser1 ? 'YOUR MESSAGE' : `${getOtherUserDisplayName()}'S MESSAGE`}
              </h3>
              <MoodIndicator mood={conflict.user1_mood as MoodLevel} size="sm" />
            </div>
            <p className="text-dark-teal font-bold leading-relaxed break-words">
              {conflict.user1_translated_message || conflict.user1_raw_message}
            </p>
          </div>
        </div>

        {/* User 2 Response */}
        {conflict.user2_raw_message ? (
          <div className="p-6 border-b-3 border-black">
            <div className="bg-vivid-orange p-4 border-3 border-black mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">💭</span>
                <h3 className="text-lg font-black text-white">
                  {isUser2 ? 'YOUR RESPONSE' : `${getOtherUserDisplayName()}'S RESPONSE`}
                </h3>
              </div>
              <p className="text-white font-bold leading-relaxed break-words">
                {conflict.user2_translated_message || conflict.user2_raw_message}
              </p>
            </div>
          </div>
        ) : canRespond ? (
          <div className="p-6 border-b-3 border-black">
            <div className="bg-vivid-orange p-4 border-3 border-black mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">✍️</span>
                <h3 className="text-lg font-black text-white">YOUR TURN TO RESPOND</h3>
              </div>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Share your side of the story. Be honest about how you're feeling..."
                className="w-full h-32 p-3 border-3 border-black font-bold text-dark-teal resize-none focus:outline-none focus:border-lime-chartreuse"
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-white font-bold">
                  {responseText.length}/1000 characters
                </span>
                <button
                  onClick={handleResponse}
                  disabled={!responseText.trim() || submitting}
                  className="bg-lime-chartreuse hover:bg-green-400 text-dark-teal px-6 py-2 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-dark-teal border-t-transparent"></div>
                  ) : (
                    <Send size={16} />
                  )}
                  <span>{submitting ? 'SENDING...' : 'SEND RESPONSE'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : conflict.status === 'pending' && (
          <div className="p-6 border-b-3 border-black">
            <div className="bg-lime-chartreuse p-4 border-3 border-black text-center">
              <span className="text-2xl">⏳</span>
              <h3 className="text-lg font-black text-dark-teal mt-2">
                WAITING FOR {getOtherUserDisplayName().toUpperCase()} TO RESPOND
              </h3>
            </div>
          </div>
        )}

        {/* AI Summary & Suggestion */}
        {conflict.ai_summary && conflict.ai_suggestion && (
          <div className="p-6 border-b-3 border-black">
            <div className="bg-dark-teal p-4 border-3 border-black mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">🤖</span>
                <h3 className="text-lg font-black text-lime-chartreuse">AI MEDIATION</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-black text-white mb-2">SUMMARY:</h4>
                  <p className="text-white font-bold leading-relaxed break-words">
                    {conflict.ai_summary}
                  </p>
                </div>
                <div>
                  <h4 className="font-black text-white mb-2">SUGGESTION:</h4>
                  <p className="text-white font-bold leading-relaxed break-words">
                    {conflict.ai_suggestion}
                  </p>
                </div>
              </div>
            </div>

            {/* Satisfaction Voting */}
            {canVote && (conflict.user1_satisfaction === null || conflict.user2_satisfaction === null) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleSatisfactionVote(true)}
                  className="bg-green-teal hover:bg-teal-600 text-white p-4 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 flex items-center justify-center space-x-2"
                >
                  <ThumbsUp size={20} />
                  <span>THIS WORKS FOR ME</span>
                </button>
                <button
                  onClick={() => handleSatisfactionVote(false)}
                  className="bg-vivid-orange hover:bg-orange-600 text-white p-4 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 flex items-center justify-center space-x-2"
                >
                  <ThumbsDown size={20} />
                  <span>NEED BETTER SOLUTION</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Rehash Content */}
        {conflict.ai_rehash_summary && conflict.ai_rehash_suggestion && (
          <div className="p-6 border-b-3 border-black">
            <div className="bg-green-teal p-4 border-3 border-black mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">🔄</span>
                <h3 className="text-lg font-black text-white">AI REHASH - ROUND 2</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-black text-white mb-2">NEW PERSPECTIVE:</h4>
                  <p className="text-white font-bold leading-relaxed break-words">
                    {conflict.ai_rehash_summary}
                  </p>
                </div>
                <div>
                  <h4 className="font-black text-white mb-2">FRESH APPROACH:</h4>
                  <p className="text-white font-bold leading-relaxed break-words">
                    {conflict.ai_rehash_suggestion}
                  </p>
                </div>
              </div>
            </div>

            {/* Rehash Satisfaction Voting */}
            {(conflict.user1_satisfaction === null || conflict.user2_satisfaction === null) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleSatisfactionVote(true)}
                  className="bg-green-teal hover:bg-teal-600 text-white p-4 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 flex items-center justify-center space-x-2"
                >
                  <ThumbsUp size={20} />
                  <span>THIS WORKS NOW</span>
                </button>
                <button
                  onClick={() => handleSatisfactionVote(false)}
                  className="bg-vivid-orange hover:bg-orange-600 text-white p-4 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 flex items-center justify-center space-x-2"
                >
                  <ThumbsDown size={20} />
                  <span>STILL NOT RIGHT</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Core Issue Input */}
        {needsCoreIssue && (
          <div className="p-6 border-b-3 border-black">
            <div className="bg-lime-chartreuse p-4 border-3 border-black mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">🧠</span>
                <h3 className="text-lg font-black text-dark-teal">CLARIFY YOUR CORE ISSUE</h3>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                What do you most want the other person to understand about this situation?
              </p>
              <textarea
                value={coreIssueText}
                onChange={(e) => setCoreIssueText(e.target.value)}
                placeholder="Focus on what you most want them to understand, not what you want them to do..."
                className="w-full h-24 p-3 border-3 border-black font-bold text-dark-teal resize-none focus:outline-none focus:border-vivid-orange"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-dark-teal font-bold">
                  {coreIssueText.length}/500 characters
                </span>
                <button
                  onClick={handleCoreIssueSubmit}
                  disabled={!coreIssueText.trim() || submitting}
                  className="bg-vivid-orange hover:bg-orange-600 text-white px-6 py-2 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Send size={16} />
                  )}
                  <span>{submitting ? 'SUBMITTING...' : 'SUBMIT'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Core Issues Reflection */}
        {conflict.ai_core_reflection && conflict.ai_core_suggestion && (
          <div className="p-6 border-b-3 border-black">
            <div className="bg-dark-teal p-4 border-3 border-black mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">💡</span>
                <h3 className="text-lg font-black text-lime-chartreuse">CORE ISSUES REFLECTION</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-black text-white mb-2">DEEPER UNDERSTANDING:</h4>
                  <p className="text-white font-bold leading-relaxed break-words">
                    {conflict.ai_core_reflection}
                  </p>
                </div>
                <div>
                  <h4 className="font-black text-white mb-2">FINAL APPROACH:</h4>
                  <p className="text-white font-bold leading-relaxed break-words">
                    {conflict.ai_core_suggestion}
                  </p>
                </div>
              </div>
            </div>

            {/* Core Reflection Voting */}
            {canVoteOnCoreReflection && (conflict.user1_satisfaction === null || conflict.user2_satisfaction === null) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleSatisfactionVote(true)}
                  className="bg-green-teal hover:bg-teal-600 text-white p-4 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 flex items-center justify-center space-x-2"
                >
                  <CheckCircle size={20} />
                  <span>FINALLY RESOLVED</span>
                </button>
                <button
                  onClick={handleFinalRuling}
                  className="bg-vivid-orange hover:bg-orange-600 text-white p-4 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 flex items-center justify-center space-x-2"
                >
                  <AlertTriangle size={20} />
                  <span>GET AI FINAL RULING</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Final AI Ruling */}
        {conflict.final_ai_ruling && (
          <div className="p-6">
            <div className="bg-dark-teal p-6 border-3 border-black text-center">
              <div className="text-6xl mb-4">⚖️</div>
              <h3 className="text-2xl font-black text-lime-chartreuse mb-4 border-b-3 border-lime-chartreuse pb-2">
                JUDGE AI'S FINAL RULING
              </h3>
              <div className="bg-black/30 p-4 border-3 border-lime-chartreuse">
                <p className="text-white font-bold leading-relaxed break-words text-lg">
                  {conflict.final_ai_ruling}
                </p>
              </div>
              
              {/* Public Voting Section */}
              {conflict.status === 'final_judgment' && (
                <div className="mt-6">
                  <h4 className="text-lg font-black text-lime-chartreuse mb-4 border-b-2 border-lime-chartreuse pb-2">
                    🗳️ PUBLIC VOTES ON THIS RULING
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {VOTE_OPTIONS.map((option) => {
                      const voteCount = getVoteCount(option.type);
                      
                      return (
                        <div
                          key={option.type}
                          className="bg-white border-3 border-black p-3 text-center"
                        >
                          <div className="text-2xl mb-2">{option.emoji}</div>
                          <div className="font-black text-dark-teal text-xs mb-1">{option.label}</div>
                          <div className="bg-dark-teal text-white px-2 py-1 text-xs font-black border-2 border-black">
                            {voteCount} votes
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 bg-vivid-orange border-3 border-black p-3">
                    <p className="text-white font-black text-sm">
                      🎭 This conflict is now on the Public Shame Board for everyone to vote on! 🎭
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resolution Status */}
        {conflict.status === 'resolved' && (
          <div className="p-6">
            <div className="bg-green-teal p-6 border-3 border-black text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-black text-white mb-2">
                CONFLICT SQUASHED!
              </h3>
              <p className="text-white font-bold">
                Both parties found a resolution they're happy with. Great job working it out!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConflictPage;