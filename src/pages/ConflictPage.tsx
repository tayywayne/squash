import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ThumbsUp, ThumbsDown, Heart, Laugh, Angry } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { conflictService, Conflict } from '../utils/conflicts';
import { profileService } from '../utils/profiles';
import { archetypeService } from '../utils/archetypes';
import MoodIndicator from '../components/MoodIndicator';
import UserDisplayName from '../components/UserDisplayName';
import Toast from '../components/Toast';
import { Profile } from '../types';

const ConflictPage: React.FC = () => {
  const { conflictId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conflict, setConflict] = useState<Conflict | null>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<Profile | null>(null);
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load conflict data
  useEffect(() => {
    const loadConflict = async () => {
      if (!conflictId) {
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
        
        // Load other user's profile if available
        const otherUserId = user?.id === conflictData.user1_id ? conflictData.user2_id : conflictData.user1_id;
        if (otherUserId) {
          try {
            const profile = await profileService.getProfileById(otherUserId);
            setOtherUserProfile(profile);
          } catch (error) {
            console.error('Error loading other user profile:', error);
          }
        }
      } catch (error) {
        console.error('Error loading conflict:', error);
        setToast({ message: 'Failed to load conflict', type: 'error' });
      } finally {
        setInitialLoading(false);
      }
    };

    loadConflict();
  }, [conflictId, navigate, user?.id]);

  const isUser1 = user?.id === conflict?.user1_id;
  const isUser2 = user?.id === conflict?.user2_id;
  const canRespond = conflict?.status === 'pending' && (user?.email === conflict?.user2_email || isUser2);
  const isResolved = conflict?.status === 'resolved';
  
  // Check if core issues step should be available
  const canSubmitCoreIssue = conflict?.rehash_attempted_at && 
    (conflict?.user1_satisfaction === false || conflict?.user2_satisfaction === false) &&
    !conflict?.core_issues_attempted_at;
  
  const needsCoreIssueFromUser = canSubmitCoreIssue && 
    ((isUser1 && !conflict?.user1_core_issue) || (isUser2 && !conflict?.user2_core_issue));
  
  const hasCoreReflection = conflict?.ai_core_reflection && conflict?.ai_core_suggestion;
  
  // Check if final ruling should be available
  const canIssueFinalRuling = conflict?.core_issues_attempted_at && 
    conflict?.ai_core_reflection && 
    conflict?.ai_core_suggestion &&
    (conflict?.user1_satisfaction === false || conflict?.user2_satisfaction === false) &&
    !conflict?.final_ai_ruling;
  
  const hasFinalRuling = conflict?.final_ai_ruling && conflict?.final_ruling_issued_at;
  
  const getPhase = (): 'input' | 'waiting' | 'mediation' | 'reactions' | 'core-issues' | 'core-reflection' | 'final-ruling' => {
    if (!conflict) return 'input';
    
    // Final ruling phase - when AI has issued the final dramatic ruling
    if (hasFinalRuling) {
      return 'final-ruling';
    }
    
    if (conflict.status === 'pending' && !conflict.user2_raw_message) {
      return canRespond ? 'input' : 'waiting';
    }
    
    // Core issues phase - after rehash when users need to clarify core issues
    if (needsCoreIssueFromUser) {
      return 'core-issues';
    }
    
    // Core reflection phase - when AI has generated reflection on core issues
    if (hasCoreReflection) {
      return 'core-reflection';
    }
    
    if ((conflict.status === 'active' || conflict.status === 'resolved') && conflict.ai_summary && conflict.ai_suggestion) {
      return 'reactions';
    }
    
    return 'mediation';
  };

  const phase = getPhase();

  const [coreIssueMessage, setCoreIssueMessage] = useState('');

  const getOtherUserDisplay = (conflict: Conflict) => {
    if (user?.id === conflict.user1_id) {
      // Current user is user1, so show user2's info
      if (conflict.user2_id && otherUserProfile) {
        const displayName = otherUserProfile.username || conflict.user2_email;
        
        return (
          <button
            onClick={() => navigate(`/user-profile/${conflict.user2_id}`)}
            className="text-coral-500 hover:text-coral-600 font-medium underline"
          >
            <UserDisplayName 
              username={otherUserProfile.username}
              archetypeEmoji={otherUserProfile.archetype_emoji}
              fallback={conflict.user2_email}
            />
          </button>
        );
      } else {
        // User2 hasn't registered yet, just show email
        return (
          <span className="text-gray-600">
            <UserDisplayName 
              username={undefined}
              archetypeEmoji={undefined}
              fallback={conflict.user2_email}
              showEmoji={false}
            />
          </span>
        );
      }
    } else {
      // Current user is user2, so show user1's info
      if (otherUserProfile) {
        return (
          <button
            onClick={() => navigate(`/user-profile/${conflict.user1_id}`)}
            className="text-coral-500 hover:text-coral-600 font-medium underline"
          >
            <UserDisplayName 
              username={otherUserProfile.username}
              archetypeEmoji={otherUserProfile.archetype_emoji}
              fallback="User 1"
            />
          </button>
        );
      } else {
        return (
          <span className="text-gray-600">
            <UserDisplayName 
              username={undefined}
              archetypeEmoji={undefined}
              fallback="You were invited"
              showEmoji={false}
            />
          </span>
        );
      }
    }
  };

  const handleSubmitMessage = async () => {
    if (!userMessage.trim()) return;
    
    if (!conflictId || !user?.id) return;

    setLoading(true);
    try {
      await conflictService.respondToConflict(conflictId, userMessage, user.id);
      setToast({ message: 'Response submitted! Generating AI mediation...', type: 'success' });
      
      // Update user's archetype after responding to a conflict
      try {
        await archetypeService.assignArchetype(user.id);
      } catch (error) {
        console.error('Error updating archetype after conflict response:', error);
        // Don't fail the response if archetype update fails
      }
      
      // Reload conflict data
      const updatedConflict = await conflictService.getConflictById(conflictId);
      setConflict(updatedConflict);
      setUserMessage('');
    } catch (error) {
      console.error('Error submitting response:', error);
      setToast({ message: 'Failed to submit response. Try again?', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCoreIssue = async () => {
    if (!coreIssueMessage.trim()) return;
    
    if (!conflictId || !user?.id) return;

    setLoading(true);
    try {
      await conflictService.submitCoreIssue(conflictId, coreIssueMessage, user.id);
      setToast({ message: 'Core issue submitted! Waiting for the other person...', type: 'success' });
      
      // Update user's archetype after submitting core issue
      try {
        await archetypeService.assignArchetype(user.id);
      } catch (error) {
        console.error('Error updating archetype after core issue submission:', error);
        // Don't fail the submission if archetype update fails
      }
      
      // Reload conflict data
      const updatedConflict = await conflictService.getConflictById(conflictId);
      setConflict(updatedConflict);
      setCoreIssueMessage('');
    } catch (error) {
      console.error('Error submitting core issue:', error);
      setToast({ message: 'Failed to submit core issue. Try again?', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSatisfactionVote = async (satisfied: boolean) => {
    if (!conflictId || !user?.id) return;

    setLoading(true);
    try {
      await conflictService.updateSatisfaction(conflictId, satisfied, user.id);
      setToast({ 
        message: satisfied ? 'Marked as resolved!' : 'Feedback recorded. Maybe try talking it out more?', 
        type: 'success' 
      });
      
      // Update user's archetype after voting on satisfaction
      try {
        await archetypeService.assignArchetype(user.id);
      } catch (error) {
        console.error('Error updating archetype after satisfaction vote:', error);
        // Don't fail the vote if archetype update fails
      }
      
      // Reload conflict data
      const updatedConflict = await conflictService.getConflictById(conflictId);
      setConflict(updatedConflict);
    } catch (error) {
      console.error('Error updating satisfaction:', error);
      setToast({ message: 'Failed to update. Try again?', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleIssueFinalRuling = async () => {
    if (!conflictId) return;

    setLoading(true);
    try {
      await conflictService.generateFinalRuling(conflictId);
      setToast({ 
        message: '⚖️ The AI has issued its final ruling! This conflict is now closed.', 
        type: 'success' 
      });
      
      // Reload conflict data
      const updatedConflict = await conflictService.getConflictById(conflictId);
      setConflict(updatedConflict);
    } catch (error) {
      console.error('Error issuing final ruling:', error);
      setToast({ message: 'Failed to issue final ruling. Try again?', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-pulse-slow mb-4">
          <div className="text-6xl">🤖</div>
        </div>
        <p className="text-gray-600">Loading conflict details...</p>
      </div>
    );
  }

  if (!conflict) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="text-6xl mb-4">🤷</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Conflict Not Found</h1>
        <p className="text-gray-600">This conflict doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  const reactions = [
    { icon: ThumbsUp, label: 'This hits', color: 'text-green-500' },
    { icon: ThumbsDown, label: 'Nah fam', color: 'text-red-500' },
    { icon: Heart, label: 'Feels', color: 'text-pink-500' },
    { icon: Laugh, label: 'Lol true', color: 'text-yellow-500' },
    { icon: Angry, label: 'Still mad', color: 'text-orange-500' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {conflict.title}
        </h1>
        <p className="text-gray-600">
          <span className="flex items-center space-x-2">
            <span>vs. {getOtherUserDisplay(conflict)}</span>
            <span>•</span>
            <span>Status: {conflict.status}</span>
          </span>
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">
            {phase === 'input' && '1/3 - Tell Your Side'}
            {phase === 'waiting' && '2/3 - Waiting for Response'}
            {phase === 'mediation' && '2/3 - AI Processing'}
            {phase === 'reactions' && '3/3 - Reactions & Next Steps'}
            {phase === 'core-issues' && '4/4 - Clarify Core Issues'}
            {phase === 'core-reflection' && '4/4 - Final Reflection'}
            {phase === 'final-ruling' && '5/5 - Final AI Ruling'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-coral-500 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: phase === 'input' ? '25%' : 
                     phase === 'waiting' || phase === 'mediation' ? '50%' : 
                     phase === 'reactions' ? '75%' : 
                     phase === 'core-issues' || phase === 'core-reflection' ? '90%' : '100%'
            }}
          />
        </div>
      </div>

      {/* Input Phase */}
      {phase === 'input' && canRespond && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {isUser1 ? 'Your Side of the Story' : 'Your Response'}
            </h2>
            <p className="text-gray-600 mb-4">
              {isUser1 
                ? "Spill the tea. What happened? How did it make you feel? Don't hold back – this is your safe space to vent."
                : "Time to share your perspective. What's your side of this situation? How did it affect you?"
              }
            </p>
            
            {!isUser1 && conflict.user1_translated_message && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-blue-900 mb-2">Their Perspective:</h3>
                <p className="text-sm text-blue-800 italic">"{conflict.user1_translated_message}"</p>
              </div>
            )}
            
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              disabled={isResolved}
              placeholder={isUser1 
                ? "Start with how you're feeling right now. Then tell us what went down. The AI needs context to help mediate effectively..."
                : "Share your side of the story. How did this situation affect you? What would you like them to understand?"
              }
              className={`w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 resize-none ${
                isResolved ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
              }`}
            />
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                {userMessage.length}/1000 characters
              </span>
              <button
                onClick={handleSubmitMessage}
                disabled={!userMessage.trim() || loading || isResolved}
                className="flex items-center space-x-2 bg-coral-500 hover:bg-coral-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>{isUser1 ? 'Submit My Side' : 'Submit Response'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waiting Phase */}
      {phase === 'waiting' && (
        <div className="text-center py-12">
          <div className="animate-pulse-slow mb-4">
            <div className="text-6xl">⏳</div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isUser1 ? 'Waiting for Their Response' : 'Waiting for AI Processing'}
          </h2>
          <p className="text-gray-600">
            {isUser1 
              ? 'Your message has been sent. Waiting for them to share their perspective...'
              : 'Both perspectives are in. Our AI is working on a resolution...'
            }
          </p>
          <div className="mt-6 bg-coral-50 p-4 rounded-lg">
            <p className="text-sm text-coral-700">
              💡 Pro tip: Step away, take a breath, maybe hydrate. This process works better when you're not stress-refreshing.
            </p>
          </div>
        </div>
      )}

      {/* Mediation Phase */}
      {phase === 'mediation' && conflict.user1_translated_message && conflict.user2_translated_message && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              AI Processing Both Perspectives
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">First Perspective:</h3>
                <p className="text-sm text-blue-800 italic">"{conflict.user1_translated_message.substring(0, 120)}..."</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Second Perspective:</h3>
                <p className="text-sm text-green-800 italic">"{conflict.user2_translated_message.substring(0, 120)}..."</p>
              </div>
            </div>

            <div className="text-center">
              <div className="animate-pulse-slow mb-4">
                <div className="text-4xl">🤖</div>
              </div>
              <p className="text-gray-600">AI is analyzing both perspectives and generating a resolution...</p>
            </div>
          </div>
        </div>
      )}

      {/* Core Issues Phase */}
      {phase === 'core-issues' && (
        <div className="space-y-6">
          {/* Check if current user has already submitted their core issue */}
          {((isUser1 && conflict?.user1_core_issue) || (isUser2 && conflict?.user2_core_issue)) ? (
            /* Show waiting state if user has submitted but other hasn't */
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <div className="text-center">
                <div className="text-4xl mb-2">⏳</div>
                <h3 className="font-semibold text-yellow-900 mb-2">Waiting for Their Core Issue</h3>
                <p className="text-sm text-yellow-700">
                  You've shared what you most want them to understand. Waiting for them to do the same...
                </p>
              </div>
            </div>
          ) : (
            /* Show core issue input form if user hasn't submitted yet */
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🎯 Clarify Your Core Issue
              </h2>
              
              <div className="bg-orange-50 p-4 rounded-lg mb-6 border border-orange-200">
                <p className="text-orange-800 text-sm">
                  <strong>We're trying a different approach.</strong> Previous solutions haven't fully resolved this conflict. 
                  Let's get to the heart of what you most want the other person to understand.
                </p>
              </div>
              
              <p className="text-gray-600 mb-4">
                Answer this question as clearly and specifically as possible:
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">
                  "What is the one thing you most want the other person to understand about your perspective?"
                </h3>
                <p className="text-sm text-blue-700">
                  Focus on what you want them to truly "get" about how you see this situation or how it affects you.
                </p>
              </div>
              
              <textarea
                value={coreIssueMessage}
                onChange={(e) => setCoreIssueMessage(e.target.value)}
                placeholder="The one thing I most want them to understand is..."
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 resize-none"
                maxLength={500}
              />
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-500">
                  {coreIssueMessage.length}/500 characters
                </span>
                <button
                  onClick={handleSubmitCoreIssue}
                  disabled={!coreIssueMessage.trim() || loading}
                  className="flex items-center space-x-2 bg-coral-500 hover:bg-coral-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Submit Core Issue</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Final AI Ruling Phase */}
      {phase === 'final-ruling' && conflict.final_ai_ruling && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-900 via-red-900 to-purple-900 p-8 rounded-lg border-4 border-gold text-white relative overflow-hidden">
            {/* Dramatic background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="text-9xl font-bold transform rotate-12 absolute -top-4 -right-4">⚖️</div>
              <div className="text-6xl font-bold transform -rotate-12 absolute -bottom-2 -left-2">🎭</div>
            </div>
            
            <div className="relative z-10">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2 text-yellow-300">
                  ⚖️ FINAL AI RULING ⚖️
                </h2>
                <div className="text-lg text-yellow-200 mb-4">
                  Judge AI Has Spoken • Case Closed Forever
                </div>
                <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full"></div>
              </div>
              
              <div className="bg-black/30 p-6 rounded-lg border border-yellow-400/50 mb-6">
                <div className="text-lg leading-relaxed text-gray-100 whitespace-pre-wrap">
                  {conflict.final_ai_ruling}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-yellow-300 font-semibold mb-2">
                  Ruling Issued: {new Date(conflict.final_ruling_issued_at!).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="text-red-300 text-sm">
                  🔒 This conflict is now permanently closed. No further changes can be made.
                </div>
              </div>
            </div>
          </div>
          
          {/* Final Status */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 text-center">
            <div className="text-4xl mb-3">🎬</div>
            <h3 className="text-xl font-bold text-white mb-2">Conflict Resolution Complete</h3>
            <p className="text-gray-300 text-sm">
              The AI has issued its final, dramatic ruling. This conflict has been resolved through the power of artificial sass and digital wisdom.
            </p>
          </div>
        </div>
      )}

      {/* Core Reflection Phase */}
      {phase === 'core-reflection' && conflict.ai_core_reflection && conflict.ai_core_suggestion && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              🎯 AI Mediator's Final Reflection
            </h2>
            
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Core Issues Addressed:</strong> Based on what each of you most wants to be understood, here's a final perspective.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Final Reflection:</h3>
                <p className="text-gray-700">
                  {conflict.ai_core_reflection}
                </p>
              </div>
              
              <div className="bg-teal-50 p-4 rounded-lg">
                <h3 className="font-medium text-teal-900 mb-2">Final Approach:</h3>
                <p className="text-teal-800">
                  {conflict.ai_core_suggestion}
                </p>
              </div>
            </div>
          </div>

          {/* Final Resolution Tools */}
          <div className={`bg-white p-6 rounded-lg border border-gray-200 ${isResolved ? 'opacity-75' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Does this final reflection help you understand each other?
            </h3>
            
            {/* Show current user's vote status and waiting state */}
            {!isResolved && (
              <>
                {/* Check if current user has already voted */}
                {((isUser1 && conflict.user1_satisfaction !== null) || (isUser2 && conflict.user2_satisfaction !== null)) ? (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="text-2xl">⏳</div>
                      <h4 className="font-semibold text-blue-900">Waiting for the Other Person</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      You've voted on this final reflection. Waiting for them to decide if this helps them understand the situation better.
                    </p>
                    <div className="mt-3 text-sm text-blue-600">
                      <p>Your vote: <strong>{(isUser1 ? conflict.user1_satisfaction : conflict.user2_satisfaction) ? 'This helps - Mark Resolved' : 'Still not quite right'}</strong></p>
                    </div>
                  </div>
                ) : (
                  /* Show voting buttons if current user hasn't voted yet */
                  <div className="flex space-x-4 mb-4">
                    <button 
                      onClick={() => handleSatisfactionVote(true)}
                      disabled={loading}
                      className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Yes, This Helps - Mark Resolved'}
                    </button>
                    <button 
                      onClick={() => handleSatisfactionVote(false)}
                      disabled={loading}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Still Not Quite Right'}
                    </button>
                  </div>
                )}
              </>
            )}
            
            {/* Show voting status for both users */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Voting Status:</h4>
              <div className="flex space-x-4">
                <div className="flex-1 text-center">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {isUser1 ? 'Your Vote' : 'User 1'}
                  </p>
                  <div className="text-2xl mb-1">
                    {conflict.user1_satisfaction === null 
                      ? '⏳' 
                      : conflict.user1_satisfaction 
                        ? '✅' 
                        : '❌'
                    }
                  </div>
                  <p className="text-xs text-gray-600">
                    {conflict.user1_satisfaction === null 
                      ? 'Pending' 
                      : conflict.user1_satisfaction 
                        ? 'Resolved' 
                        : 'Needs work'
                    }
                  </p>
                </div>
                
                <div className="flex-1 text-center">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {isUser2 ? 'Your Vote' : 'User 2'}
                  </p>
                  <div className="text-2xl mb-1">
                    {conflict.user2_satisfaction === null 
                      ? '⏳' 
                      : conflict.user2_satisfaction 
                        ? '✅' 
                        : '❌'
                    }
                  </div>
                  <p className="text-xs text-gray-600">
                    {conflict.user2_satisfaction === null 
                      ? 'Pending' 
                      : conflict.user2_satisfaction 
                        ? 'Resolved' 
                        : 'Needs work'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            {isResolved && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="text-2xl">🎉</div>
                  <h4 className="font-semibold text-green-900">Conflict Successfully Resolved!</h4>
                </div>
                <p className="text-sm text-green-700">
                  This conflict has been marked as resolved through the core issues reflection process.
                </p>
              </div>
            )}
          </div>
          
          {/* Final Ruling Button - Show if both users have voted and at least one is not satisfied */}
          {canIssueFinalRuling && (
            <div className="bg-gradient-to-r from-red-50 to-purple-50 p-6 rounded-lg border-2 border-red-200">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">⚖️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Last Resort: Let the AI Decide Anyway
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  This conflict has been through multiple resolution attempts. Time for Judge AI to issue a final, dramatic ruling that will close this case forever.
                </p>
                <div className="bg-yellow-100 p-3 rounded-lg border border-yellow-300 mb-4">
                  <p className="text-xs text-yellow-800">
                    ⚠️ <strong>Warning:</strong> Once the AI issues its final ruling, this conflict will be permanently closed and no further changes can be made.
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleIssueFinalRuling}
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Judge AI is deliberating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xl">⚖️</span>
                    <span>Issue Final AI Ruling</span>
                    <span className="text-xl">🎭</span>
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* AI Response & Reactions Phase */}
      {phase === 'reactions' && conflict.ai_summary && conflict.ai_suggestion && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              {conflict.ai_rehash_summary && conflict.ai_rehash_suggestion 
                ? '🤖 AI Mediator\'s Rehash' 
                : '🤖 AI Mediator\'s Take'
              }
            </h2>
            
            {conflict.ai_rehash_summary && conflict.ai_rehash_suggestion && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Fresh perspective:</strong> Since the first resolution didn't fully work, here's a new approach to help move things forward.
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">What I'm Hearing:</h3>
                <p className="text-gray-700">
                  {conflict.ai_rehash_summary || conflict.ai_summary}
                </p>
              </div>
              
              <div className="bg-teal-50 p-4 rounded-lg">
                <h3 className="font-medium text-teal-900 mb-2">Suggested Next Steps:</h3>
                <p className="text-teal-800">
                  {conflict.ai_rehash_suggestion || conflict.ai_suggestion}
                </p>
              </div>
            </div>
          </div>

          {/* Reaction Tools */}
          <div className={`bg-white p-6 rounded-lg border border-gray-200 ${isResolved ? 'opacity-75' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              How does this land with you?
            </h3>
            
            <div className={`flex flex-wrap gap-3 mb-6 ${isResolved ? 'pointer-events-none' : ''}`}>
              {reactions.map((reaction, index) => (
                <button
                  key={index}
                  disabled={isResolved}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${reaction.color} ${
                    isResolved ? 'cursor-not-allowed opacity-60' : 'hover:bg-gray-50'
                  }`}
                >
                  <reaction.icon size={20} />
                  <span className="text-sm font-medium">{reaction.label}</span>
                </button>
              ))}
            </div>

            {!isResolved && (
              <div className="flex space-x-4">
                <button 
                  onClick={() => handleSatisfactionVote(true)}
                  disabled={loading}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Mark as Resolved
                </button>
                <button 
                  onClick={() => handleSatisfactionVote(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Need More Help
                </button>
              </div>
            )}

            {isResolved && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="text-2xl">🎉</div>
                  <h4 className="font-semibold text-green-900">Conflict Successfully Resolved!</h4>
                </div>
                <p className="text-sm text-green-700">
                  This conflict has been marked as resolved. No further changes can be made.
                </p>
              </div>
            )}
          </div>

          {/* Show satisfaction status */}
          {(conflict.user1_satisfaction !== null || conflict.user2_satisfaction !== null) && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolution Status</h3>
              <div className="space-y-2">
                {conflict.user1_satisfaction !== null && (
                  <p className="text-sm text-gray-600">
                    User 1: {conflict.user1_satisfaction ? '✅ Satisfied' : '❌ Needs more work'}
                  </p>
                )}
                {conflict.user2_satisfaction !== null && (
                  <p className="text-sm text-gray-600">
                    User 2: {conflict.user2_satisfaction ? '✅ Satisfied' : '❌ Needs more work'}
                  </p>
                )}
                {conflict.status === 'resolved' && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-green-800 font-medium">🎉 Conflict Successfully Resolved!</p>
                    <p className="text-sm text-green-700 mt-1">Both parties are satisfied with the resolution.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Always show current voting status */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Voting Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {isUser1 ? 'Your vote' : 'User 1'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {conflict.user1_satisfaction === null 
                      ? 'Pending vote on current resolution' 
                      : conflict.user1_satisfaction 
                        ? 'Satisfied with resolution' 
                        : 'Needs more work'
                    }
                  </p>
                </div>
                <div className="text-2xl">
                  {conflict.user1_satisfaction === null 
                    ? '⏳' 
                    : conflict.user1_satisfaction 
                      ? '✅' 
                      : '❌'
                  }
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {isUser2 ? 'Your vote' : 'User 2'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {conflict.user2_satisfaction === null 
                      ? 'Pending vote on current resolution' 
                      : conflict.user2_satisfaction 
                        ? 'Satisfied with resolution' 
                        : 'Needs more work'
                    }
                  </p>
                </div>
                <div className="text-2xl">
                  {conflict.user2_satisfaction === null 
                    ? '⏳' 
                    : conflict.user2_satisfaction 
                      ? '✅' 
                      : '❌'
                  }
                </div>
              </div>

              {conflict.status === 'resolved' && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="text-2xl">🎉</div>
                    <h4 className="font-semibold text-green-900">Conflict Successfully Resolved!</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    Both parties have voted and are satisfied with the resolution.
                  </p>
                </div>
              )}

              {conflict.status === 'active' && conflict.user1_satisfaction !== null && conflict.user2_satisfaction !== null && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="text-2xl">🔄</div>
                    <h4 className="font-semibold text-yellow-900">Waiting for Both Parties</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Both parties need to be satisfied for the conflict to be marked as resolved.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConflictPage;