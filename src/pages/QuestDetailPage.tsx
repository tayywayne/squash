import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, HelpCircle, MessageSquare, RefreshCw, Send, Trophy } from 'lucide-react';
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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stepResult, setStepResult] = useState<StepSubmissionResult | null>(null);
  const [userQuestId, setUserQuestId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load quest details
  useEffect(() => {
    const loadQuestDetails = async () => {
      if (!questId || !user?.id) return;
      
      try {
        const details = await questsService.getQuestDetails(questId, user.id);
        if (!details) {
          setToast({ message: 'Quest not found', type: 'error' });
          navigate('/quests');
          return;
        }
        
        setQuestDetails(details);
        
        // If quest is already started, set current step
        if (details.user_progress.is_started && !details.user_progress.is_completed) {
          setCurrentStepIndex(details.user_progress.current_step - 1);
        }
        
        // Start quest if not started
        if (!details.user_progress.is_started) {
          const userQuestId = await questsService.startQuest(questId, user.id);
          setUserQuestId(userQuestId);
        }
      } catch (error) {
        console.error('Error loading quest details:', error);
        setToast({ message: 'Failed to load quest details', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadQuestDetails();
  }, [questId, user?.id, navigate]);

  // Set user quest ID when details load
  useEffect(() => {
    if (questDetails?.user_progress.is_started) {
      // Extract user_quest_id from the first step that has user data
      const stepWithUserData = questDetails.steps.find(step => step.is_completed);
      if (stepWithUserData && questDetails.steps[0].is_completed) {
        // This is a bit of a hack - we're assuming the user_quest_id is in the URL of the API call
        // In a real app, you'd store this properly
        setUserQuestId(questDetails.quest.id);
      }
    }
  }, [questDetails]);

  // Reset user response when step changes
  useEffect(() => {
    setUserResponse('');
    setSelectedOption(null);
    setStepResult(null);
  }, [currentStepIndex]);

  const handleSubmitStep = async () => {
    if (!questDetails || !userQuestId) return;
    
    const currentStep = questDetails.steps[currentStepIndex];
    
    // Validate response
    if (currentStep.step_type === 'rewrite' && !userResponse.trim()) {
      setToast({ message: 'Please enter your response', type: 'error' });
      return;
    }
    
    if ((currentStep.step_type === 'quiz' || currentStep.step_type === 'choice') && !selectedOption) {
      setToast({ message: 'Please select an option', type: 'error' });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = currentStep.step_type === 'rewrite' 
        ? userResponse 
        : selectedOption || '';
      
      const result = await questsService.submitQuestStep(
        userQuestId,
        currentStep.id,
        response
      );
      
      if (!result) {
        throw new Error('Failed to submit step');
      }
      
      setStepResult(result);
      
      // If quest is completed, show success message
      if (result.quest_completed) {
        setToast({ 
          message: `Quest completed! You earned ${questDetails.quest.reward_cred} SquashCred!`, 
          type: 'success' 
        });
      }
    } catch (error) {
      console.error('Error submitting step:', error);
      setToast({ message: 'Failed to submit step', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (!questDetails || !stepResult) return;
    
    if (stepResult.quest_completed) {
      // Reload quest details to show completion
      if (questId && user?.id) {
        questsService.getQuestDetails(questId, user.id)
          .then(details => {
            if (details) {
              setQuestDetails(details);
            }
          })
          .catch(error => {
            console.error('Error reloading quest details:', error);
          });
      }
    } else {
      // Move to next step
      setCurrentStepIndex(stepResult.next_step - 1);
    }
    
    // Clear step result
    setStepResult(null);
  };

  const getCurrentStep = (): QuestStep | null => {
    if (!questDetails || questDetails.steps.length === 0) return null;
    return questDetails.steps[currentStepIndex];
  };

  const renderStepContent = () => {
    const currentStep = getCurrentStep();
    if (!currentStep) return null;
    
    // If step result is available, show feedback
    if (stepResult) {
      return (
        <div className={`p-6 border-3 border-black ${stepResult.is_correct ? 'bg-green-teal' : 'bg-vivid-orange'}`}>
          <div className="flex items-center space-x-3 mb-4">
            {stepResult.is_correct ? (
              <>
                <CheckCircle className="h-6 w-6 text-white" />
                <h3 className="text-xl font-black text-white">Correct!</h3>
              </>
            ) : (
              <>
                <RefreshCw className="h-6 w-6 text-white" />
                <h3 className="text-xl font-black text-white">Not Quite</h3>
              </>
            )}
          </div>
          
          <p className="text-white font-bold mb-6">{stepResult.feedback}</p>
          
          {stepResult.quest_completed ? (
            <div className="bg-white p-4 border-3 border-black">
              <div className="text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-xl font-black text-dark-teal mb-2">QUEST COMPLETED!</h3>
                <p className="text-dark-teal font-bold mb-4">
                  You've earned {questDetails?.quest.reward_cred} SquashCred and unlocked a new achievement!
                </p>
                <button
                  onClick={() => navigate('/quests')}
                  className="bg-vivid-orange hover:bg-orange-600 text-white px-6 py-2 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1"
                >
                  BACK TO QUESTS
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleNextStep}
              className="bg-white hover:bg-gray-100 text-dark-teal px-6 py-2 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 flex items-center space-x-2"
            >
              <span>CONTINUE</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      );
    }
    
    // Otherwise, show step content based on type
    switch (currentStep.step_type) {
      case 'quiz':
      case 'choice':
        return (
          <div>
            <p className="text-dark-teal font-bold mb-6">{currentStep.instruction}</p>
            
            <div className="space-y-3 mb-6">
              {currentStep.options?.map((option) => (
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
                    <div className={`w-6 h-6 flex-shrink-0 border-2 border-black rounded-full mr-3 ${
                      selectedOption === option.id ? 'bg-dark-teal' : 'bg-white'
                    }`}>
                      {selectedOption === option.id && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-dark-teal">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>
            
            <button
              onClick={handleSubmitStep}
              disabled={!selectedOption || submitting}
              className="bg-vivid-orange hover:bg-orange-600 text-white px-6 py-2 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>SUBMITTING...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>SUBMIT ANSWER</span>
                </>
              )}
            </button>
          </div>
        );
      
      case 'rewrite':
        return (
          <div>
            <p className="text-dark-teal font-bold mb-6">{currentStep.instruction}</p>
            
            <textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="Type your response here..."
              className="w-full h-32 p-3 border-3 border-black font-bold text-dark-teal resize-none focus:outline-none focus:border-vivid-orange transition-colors mb-6"
              maxLength={500}
            />
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs text-dark-teal font-bold">
                {userResponse.length}/500 characters
              </span>
              
              <div className="bg-lime-chartreuse px-3 py-1 border-2 border-black">
                <span className="text-xs font-bold text-dark-teal">
                  <HelpCircle className="inline h-3 w-3 mr-1" />
                  Focus on clear, constructive communication
                </span>
              </div>
            </div>
            
            <button
              onClick={handleSubmitStep}
              disabled={!userResponse.trim() || submitting}
              className="bg-vivid-orange hover:bg-orange-600 text-white px-6 py-2 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>SUBMITTING...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>SUBMIT RESPONSE</span>
                </>
              )}
            </button>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-8">
            <p className="text-dark-teal font-bold">Unknown step type</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-pulse-slow mb-4">
          <div className="text-6xl">📚</div>
        </div>
        <p className="text-dark-teal font-bold">Loading quest...</p>
      </div>
    );
  }

  if (!questDetails) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="text-6xl mb-4">🤷</div>
        <h1 className="text-2xl font-bold text-dark-teal mb-2">Quest Not Found</h1>
        <p className="text-dark-teal font-bold">This quest doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  const currentStep = getCurrentStep();
  const { quest, user_progress } = questDetails;

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
        
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 w-16 h-16 ${questsService.getDifficultyColor(quest.difficulty)} border-3 border-black flex items-center justify-center`}>
            <span className="text-3xl">{quest.emoji}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-black text-dark-teal mb-2">{quest.title}</h1>
            <p className="text-dark-teal font-bold mb-3">{quest.description}</p>
            
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className={`px-2 py-1 ${questsService.getDifficultyColor(quest.difficulty)} border-2 border-black font-bold`}>
                {quest.difficulty.toUpperCase()}
              </div>
              
              <div className="px-2 py-1 bg-dark-teal text-white border-2 border-black font-bold flex items-center">
                <Trophy className="h-3 w-3 mr-1" />
                <span>{quest.reward_cred} CRED</span>
              </div>
              
              <div className="px-2 py-1 bg-lime-chartreuse text-dark-teal border-2 border-black font-bold">
                <span>{quest.theme}</span>
              </div>
              
              {user_progress.is_completed && (
                <div className="px-2 py-1 bg-green-teal text-white border-2 border-black font-bold flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>COMPLETED</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-bold text-dark-teal">
            {user_progress.is_completed 
              ? 'COMPLETED!' 
              : `STEP ${currentStepIndex + 1} OF ${questDetails.steps.length}`}
          </div>
          <div className="text-sm font-bold text-dark-teal flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>
              {user_progress.started_at && new Date(user_progress.started_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="h-3 bg-gray-200 border-2 border-black">
          <div 
            className={`h-full ${user_progress.is_completed ? 'bg-green-teal' : 'bg-vivid-orange'}`}
            style={{ width: `${((currentStepIndex + 1) / questDetails.steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex mb-6 overflow-x-auto pb-2">
        {questDetails.steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => {
              // Only allow navigation to completed steps or current step
              if (step.is_completed || index <= user_progress.current_step - 1) {
                setCurrentStepIndex(index);
              }
            }}
            disabled={!step.is_completed && index > user_progress.current_step - 1}
            className={`flex-shrink-0 w-10 h-10 flex items-center justify-center border-3 mr-2 transition-all ${
              index === currentStepIndex
                ? 'bg-vivid-orange text-white border-black'
                : step.is_completed
                  ? 'bg-green-teal text-white border-black'
                  : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
            }`}
          >
            {step.is_completed ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <span className="font-black">{index + 1}</span>
            )}
          </button>
        ))}
      </div>

      {/* Current Step */}
      {currentStep && (
        <div className="bg-white border-3 border-black shadow-brutal mb-6">
          {/* Step Header */}
          <div className="p-4 border-b-3 border-black bg-lime-chartreuse">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{questsService.getStepTypeIcon(currentStep.step_type)}</div>
              <h2 className="text-xl font-black text-dark-teal">{currentStep.title}</h2>
            </div>
          </div>
          
          {/* Step Content */}
          <div className="p-6">
            {renderStepContent()}
          </div>
        </div>
      )}

      {/* Quest Info */}
      <div className="bg-dark-teal p-6 border-3 border-black shadow-brutal">
        <h3 className="text-lg font-black text-white mb-4 border-b-2 border-lime-chartreuse pb-2">
          QUEST BENEFITS
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white border-2 border-black p-4">
            <div className="text-2xl font-black text-vivid-orange mb-1">{quest.reward_cred}</div>
            <div className="text-sm text-dark-teal font-bold">SQUASHCRED POINTS</div>
          </div>
          
          <div className="bg-white border-2 border-black p-4">
            <div className="text-2xl font-black text-vivid-orange mb-1">🏆</div>
            <div className="text-sm text-dark-teal font-bold">UNIQUE ACHIEVEMENT</div>
          </div>
          
          {quest.unlocks_tool ? (
            <div className="bg-white border-2 border-black p-4">
              <div className="text-2xl font-black text-vivid-orange mb-1">🔓</div>
              <div className="text-sm text-dark-teal font-bold">UNLOCKS: {quest.unlocks_tool}</div>
            </div>
          ) : (
            <div className="bg-white border-2 border-black p-4">
              <div className="text-2xl font-black text-vivid-orange mb-1">🧠</div>
              <div className="text-sm text-dark-teal font-bold">CONFLICT SKILLS</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestDetailPage;