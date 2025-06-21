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
  
  const getPhase = (): 'input' | 'waiting' | 'mediation' | 'reactions' => {
    if (!conflict) return 'input';
    
    if (conflict.status === 'pending' && !conflict.user2_raw_message) {
      return canRespond ? 'input' : 'waiting';
    }
    
    if (conflict.status === 'active' && conflict.ai_summary && conflict.ai_suggestion) {
      return 'reactions';
    }
    
    return 'mediation';
  };

  const phase = getPhase();

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
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-coral-500 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: phase === 'input' ? '33%' : phase === 'waiting' || phase === 'mediation' ? '66%' : '100%' 
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
              placeholder={isUser1 
                ? "Start with how you're feeling right now. Then tell us what went down. The AI needs context to help mediate effectively..."
                : "Share your side of the story. How did this situation affect you? What would you like them to understand?"
              }
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 resize-none"
            />
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                {userMessage.length}/1000 characters
              </span>
              <button
                onClick={handleSubmitMessage}
                disabled={!userMessage.trim() || loading}
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

      {/* AI Response & Reactions Phase */}
      {phase === 'reactions' && conflict.ai_summary && conflict.ai_suggestion && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              🤖 AI Mediator's Take
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">What I'm Hearing:</h3>
                <p className="text-gray-700">{conflict.ai_summary}</p>
              </div>
              
              <div className="bg-teal-50 p-4 rounded-lg">
                <h3 className="font-medium text-teal-900 mb-2">Suggested Next Steps:</h3>
                <p className="text-teal-800">{conflict.ai_suggestion}</p>
              </div>
            </div>
          </div>

          {/* Reaction Tools */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              How does this land with you?
            </h3>
            
            <div className="flex flex-wrap gap-3 mb-6">
              {reactions.map((reaction, index) => (
                <button
                  key={index}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors ${reaction.color}`}
                >
                  <reaction.icon size={20} />
                  <span className="text-sm font-medium">{reaction.label}</span>
                </button>
              ))}
            </div>

            <div className="flex space-x-4">
              <button className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded-lg transition-colors">
                onClick={() => handleSatisfactionVote(true)}
                disabled={loading}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
              </button>
              <button 
                onClick={() => handleSatisfactionVote(false)}
                disabled={loading}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Need More Help
              </button>
            </div>
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
        </div>
      )}
    </div>
  );
};

export default ConflictPage;