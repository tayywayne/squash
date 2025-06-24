import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, Clock, CheckCircle, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../utils/profiles';
import MoodIndicator from '../components/MoodIndicator';
import UserDisplayName from '../components/UserDisplayName';
import { archetypeService } from '../utils/archetypes';
import { conflictService, Conflict } from '../utils/conflicts';
import { MoodLevel } from '../types';
import { Profile } from '../types';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [otherUserProfiles, setOtherUserProfiles] = useState<Record<string, Profile>>({});
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
        if (conflict.user2_id) {
          uniqueConnections.add(conflict.user2_id);
        } else {
          uniqueConnections.add(conflict.user2_email);
        }
      } else {
        uniqueConnections.add(conflict.user1_id);
      }
    });
    
    return uniqueConnections.size;
  }, [conflicts, user?.id]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'JUST NOW';
    if (diffInHours < 24) return `${diffInHours} HOURS AGO`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} DAYS AGO`;
    return `${Math.floor(diffInDays / 7)} WEEKS AGO`;
  };

  const getOtherUserDisplay = (conflict: Conflict): React.ReactNode => {
    if (user?.id === conflict.user1_id) {
      if (conflict.user2_id) {
        const otherProfile = otherUserProfiles[conflict.user2_id];
        if (otherProfile) {
          return (
            <button
              onClick={() => navigate(`/user-profile/${conflict.user2_id}`)}
              className="text-primary-teal hover:text-primary-orange font-bold uppercase transition-colors border-b-2 border-primary-teal hover:border-primary-orange"
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
          return (
            <span className="text-text-secondary font-bold uppercase">
              {conflict.user2_email}
            </span>
          );
        }
      } else {
        return (
          <span className="text-text-secondary font-bold uppercase">
            {conflict.user2_email} <span className="text-xs">(INVITED)</span>
          </span>
        );
      }
    } else {
      const otherProfile = otherUserProfiles[conflict.user1_id];
      if (otherProfile) {
        return (
          <button
            onClick={() => navigate(`/user-profile/${conflict.user1_id}`)}
            className="text-primary-teal hover:text-primary-orange font-bold uppercase transition-colors border-b-2 border-primary-teal hover:border-primary-orange"
          >
            <UserDisplayName 
              username={otherProfile.username}
              archetypeEmoji={otherProfile.archetype_emoji}
              supporterEmoji={otherProfile.supporter_emoji}
              fallback="USER 1"
            />
          </button>
        );
      } else {
        return (
          <span className="text-text-secondary font-bold uppercase">
            YOU WERE INVITED
          </span>
        );
      }
    }
  };

  const getConflictStatus = (conflict: Conflict) => {
    if (conflict.final_ai_ruling) {
      return { label: 'FINAL AI JUDGMENT ISSUED', color: 'bg-text-primary text-background-white' };
    }
    
    if (conflict.rehash_attempted_at && 
        (conflict.user1_satisfaction === false || conflict.user2_satisfaction === false) &&
        !conflict.core_issues_attempted_at) {
      
      if ((user?.id === conflict.user1_id && !conflict.user1_core_issue) ||
          (user?.id === conflict.user2_id && !conflict.user2_core_issue)) {
        return { label: 'YOUR TURN: CLARIFY CORE ISSUE', color: 'bg-primary-orange text-background-white' };
      }
      
      if ((user?.id === conflict.user1_id && conflict.user1_core_issue && !conflict.user2_core_issue) ||
          (user?.id === conflict.user2_id && conflict.user2_core_issue && !conflict.user1_core_issue)) {
        return { label: 'WAITING FOR THEIR CORE ISSUE', color: 'bg-text-secondary text-background-white' };
      }
    }
    
    if (conflict.ai_core_reflection && conflict.ai_core_suggestion) {
      if ((user?.id === conflict.user1_id && conflict.user1_satisfaction === null) ||
          (user?.id === conflict.user2_id && conflict.user2_satisfaction === null)) {
        return { label: 'VOTE ON FINAL REFLECTION', color: 'bg-primary-teal text-background-white' };
      }
      
      if ((user?.id === conflict.user1_id && conflict.user1_satisfaction !== null && conflict.user2_satisfaction === null) ||
          (user?.id === conflict.user2_id && conflict.user2_satisfaction !== null && conflict.user1_satisfaction === null)) {
        return { label: 'WAITING FOR THEIR VOTE', color: 'bg-text-secondary text-background-white' };
      }
      
      if (conflict.user1_satisfaction === false || conflict.user2_satisfaction === false) {
        return { label: 'READY FOR AI FINAL RULING', color: 'bg-primary-orange text-background-white' };
      }
    }
    
    if (conflict.ai_rehash_summary && conflict.ai_rehash_suggestion) {
      if ((user?.id === conflict.user1_id && conflict.user1_satisfaction === null) ||
          (user?.id === conflict.user2_id && conflict.user2_satisfaction === null)) {
        return { label: 'VOTE ON NEW APPROACH', color: 'bg-primary-teal text-background-white' };
      }
      
      if ((user?.id === conflict.user1_id && conflict.user1_satisfaction !== null && conflict.user2_satisfaction === null) ||
          (user?.id === conflict.user2_id && conflict.user2_satisfaction !== null && conflict.user1_satisfaction === null)) {
        return { label: 'WAITING FOR THEIR VOTE', color: 'bg-text-secondary text-background-white' };
      }
    }
    
    if (conflict.ai_summary && conflict.ai_suggestion) {
      if ((user?.id === conflict.user1_id && conflict.user1_satisfaction === null) ||
          (user?.id === conflict.user2_id && conflict.user2_satisfaction === null)) {
        return { label: 'VOTE ON AI MEDIATION', color: 'bg-primary-teal text-background-white' };
      }
      
      if ((user?.id === conflict.user1_id && conflict.user1_satisfaction !== null && conflict.user2_satisfaction === null) ||
          (user?.id === conflict.user2_id && conflict.user2_satisfaction !== null && conflict.user1_satisfaction === null)) {
        return { label: 'WAITING FOR THEIR VOTE', color: 'bg-text-secondary text-background-white' };
      }
    }
    
    if (conflict.status === 'pending') {
      if (user?.id === conflict.user1_id) {
        return { label: 'WAITING FOR THEM', color: 'bg-text-secondary text-background-white' };
      } else {
        return { label: 'YOUR TURN TO RESPOND', color: 'bg-primary-orange text-background-white' };
      }
    }
    
    if (conflict.status === 'active') {
      return { label: 'AI PROCESSING...', color: 'bg-primary-teal text-background-white' };
    }
    
    return { label: 'RESOLVED', color: 'bg-text-secondary text-background-white' };
  };

  return (
    <div className="max-w-6xl mx-auto p-brutal">
      {/* Header */}
      <div className="mb-brutal">
        <h1 className="text-5xl font-black text-text-primary mb-4 uppercase">
          DASHBOARD
        </h1>
        <p className="text-xl text-text-secondary font-medium">
          Time to face the music. How's your conflict resolution game today?
        </p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-brutal">
        <div className="bg-background-white border-brutal border-border-black p-6">
          <div className="flex items-center">
            <div className="bg-primary-teal text-background-white p-4 border-brutal border-border-black mr-6">
              <MessageSquare className="h-8 w-8" />
            </div>
            <div>
              <p className="text-4xl font-black text-text-primary">{activeConflicts.length}</p>
              <p className="text-text-secondary font-bold uppercase text-sm">ACTIVE CONFLICTS</p>
            </div>
          </div>
        </div>
        
        <div className="bg-background-white border-brutal border-border-black p-6">
          <div className="flex items-center">
            <div className="bg-primary-orange text-background-white p-4 border-brutal border-border-black mr-6">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div>
              <p className="text-4xl font-black text-text-primary">{resolvedConflicts.length}</p>
              <p className="text-text-secondary font-bold uppercase text-sm">SQUASHES RESOLVED</p>
            </div>
          </div>
        </div>
        
        <div className="bg-background-white border-brutal border-border-black p-6">
          <div className="flex items-center">
            <div className="bg-text-primary text-background-white p-4 border-brutal border-border-black mr-6">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <p className="text-4xl font-black text-text-primary">{uniqueConnectedAccounts}</p>
              <p className="text-text-secondary font-bold uppercase text-sm">PEOPLE TOLERATE YOU</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b-brutal border-border-black">
          <nav className="flex space-x-0">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-4 px-6 font-black text-sm uppercase transition-all border-brutal ${
                activeTab === 'active'
                  ? 'bg-primary-teal text-background-white border-border-black'
                  : 'bg-background-white text-text-secondary hover:text-text-primary border-transparent hover:border-border-black'
              }`}
            >
              ACTIVE CONFLICTS ({activeConflicts.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-6 font-black text-sm uppercase transition-all border-brutal ${
                activeTab === 'history'
                  ? 'bg-primary-teal text-background-white border-border-black'
                  : 'bg-background-white text-text-secondary hover:text-text-primary border-transparent hover:border-border-black'
              }`}
            >
              MY SQUASHES ({resolvedConflicts.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'active' ? (
        <div className="space-y-6">
          {/* New Conflict Button */}
          <button 
            onClick={() => navigate('/new-conflict')}
            className="w-full p-8 border-brutal border-border-black bg-background-white hover:bg-primary-orange hover:text-background-white transition-colors group"
          >
            <div className="flex items-center justify-center">
              <div className="bg-text-primary group-hover:bg-background-white text-background-white group-hover:text-text-primary p-4 border-brutal border-border-black mr-6 transition-colors">
                <Plus className="h-8 w-8" />
              </div>
              <div>
                <p className="text-2xl font-black uppercase mb-2">
                  START NEW CONFLICT RESOLUTION
                </p>
                <p className="text-text-secondary group-hover:text-background-white font-medium">
                  Got beef? Let's squash it. Invite someone to hash it out.
                </p>
              </div>
            </div>
          </button>

          {/* Active Conflicts */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-text-secondary font-bold uppercase">LOADING YOUR CONFLICTS...</p>
            </div>
          ) : activeConflicts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😌</div>
              <p className="text-text-secondary font-bold uppercase">NO ACTIVE CONFLICTS. LIVING YOUR BEST DRAMA-FREE LIFE!</p>
            </div>
          ) : (
            activeConflicts.map((conflict) => {
              const status = getConflictStatus(conflict);
              return (
                <div key={conflict.id} className="bg-background-white border-brutal border-border-black p-6 hover:bg-background-light transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className="text-xl font-black text-text-primary uppercase">{conflict.title}</h3>
                        <MoodIndicator mood={conflict.user1_mood as MoodLevel} size="sm" />
                      </div>
                      <div className="text-text-secondary mb-3 flex items-center space-x-2 font-bold uppercase text-sm">
                        <span>VS.</span>
                        <div>{getOtherUserDisplay(conflict)}</div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <span className="flex items-center text-text-secondary font-medium">
                          <Clock className="h-4 w-4 mr-2" />
                          {formatTimeAgo(conflict.created_at)}
                        </span>
                        <span className={`px-3 py-1 text-xs font-black uppercase border-brutal border-border-black ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/conflict/${conflict.id}`)}
                      className="bg-primary-teal text-background-white hover:bg-primary-orange px-6 py-3 font-black uppercase text-sm border-brutal border-border-black transition-colors"
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
        <div className="space-y-6">
          {/* Recent Squashes */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-text-secondary font-bold uppercase">LOADING YOUR HISTORY...</p>
            </div>
          ) : resolvedConflicts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-text-secondary font-bold uppercase">NO RESOLVED CONFLICTS YET. START SQUASHING SOME BEEF!</p>
            </div>
          ) : (
            resolvedConflicts.map((conflict) => (
              <div key={conflict.id} className="bg-background-white border-brutal border-border-black p-6 hover:bg-background-light transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-text-primary uppercase mb-3">{conflict.title}</h3>
                    <div className="text-text-secondary mb-3 flex items-center space-x-2 font-bold uppercase text-sm">
                      <span>VS.</span>
                      <div>{getOtherUserDisplay(conflict)}</div>
                    </div>
                    {conflict.ai_summary && (
                      <p className="text-sm text-text-secondary font-medium mb-4 italic">"{conflict.ai_summary}"</p>
                    )}
                    <div className="flex items-center space-x-6 text-sm">
                      <span className="flex items-center text-text-secondary font-medium">
                        <Clock className="h-4 w-4 mr-2" />
                        {conflict.resolved_at ? formatTimeAgo(conflict.resolved_at) : formatTimeAgo(conflict.created_at)}
                      </span>
                      <span className={`px-3 py-1 text-xs font-black uppercase border-brutal border-border-black ${
                        conflict.status === 'final_judgment' 
                          ? 'bg-text-primary text-background-white' 
                          : 'bg-primary-teal text-background-white'
                      }`}>
                        {conflict.status === 'final_judgment' ? '⚖️ FINAL JUDGMENT' : '✅ RESOLVED'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/conflict/${conflict.id}`)}
                    className="bg-primary-teal text-background-white hover:bg-primary-orange px-6 py-3 font-black uppercase text-sm border-brutal border-border-black transition-colors"
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