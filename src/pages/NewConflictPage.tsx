import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import MoodIndicator from '../components/MoodIndicator';
import Toast from '../components/Toast';
import { conflictService, CreateConflictData } from '../utils/conflicts';
import { archetypeService } from '../utils/archetypes';
import { userLookupService } from '../utils/userLookup';
import { inviteService } from '../utils/invites';
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
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [emailCheckError, setEmailCheckError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkEmailExists = async (email: string) => {
    if (!email.trim() || !email.includes('@')) {
      setUserExists(null);
      setEmailCheckError(null);
      return;
    }

    setEmailCheckLoading(true);
    setEmailCheckError(null);
    
    try {
      const result = await userLookupService.checkUserExists(email);
      
      if (result.error) {
        setEmailCheckError(result.error);
        setUserExists(null);
      } else {
        setUserExists(result.exists);
      }
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailCheckError('Failed to check email');
      setUserExists(null);
    } finally {
      setEmailCheckLoading(false);
    }
  };

  // Debounced email checking
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.otherUserEmail) {
        checkEmailExists(formData.otherUserEmail);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.otherUserEmail]);
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
      
      // If the user doesn't exist, send an invite email
      if (userExists === false) {
        try {
          const inviterName = user.first_name || user.username || 'Someone';
          await inviteService.sendConflictInvite({
            to_email: formData.otherUserEmail,
            conflict_id: conflictId,
            inviter_name: inviterName
          });
          
          setToast({ 
            message: 'Conflict created and invite sent! They\'ll get an email to join Squashie.', 
            type: 'success' 
          });
        } catch (inviteError) {
          console.error('Error sending invite:', inviteError);
          setToast({ 
            message: 'Conflict created, but failed to send invite email. They can still join manually.', 
            type: 'info' 
          });
        }
      } else {
        setToast({ 
          message: 'Conflict created! The other party will be notified. Time to get this sorted.', 
          type: 'success' 
        });
      }
      
      // Update user's archetype after creating a conflict
      try {
        await archetypeService.assignArchetype(user.id);
      } catch (error) {
        console.error('Error updating archetype after conflict creation:', error);
        // Don't fail the conflict creation if archetype update fails
      }
      
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
    "Group Chat Ghosting 👻",
    "The Great Dishes Debate 🍽️", 
    "The Venmo Vanishing Act 💸",
    "Canceled Plans Catastrophe ❌",
    "Micromanager Mayhem 📋",
    "Passive-Aggressive Olympics 🥇",
    "Drama in the Group Project 📊",
    "Used My Stuff Without Asking 👜",
    "“I Was Just Joking” 🙄"
  ];

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
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-dark-teal hover:text-vivid-orange transition-colors font-black"
          >
            <ArrowLeft size={20} />
            <span>BACK TO DASHBOARD</span>
          </button>
        </div>
        
        <h1 className="text-4xl font-black text-dark-teal mb-4 border-b-3 border-black pb-2">
          START A NEW CONFLICT
        </h1>
        <p className="text-dark-teal font-bold text-lg">
          Got beef? Let's squash it. Fill out the details and we'll help you resolve it.
        </p>
      </div>

      {/* Mood Check-in */}
      <div className="bg-white p-6 border-3 border-black shadow-brutal mb-6">
        <h2 className="text-xl font-black text-dark-teal mb-4 flex items-center">
          <span className="text-2xl mr-2">🌡️</span> HOW ARE YOU FEELING RIGHT NOW?
        </h2>
        <MoodIndicator 
          mood={currentMood} 
          interactive 
          onMoodChange={setCurrentMood}
        />
        <p className="text-sm text-dark-teal mt-3 font-bold">
          This helps our AI understand your emotional state and translate your message appropriately.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 border-3 border-black shadow-brutal">
          <h2 className="text-xl font-black text-dark-teal mb-4 flex items-center">
            <span className="text-2xl mr-2">📝</span> CONFLICT DETAILS
          </h2>
          
          {/* Conflict Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-black text-dark-teal mb-2">
              WHAT SHOULD WE CALL THIS CONFLICT?
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-3 border-black font-bold text-dark-teal focus:outline-none focus:border-vivid-orange transition-colors"
              placeholder="Give it a memorable name..."
              maxLength={100}
            />
            <div className="mt-2">
              <p className="text-xs text-dark-teal mb-2 font-bold">Need inspiration? Try one of these:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {conflictTitleSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, title: suggestion }))}
                    className="text-xs bg-lime-chartreuse hover:bg-lime-chartreuse/80 text-dark-teal px-2 py-1 border-2 border-black transition-colors font-bold"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Other User Email */}
          <div className="mb-6">
            <label htmlFor="otherUserEmail" className="block text-sm font-black text-dark-teal mb-2">
              WHO'S THE OTHER PARTY IN THIS CONFLICT?
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-teal" />
              <input
                id="otherUserEmail"
                name="otherUserEmail"
                type="email"
                value={formData.otherUserEmail}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border-3 border-black font-bold text-dark-teal focus:outline-none focus:border-vivid-orange transition-colors"
                placeholder="their.email@example.com"
              />
            </div>
            
            {/* Email Status Indicator */}
            {formData.otherUserEmail && (
              <div className="mt-2">
                {emailCheckLoading ? (
                  <div className="flex items-center space-x-2 text-sm text-dark-teal">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-black border-t-vivid-orange"></div>
                    <span>Checking email...</span>
                  </div>
                ) : emailCheckError ? (
                  <div className="flex items-center space-x-2 text-sm text-vivid-orange">
                    <AlertCircle size={14} />
                    <span>Unable to verify email</span>
                  </div>
                ) : userExists === true ? (
                  <div className="flex items-center space-x-2 text-sm text-green-teal font-bold">
                    <CheckCircle size={14} />
                    <span>This person has a Squashie account</span>
                  </div>
                ) : userExists === false ? (
                  <div className="p-3 bg-lime-chartreuse border-2 border-black">
                    <div className="flex items-start space-x-2 text-sm text-dark-teal">
                      <Mail size={14} className="mt-0.5 flex-shrink-0 text-dark-teal" />
                      <div>
                        <p className="font-black">This person doesn't have an account yet</p>
                        <p className="text-dark-teal mt-1 font-bold">
                          Sending this conflict will invite them to join Squashie!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            <p className="text-xs text-dark-teal mt-1 font-bold">
              They'll get an invitation to join this conflict resolution.
            </p>
          </div>

          {/* Conflict Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-black text-dark-teal mb-2">
              WHAT'S THE SITUATION? GIVE US THE CONTEXT.
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-4 py-3 border-3 border-black font-bold text-dark-teal resize-none focus:outline-none focus:border-vivid-orange transition-colors"
              placeholder="Let it out. The pettiness, the disappointment, the rage-text you didn’t send. The more we know, the better our AI can turn it into something… slightly less petty."
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-dark-teal font-bold">
                They won't see your raw message - AI will translate it first.
              </p>
              <span className="text-xs text-dark-teal font-bold">
                {formData.description.length}/1000
              </span>
            </div>
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-lime-chartreuse p-6 border-3 border-black shadow-brutal">
          <h3 className="text-lg font-black text-dark-teal mb-3 flex items-center">
            <span className="text-2xl mr-2">💡</span> BEFORE YOU SUBMIT
          </h3>
          <ul className="space-y-3 text-sm text-dark-teal font-bold">
            <li className="flex items-start border-2 border-black bg-white p-2">
              <span className="text-xl mr-2">⚠️</span>
              <span>They won't see your raw message, but avoid threats or serious attacks.</span>
            </li>
            <li className="flex items-start border-2 border-black bg-white p-2">
              <span className="text-xl mr-2">🎭</span>
              <span>This is a safe space to rant. But if your message is just 'K' or 'lol okay', please try again.</span>
            </li>
            <li className="flex items-start border-2 border-black bg-white p-2">
              <span className="text-xl mr-2">🤖</span>
              <span>Yes, sarcasm is fun. No, the AI doesn't pick up on it well. Be mad, not confusing.</span>
            </li>
            <li className="flex items-start border-2 border-black bg-white p-2">
              <span className="text-xl mr-2">📝</span>
              <span>This isn't your diary. If your message includes "like that time in 2019" — edit it down.</span>
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-white hover:bg-gray-100 text-dark-teal font-black py-3 px-4 border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1"
          >
            CANCEL
          </button>
          <button
            type="submit"
            disabled={loading || !formData.title.trim() || !formData.otherUserEmail.trim() || !formData.description.trim()}
            className="flex-1 bg-vivid-orange hover:bg-orange-600 text-white font-black py-3 px-4 border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-3 border-white border-t-transparent"></div>
                <span>CREATING CONFLICT...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>START RESOLUTION PROCESS</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer Note */}
      <div className="mt-8 text-center bg-dark-teal p-4 border-3 border-black">
        <p className="text-xs text-white font-bold">
          By starting this conflict resolution, you agree to engage constructively. 
          Our AI mediator has zero tolerance for personal attacks or bad faith arguments. 
          <span className="text-lime-chartreuse">Let's squash this beef! 💪</span>
        </p>
      </div>
    </div>
  );
};

export default NewConflictPage;