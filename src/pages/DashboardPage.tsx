import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, Clock, CheckCircle, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import MoodIndicator from '../components/MoodIndicator';
import UserDisplayName from '../components/UserDisplayName';
import { archetypeService } from '../utils/archetypes';
import { conflictService, Conflict } from '../utils/conflicts';
import { MoodLevel } from '../types';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [currentMood, setCurrentMood] = useState<MoodLevel>('meh');
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);

  // Trigger archetype assignment when user loads dashboard
  React.useEffect(() => {
    const assignUserArchetype = async () => {
      if (user?.id) {
        try {
          await archetypeService.assignArchetype(user.id);
        } catch (error) {
          console.error('Error assigning user archetype:', error);
        }
      }
    };

    assignUserArchetype();
  }, [user?.id]);

  // Load user conflicts
  React.useEffect(() => {
    const loadConflicts = async () => {
      if (!user?.id || !user?.email) return;
      
      try {
        const userConflicts = await conflictService.getUserConflicts(user.id, user.email);
        setConflicts(userConflicts);
      } catch (error) {
        console.error('Error loading conflicts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConflicts();
  }, [user?.id, user?.email]);

  const activeConflicts = conflicts.filter(c => c.status === 'pending' || c.status === 'active');
  const resolvedConflicts = conflicts.filter(c => c.status === 'resolved' || c.status === 'final_judgment');

  // Calculate unique connected accounts
  const uniqueConnectedAccounts = React.useMemo(() => {
    const uniqueConnections = new Set<string>();
    
    conflicts.forEach(conflict => {
      if (user?.id === conflict.user1_id) {
        // Current user is user1, so add user2's identifier
        if (conflict.user2_id) {
          uniqueConnections.add(conflict.user2_id);
        } else {
          uniqueConnections.add(conflict.user2_email);
        }
      } else {
        // Current user is user2, so add user1's identifier
        uniqueConnections.add(conflict.user1_id);
      }
    });
    
    return uniqueConnections.size;
  }, [conflicts, user?.id]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return `${Math.floor(diffInDays / 7)} weeks ago`;
  };

  const getOtherUserDisplay = (conflict: Conflict) => {
    if (user?.id === conflict.user1_id) {
      return conflict.user2_email;
    }
    return 'You were invited';
  };

  const getConflictStatus = (conflict: Conflict) => {
    // Check for final ruling phase
    if (conflict.final_ai_ruling) {
      return { label: 'Final AI judgment issued', color: 'bg-purple-100 text-purple-800' };
    }
    
    // Check for core issues phase
    if (conflict.rehash_attempted_at && 
        (conflict.user1_satisfaction === false || conflict.user2_satisfaction === false) &&
        !conflict.core_issues_attempted_at) {
      
      // Check if current user needs to submit core issue
      if ((user?.id === conflict.user1_id && !conflict.user1_core_issue) ||
          (user?.id === conflict.user2_id && !conflict.user2_core_issue)) {
        return { label: 'Your turn: clarify core issue', color: 'bg-orange-100 text-orange-800' };
      }
      
      // Check if waiting for other user's core issue
      if ((user?.id === conflict.user1_id && conflict.user1_core_issue && !conflict.user2_core_issue) ||
          (user?.id === conflict.user2_id && conflict.user2_core_issue && !conflict.user1_core_issue)) {
        return { label: 'Waiting for their core issue', color: 'bg-yellow-100 text-yellow-800' };
      }
    }
    
    // Check for core reflection phase (both core issues submitted, AI has reflected)
    if (conflict.ai_core_reflection && conflict.ai_core_suggestion) {
      // Check if current user needs to vote on core reflection
      if ((user?.id === conflict.user1_id && conflict.user1_satisfaction === null) ||
          (user?.id === conflict.user2_id && conflict.user2_satisfaction === null)) {
        return { label: 'Vote on final reflection', color: 'bg-indigo-100 text-indigo-800' };
      }
      
      // Check if waiting for other user's vote on core reflection
      if ((user?.id === conflict.user1_id && conflict.user1_satisfaction !== null && conflict.user2_satisfaction === null) ||
          (user?.id === conflict.user2_id && conflict.user2_satisfaction !== null && conflict.user1_satisfaction === null)) {
        return { label: 'Waiting for their vote', color: 'bg-yellow-100 text-yellow-800' };
      }
      
      // Both voted but not satisfied - ready for final ruling
      if (conflict.user1_satisfaction === false || conflict.user2_satisfaction === false) {
        return { label: 'Ready for AI final ruling', color: 'bg-red-100 text-red-800' };
      }
    }
    
    // Check for rehash phase (AI has provided rehashed content)
    if (conflict.ai_rehash_summary && conflict.ai_rehash_suggestion) {
      // Check if current user needs to vote on rehash
      if ((user?.id === conflict.user1_id && conflict.user1_satisfaction === null) ||
          (user?.id === conflict.user2_id && conflict.user2_satisfaction === null)) {
        return { label: 'Vote on new approach', color: 'bg-blue-100 text-blue-800' };
      }
      
      // Check if waiting for other user's vote on rehash
      if ((user?.id === conflict.user1_id && conflict.user1_satisfaction !== null && conflict.user2_satisfaction === null) ||
          (user?.id === conflict.user2_id && conflict.user2_satisfaction !== null && conflict.user1_satisfaction === null)) {
        return { label: 'Waiting for their vote', color: 'bg-yellow-100 text-yellow-800' };
      }
    }
    
    // Check for initial AI mediation phase
    if (conflict.ai_summary && conflict.ai_suggestion) {
      // Check if current user needs to vote on initial mediation
      if ((user?.id === conflict.user1_id && conflict.user1_satisfaction === null) ||
          (user?.id === conflict.user2_id && conflict.user2_satisfaction === null)) {
        return { label: 'Vote on AI mediation', color: 'bg-green-100 text-green-800' };
      }
      
      // Check if waiting for other user's vote on initial mediation
      if ((user?.id === conflict.user1_id && conflict.user1_satisfaction !== null && conflict.user2_satisfaction === null) ||
          (user?.id === conflict.user2_id && conflict.user2_satisfaction !== null && conflict.user1_satisfaction === null)) {
        return { label: 'Waiting for their vote', color: 'bg-yellow-100 text-yellow-800' };
      }
    }
    
    // Original status logic for basic states
    if (conflict.status === 'pending') {
      if (user?.id === conflict.user1_id) {
        return { label: 'Waiting for them', color: 'bg-yellow-100 text-yellow-800' };
      } else {
        return { label: 'Your turn to respond', color: 'bg-blue-100 text-blue-800' };
      }
    }
    
    if (conflict.status === 'active') {
      return { label: 'AI processing...', color: 'bg-purple-100 text-purple-800' };
    }
    
    return { label: 'Resolved', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Time to face the music. How's your conflict resolution game today?
        </p>
        
        {/* Mood Selector 
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Mood Check-in:
          </label>
          <MoodIndicator 
            mood={currentMood} 
            interactive 
            onMoodChange={setCurrentMood}
          />
        </div>
      </div>*/}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-coral-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{activeConflicts.length}</p>
              <p className="text-gray-600">Active Conflicts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-teal-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{resolvedConflicts.length}</p>
              <p className="text-gray-600">Squashes Resolved</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-lavender-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{uniqueConnectedAccounts}</p>
              <p className="text-gray-600">People Tolerate You</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'active'
                  ? 'border-coral-500 text-coral-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active Conflicts ({activeConflicts.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-coral-500 text-coral-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Squashes ({resolvedConflicts.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'active' ? (
        <div className="space-y-4">
          {/* New Conflict Button */}
          <button 
            onClick={() => navigate('/new-conflict')}
            className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-coral-400 hover:bg-coral-50 transition-colors group"
          >
            <div className="flex items-center justify-center">
              <Plus className="h-8 w-8 text-gray-400 group-hover:text-coral-500" />
              <div className="ml-4">
                <p className="text-lg font-medium text-gray-900 group-hover:text-coral-600">
                  Start New Conflict Resolution
                </p>
                <p className="text-gray-600">
                  Got beef? Let's squash it. Invite someone to hash it out.
                </p>
              </div>
            </div>
          </button>

          {/* Active Conflicts */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse-slow mb-4">
                <div className="text-4xl">⏳</div>
              </div>
              <p className="text-gray-600">Loading your conflicts...</p>
            </div>
          ) : activeConflicts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">😌</div>
              <p className="text-gray-600">No active conflicts. Living your best drama-free life!</p>
            </div>
          ) : (
            activeConflicts.map((conflict) => {
              const status = getConflictStatus(conflict);
              return (
                <div key={conflict.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{conflict.title}</h3>
                        <MoodIndicator mood={conflict.user1_mood as MoodLevel} size="sm" />
                      </div>
                      <p className="text-gray-600 mb-2">vs. {getOtherUserDisplay(conflict)}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTimeAgo(conflict.created_at)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/conflict/${conflict.id}`)}
                      className="text-coral-500 hover:text-coral-600 font-medium"
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Recent Squashes */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse-slow mb-4">
                <div className="text-4xl">⏳</div>
              </div>
              <p className="text-gray-600">Loading your history...</p>
            </div>
          ) : resolvedConflicts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📚</div>
              <p className="text-gray-600">No resolved conflicts yet. Start squashing some beef!</p>
            </div>
          ) : (
            resolvedConflicts.map((conflict) => (
              <div key={conflict.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{conflict.title}</h3>
                    <p className="text-gray-600 mb-2">vs. {getOtherUserDisplay(conflict)}</p>
                    {conflict.ai_summary && (
                      <p className="text-sm text-gray-700 mb-3 italic">"{conflict.ai_summary}"</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {conflict.resolved_at ? formatTimeAgo(conflict.resolved_at) : formatTimeAgo(conflict.created_at)}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {conflict.status === 'final_judgment' ? '⚖️ Final Judgment' : '✅ Resolved'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/conflict/${conflict.id}`)}
                    className="text-coral-500 hover:text-coral-600 font-medium"
                  >
                    View Details →
                  </button>
                  </div>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;