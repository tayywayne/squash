import React, { useState } from 'react';
import { User, Bell, Trash2, Download, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Toast from '../components/Toast';

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState({
    conflictUpdates: true,
    followUps: true,
    weeklyDigest: false,
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

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
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-coral-100 rounded-full flex items-center justify-center">
              <User size={32} className="text-coral-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.email}</h2>
              <p className="text-gray-600">Conflict Resolution Specialist</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-coral-500">12</p>
              <p className="text-sm text-gray-600">Total Conflicts</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-teal-500">8</p>
              <p className="text-sm text-gray-600">Successfully Resolved</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-lavender-500">67%</p>
              <p className="text-sm text-gray-600">Resolution Rate</p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
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

        {/* Privacy & Data */}
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
      </div>
    </div>
  );
};

export default ProfilePage;