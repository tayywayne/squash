import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, ThumbsUp, ThumbsDown, Heart, Laugh, Angry } from 'lucide-react';
import { mockOpenAI } from '../utils/openai';
import MoodIndicator from '../components/MoodIndicator';
import Toast from '../components/Toast';

const ConflictPage: React.FC = () => {
  const { conflictId } = useParams();
  const [userMessage, setUserMessage] = useState('');
  const [otherUserMessage, setOtherUserMessage] = useState('');
  const [aiResponse, setAiResponse] = useState<{
    summary: string;
    suggestion: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<'input' | 'waiting' | 'mediation' | 'reactions'>('input');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Mock other user's submission (simulate real-time updates)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (phase === 'waiting') {
        setOtherUserMessage("I was just trying to help! I didn't realize you felt like I was overstepping. I thought we were on the same page about sharing responsibilities, but clearly I misread the situation. I genuinely didn't mean to make you feel dismissed or unheard.");
        setPhase('mediation');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [phase]);

  const handleSubmitMessage = () => {
    if (!userMessage.trim()) return;
    
    setPhase('waiting');
    setToast({ message: 'Message sent! Waiting for the other party...', type: 'info' });
  };

  const handleAIMediation = async () => {
    setLoading(true);
    try {
      const response = await mockOpenAI.mediateConflict(userMessage, otherUserMessage);
      setAiResponse(response);
      setPhase('reactions');
      setToast({ message: 'AI mediation complete! Time for some real talk.', type: 'success' });
    } catch (error) {
      setToast({ message: 'AI had a moment. Try again?', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

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
          Conflict Resolution Session
        </h1>
        <p className="text-gray-600">
          Conflict ID: #{conflictId} • Time to get real about what's bothering you both.
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
      {phase === 'input' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Side of the Story
            </h2>
            <p className="text-gray-600 mb-4">
              Spill the tea. What happened? How did it make you feel? Don't hold back – this is your safe space to vent.
            </p>
            
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Start with how you're feeling right now. Then tell us what went down. The AI needs context to help mediate effectively..."
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 resize-none"
            />
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                {userMessage.length}/1000 characters
              </span>
              <button
                onClick={handleSubmitMessage}
                disabled={!userMessage.trim()}
                className="flex items-center space-x-2 bg-coral-500 hover:bg-coral-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
                <span>Submit My Side</span>
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
            Waiting for the Other Party
          </h2>
          <p className="text-gray-600">
            Your message has been sent. Waiting for them to share their perspective...
          </p>
          <div className="mt-6 bg-coral-50 p-4 rounded-lg">
            <p className="text-sm text-coral-700">
              💡 Pro tip: Step away, take a breath, maybe hydrate. This process works better when you're not stress-refreshing.
            </p>
          </div>
        </div>
      )}

      {/* Mediation Phase */}
      {phase === 'mediation' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Both Sides Are In
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Your Perspective:</h3>
                <p className="text-sm text-blue-800 italic">"{userMessage.substring(0, 120)}..."</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Their Perspective:</h3>
                <p className="text-sm text-green-800 italic">"{otherUserMessage.substring(0, 120)}..."</p>
              </div>
            </div>

            <button
              onClick={handleAIMediation}
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'AI is thinking...' : 'Get AI Mediation'}
            </button>
          </div>
        </div>
      )}

      {/* AI Response & Reactions Phase */}
      {phase === 'reactions' && aiResponse && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              🤖 AI Mediator's Take
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">What I'm Hearing:</h3>
                <p className="text-gray-700">{aiResponse.summary}</p>
              </div>
              
              <div className="bg-teal-50 p-4 rounded-lg">
                <h3 className="font-medium text-teal-900 mb-2">Suggested Next Steps:</h3>
                <p className="text-teal-800">{aiResponse.suggestion}</p>
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
                Mark as Resolved
              </button>
              <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg transition-colors">
                Need More Help
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConflictPage;