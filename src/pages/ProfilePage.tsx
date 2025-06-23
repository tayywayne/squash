import React, { useState } from 'react';
import { User, Bell, Trash2, Download, Shield, Edit3, Save, X, Camera, Upload, AlertCircle, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { conflictService, Conflict } from '../utils/conflicts';
import { storageService } from '../utils/storage';
import { archetypeService, ARCHETYPES } from '../utils/archetypes';
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
    <div className="max-w-4xl mx-auto p-6">
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
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {(isEditing && editForm.avatar_url) || user?.avatar_url ? (
                  <img
                    src={isEditing ? editForm.avatar_url : user.avatar_url}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
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
              <div>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editForm.first_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                          placeholder="First name"
                          className="text-lg font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-coral-500 outline-none"
                        />
                        <input
                          type="text"
                          value={editForm.last_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                          placeholder="Last name"
                          className="text-lg font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-coral-500 outline-none"
                        />
                      </div>
                      <div className="text-gray-600">
                        @{user?.username || 'Username not set'}
                      </div>
                      <p className="text-xs text-gray-500">
                        Username cannot be changed after account creation
                      </p>
                    </div>
                    
                    {/* Avatar URL Section */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Profile Photo URL
                      </label>
                      <input
                        type="url"
                        value={editForm.avatar_url}
                        onChange={(e) => setEditForm(prev => ({ ...prev, avatar_url: e.target.value }))}
                        placeholder="https://example.com/your-photo.jpg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        Enter a URL to an image you'd like to use as your profile photo.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {user?.first_name && user?.last_name 
                        ? `${user.first_name} ${user.last_name}` 
                        : user?.username || 'Set your name'
                      }
                    </h2>
                    {user?.username && (
                      <p className="text-gray-600">@{user.username}</p>
                    )}
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                    <p className="text-sm text-gray-500">Conflict Resolution Specialist</p>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              {isEditing && !editingDisabled ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex items-center space-x-1 bg-coral-500 hover:bg-coral-600 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
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
                    className="flex items-center space-x-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg transition-colors"
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditToggle}
                  className="flex items-center space-x-1 text-coral-600 hover:text-coral-700 font-medium"
                >
                  <Edit3 size={16} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-coral-500">{totalConflictsCount}</p>
                <p className="text-sm text-gray-600">Total Conflicts</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-teal-500">{resolvedConflictsCount}</p>
                <p className="text-sm text-gray-600">Successfully Resolved</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-lavender-500">{resolutionRate}%</p>
                <p className="text-sm text-gray-600">Resolution Rate</p>
              </div>
            </div>
          )}
        </div>

        {/* Conflict Archetype Display */}
        {archetypeInfo && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-3 mb-2">
              <Award className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-purple-900">Conflict Archetype</h3>
            </div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-3xl">{archetypeInfo.emoji}</span>
              <div>
                <h4 className="text-xl font-bold text-purple-800">{archetypeInfo.title}</h4>
                <p className="text-sm text-purple-700">{archetypeInfo.description}</p>
              </div>
            </div>
            {user?.archetype_assigned_at && (
              <p className="text-xs text-purple-600 mt-2">
                Assigned: {new Date(user.archetype_assigned_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>
        )}

        {/* Notification Settings - Hidden until functionality is implemented */}
        {/* 
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Conflict Updates</h3>
                <p className="text-sm text-gray-600">Get notified when someone responds to your conflicts</p>
              </div>
              <button
                onClick={() => handleNotificationChange('conflictUpdates')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.conflictUpdates ? 'bg-coral-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.conflictUpdates ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Follow-up Reminders</h3>
                <p className="text-sm text-gray-600">Gentle nudges to check in on resolved conflicts</p>
              </div>
              <button
                onClick={() => handleNotificationChange('followUps')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.followUps ? 'bg-coral-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.followUps ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Weekly Digest</h3>
                <p className="text-sm text-gray-600">Summary of your conflict resolution journey</p>
              </div>
              <button
                onClick={() => handleNotificationChange('weeklyDigest')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.weeklyDigest ? 'bg-coral-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.weeklyDigest ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
        */}

        {/* Privacy & Data - Hidden until functionality is implemented */}
        {/* 
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Privacy & Data</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Export Your Data</h3>
                <p className="text-sm text-gray-600">Download all your conflicts and resolutions</p>
              </div>
              <button
                onClick={handleExportData}
                className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 font-medium"
              >
                <Download size={18} />
                <span>Export</span>
              </button>
            </div>

            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-red-900">Danger Zone</h3>
                  <p className="text-sm text-red-700">
                    Delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        */}

        {/* Tips & Philosophy */}
        <div className="bg-gradient-to-r from-coral-50 to-teal-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 Conflict Resolution Philosophy</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Remember:</strong> The goal isn't to "win" – it's to understand and be understood.
            </p>
            <p>
              <strong>Pro tip:</strong> Most conflicts stem from unmet expectations or poor communication. Start there.
            </p>
            <p>
              <strong>Mindset shift:</strong> Instead of "How can I prove I'm right?" try "How can we both feel heard?"
            </p>
            <p>
              <strong>Reality check:</strong> Sometimes you're both right. Sometimes you're both wrong. Sometimes it doesn't matter who's right.
            </p>
          </div>
        </div>

        {/* Profile Tips */}
        <div className="bg-lavender-50 p-6 rounded-lg border border-lavender-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">👤 Profile Tips</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Username:</strong> Choose something that represents you well. Other users will see this when you're in conflicts together.
            </p>
            <p>
              <strong>Avatar:</strong> A friendly photo helps humanize conflicts. You can use any image URL - try uploading to a service like Imgur or use a Gravatar URL.
            </p>
            <p>
              <strong>Privacy:</strong> Your profile is visible to other users you're in conflicts with. Keep it professional but personable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;