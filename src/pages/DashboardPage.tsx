import React, { useState } from 'react';
import { Plus, MessageSquare, Clock, CheckCircle, Users } from 'lucide-react';
import MoodIndicator from '../components/MoodIndicator';
import { MoodLevel } from '../types';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [currentMood, setCurrentMood] = useState<MoodLevel>('meh');

  // Mock data
  const activeConflicts = [
    {
      id: '1',
      title: 'The Great Dishes Debate',
      otherUser: 'Sarah',
      status: 'waiting_for_them',
      createdAt: '2 hours ago',
      mood: 'annoyed' as MoodLevel,
    },
    {
      id: '2', 
      title: 'Project Deadline Drama',
      otherUser: 'Mike',
      status: 'ready_for_ai',
      createdAt: '1 day ago',
      mood: 'rage' as MoodLevel,
    }
  ];

  const recentSquashes = [
    {
      id: '1',
      title: 'Netflix Password Controversy',
      otherUser: 'Alex',
      outcome: 'resolved',
      resolvedAt: '3 days ago',
      aiSummary: 'Classic boundary confusion resolved with clear expectations.',
    },
    {
      id: '2',
      title: 'Group Chat Ghosting',
      otherUser: 'Jamie',
      outcome: 'still_beefing',
      resolvedAt: '1 week ago',
      aiSummary: 'Communication styles clashed. Follow-up recommended.',
    }
  ];

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
        
        {/* Mood Selector */}
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
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-coral-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-gray-600">Active Conflicts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-teal-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">7</p>
              <p className="text-gray-600">Squashes Resolved</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-lavender-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">5</p>
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
              My Squashes ({recentSquashes.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'active' ? (
        <div className="space-y-4">
          {/* New Conflict Button */}
          <button className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-coral-400 hover:bg-coral-50 transition-colors group">
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
          {activeConflicts.map((conflict) => (
            <div key={conflict.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{conflict.title}</h3>
                    <MoodIndicator mood={conflict.mood} size="sm" />
                  </div>
                  <p className="text-gray-600 mb-2">vs. {conflict.otherUser}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {conflict.createdAt}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      conflict.status === 'waiting_for_them' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {conflict.status === 'waiting_for_them' ? 'Waiting for them' : 'Ready for AI mediation'}
                    </span>
                  </div>
                </div>
                <button className="text-coral-500 hover:text-coral-600 font-medium">
                  Continue →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Recent Squashes */}
          {recentSquashes.map((squash) => (
            <div key={squash.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{squash.title}</h3>
                  <p className="text-gray-600 mb-2">vs. {squash.otherUser}</p>
                  <p className="text-sm text-gray-700 mb-3 italic">"{squash.aiSummary}"</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {squash.resolvedAt}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      squash.outcome === 'resolved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {squash.outcome === 'resolved' ? '✅ Resolved' : '🔥 Still Beefing'}
                    </span>
                  </div>
                </div>
                <button className="text-coral-500 hover:text-coral-600 font-medium">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;