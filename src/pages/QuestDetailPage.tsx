import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Award, CheckCircle, X, Send, AlertTriangle, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { questsService, QuestDetails, QuestStep, StepSubmissionResult } from '../utils/quests';
import Toast from '../components/Toast';

const QuestDetailPage: React.FC = () => {
  const { questId } = useParams<{ questId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questDetails, setQuestDetails] = useState<QuestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [userQuestId, setUserQuestId] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stepResult, setStepResult] = useState<StepSubmissionResult | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Load quest details
  useEffect(() => {
    const loadQuestDetails = async () => {
      if (!questId || questId === 'undefined') {
        setToast({ message: 'Invalid quest ID', type: 'error' });
        navigate('/quests');
        return;
      }
      
      try {
        setLoading(true);
        const details = await questsService.getQuestDetails(questId);
        setQuestDetails(details);
        
        // Set current step index based on user progress
        if (details.user_progress.is_started) {
          setCurrentStepIndex(details.user_progress.current_step - 1);
        }
        
        // Check if quest is already completed
        if (details.user_progress.is_completed) {
          setShowCompletionModal(true);
        }
      } catch (error) {
        console.error('Error loading quest details:', error);
        setToast({ message: 'Failed to load quest details', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadQuestDetails();
  }, [questId]);

  // Start quest if not already started
  useEffect(() => {
    const startQuestIfNeeded = async () => {
      if (!questId || !questDetails) return;
      
      // Skip if quest is already started
      if (questDetails.user_progress.is_started) {
        console.log('Quest already started, skipping startQuest call');
        return;
      }
      
      try {
        console.log('Starting quest:', questId);
        const userQuestId = await questsService.startQuest(questId);
        setUserQuestId(userQuestId);
        
        // Reload quest details to get updated progress
        const updatedDetails = await questsService.getQuestDetails(questId);
        setQuestDetails(updatedDetails);
      } catch (error) {
        console.error('Error starting quest:', error);
        
        setToast({ message: 'Failed to start quest', type: 'error' });
      }
    };

    startQuestIfNeeded();
  }, [questId, questDetails?.user_progress.is_started]);

  const handleSubmitStep = async () => {
    if (!questDetails || !questId) return;
    if (!user?.id) {
      setToast({ message: 'You must be logged in to submit answers', type: 'error' });
      return;
    }
    
    const currentStep = questDetails.steps[currentStepIndex];
    
    // Validate response
    if (currentStep.step_type === 'quiz' || currentStep.step_type === 'choice') {
      if (!selectedOption) {
        setToast({ message: 'Please select an option', type: 'error' });
        return;
      }
    } else if (currentStep.step_type === 'rewrite') {
      if (!userResponse.trim()) {
        setToast({ message: 'Please enter your response', type: 'error' });
        return;
      }
    }
    
    setSubmitting(true);
    
    try {
      // Get user quest ID if not already set
      let userQuestIdToUse = userQuestId;
      if (!userQuestIdToUse) {
        userQuestIdToUse = await questsService.startQuest(questId);
        setUserQuestId(userQuestIdToUse);
      }
      
      // Submit step
      const response = currentStep.step_type === 'rewrite' ? userResponse : selectedOption || '';
      const result = await questsService.submitQuestStep(
        user.id,
        userQuestIdToUse,
        currentStep.id,
        response
      );
      
      setStepResult(result);
      
      // Check if quest is completed
      if (result.quest_completed) {
        setShowCompletionModal(true);
      }
      
      // Reload quest details after a short delay
      setTimeout(async () => {
        const updatedDetails = await questsService.getQuestDetails(questId);
        setQuestDetails(updatedDetails);
        
        // Move to next step if not completed
        if (!result.quest_completed && result.next_step > currentStep.step_number) {
          setCurrentStepIndex(result.next_step - 1);
          setUserResponse('');
          setSelectedOption(null);
          setStepResult(null);
        }
      }, 2000);
    } catch (error) {
      console.error('Error submitting step:', error);
      setToast({ message: 'Failed to submit step', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    setStepResult(null);
  };

  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
    navigate('/quests');
  };

  const renderStepContent = (step: QuestStep) => {
    // If step result is available, show feedback
    if (stepResult) {
      return (
        <div className={`p-6 border-3 border-black ${stepResult.is_correct ? 'bg-green-teal' : 'bg-vivid-orange'}`}>
          <div className="flex items-center space-x-3 mb-4">
            {stepResult.is_correct ? (
              <>
                <CheckCircle className="h-6 w-6 text-white" />
                <h3 className="text-xl font-black text-white">CORRECT!</h3>
              </>
            ) : (
              <>
                <X className="h-6 w-6 text-white" />
                <h3 className="text-xl font-black text-white">NOT QUITE</h3>
              </>
            )}
          </div>
          <p className="text-white font-bold mb-6">
            {stepResult.is_correct ? step.feedback_correct : step.feedback_incorrect}
          </p>
          <button
            onClick={handleContinue}
            className="bg-white hover:bg-gray-100 text-dark-teal font-black py-2 px-4 border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1"
          >
            CONTINUE
          </button>
        </div>
      );
    }

    // Otherwise, show step content based on type
    switch (step.step_type) {
      case 'quiz':
      case 'choice':
        return (
          <div className="space-y-4">
            {step.options && step.options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`w-full text-left p-4 border-3 transition-all ${
                  selectedOption === option.id
                    ? 'bg-lime-chartreuse border-black shadow-brutal'
                    : 'bg-white border-black hover:bg-lime-chartreuse/20'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 flex-shrink-0 border-2 border-black rounded-full mr-3 flex items-center justify-center">
                    {selectedOption === option.id && (
                      <div className="w-3 h-3 bg-dark-teal rounded-full"></div>
                    )}
                  </div>
                  <span className="font-bold text-dark-teal">{option.text}</span>
                </div>
              </button>
            ))}
          </div>
        );
      
      case 'rewrite':
        return (
          <div className="space-y-4">
            <textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="Type your response here..."
              className="w-full h-32 p-4 border-3 border-black font-bold text-dark-teal resize-none focus:outline-none focus:border-vivid-orange transition-colors"
            />
          </div>
        );
      
      default:
        return <p>Unknown step type</p>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-pulse-slow mb-4">
          <div className="text-6xl">📚</div>
        </div>
        <p className="text-dark-teal font-bold">Loading quest details...</p>
      </div>
    );
  }

  if (!questDetails) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="text-6xl mb-4">🤷</div>
        <h1 className="text-2xl font-black text-dark-teal mb-2">QUEST NOT FOUND</h1>
        <p className="text-dark-teal font-bold">This quest doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  const currentStep = questDetails.steps[currentStepIndex];
  const totalSteps = questDetails.steps.length;
  const progressPercentage = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

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
          onClick={() => navigate('/quests')}
          className="flex items-center space-x-2 text-dark-teal hover:text-vivid-orange mb-6 transition-colors font-black"
        >
          <ArrowLeft size={20} />
          <span>BACK TO QUESTS</span>
        </button>
        
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="text-5xl">{questDetails.quest.emoji}</div>
            <div>
              <h1 className="text-3xl font-black text-dark-teal mb-2">{questDetails.quest.title}</h1>
              <p className="text-dark-teal font-bold">{questDetails.quest.description}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
                <span className={`px-3 py-1 text-xs font-black border-2 border-black ${
                  questDetails.quest.difficulty === 'easy' ? 'bg-green-teal text-white' :
                  questDetails.quest.difficulty === 'medium' ? 'bg-vivid-orange text-white' :
                  'bg-dark-teal text-white'
                }`}>
                  {questDetails.quest.difficulty.toUpperCase()}
                </span>
                <span className="px-3 py-1 text-xs font-black border-2 border-black bg-lime-chartreuse text-dark-teal">
                  {questDetails.quest.theme}
                </span>
                <span className="px-3 py-1 text-xs font-black border-2 border-black bg-dark-teal text-white">
                  +{questDetails.quest.reward_cred} CRED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-black text-dark-teal">STEP {currentStepIndex + 1} OF {totalSteps}</span>
          <span className="text-sm font-black text-dark-teal">{progressPercentage}% COMPLETE</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-black">
          <div 
            className="bg-lime-chartreuse h-full rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Current Step */}
      <div className="bg-white border-3 border-black shadow-brutal mb-6">
        <div className="p-6 border-b-3 border-black">
          <h2 className="text-xl font-black text-dark-teal mb-2">{currentStep.title}</h2>
          <p className="text-dark-teal font-bold">{currentStep.instruction}</p>
        </div>
        
        <div className="p-6">
          {renderStepContent(currentStep)}
        </div>
        
        {/* Submit Button (only show if no result yet) */}
        {!stepResult && (
          <div className="p-6 border-t-3 border-black">
            <button
              onClick={handleSubmitStep}
              disabled={submitting || (!selectedOption && !userResponse.trim())}
              className="bg-vivid-orange hover:bg-orange-600 text-white px-6 py-3 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>SUBMITTING...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>SUBMIT ANSWER</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Quest Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-3 border-black shadow-brutal max-w-md w-full p-6 relative">
            <div className="absolute -top-4 -right-4 text-4xl animate-bounce">🎉</div>
            <div className="absolute -top-2 -left-2 text-3xl animate-bounce delay-100">✨</div>
            
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{questDetails.quest.emoji}</div>
              <h2 className="text-2xl font-black text-dark-teal mb-2">QUEST COMPLETED!</h2>
              <p className="text-dark-teal font-bold">
                You've successfully completed "{questDetails.quest.title}"
              </p>
            </div>
            
            <div className="bg-lime-chartreuse p-4 border-3 border-black mb-6">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <Sparkles className="h-5 w-5 text-dark-teal" />
                <h3 className="text-lg font-black text-dark-teal">REWARDS EARNED</h3>
                <Sparkles className="h-5 w-5 text-dark-teal" />
              </div>
              <div className="space-y-2 text-center">
                <p className="flex items-center justify-center space-x-2 text-dark-teal font-bold">
                  <Award size={18} />
                  <span>+{questDetails.quest.reward_cred} SquashCred</span>
                </p>
                <p className="flex items-center justify-center space-x-2 text-dark-teal font-bold">
                  <CheckCircle size={18} />
                  <span>New achievement unlocked!</span>
                </p>
                {questDetails.quest.unlocks_tool && (
                  <p className="flex items-center justify-center space-x-2 text-dark-teal font-bold">
                    <AlertTriangle size={18} />
                    <span>New tool unlocked: {questDetails.quest.unlocks_tool}</span>
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={handleCloseCompletionModal}
              className="w-full bg-vivid-orange hover:bg-orange-600 text-white px-6 py-3 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1"
            >
              CONTINUE YOUR JOURNEY
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestDetailPage;