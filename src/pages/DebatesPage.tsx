import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, Clock, CheckCircle, Users, Crown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { debatesService } from '../utils/debates';
import { Debate, DebateInvite, CompletedDebate } from '../types/debate';
import DebateCard from '../components/DebateCard';
import DebateInviteCard from '../components/DebateInviteCard';
import Toast from '../components/Toast';

const DebatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'invites' | 'completed'>('active');
  const [activeDebates, setActiveDebates] = useState<Debate[]>([]);
  const [pendingInvites, setPendingInvites] = useState<DebateInvite[]>([]);
  const [completedDebates, setCompletedDebates] = useState<CompletedDebate[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load debates data
  useEffect(() => {
    const loadDebates = async () => {
      setLoading(true);
      try {
        // Load active debates
        const active = await debatesService.getActiveDebates();
        setActiveDebates(active);
        
        // Load pending invites
        const invites = await debatesService.getPendingDebateInvites();
        setPendingInvites(invites);
        
        // Load completed debates
        const completed = await debatesService.getCompletedDebates();
        setCompletedDebates(completed);
      } catch (error) {
        console.error('Error loading debates:', error);
        setToast({ message: 'Failed to load debates', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    loadDebates();
  }, []);
  
  // Refresh active debates after voting
  const handleVoteCast = async () => {
    try {
      const active = await debatesService.getActiveDebates();
      setActiveDebates(active);
    } catch (error) {
      console.error('Error refreshing debates after vote:', error);
    }
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
          PUBLIC DEBATES
        </h1>
        <p className="text-dark-teal font-bold text-lg">
          Challenge others to friendly debates and let the community decide who makes the better case!
        </p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-lime-chartreuse p-6 border-3 border-black shadow-brutal">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-dark-teal" />
            <div className="ml-4">
              <p className="text-3xl font-black text-dark-teal">{activeDebates.length}</p>
              <p className="text-dark-teal font-bold">ACTIVE DEBATES</p>
            </div>
          </div>
        </div>
        
        <div className="bg-vivid-orange p-6 border-3 border-black shadow-brutal">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-white" />
            <div className="ml-4">
              <p className="text-3xl font-black text-white">{pendingInvites.length}</p>
              <p className="text-white font-bold">DEBATE INVITES</p>
            </div>
          </div>
        </div>
        
        <div className="bg-dark-teal p-6 border-3 border-black shadow-brutal">
          <div className="flex items-center">
            <Crown className="h-8 w-8 text-lime-chartreuse" />
            <div className="ml-4">
              <p className="text-3xl font-black text-lime-chartreuse">{completedDebates.length}</p>
              <p className="text-lime-chartreuse font-bold">COMPLETED DEBATES</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Debate Button */}
      <button 
        onClick={() => navigate('/new-debate')}
        className="w-full p-6 border-3 border-black bg-vivid-orange hover:bg-orange-600 text-white shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 mb-8"
      >
        <div className="flex items-center justify-center">
          <Plus className="h-8 w-8 text-white" />
          <div className="ml-4 text-left">
            <p className="text-xl font-black">
              START A NEW DEBATE
            </p>
            <p className="text-white">
              Challenge someone to a friendly debate on any topic.
            </p>
          </div>
        </div>
      </button>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b-3 border-black">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-2 px-4 border-3 font-black text-lg transition-colors ${
                activeTab === 'active'
                  ? 'border-black bg-lime-chartreuse text-dark-teal -mb-[3px]'
                  : 'border-transparent text-dark-teal hover:text-vivid-orange'
              }`}
            >
              ACTIVE DEBATES ({activeDebates.length})
            </button>
            <button
              onClick={() => setActiveTab('invites')}
              className={`py-2 px-4 border-3 font-black text-lg transition-colors ${
                activeTab === 'invites'
                  ? 'border-black bg-lime-chartreuse text-dark-teal -mb-[3px]'
                  : 'border-transparent text-dark-teal hover:text-vivid-orange'
              }`}
            >
              INVITES ({pendingInvites.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-2 px-4 border-3 font-black text-lg transition-colors ${
                activeTab === 'completed'
                  ? 'border-black bg-lime-chartreuse text-dark-teal -mb-[3px]'
                  : 'border-transparent text-dark-teal hover:text-vivid-orange'
              }`}
            >
              COMPLETED ({completedDebates.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-pulse-slow mb-4">
            <div className="text-4xl">⏳</div>
          </div>
          <p className="text-dark-teal font-bold">Loading debates...</p>
        </div>
      ) : (
        <div>
          {/* Active Debates */}
          {activeTab === 'active' && (
            <div>
              {activeDebates.length === 0 ? (
                <div className="text-center py-8 border-3 border-black p-6">
                  <div className="text-4xl mb-4">🎭</div>
                  <p className="text-dark-teal font-bold">No active debates yet. Start one or respond to an invite!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeDebates.map(debate => (
                    <DebateCard 
                      key={debate.id} 
                      debate={debate} 
                      onVoteCast={handleVoteCast}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Debate Invites */}
          {activeTab === 'invites' && (
            <div>
              {pendingInvites.length === 0 ? (
                <div className="text-center py-8 border-3 border-black p-6">
                  <div className="text-4xl mb-4">📭</div>
                  <p className="text-dark-teal font-bold">No pending debate invites. Check back later!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingInvites.map(invite => (
                    <DebateInviteCard key={invite.id} invite={invite} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Completed Debates */}
          {activeTab === 'completed' && (
            <div>
              {completedDebates.length === 0 ? (
                <div className="text-center py-8 border-3 border-black p-6">
                  <div className="text-4xl mb-4">🏆</div>
                  <p className="text-dark-teal font-bold">No completed debates yet. Check back after active debates finish!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {completedDebates.map(debate => (
                    <DebateCard 
                      key={debate.id} 
                      debate={debate} 
                      showVotes={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebatesPage;