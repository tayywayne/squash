import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, Star, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { questsService, Quest } from '../utils/quests';
import Toast from '../components/Toast';

const QuestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load available quests
  useEffect(() => {
    const loadQuests = async () => {
      try {
        setLoading(true);
        const availableQuests = await questsService.getAvailableQuests();
        setQuests(availableQuests);
      } catch (error) {
        console.error('Error in getAvailableQuests:', error);
        setToast({ message: 'Failed to load quests', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadQuests();
  }, []);

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

  const handleStartQuest = (questId: string) => {
    if (!questId) {
      setToast({ message: 'Invalid quest ID', type: 'error' });
      return;
    }
    navigate(`/quest/${questId}`);
  };

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
        <h1 className="text-4xl font-black text-dark-teal mb-4 border-b-3 border-black pb-2 flex items-center">
          <BookOpen className="h-8 w-8 text-vivid-orange mr-3" />
          CONFLICT CONFIDENCE QUESTS
        </h1>
        <p className="text-dark-teal font-bold text-lg">
          Level up your conflict resolution skills with these interactive challenges. 
          Complete quests to earn SquashCred and unlock achievements!
        </p>
      </div>

      {/* Quest Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-lime-chartreuse p-6 border-3 border-black shadow-brutal">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-dark-teal" />
            <div className="ml-4">
              <p className="text-xl font-black text-dark-teal">COMMUNICATION</p>
              <p className="text-dark-teal font-bold">Express yourself clearly</p>
            </div>
          </div>
        </div>
        
        <div className="bg-vivid-orange p-6 border-3 border-black shadow-brutal">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-white" />
            <div className="ml-4">
              <p className="text-xl font-black text-white">BOUNDARIES</p>
              <p className="text-white font-bold">Set healthy limits</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-teal p-6 border-3 border-black shadow-brutal">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-white" />
            <div className="ml-4">
              <p className="text-xl font-black text-white">DE-ESCALATION</p>
              <p className="text-white font-bold">Calm heated situations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quests List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-pulse-slow mb-4">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto" />
          </div>
          <p className="text-dark-teal font-bold">Loading quests...</p>
        </div>
      ) : quests.length === 0 ? (
        <div className="text-center py-12 border-3 border-black p-6">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-black text-dark-teal mb-2">NO QUESTS AVAILABLE</h3>
          <p className="text-dark-teal font-bold">
            Check back soon for new conflict resolution challenges!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {quests.map((quest) => (
            <div 
              key={quest.quest_id} 
              className="bg-white border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1"
            >
              <div className="p-6 border-b-3 border-black">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{quest.emoji}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-dark-teal mb-2">{quest.title}</h3>
                      <p className="text-dark-teal mb-3 font-bold">{quest.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className={`px-3 py-1 text-xs font-black border-2 border-black ${getDifficultyColor(quest.difficulty)}`}>
                          {quest.difficulty.toUpperCase()}
                        </span>
                        <span className="px-3 py-1 text-xs font-black border-2 border-black bg-lime-chartreuse text-dark-teal">
                          {quest.theme}
                        </span>
                        <span className="px-3 py-1 text-xs font-black border-2 border-black bg-dark-teal text-white">
                          +{quest.reward_cred} CRED
                        </span>
                        {quest.unlocks_tool && (
                          <span className="px-3 py-1 text-xs font-black border-2 border-black bg-vivid-orange text-white">
                            UNLOCKS TOOL
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="p-6 flex flex-col sm:flex-row items-center justify-between">
                <div className="w-full sm:w-2/3 mb-4 sm:mb-0">
                  {quest.is_started ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2 text-sm text-dark-teal font-bold">
                          <Clock size={16} />
                          <span>Step {quest.current_step} of {quest.total_steps}</span>
                        </div>
                        <span className="text-sm font-black text-dark-teal">
                          {quest.progress_percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-black">
                        <div 
                          className="bg-lime-chartreuse h-full rounded-full" 
                          style={{ width: `${quest.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-dark-teal font-bold">
                      Complete this quest to earn {quest.reward_cred} SquashCred and level up your conflict skills!
                    </p>
                  )}
                </div>
                <div>
                  {quest.is_completed ? (
                    <div className="flex items-center space-x-2 bg-green-teal text-white px-4 py-2 font-black border-3 border-black">
                      <CheckCircle size={18} />
                      <span>COMPLETED</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartQuest(quest.id)}
                      className="bg-vivid-orange hover:bg-orange-600 text-white px-4 py-2 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 flex items-center space-x-2"
                    >
                      <span>{quest.is_started ? 'CONTINUE' : 'START QUEST'}</span>
                      <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center">
        <div className="bg-lime-chartreuse p-6 border-3 border-black shadow-brutal">
          <h3 className="text-lg font-black text-dark-teal mb-2 flex items-center justify-center">
            <span className="text-2xl mr-2">📢</span> QUEST REWARDS
          </h3>
          <p className="text-dark-teal font-bold leading-relaxed">
            Completing quests earns you SquashCred points, unlocks achievements, and teaches you valuable conflict resolution skills.
            New quests are added regularly!
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuestsPage;