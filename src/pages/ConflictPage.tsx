import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ThumbsUp, ThumbsDown, Heart, Laugh, Angry } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { conflictService, Conflict } from '../utils/conflicts';
import MoodIndicator from '../components/MoodIndicator';
import Toast from '../components/Toast';

const ConflictPage: React.FC = () => {
  const { conflictId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conflict, setConflict] = useState<Conflict | null>(null);
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
      } catch (error) {
        console.error('Error loading conflict:', error);
        setToast({ message: 'Failed to load conflict', type: 'error' });
      } finally {
        setInitialLoading(false);
      }
    };

    loadConflict();
  }, [conflictId, navigate]);

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
  
  const getPhase = (): 'input' | 'waiting' | 'mediation' | 'reactions' | 'core-issues' | 'core-reflection' => {
    if (!conflict) return 'input';
    
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

  const handleSubmitMessage = async () => {
    if (!userMessage.trim()) return;
    
    if (!conflictId || !user?.id) return;

    setLoading(true);
    try {
      await conflictService.respondToConflict(conflictId, userMessage, user.id);
      setToast({ message: 'Response submitted! Generating AI mediation...', type: 'success' });
      
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
          Conflict ID: #{conflictId?.slice(0, 8)} • Status: {conflict.status}
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
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-coral-500 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: phase === 'input' ? '25%' : 
                     phase === 'waiting' || phase === 'mediation' ? '50%' : 
                     phase === 'reactions' ? '75%' : '100%' 
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
          
          {/* Show waiting state if user has submitted but other hasn't */}
          {((isUser1 && conflict?.user1_core_issue && !conflict?.user2_core_issue) ||
            (isUser2 && conflict?.user2_core_issue && !conflict?.user1_core_issue)) && (
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <div className="text-center">
                <div className="text-4xl mb-2">⏳</div>
                <h3 className="font-semibold text-yellow-900 mb-2">Waiting for Their Core Issue</h3>
                <p className="text-sm text-yellow-700">
                  You've shared what you most want them to understand. Waiting for them to do the same...
                </p>
              </div>
            </div>
          )}
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
            
            {!isResolved && (
              <div className="flex space-x-4">
                <button 
                  onClick={() => handleSatisfactionVote(true)}
                  disabled={loading}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Yes, This Helps - Mark Resolved
                </button>
                <button 
                  onClick={() => handleSatisfactionVote(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Still Not Quite Right
                </button>
              </div>
            )}
          </div>
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