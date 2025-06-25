import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, BookOpen, CheckCircle, ChevronRight, Star, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { questsService, QuestDetails, QuestStep, StepSubmissionResult } from '../utils/quests';
import Toast from '../components/Toast';

const QuestDetailPage: React.FC = () => {
  const { questId } = useParams<{ questId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questDetails, setQuestDetails] = useState<QuestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stepResult, setStepResult] = useState<StepSubmissionResult | null>(null);
  const [userQuestId, setUserQuestId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load quest details
  useEffect(() => {
    const loadQuestDetails = async () => {
      if (!questId) {
        setToast({ message: 'Invalid quest ID', type: 'error' });
        navigate('/quests');
        return;
      }

      try {
        const details = await questsService.getQuestDetails(questId);
        if (!details) {
          setToast({ message: 'Quest not found', type: 'error' });
          navigate('/quests');
          return;
        }

        setQuestDetails(details);
        
        // If quest is already started, set current step
        if (details.user_progress.is_started) {
          setCurrentStepIndex(details.user_progress.current_step - 1);
        }
        
        // Start quest if not already started
        if (!details.user_progress.is_started) {
          const startedQuestId = await questsService.startQuest(questId);
          if (startedQuestId) {
            setUserQuestId(startedQuestId);
          }
        }
      } catch (error) {
        console.error('Error loading quest details:', error);
        setToast({ message: 'Failed to load quest details', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadQuestDetails();
  }, [questId, navigate]);

  const handleSubmitStep = async () => {
    if (!questDetails || !questId || submitting || !userResponse.trim()) return;
    
    const currentStep = questDetails.steps[currentStepIndex];
    
    setSubmitting(true);
    try {
      // Get or create user quest ID
      let questProgressId = userQuestId;
      if (!questProgressId) {
        questProgressId = await questsService.startQuest(questId);
        setUserQuestId(questProgressId);
      }
      
      if (!questProgressId) {
        throw new Error('Failed to get quest progress ID');
      }
      
      // Submit step
      const result = await questsService.submitQuestStep(
        questProgressId,
        currentStep.id,
        userResponse
      );
      
      if (result) {
        setStepResult(result);
        
        // If quest completed, show success message
        if (result.quest_completed) {
          setToast({ 
            message: `Quest completed! You earned ${questDetails.quest.reward_cred} SquashCred!`, 
            type: 'success' 
          });
        }
      } else {
        setToast({ message: 'Failed to submit step', type: 'error' });
      }
    } catch (error) {
      console.error('Error submitting step:', error);
      setToast({ message: 'Failed to submit step', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (!questDetails) return;
    
    // Move to next step
    if (currentStepIndex < questDetails.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setUserResponse('');
      setStepResult(null);
    } else {
      // Quest completed, navigate back to quests page
      navigate('/quests');
    }
  };

  const renderStepContent = (step: QuestStep) => {
    switch (step.step_type) {
      case 'quiz':
      case 'choice':
        return (
          <div className="space-y-3">
            {step.options && JSON.parse(step.options as unknown as string).map((option: { id: string; text: string }) => (
              <button
                key={option.id}
                onClick={() => setUserResponse(option.id)}
                disabled={!!stepResult}
                className={`w-full text-left p-4 border-3 transition-all ${
                  userResponse === option.id
                    ? 'bg-lime-chartreuse border-black'
                    : 'bg-white border-black hover:bg-lime-chartreuse/20'
                } ${stepResult ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 flex-shrink-0 mr-3 border-2 border-black flex items-center justify-center">
                    {userResponse === option.id && <CheckCircle className="h-4 w-4 text-dark-teal" />}
                  </div>
                  <span className="text-dark-teal font-bold">{option.text}</span>
                </div>
              </button>
            ))}
          </div>
        );
      
      case 'rewrite':
        return (
          <div className="space-y-3">
            <textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              disabled={!!stepResult}
              placeholder="Type your response here..."
              className="w-full h-32 p-3 border-3 border-black font-bold text-dark-teal resize-none focus:outline-none focus:border-vivid-orange transition-colors"
              maxLength={1000}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-dark-teal font-bold">
                {userResponse.length}/1000 characters
              </span>
            </div>
          </div>
        );
      
      default:
        return <p className="text-dark-teal font-bold">Unknown step type</p>;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-teal text-white';
      case 'medium':
        return 'bg-vivid-orange text-white';
      case 'hard':
        return 'bg-dark-teal text-white';
      default:
        return 'bg-lime-chartreuse text-dark-teal';
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
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-lime-chartreuse border-3 border-black flex items-center justify-center">
                <span className="text-3xl">{questDetails.quest.emoji}</span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-2xl font-black text-dark-teal">{questDetails.quest.title}</h1>
                <span className={`text-xs font-black px-2 py-0.5 ${getDifficultyColor(questDetails.quest.difficulty)}`}>
                  {questDetails.quest.difficulty.toUpperCase()}
                </span>
              </div>
              
              <p className="text-dark-teal text-sm mb-2">{questDetails.quest.description}</p>
              
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center space-x-1 bg-dark-teal text-white px-2 py-1">
                  <Award size={12} />
                  <span className="font-bold">{questDetails.quest.reward_cred} CRED</span>
                </div>
                
                <div className="flex items-center space-x-1 bg-lime-chartreuse text-dark-teal px-2 py-1">
                  <BookOpen size={12} />
                  <span className="font-bold">{totalSteps} STEPS</span>
                </div>
                
                <div className="flex items-center space-x-1 bg-gray-100 text-dark-teal px-2 py-1">
                  <Star size={12} />
                  <span className="font-bold">{questDetails.quest.theme}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-dark-teal">PROGRESS</span>
          <span className="text-sm font-bold text-dark-teal">{progressPercentage}%</span>
        </div>
        <div className="h-3 bg-gray-200 border-2 border-black">
          <div 
            className="h-full bg-lime-chartreuse" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs font-bold text-dark-teal">Step {currentStepIndex + 1} of {totalSteps}</span>
          {questDetails.user_progress.is_completed && (
            <span className="text-xs font-bold text-green-teal flex items-center">
              <CheckCircle size={12} className="mr-1" />
              COMPLETED
            </span>
          )}
        </div>
      </div>

      {/* Current Step */}
      <div className="bg-white border-3 border-black shadow-brutal mb-6">
        <div className="p-6 border-b-3 border-black">
          <h2 className="text-xl font-black text-dark-teal mb-4">
            {currentStep.title}
          </h2>
          <p className="text-dark-teal font-bold mb-6">
            {currentStep.instruction}
          </p>
          
          {renderStepContent(currentStep)}
        </div>
        
        {/* Step Result Feedback */}
        {stepResult && (
          <div className={`p-6 border-b-3 border-black ${
            stepResult.is_correct ? 'bg-green-teal' : 'bg-vivid-orange'
          }`}>
            <div className="flex items-start space-x-3">
              {stepResult.is_correct ? (
                <CheckCircle className="h-6 w-6 text-white flex-shrink-0 mt-1" />
              ) : (
                <AlertCircle className="h-6 w-6 text-white flex-shrink-0 mt-1" />
              )}
              <div>
                <h3 className="text-lg font-black text-white mb-2">
                  {stepResult.is_correct ? 'Correct!' : 'Not quite right'}
                </h3>
                <p className="text-white font-bold">
                  {stepResult.feedback}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="p-6 flex justify-between">
          <button
            onClick={() => navigate('/quests')}
            className="bg-white hover:bg-gray-100 text-dark-teal font-black py-2 px-4 border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1"
          >
            EXIT QUEST
          </button>
          
          {stepResult ? (
            <button
              onClick={handleNextStep}
              className="bg-vivid-orange hover:bg-orange-600 text-white font-black py-2 px-4 border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 flex items-center space-x-2"
            >
              <span>{stepResult.quest_completed ? 'FINISH QUEST' : 'NEXT STEP'}</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmitStep}
              disabled={!userResponse.trim() || submitting}
              className="bg-vivid-orange hover:bg-orange-600 text-white font-black py-2 px-4 border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? 'SUBMITTING...' : 'SUBMIT ANSWER'}
            </button>
          )}
        </div>
      </div>

      {/* Quest Info */}
      <div className="bg-lime-chartreuse p-6 border-3 border-black shadow-brutal">
        <h3 className="text-lg font-black text-dark-teal mb-3 flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          QUEST TIPS
        </h3>
        <div className="space-y-3 text-dark-teal font-bold">
          <p>
            <strong>Take your time:</strong> These exercises are designed to help you develop real communication skills.
          </p>
          <p>
            <strong>Be honest:</strong> The goal is to learn, not to get every answer "right" the first time.
          </p>
          <p>
            <strong>Apply what you learn:</strong> Try using these techniques in your real-life conflicts!
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuestDetailPage;