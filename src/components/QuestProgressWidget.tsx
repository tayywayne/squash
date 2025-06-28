import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { questsService, Quest } from '../utils/quests';
import { useAuth } from '../hooks/useAuth';

const QuestProgressWidget: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuests = async () => {
      try {
        setLoading(true);
        const availableQuests = await questsService.getAvailableQuests();
        setQuests(availableQuests);
      } catch (error) {
        console.error('Error loading quests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuests();
  }, []);

  // Find the first in-progress quest
  const inProgressQuest = quests.find(q => q.user_started && !q.user_completed);
  
  // If no in-progress quest, suggest the first available quest
  const suggestedQuest = !inProgressQuest ? quests.find(q => !q.user_completed) : null;

  const handleStartQuest = (questId: string) => {
    navigate(`/quest/${questId}`);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 border-3 border-black shadow-brutal animate-pulse">
        <div className="flex items-center space-x-2 mb-4">
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="h-24 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!inProgressQuest && !suggestedQuest) {
    return (
      <div className="bg-white p-6 border-3 border-black shadow-brutal">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="h-5 w-5 text-vivid-orange" />
          <h3 className="text-lg font-black text-dark-teal">QUESTS</h3>
        </div>
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-dark-teal font-bold">
            You've completed all available quests! Check back later for new ones.
          </p>
        </div>
      </div>
    );
  }

  if (inProgressQuest) {
    return (
      <div className="bg-white p-6 border-3 border-black shadow-brutal">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-vivid-orange" />
            <h3 className="text-lg font-black text-dark-teal">CURRENT QUEST</h3>
          </div>
          <div className="flex items-center space-x-1 text-sm text-dark-teal">
            <Award size={16} />
            <span className="font-bold">+{inProgressQuest.reward_cred} CRED</span>
          </div>
        </div>
        
        <div className="flex items-start space-x-4 mb-4">
          <div className="text-4xl">{inProgressQuest.emoji}</div>
          <div className="flex-1">
            <h4 className="text-lg font-black text-dark-teal mb-1">{inProgressQuest.title}</h4>
            <p className="text-dark-teal text-sm font-bold mb-2">{inProgressQuest.description}</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2 text-sm text-dark-teal font-bold">
                  <Clock size={16} />
                  <span>Step {inProgressQuest.current_step} of {inProgressQuest.total_steps}</span>
                </div>
                <span className="text-sm font-black text-dark-teal">
                  {inProgressQuest.progress_percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-black">
                <div 
                  className="bg-lime-chartreuse h-full rounded-full" 
                  style={{ width: `${inProgressQuest.progress_percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => handleStartQuest(inProgressQuest.id)}
          className="w-full bg-vivid-orange hover:bg-orange-600 text-white px-4 py-3 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 flex items-center justify-center space-x-2"
        >
          <span>CONTINUE QUEST</span>
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  // Suggested quest (when no in-progress quest)
  return (
    <div className="bg-white p-6 border-3 border-black shadow-brutal">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-vivid-orange" />
          <h3 className="text-lg font-black text-dark-teal">SUGGESTED QUEST</h3>
        </div>
        <div className="flex items-center space-x-1 text-sm text-dark-teal">
          <Award size={16} />
          <span className="font-bold">+{suggestedQuest?.reward_cred} CRED</span>
        </div>
      </div>
      
      <div className="flex items-start space-x-4 mb-4">
        <div className="text-4xl">{suggestedQuest?.emoji}</div>
        <div className="flex-1">
          <h4 className="text-lg font-black text-dark-teal mb-1">{suggestedQuest?.title}</h4>
          <p className="text-dark-teal text-sm font-bold mb-2">{suggestedQuest?.description}</p>
          
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`px-3 py-1 text-xs font-black border-2 border-black ${
              suggestedQuest?.difficulty === 'easy' ? 'bg-green-teal text-white' :
              suggestedQuest?.difficulty === 'medium' ? 'bg-vivid-orange text-white' :
              'bg-dark-teal text-white'
            }`}>
              {suggestedQuest?.difficulty.toUpperCase()}
            </span>
            <span className="px-3 py-1 text-xs font-black border-2 border-black bg-lime-chartreuse text-dark-teal">
              {suggestedQuest?.theme}
            </span>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => suggestedQuest && handleStartQuest(suggestedQuest.id)}
        className="w-full bg-vivid-orange hover:bg-orange-600 text-white px-4 py-3 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 flex items-center justify-center space-x-2"
      >
        <span>START QUEST</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
};

export default QuestProgressWidget;