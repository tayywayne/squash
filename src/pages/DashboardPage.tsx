import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, Clock, CheckCircle, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../utils/profiles';
import { redditConflictsService } from '../utils/redditConflicts';
import MoodIndicator from '../components/MoodIndicator';
import UserDisplayName from '../components/UserDisplayName';
import { archetypeService } from '../utils/archetypes';
import { conflictService, Conflict } from '../utils/conflicts';
import Toast from '../components/Toast';
import { MoodLevel } from '../types';
import { Profile } from '../types';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [currentMood, setCurrentMood] = useState<MoodLevel>('meh');
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [otherUserProfiles, setOtherUserProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

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
        
        // Load profiles for other users in conflicts
        const otherUserIds = new Set<string>();
        userConflicts.forEach(conflict => {
          if (user.id === conflict.user1_id && conflict.user2_id) {
            otherUserIds.add(conflict.user2_id);
          } else if (user.id === conflict.user2_id) {
            otherUserIds.add(conflict.user1_id);
          }
        });
        
        // Fetch profiles for all other users
        const profilePromises = Array.from(otherUserIds).map(async (userId) => {
          try {
            const profile = await profileService.getProfileById(userId);
            return { userId, profile };
          } catch (error) {
            console.error(`Error loading profile for user ${userId}:`, error);
            return { userId, profile: null };
          }
        });
        
        const profileResults = await Promise.all(profilePromises);
        const profilesMap: Record<string, Profile> = {};
        profileResults.forEach(({ userId, profile }) => {
          if (profile) {
            profilesMap[userId] = profile;
          }
        });
        
        setOtherUserProfiles(profilesMap);
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

  const getOtherUserDisplay = (conflict: Conflict): React.ReactNode => {
    if (user?.id === conflict.user1_id) {
      // Current user is user1, show user2's info
      if (conflict.user2_id) {
        const otherProfile = otherUserProfiles[conflict.user2_id];
        if (otherProfile) {
          return (
            <button
              onClick={() => navigate(`/user-profile/${conflict.user2_id}`)}
              className="text-vivid-orange hover:text-orange-600 font-black underline transition-colors"
            >
              <UserDisplayName 
                username={otherProfile.username}
                archetypeEmoji={otherProfile.archetype_emoji}
                supporterEmoji={otherProfile.supporter_emoji}
                fallback={conflict.user2_email}
              />
            </button>
          );
        } else {
          // Profile not loaded yet or user doesn't have a profile
          return (
            <span className="text-dark-teal font-bold">
              {conflict.user2_email}
            </span>
          );
        }
      } else {
        // User2 hasn't joined yet
        return (
          <span className="text-dark-teal font-bold">
            {conflict.user2_email} <span className="text-xs text-gray-500">(invited)</span>
          </span>
        );
      }
    } else {
      // Current user is user2, show user1's info
      const otherProfile = otherUserProfiles[conflict.user1_id];
      if (otherProfile) {
        return (
          <button
            onClick={() => navigate(`/user-profile/${conflict.user1_id}`)}
            className="text-vivid-orange hover:text-orange-600 font-black underline transition-colors"
          >
            <UserDisplayName 
              username={otherProfile.username}
              archetypeEmoji={otherProfile.archetype_emoji}
              supporterEmoji={otherProfile.supporter_emoji}
              fallback="User 1"
            />
          </button>
        );
      } else {
        return (
          <span className="text-dark-teal font-bold">
            You were invited
          </span>
        );
      }
    }
  };

  const getConflictStatus = (conflict: Conflict) => {
    // Check for final ruling phase
    if (conflict.final_ai_ruling) {
      return { label: 'FINAL AI JUDGMENT ISSUED', color: 'bg-dark-teal text-white border-black' };
    }
    
    // Check for core issues phase
    if (conflict.rehash_attempted_at && 
        (conflict.user1_satisfaction === false || conflict.user2_satisfaction === false) &&
        !conflict.core_issues_attempted_at) {
      
      // Check if current user needs to submit core issue
      if ((user?.id === conflict.user1_id && !conflict.user1_core_issue) ||
          (user?.id === conflict.user2_id && !conflict.user2_core_issue)) {
        return { label: 'YOUR TURN: CLARIFY CORE ISSUE', color: 'bg-vivid-orange text-white border-black' };
      }
      
      // Check if waiting for other user's core issue
      if ((user?.id === conflict.user1_id && conflict.user1_core_issue && !conflict.user2_core_issue) ||
          (user?.id === conflict.user2_id && conflict.user2_core_issue && !conflict.user1_core_issue)) {
        return { label: 'WAITING FOR THEIR CORE ISSUE', color: 'bg-lime-chartreuse text-dark-teal border-black' };
      }
    }
    
    // Check for core reflection phase (both core issues submitted, AI has reflected)
    if (conflict.ai_core_reflection && conflict.ai_core_suggestion) {
      // Check if current user needs to vote on core reflection
      if ((user?.id === conflict.user1_id && conflict.user1_satisfaction === null) ||
          (user?.id === conflict.user2_id && conflict.user2_satisfaction === null)) {
        return { label: 'VOTE ON FINAL REFLECTION', color: 'bg-dark-teal text-white border-black' };
      }
      
      // Check if waiting for other user's vote on core reflection
      if ((user?.id === conflict.user1_id && conflict.user1_satisfaction !== null && conflict.user2_satisfaction === null) ||
          (user?.id === conflict.user2_id && conflict.user2_satisfaction !== null && conflict.user1_satisfaction === null)) {
        return { label: 'WAITING FOR THEIR VOTE', color: 'bg-lime-chartreuse text-dark-teal border-black' };
      }
      
      // Both voted but not satisfied - ready for final ruling
      if (conflict.user1_satisfaction === false || conflict.user2_satisfaction === false) {
        return { label: 'READY FOR AI FINAL RULING', color: 'bg-vivid-orange text-white border-black' };
      }
    }
    
    // Check for rehash phase (AI has provided rehashed content)
    if (conflict.ai_rehash_summary && conflict.ai_rehash_suggestion) {
      // Check if current user needs to vote on rehash
      if ((user?.id === conflict.user1_id && conflict.user1_satisfaction === null) ||
          (user?.id === conflict.user2_id && conflict.user2_satisfaction === null)) {
        return { label: 'VOTE ON NEW APPROACH', color: 'bg-green-teal text-white border-black' };
      }
      
      // Check if waiting for other user's vote on rehash
      if ((user?.id === conflict.user1_id && conflict.user1_satisfaction !== null && conflict.user2_satisfaction === null) ||
          (user?.id === conflict.user2_id && conflict.user2_satisfaction !== null && conflict.user1_satisfaction === null)) {
        return { label: 'WAITING FOR THEIR VOTE', color: 'bg-lime-chartreuse text-dark-teal border-black' };
      }
    }
    
    // Check for initial AI mediation phase
    if (conflict.ai_summary && conflict.ai_suggestion) {
      // Check if current user needs to vote on initial mediation
      if ((user?.id === conflict.user1_id && conflict.user1_satisfaction === null) ||
          (user?.id === conflict.user2_id && conflict.user2_satisfaction === null)) {
        return { label: 'VOTE ON AI MEDIATION', color: 'bg-green-teal text-white border-black' };
      }
      
      // Check if waiting for other user's vote on initial mediation
      if ((user?.id === conflict.user1_id && conflict.user1_satisfaction !== null && conflict.user2_satisfaction === null) ||
          (user?.id === conflict.user2_id && conflict.user2_satisfaction !== null && conflict.user1_satisfaction === null)) {
        return { label: 'WAITING FOR THEIR VOTE', color: 'bg-lime-chartreuse text-dark-teal border-black' };
      }
    }
    
    // Original status logic for basic states
    if (conflict.status === 'pending') {
      if (user?.id === conflict.user1_id) {
        return { label: 'WAITING FOR THEM', color: 'bg-lime-chartreuse text-dark-teal border-black' };
      } else {
        return { label: 'YOUR TURN TO RESPOND', color: 'bg-vivid-orange text-white border-black' };
      }
    }
    
    if (conflict.status === 'active') {
      return { label: 'AI PROCESSING...', color: 'bg-dark-teal text-white border-black' };
    }
    
    return { label: 'RESOLVED', color: 'bg-green-teal text-white border-black' };
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
          DASHBOARD
        </h1>
        <p className="text-dark-teal font-bold text-lg">
          Time to face the music. How's your conflict resolution game today?
        </p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-lime-chartreuse p-6 border-3 border-black shadow-brutal">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-dark-teal" />
            <div className="ml-4">
              <p className="text-3xl font-black text-dark-teal">{activeConflicts.length}</p>
              <p className="text-dark-teal font-bold">ACTIVE CONFLICTS</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-teal p-6 border-3 border-black shadow-brutal">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-white" />
            <div className="ml-4">
              <p className="text-3xl font-black text-white">{resolvedConflicts.length}</p>
              <p className="text-white font-bold">SQUASHES RESOLVED</p>
            </div>
          </div>
        </div>
        
        <div className="bg-vivid-orange p-6 border-3 border-black shadow-brutal">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-white" />
            <div className="ml-4">
              <p className="text-3xl font-black text-white">{uniqueConnectedAccounts}</p>
              <p className="text-white font-bold">PEOPLE TOLERATE YOU</p>
            </div>
          </div>
        </div>
      </div>

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
              ACTIVE CONFLICTS ({activeConflicts.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-4 border-3 font-black text-lg transition-colors ${
                activeTab === 'history'
                  ? 'border-black bg-lime-chartreuse text-dark-teal -mb-[3px]'
                  : 'border-transparent text-dark-teal hover:text-vivid-orange'
              }`}
            >
              MY SQUASHES ({resolvedConflicts.length})
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
            className="w-full p-6 border-3 border-black bg-vivid-orange hover:bg-orange-600 text-white shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1"
          >
            <div className="flex items-center justify-center">
              <Plus className="h-8 w-8 text-white" />
              <div className="ml-4 text-left">
                <p className="text-xl font-black">
                  START NEW CONFLICT RESOLUTION
                </p>
                <p className="text-white">
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
              <p className="text-dark-teal font-bold">Loading your conflicts...</p>
            </div>
          ) : activeConflicts.length === 0 ? (
            <div className="text-center py-8 border-3 border-black p-6">
              <div className="text-4xl mb-4">😌</div>
              <p className="text-dark-teal font-bold">No active conflicts. Living your best drama-free life!</p>
            </div>
          ) : (
            activeConflicts.map((conflict) => {
              const status = getConflictStatus(conflict);
              return (
                <div key={conflict.id} className="bg-white p-6 border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-black text-dark-teal">{conflict.title}</h3>
                        <MoodIndicator mood={conflict.user1_mood as MoodLevel} size="sm" />
                      </div>
                      <div className="text-dark-teal mb-2 flex items-center space-x-1 font-bold">
                        <span>vs.</span>
                        <div>{getOtherUserDisplay(conflict)}</div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-dark-teal">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTimeAgo(conflict.created_at)}
                        </span>
                        <span className={`px-3 py-1 text-xs font-black border-2 ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/conflict/${conflict.id}`)}
                      className="text-vivid-orange hover:text-orange-600 font-black"
                    >
                      CONTINUE →
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
              <p className="text-dark-teal font-bold">Loading your history...</p>
            </div>
          ) : resolvedConflicts.length === 0 ? (
            <div className="text-center py-8 border-3 border-black p-6">
              <div className="text-4xl mb-4">📚</div>
              <p className="text-dark-teal font-bold">No resolved conflicts yet. Start squashing some beef!</p>
            </div>
          ) : (
            resolvedConflicts.map((conflict) => (
              <div key={conflict.id} className="bg-white p-6 border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-dark-teal mb-2">{conflict.title}</h3>
                    <div className="text-dark-teal mb-2 flex items-center space-x-1 font-bold">
                      <span>vs.</span>
                      <div>{getOtherUserDisplay(conflict)}</div>
                    </div>
                    {conflict.ai_summary && (
                      <p className="text-sm text-dark-teal mb-3 italic border-l-3 border-lime-chartreuse pl-3">"{conflict.ai_summary}"</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-dark-teal">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {conflict.resolved_at ? formatTimeAgo(conflict.resolved_at) : formatTimeAgo(conflict.created_at)}
                      </span>
                      <span className="px-3 py-1 text-xs font-black border-2 bg-green-teal text-white border-black">
                        {conflict.status === 'final_judgment' ? '⚖️ FINAL JUDGMENT' : '✅ RESOLVED'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/conflict/${conflict.id}`)}
                    className="text-vivid-orange hover:text-orange-600 font-black"
                  >
                    VIEW DETAILS →
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