import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, MessageSquare, CheckCircle } from 'lucide-react';
import { profileService } from '../utils/profiles';
import { conflictService, Conflict } from '../utils/conflicts';
import { useAuth } from '../hooks/useAuth';
import UserDisplayName from '../components/UserDisplayName';
import SupporterCard from '../components/SupporterCard';
import ArchetypeAchievements from '../components/ArchetypeAchievements';
import GeneralAchievements from '../components/GeneralAchievements';
import SquashCredDisplay from '../components/SquashCredDisplay';
import { archetypeService } from '../utils/archetypes';
import { Profile } from '../types';
import Toast from '../components/Toast';

const OtherUserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sharedConflicts, setSharedConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [conflictsLoading, setConflictsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Get archetype info
  const archetypeInfo = profile?.conflict_archetype ? archetypeService.getArchetypeInfo(profile.conflict_archetype) : null;

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setToast({ message: 'Invalid user ID', type: 'error' });
        navigate('/dashboard');
        return;
      }

      // Prevent users from viewing their own profile through this page
      if (userId === currentUser?.id) {
        navigate('/profile');
        return;
      }

      try {
        const profileData = await profileService.getProfileById(userId);
        if (!profileData) {
          setToast({ message: 'User profile not found', type: 'error' });
          navigate('/dashboard');
          return;
        }
        setProfile(profileData);
      } catch (error) {
        console.error('Error loading profile:', error);
        setToast({ message: 'Failed to load user profile', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, currentUser?.id, navigate]);

  useEffect(() => {
    const loadSharedConflicts = async () => {
      if (!userId || !currentUser?.id || !currentUser?.email) return;

      try {
        // Get all conflicts for current user
        const userConflicts = await conflictService.getUserConflicts(currentUser.id, currentUser.email);
        
        // Filter conflicts that involve the other user
        const shared = userConflicts.filter(conflict => 
          conflict.user1_id === userId || conflict.user2_id === userId
        );
        
        setSharedConflicts(shared);
      } catch (error) {
        console.error('Error loading shared conflicts:', error);
      } finally {
        setConflictsLoading(false);
      }
    };

    loadSharedConflicts();
  }, [userId, currentUser?.id, currentUser?.email]);

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

  const resolvedConflicts = sharedConflicts.filter(c => c.status === 'resolved');
  const finalJudgmentConflicts = sharedConflicts.filter(c => c.status === 'final_judgment');
  const totalClosedConflicts = resolvedConflicts.length + finalJudgmentConflicts.length;
  const activeConflicts = sharedConflicts.filter(c => c.status === 'pending' || c.status === 'active');

  // Get supporter background gradient
  const getSupporterBackgroundGradient = () => {
    if (!profile?.supporter_level) return '';
    
    const gradients = {
      tip_1: 'bg-green-teal',
      tip_2: 'bg-vivid-orange', 
      tip_3: 'bg-lime-chartreuse'
    };
    
    return gradients[profile.supporter_level as keyof typeof gradients] || '';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-pulse-slow mb-4">
          <div className="text-6xl">👤</div>
        </div>
        <p className="text-gray-600">Loading user profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="text-6xl mb-4">🤷</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
        <p className="text-gray-600">This user profile doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getSupporterBackgroundGradient()}`}>
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
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      {/* Profile Info */}
      <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 border-3 border-black shadow-brutal mb-6 overflow-hidden">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${profile.username}'s avatar`}
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover border-3 border-black"
              />
            ) : (
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-lime-chartreuse rounded-full flex items-center justify-center">
                <User size={32} className="text-dark-teal sm:w-12 sm:h-12" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-black text-dark-teal mb-2 break-words">
              <UserDisplayName 
                username={profile.username}
                archetypeEmoji={profile.archetype_emoji}
                supporterEmoji={profile.supporter_emoji}
                supporterEmoji={profile.supporter_emoji}
                supporterEmoji={profile.supporter_emoji}
                fallback="Anonymous User"
              />
            </h1>
            {profile.username && (
              <p className="text-dark-teal mb-2 text-sm sm:text-base break-all font-bold">@{profile.username}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-dark-teal">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Joined {formatTimeAgo(profile.created_at)}</span>
                <span className="sm:hidden">{formatTimeAgo(profile.created_at)}</span>
              </span>
              {userId && (
                <div className="overflow-hidden">
                  <SquashCredDisplay 
                    userId={userId} 
                    showTier={true}
                    showTooltip={false}
                    size="sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Supporter Status Display */}
      {profile.supporter_level && profile.supporter_emoji && profile.supporter_since && (
        <SupporterCard
          supporterLevel={profile.supporter_level as 'tip_1' | 'tip_2' | 'tip_3'}
          supporterEmoji={profile.supporter_emoji}
          supporterSince={profile.supporter_since}
          className="mb-6"
        />
      )}

      {/* Conflict Archetype Display */}
      {archetypeInfo && (
        <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 border-3 border-black shadow-brutal mb-6 overflow-hidden">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">{archetypeInfo.emoji}</span>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-black text-dark-teal break-words">{archetypeInfo.title}</h3>
              <p className="text-sm text-dark-teal break-words leading-relaxed font-bold">{archetypeInfo.description}</p>
            </div>
          </div>
          {profile.archetype_assigned_at && (
            <p className="text-xs text-dark-teal mt-2 font-bold">
              Assigned: {new Date(profile.archetype_assigned_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
        </div>
      )}

      {/* Archetype Achievements */}
      <ArchetypeAchievements userId={userId} className="mb-6" />

      {/* General Achievements */}
      <GeneralAchievements userId={userId} className="mb-6" />

      {/* Shared Conflict History */}
      <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 border-3 border-black shadow-brutal overflow-hidden">
        <h2 className="text-xl font-black text-dark-teal mb-4">
          Your Conflict History Together
        </h2>
        
        {conflictsLoading ? (
          <div className="text-center py-8">
            <div className="animate-pulse-slow mb-4">
              <div className="text-4xl">⏳</div>
            </div>
            <p className="text-dark-teal font-bold">Loading shared conflicts...</p>
          </div>
        ) : sharedConflicts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🤝</div>
            <p className="text-dark-teal font-bold">No shared conflicts yet. Hopefully it stays that way!</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-white border-3 border-black shadow-brutal">
                <div className="text-xl sm:text-2xl font-black text-vivid-orange">{sharedConflicts.length}</div>
                <div className="text-sm text-dark-teal font-bold">Total Conflicts</div>
              </div>
              <div className="text-center p-4 bg-white border-3 border-black shadow-brutal">
                <div className="text-xl sm:text-2xl font-black text-green-teal">{totalClosedConflicts}</div>
                <div className="text-sm text-dark-teal font-bold">Closed Together</div>
              </div>
              <div className="text-center p-4 bg-white border-3 border-black shadow-brutal">
                <div className="text-xl sm:text-2xl font-black text-lime-chartreuse">
                  {sharedConflicts.length > 0 ? Math.round((totalClosedConflicts / sharedConflicts.length) * 100) : 0}%
                </div>
                <div className="text-sm text-dark-teal font-bold">Resolution Rate</div>
              </div>
            </div>

            {/* Active Conflicts */}
            {activeConflicts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-black text-dark-teal mb-3">Active Conflicts</h3>
                <div className="space-y-3">
                  {activeConflicts.map((conflict) => (
                    <div key={conflict.id} className="p-4 bg-lime-chartreuse border-3 border-black overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1 pr-4">
                          <h4 className="font-black text-dark-teal break-words">{conflict.title}</h4>
                          <p className="text-sm text-dark-teal font-bold">
                            Status: {conflict.status} • {formatTimeAgo(conflict.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/conflict/${conflict.id}`)}
                          className="text-vivid-orange hover:text-orange-600 font-black text-sm flex-shrink-0"
                        >
                          View →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolved Conflicts */}
            {totalClosedConflicts > 0 && (
              <div>
                <h3 className="text-lg font-black text-dark-teal mb-3">Closed Conflicts</h3>
                <div className="space-y-3">
                  {[...resolvedConflicts, ...finalJudgmentConflicts].slice(0, 5).map((conflict) => (
                    <div key={conflict.id} className="p-4 bg-green-teal border-3 border-black overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1 pr-4">
                          <h4 className="font-black text-white break-words">{conflict.title}</h4>
                          <p className="text-sm text-white font-bold">
                            {conflict.status === 'final_judgment' ? '⚖️' : <CheckCircle className="inline h-4 w-4 mr-1" />}
                            {conflict.status === 'final_judgment' ? 'Final judgment' : 'Resolved'} {conflict.resolved_at ? formatTimeAgo(conflict.resolved_at) : formatTimeAgo(conflict.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/conflict/${conflict.id}`)}
                          className="text-lime-chartreuse hover:text-green-300 font-black text-sm flex-shrink-0"
                        >
                          View →
                        </button>
                      </div>
                    </div>
                  ))}
                  {totalClosedConflicts > 5 && (
                    <p className="text-sm text-dark-teal text-center font-bold">
                      And {totalClosedConflicts - 5} more closed conflicts...
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>



      {/* Conflict Resolution Philosophy */}
      <div className="mt-6 bg-white/70 backdrop-blur-sm p-4 sm:p-6 border-3 border-black shadow-brutal overflow-hidden">
        <h3 className="text-lg font-black text-dark-teal mb-3">
          <UserDisplayName 
            username={profile.username}
            archetypeEmoji={profile.archetype_emoji}
            fallback="This user"
            showEmoji={false}
          />'s Conflict Resolution Journey
        </h3>
        <div className="text-sm text-dark-teal leading-relaxed font-bold">
          {sharedConflicts.length > 0 ? (
            <p>
              You and <UserDisplayName 
                username={profile.username}
                archetypeEmoji={profile.archetype_emoji}
                fallback="this user"
                showEmoji={false}
              /> have worked through {sharedConflicts.length} conflict{sharedConflicts.length !== 1 ? 's' : ''} together, 
              with a {sharedConflicts.length > 0 ? Math.round((resolvedConflicts.length / sharedConflicts.length) * 100) : 0}% resolution rate. 
              {resolvedConflicts.length > 0 && ' That shows real commitment to understanding each other!'}
            </p>
          ) : (
            <p>
              This is your first time working through a conflict with <UserDisplayName 
                username={profile.username}
                archetypeEmoji={profile.archetype_emoji}
                fallback="this user"
                showEmoji={false}
              />. 
              Remember: the goal is understanding, not winning.
            </p>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default OtherUserProfilePage;