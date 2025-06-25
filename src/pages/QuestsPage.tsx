import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, Star, ChevronRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { questsService, Quest } from '../utils/quests';
import Toast from '../components/Toast';

const QuestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load available quests
  useEffect(() => {
    const loadQuests = async () => {
      try {
        const availableQuests = await questsService.getAvailableQuests();
        setQuests(availableQuests);
      } catch (error) {
        console.error('Error in loadQuests:', error);
        setToast({ message: 'Failed to load quests', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadQuests();
  }, []);

  const handleStartQuest = async (questId: string) => {
    try {
      const userQuestId = await questsService.startQuest(questId);
      if (userQuestId) {
        navigate(`/quest/${questId}`);
      } else {
        setToast({ message: 'Failed to start quest', type: 'error' });
      }
    } catch (error) {
      console.error('Error starting quest:', error);
      setToast({ message: 'Failed to start quest', type: 'error' });
    }
  };

  const handleContinueQuest = (questId: string) => {
    navigate(`/quest/${questId}`);
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

  const getQuestStatusInfo = (quest: Quest) => {
    if (quest.is_completed) {
      return {
        icon: CheckCircle,
        text: 'COMPLETED',
        color: 'text-green-teal',
        bgColor: 'bg-green-teal/10'
      };
    }
    
    if (quest.is_started) {
      return {
        icon: Clock,
        text: `IN PROGRESS (${quest.progress_percentage}%)`,
        color: 'text-vivid-orange',
        bgColor: 'bg-vivid-orange/10'
      };
    }
    
    return {
      icon: Star,
      text: 'START QUEST',
      color: 'text-lime-chartreuse',
      bgColor: 'bg-lime-chartreuse/10'
    };
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-pulse-slow mb-4">
          <div className="text-6xl">📚</div>
        </div>
        <p className="text-dark-teal font-bold">Loading quests...</p>
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
        <h1 className="text-4xl font-black text-dark-teal mb-4 border-b-3 border-black pb-2">
          CONFLICT CONFIDENCE QUESTS
        </h1>
        <p className="text-dark-teal font-bold text-lg">
          Complete these interactive challenges to level up your conflict resolution skills and earn rewards!
        </p>
      </div>

      {/* Quests List */}
      <div className="space-y-6">
        {quests.length === 0 ? (
          <div className="text-center py-12 border-3 border-black p-6">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-black text-dark-teal mb-2">NO QUESTS AVAILABLE</h2>
            <p className="text-dark-teal font-bold">
              Check back soon for new conflict resolution challenges!
            </p>
          </div>
        ) : (
          quests.map((quest) => {
            const statusInfo = getQuestStatusInfo(quest);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div 
                key={quest.quest_id} 
                className="bg-white border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-lime-chartreuse border-3 border-black flex items-center justify-center">
                          <span className="text-3xl">{quest.emoji}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-xl font-black text-dark-teal truncate">{quest.title}</h3>
                          <span className={`text-xs font-black px-2 py-0.5 ${getDifficultyColor(quest.difficulty)}`}>
                            {quest.difficulty.toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-dark-teal text-sm mb-2">{quest.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <div className="flex items-center space-x-1 bg-dark-teal text-white px-2 py-1">
                            <Award size={12} />
                            <span className="font-bold">{quest.reward_cred} CRED</span>
                          </div>
                          
                          <div className="flex items-center space-x-1 bg-lime-chartreuse text-dark-teal px-2 py-1">
                            <BookOpen size={12} />
                            <span className="font-bold">{quest.total_steps} STEPS</span>
                          </div>
                          
                          <div className="flex items-center space-x-1 bg-gray-100 text-dark-teal px-2 py-1">
                            <Star size={12} />
                            <span className="font-bold">{quest.theme}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => quest.is_started ? handleContinueQuest(quest.quest_id) : handleStartQuest(quest.quest_id)}
                      className={`flex items-center space-x-2 ${statusInfo.bgColor} ${statusInfo.color} px-4 py-2 border-2 border-black hover:shadow-brutal-sm transition-all`}
                    >
                      <StatusIcon size={16} />
                      <span className="font-black text-sm">{statusInfo.text}</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Progress Bar (only for started quests) */}
                {quest.is_started && !quest.is_completed && (
                  <div className="h-3 bg-gray-200 border-t-2 border-black">
                    <div 
                      className="h-full bg-lime-chartreuse" 
                      style={{ width: `${quest.progress_percentage}%` }}
                    ></div>
                  </div>
                )}
                
                {/* Completed Bar */}
                {quest.is_completed && (
                  <div className="h-3 bg-green-teal border-t-2 border-black"></div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Info Section */}
      <div className="mt-12 bg-dark-teal p-6 border-3 border-black shadow-brutal">
        <h3 className="text-lg font-black text-white mb-3 flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-lime-chartreuse" />
          ABOUT CONFLICT CONFIDENCE QUESTS
        </h3>
        <p className="text-white font-bold mb-4">
          These interactive challenges help you build practical conflict resolution skills through guided exercises.
          Complete quests to earn SquashCred, unlock achievements, and become a more effective communicator.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-white border-2 border-black p-3">
            <div className="text-2xl font-black text-vivid-orange">LEARN</div>
            <div className="text-sm text-dark-teal font-bold">Practice real communication skills</div>
          </div>
          <div className="bg-white border-2 border-black p-3">
            <div className="text-2xl font-black text-vivid-orange">EARN</div>
            <div className="text-sm text-dark-teal font-bold">Get SquashCred for completing quests</div>
          </div>
          <div className="bg-white border-2 border-black p-3">
            <div className="text-2xl font-black text-vivid-orange">GROW</div>
            <div className="text-sm text-dark-teal font-bold">Unlock new tools and abilities</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestsPage;