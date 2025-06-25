import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, CheckCircle, Clock, Star, Trophy, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { questsService, Quest } from '../utils/quests';
import Toast from '../components/Toast';

const QuestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    const loadQuests = async () => {
      if (!user?.id) return;
      
      try {
        const questsData = await questsService.getAvailableQuests(user.id);
        setQuests(questsData);
      } catch (error) {
        console.error('Error loading quests:', error);
        setToast({ message: 'Failed to load quests', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadQuests();
  }, [user?.id]);

  const filteredQuests = quests.filter(quest => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'in-progress') return quest.is_started && !quest.is_completed;
    if (activeFilter === 'completed') return quest.is_completed;
    return true;
  });

  const getDifficultyBadge = (difficulty: string) => {
    const colors = questsService.getDifficultyColor(difficulty);
    return (
      <div className={`px-2 py-1 text-xs font-black ${colors} border-2 border-black`}>
        {difficulty.toUpperCase()}
      </div>
    );
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
        <h1 className="text-4xl font-black text-dark-teal mb-4 border-b-3 border-black pb-2">
          CONFLICT CONFIDENCE QUESTS
        </h1>
        <p className="text-dark-teal font-bold text-lg">
          Complete interactive challenges to build your conflict resolution skills, earn SquashCred, and unlock achievements.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex bg-gray-100 p-1 border-3 border-black">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-1 py-2 text-sm font-black transition-colors ${
              activeFilter === 'all'
                ? 'bg-lime-chartreuse text-dark-teal border-2 border-black'
                : 'text-dark-teal hover:text-vivid-orange'
            }`}
          >
            ALL QUESTS
          </button>
          <button
            onClick={() => setActiveFilter('in-progress')}
            className={`flex-1 py-2 text-sm font-black transition-colors ${
              activeFilter === 'in-progress'
                ? 'bg-lime-chartreuse text-dark-teal border-2 border-black'
                : 'text-dark-teal hover:text-vivid-orange'
            }`}
          >
            IN PROGRESS
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`flex-1 py-2 text-sm font-black transition-colors ${
              activeFilter === 'completed'
                ? 'bg-lime-chartreuse text-dark-teal border-2 border-black'
                : 'text-dark-teal hover:text-vivid-orange'
            }`}
          >
            COMPLETED
          </button>
        </div>
      </div>

      {/* Quests List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-pulse-slow mb-4">
            <div className="text-6xl">📚</div>
          </div>
          <p className="text-dark-teal font-bold">Loading quests...</p>
        </div>
      ) : filteredQuests.length === 0 ? (
        <div className="text-center py-12 border-3 border-black p-6">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-black text-dark-teal mb-2">NO QUESTS FOUND</h2>
          <p className="text-dark-teal font-bold">
            {activeFilter === 'all' 
              ? "We couldn't find any quests. Check back later!" 
              : activeFilter === 'in-progress'
                ? "You don't have any quests in progress. Start one from the 'All Quests' tab!"
                : "You haven't completed any quests yet. Time to start learning!"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredQuests.map((quest) => (
            <div 
              key={quest.quest_id} 
              className={`bg-white border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 overflow-hidden ${
                quest.is_completed ? 'border-green-teal' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex items-start">
                  {/* Quest Icon */}
                  <div className={`flex-shrink-0 w-16 h-16 ${questsService.getDifficultyColor(quest.difficulty)} border-3 border-black flex items-center justify-center mr-4`}>
                    <span className="text-3xl">{quest.emoji}</span>
                  </div>
                  
                  {/* Quest Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-xl font-black text-dark-teal">{quest.title}</h3>
                      {quest.is_completed && (
                        <CheckCircle className="h-5 w-5 text-green-teal" />
                      )}
                    </div>
                    
                    <p className="text-dark-teal mb-3 text-sm">{quest.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {getDifficultyBadge(quest.difficulty)}
                      
                      <div className="px-2 py-1 bg-dark-teal text-white border-2 border-black font-bold flex items-center">
                        <Trophy className="h-3 w-3 mr-1" />
                        <span>{quest.reward_cred} CRED</span>
                      </div>
                      
                      <div className="px-2 py-1 bg-lime-chartreuse text-dark-teal border-2 border-black font-bold">
                        <span>{quest.theme}</span>
                      </div>
                      
                      <div className="px-2 py-1 bg-white text-dark-teal border-2 border-black font-bold flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" />
                        <span>{quest.total_steps} STEPS</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                {(quest.is_started || quest.is_completed) && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-xs font-bold text-dark-teal">
                        {quest.is_completed 
                          ? 'COMPLETED!' 
                          : `STEP ${quest.current_step} OF ${quest.total_steps}`}
                      </div>
                      <div className="text-xs font-bold text-dark-teal">
                        {quest.progress_percentage}%
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 border-2 border-black">
                      <div 
                        className={`h-full ${quest.is_completed ? 'bg-green-teal' : 'bg-vivid-orange'}`}
                        style={{ width: `${quest.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Action Button */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => navigate(`/quest/${quest.quest_id}`)}
                    className={`px-4 py-2 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 flex items-center space-x-2 ${
                      quest.is_completed
                        ? 'bg-green-teal text-white'
                        : quest.is_started
                          ? 'bg-vivid-orange text-white'
                          : 'bg-lime-chartreuse text-dark-teal'
                    }`}
                  >
                    <span>
                      {quest.is_completed
                        ? 'REVIEW QUEST'
                        : quest.is_started
                          ? 'CONTINUE QUEST'
                          : 'START QUEST'}
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-12 bg-dark-teal p-6 border-3 border-black shadow-brutal">
        <h3 className="text-lg font-black text-white mb-4 flex items-center">
          <Zap className="h-5 w-5 text-lime-chartreuse mr-2" />
          ABOUT CONFLICT CONFIDENCE QUESTS
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 border-2 border-black">
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="h-5 w-5 text-vivid-orange" />
              <h4 className="font-black text-dark-teal">EARN REWARDS</h4>
            </div>
            <p className="text-sm text-dark-teal">
              Complete quests to earn SquashCred points, unlock special achievements, and gain access to advanced tools.
            </p>
          </div>
          
          <div className="bg-white p-4 border-2 border-black">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="h-5 w-5 text-vivid-orange" />
              <h4 className="font-black text-dark-teal">BUILD SKILLS</h4>
            </div>
            <p className="text-sm text-dark-teal">
              Each quest teaches practical conflict resolution skills you can apply to real-life situations.
            </p>
          </div>
          
          <div className="bg-white p-4 border-2 border-black">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="h-5 w-5 text-vivid-orange" />
              <h4 className="font-black text-dark-teal">TRACK PROGRESS</h4>
            </div>
            <p className="text-sm text-dark-teal">
              Your progress is saved automatically. Return anytime to continue where you left off.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestsPage;