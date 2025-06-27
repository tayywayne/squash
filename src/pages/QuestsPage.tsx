import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, Star, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { questsService, Quest } from '../utils/quests';
import { useAuth } from '../hooks/useAuth';
import Toast from '../components/Toast';

const QuestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

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

  const QuestCard = ({ quest }: { quest: Quest }) => (
    <div 
      key={quest.quest_id} 
      className={`bg-white border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 ${
        quest.user_completed ? 'border-green-teal' : ''
      }`}
    >
      <div className="p-6 border-b-3 border-black">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <div className="text-4xl">{quest.emoji}</div>
              {quest.user_completed && (
                <div className="absolute -top-2 -right-2 bg-green-teal text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-black">
                  <CheckCircle className="h-3 w-3" />
                </div>
              )}
            </div>
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

      <div className="p-6 flex flex-col sm:flex-row items-center justify-between">
        <div className="w-full sm:w-2/3 mb-4 sm:mb-0">
          {quest.user_started ? (
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
          {quest.user_completed ? (
            <div className="flex items-center space-x-2 bg-green-teal text-white px-4 py-2 font-black border-3 border-black">
              <CheckCircle size={18} />
              <span>COMPLETED</span>
              <span className="ml-1 text-xs bg-white text-green-teal px-2 py-0.5 rounded-full">+{quest.reward_cred}</span>
            </div>
          ) : (
            <button
              onClick={() => handleStartQuest(quest.id)}
              className="bg-vivid-orange hover:bg-orange-600 text-white px-4 py-2 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 flex items-center space-x-2"
            >
              <span>{quest.user_started ? 'CONTINUE' : 'START QUEST'}</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const incompleteQuests = quests.filter(q => !q.user_completed);
  const completedQuests = quests.filter(q => q.user_completed);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

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

      {/* Sections */}
      {loading ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto animate-pulse" />
          <p className="text-dark-teal font-bold mt-4">Loading quests...</p>
        </div>
      ) : (
        <>
          {incompleteQuests.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-black text-dark-teal mb-4 border-b-3 border-black pb-2">
                AVAILABLE QUESTS
              </h2>
              <div className="space-y-6">
                {incompleteQuests.map(quest => <QuestCard key={quest.quest_id} quest={quest} />)}
              </div>
            </div>
          )}

          {completedQuests.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-black text-dark-teal mb-4 border-b-3 border-black pb-2 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-teal mr-2" />
                COMPLETED QUESTS
              </h2>
              <div className="space-y-6">
                {completedQuests.map(quest => <QuestCard key={quest.quest_id} quest={quest} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuestsPage;