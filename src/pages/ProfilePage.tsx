import React, { useState } from 'react';
import { User, Bell, Trash2, Download, Shield, Edit3, Save, X, Camera, Upload, AlertCircle, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { conflictService, Conflict } from '../utils/conflicts';
import { storageService } from '../utils/storage';
import { archetypeService, ARCHETYPES } from '../utils/archetypes';
import { generalAchievementsService } from '../utils/generalAchievements';
import SupporterCard from '../components/SupporterCard';
import ArchetypeAchievements from '../components/ArchetypeAchievements';
import GeneralAchievements from '../components/GeneralAchievements';
import SquashCredDisplay from '../components/SquashCredDisplay';
import SquashCredHistory from '../components/SquashCredHistory';
import Toast from '../components/Toast';

const ProfilePage: React.FC = () => {
  const { user, signOut, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const editingDisabled = false; // Re-enable editing
  const [editForm, setEditForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    avatar_url: user?.avatar_url || '',
  });
  const [loading, setLoading] = useState(false);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    conflictUpdates: true,
    followUps: true,
    weeklyDigest: false,
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Get archetype info
  const archetypeInfo = user?.conflict_archetype ? archetypeService.getArchetypeInfo(user.conflict_archetype) : null;

  // Initialize edit form when entering edit mode
  React.useEffect(() => {
    if (isEditing && user) {
      setEditForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [isEditing, user]);

  // Load user conflicts for statistics
  React.useEffect(() => {
    const loadConflictStats = async () => {
      if (!user?.id || !user?.email) return;
      
      setStatsLoading(true);
      try {
        const userConflicts = await conflictService.getUserConflicts(user.id, user.email);
        setConflicts(userConflicts);
      } catch (error) {
        console.error('Error loading conflict stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    loadConflictStats();
  }, [user?.id, user?.email]);

  // Calculate statistics
  const totalConflictsCount = conflicts.length;
  const resolvedConflictsCount = conflicts.filter(c => c.status === 'resolved').length;
  const resolutionRate = totalConflictsCount > 0 ? Math.round((resolvedConflictsCount / totalConflictsCount) * 100) : 0;

  // Get supporter background gradient
  const getSupporterBackgroundGradient = () => {
    if (!user?.supporter_level) return '';
    
    const gradients = {
      tip_1: 'bg-green-teal',
      tip_2: 'bg-vivid-orange', 
      tip_3: 'bg-lime-chartreuse'
    };
    
    return gradients[user.supporter_level as keyof typeof gradients] || '';
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form to current user data
      setEditForm({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        avatar_url: user?.avatar_url || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile({
        first_name: editForm.first_name.trim() || undefined,
        last_name: editForm.last_name.trim() || undefined,
        avatar_url: editForm.avatar_url.trim() || undefined,
      });

      if (error) {
        setToast({ message: 'Failed to update profile. Try again?', type: 'error' });
      } else {
        setToast({ message: 'Profile updated successfully!', type: 'success' });
        setIsEditing(false);
        
        // Check for profile update achievements
        if (user?.id) {
          try {
            // Get profile update count
            const { data: updates } = await supabase
              .from('profile_updates')
              .select('update_type')
              .eq('user_id', user.id);
            
            const profileUpdateCount = updates?.length || 0;
            const hasChangedUsername = updates?.some(u => u.update_type === 'username') || false;
            const hasCustomAvatar = editForm.avatar_url.trim() !== '' || user.avatar_url !== '';
            
            await generalAchievementsService.checkAndUnlockAchievements(user.id, {
              profileUpdateCount,
              hasChangedUsername,
              hasCustomAvatar
            });
          } catch (error) {
            console.error('Error checking profile update achievements:', error);
          }
        }
        
      }
    } catch (error) {
      setToast({ message: 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setToast({ message: 'Notification preferences updated!', type: 'success' });
  };

  const handleExportData = () => {
    setToast({ message: 'Data export initiated. Check your email in a few minutes.', type: 'info' });
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure? This will delete all your conflicts, resolutions, and make you start fresh. No take-backs.')) {
      setToast({ message: 'Account deletion initiated. It\'s been real. ✌️', type: 'info' });
      setTimeout(() => signOut(), 2000);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">
            Manage your account, notifications, and conflict resolution preferences.
          </p>
        </div>

        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 border-3 border-black shadow-brutal">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                <div className="relative">
                  {(isEditing && editForm.avatar_url) || user?.avatar_url ? (
                    <img
                      src={isEditing ? editForm.avatar_url : user.avatar_url}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-3 border-black"
                      onError={(e) => {
                        // Hide broken images
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-coral-100 rounded-full flex items-center justify-center">
                      <User size={32} className="text-coral-600" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editForm.first_name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                            placeholder="First name"
                            className="text-base sm:text-lg font-semibold text-dark-teal bg-transparent border-3 border-black focus:border-vivid-orange outline-none w-full p-2"
                          />
                          <input
                            type="text"
                            value={editForm.last_name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                            placeholder="Last name"
                            className="text-base sm:text-lg font-semibold text-dark-teal bg-transparent border-3 border-black focus:border-vivid-orange outline-none w-full p-2"
                          />
                        </div>
                        <div className="text-dark-teal text-sm sm:text-base truncate">
                          @{user?.username || 'Username not set'}
                        </div>
                        <p className="text-xs text-dark-teal">
                          Username cannot be changed after account creation
                        </p>
                      </div>
                      
                      {/* Avatar URL Section */}
                      <div className="space-y-2">
                        <label className="block text-sm font-black text-dark-teal">
                          Profile Photo URL
                        </label>
                        <input
                          type="url"
                          value={editForm.avatar_url}
                          onChange={(e) => setEditForm(prev => ({ ...prev, avatar_url: e.target.value }))}
                          placeholder="https://example.com/your-photo.jpg"
                          className="w-full px-3 py-2 border-3 border-black focus:border-vivid-orange text-xs sm:text-sm font-bold text-dark-teal"
                        />
                        <p className="text-xs text-dark-teal">
                          Enter a URL to an image you'd like to use as your profile photo.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-lg sm:text-xl font-black text-dark-teal truncate">
                        {user?.first_name && user?.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : user?.username || 'Set your name'
                        }
                      </h2>
                      {user?.username && (
                        <p className="text-dark-teal text-sm sm:text-base truncate">@{user.username}</p>
                      )}
                      <p className="text-dark-teal text-xs sm:text-sm truncate">{user?.email}</p>
                      <p className="text-sm text-dark-teal">
                                        {user?.id && (
                    <div className="mt-2 overflow-hidden">
                      <SquashCredDisplay 
                        userId={user.id} 
                        showTier={true}
                        showTooltip={false}
                        size="md"
                      />
                    </div>
                  )}
                      </p>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                {isEditing && !editingDisabled ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex items-center justify-center space-x-1 bg-vivid-orange hover:bg-orange-600 text-white px-3 py-2 border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 text-sm font-black"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Save size={16} />
                      )}
                      <span>{loading ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={handleEditToggle}
                      disabled={loading}
                      className="flex items-center justify-center space-x-1 bg-white hover:bg-gray-100 text-dark-teal px-3 py-2 border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 text-sm font-black"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditToggle}
                    className="flex items-center space-x-1 text-vivid-orange hover:text-orange-600 font-black text-sm"
                  >
                    <Edit3 size={16} />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>

            {statsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 bg-white border-3 border-black shadow-brutal animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-white border-3 border-black shadow-brutal">
                  <p className="text-xl sm:text-2xl font-black text-vivid-orange">{totalConflictsCount}</p>
                  <p className="text-sm text-dark-teal font-bold">Total Conflicts</p>
                </div>
                <div className="p-4 bg-white border-3 border-black shadow-brutal">
                  <p className="text-xl sm:text-2xl font-black text-green-teal">{resolvedConflictsCount}</p>
                  <p className="text-sm text-dark-teal font-bold">Successfully Resolved</p>
                </div>
                <div className="p-4 bg-white border-3 border-black shadow-brutal">
                  <p className="text-xl sm:text-2xl font-black text-lime-chartreuse">{resolutionRate}%</p>
                  <p className="text-sm text-dark-teal font-bold">Resolution Rate</p>

                </div>
              </div>
            )}
          </div>

          {/* Conflict Archetype Display */}
          {archetypeInfo && (
            <div className="mt-6 p-4 bg-lime-chartreuse border-3 border-black shadow-brutal overflow-hidden">
              <div className="flex items-center space-x-3 mb-2">
                <Award className="h-5 w-5 text-dark-teal" />
                <h3 className="text-lg font-black text-dark-teal">Conflict Archetype</h3>
              </div>
              <div className="flex items-start space-x-3 mb-2">
                <span className="text-3xl">{archetypeInfo.emoji}</span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xl font-black text-dark-teal">{archetypeInfo.title}</h4>
                  <p className="text-sm text-dark-teal leading-relaxed font-bold">{archetypeInfo.description}</p>
                </div>
              </div>
              {user?.archetype_assigned_at && (
                <p className="text-xs text-dark-teal mt-2 font-bold">
                  Assigned: {new Date(user.archetype_assigned_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
            </div>
          )}

          {/* Supporter Status Display */}
          {user?.supporter_level && user?.supporter_emoji && user?.supporter_since && (
            <SupporterCard
              supporterLevel={user.supporter_level as 'tip_1' | 'tip_2' | 'tip_3'}
              supporterEmoji={user.supporter_emoji}
              supporterSince={user.supporter_since}
            />
          )}

          {/* Archetype Achievements */}
          {user?.id && (
            <ArchetypeAchievements userId={user.id} className="mt-6" />
          )}

          {/* General Achievements */}
          {user?.id && (
            <GeneralAchievements userId={user.id} className="mt-6" />
          )}

          {/* SquashCred History */}
          {user?.id && (
            <SquashCredHistory userId={user.id} limit={5} className="mt-6" />
          )}

          {/* Tips & Philosophy */}
          <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 border-3 border-black shadow-brutal">
            <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 border-3 border-black shadow-brutal">
              <div className="space-y-3 text-sm text-dark-teal">
                <p>
                  <strong className="font-black">Remember:</strong> The goal isn't to "win" – it's to understand and be understood.
                </p>
                <p>
                  <strong className="font-black">Pro tip:</strong> Most conflicts stem from unmet expectations or poor communication. Start there.
                </p>
                <p>
                  <strong className="font-black">Mindset shift:</strong> Instead of "How can I prove I'm right?" try "How can we both feel heard?"
                </p>
                <p>
                  <strong className="font-black">Reality check:</strong> Sometimes you're both right. Sometimes you're both wrong. Sometimes it doesn't matter who's right.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;