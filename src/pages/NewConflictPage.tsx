import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import MoodIndicator from '../components/MoodIndicator';
import Toast from '../components/Toast';
import { conflictService } from '../utils/conflicts';
import { archetypeService } from '../utils/archetypes';
import { MoodLevel } from '../types';

const NewConflictPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    otherUserEmail: '',
    description: '',
  });
  const [currentMood, setCurrentMood] = useState<MoodLevel>('annoyed');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.otherUserEmail.trim() || !formData.description.trim()) {
      setToast({ message: 'Please fill in all fields. We need the full tea to help you squash this.', type: 'error' });
      return;
    }

    if (formData.otherUserEmail === user?.email) {
      setToast({ message: 'You can\'t start a conflict with yourself. That\'s called therapy.', type: 'error' });
      return;
    }

    setLoading(true);
    
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const conflictId = await conflictService.createConflict({
        title: formData.title,
        otherUserEmail: formData.otherUserEmail,
        description: formData.description,
        mood: currentMood
      }, user.id);
      
      // Update user's archetype after creating a conflict
      try {
        await archetypeService.assignArchetype(user.id);
      } catch (error) {
        console.error('Error updating archetype after conflict creation:', error);
        // Don't fail the conflict creation if archetype update fails
      }
      
      setToast({ 
        message: 'Conflict created! The other party will be notified. Time to get this sorted.', 
        type: 'success' 
      });
      
      // Navigate to dashboard after a brief delay
      setTimeout(() => {
        navigate(`/conflict/${conflictId}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error creating conflict:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setToast({ 
        message: `Failed to create conflict: ${errorMessage}. Check your connection and try again?`, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const conflictTitleSuggestions = [
    "The Great Dishes Debate",
    "Project Deadline Drama", 
    "Netflix Password Controversy",
    "Group Chat Ghosting",
    "Borrowed Item Bermuda Triangle",
    "Plans That Got Cancelled",
    "The Miscommunication Mess"
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
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
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Start a New Conflict Resolution
        </h1>
        <p className="text-gray-600">
          Got beef? Let's squash it. Fill out the details and we'll help you both work through it.
        </p>
      </div>

      {/* Mood Check-in */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          First, how are you feeling right now?
        </h2>
        <MoodIndicator 
          mood={currentMood} 
          interactive 
          onMoodChange={setCurrentMood}
        />
        <p className="text-sm text-gray-600 mt-2">
          This helps our AI understand the emotional context of your situation.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Conflict Details
          </h2>
          
          {/* Conflict Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              What should we call this conflict?
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors"
              placeholder="Give it a memorable name..."
              maxLength={100}
            />
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-2">Need inspiration? Try one of these:</p>
              <div className="flex flex-wrap gap-2">
                {conflictTitleSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, title: suggestion }))}
                    className="text-xs bg-gray-100 hover:bg-coral-100 text-gray-700 hover:text-coral-700 px-2 py-1 rounded transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Other User Email */}
          <div className="mb-6">
            <label htmlFor="otherUserEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Who's the other party in this conflict?
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="otherUserEmail"
                name="otherUserEmail"
                type="email"
                value={formData.otherUserEmail}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors"
                placeholder="their.email@example.com"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              They'll get an invitation to join this conflict resolution session.
            </p>
          </div>

          {/* Conflict Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              What's the situation? Give us the context.
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors resize-none"
              placeholder="Spill the tea. What happened? How did it make you feel? What's the core issue here? The more context you give us, the better our AI can help mediate..."
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                They wont see anything you write, so have at it.
              </p>
              <span className="text-xs text-gray-500">
                {formData.description.length}/1000
              </span>
            </div>
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-teal-50 p-6 rounded-lg border border-teal-200">
          <h3 className="text-lg font-semibold text-teal-900 mb-3">
            💡 Before You Submit
          </h3>
          <ul className="space-y-2 text-sm text-teal-800">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Focus on the specific incident or pattern, not their entire personality</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Describe how their actions affected you, not what you think they intended</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Avoid absolute words like "always" or "never" - they make people defensive</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Remember: the goal is understanding, not winning</span>
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.title.trim() || !formData.otherUserEmail.trim() || !formData.description.trim()}
            className="flex-1 bg-coral-500 hover:bg-coral-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Creating Conflict...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Start Resolution Process</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer Note */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          By starting this conflict resolution, you agree to engage constructively and respectfully. 
          Our AI mediator has zero tolerance for personal attacks or bad faith arguments.
        </p>
      </div>
    </div>
  );
};

export default NewConflictPage;