import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { debatesService } from '../utils/debates';
import { userLookupService } from '../utils/userLookup';
import Toast from '../components/Toast';

const NewDebatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    creatorSide: '',
    creatorPosition: '',
    opponentSide: '',
    opponentEmail: '',
  });
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
      if (formData.opponentEmail) {
        checkEmailExists(formData.opponentEmail);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.opponentEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || 
        !formData.creatorSide.trim() || 
        !formData.creatorPosition.trim() || 
        !formData.opponentSide.trim() || 
        !formData.opponentEmail.trim()) {
      setToast({ message: 'Please fill in all fields to start the debate.', type: 'error' });
      return;
    }

    if (formData.opponentEmail === user?.email) {
      setToast({ message: 'You can\'t debate yourself. Invite someone else!', type: 'error' });
      return;
    }

    setLoading(true);
    
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const debateId = await debatesService.createDebate({
        title: formData.title,
        creator_side: formData.creatorSide,
        creator_position: formData.creatorPosition,
        opponent_side: formData.opponentSide,
        opponent_email: formData.opponentEmail
      }, user.id);
      
      // Show success message
      if (userExists === false) {
        setToast({ 
          message: 'Debate created and invite sent! They\'ll get an email to join Squashie.', 
          type: 'success' 
        });
      } else {
        setToast({ 
          message: 'Debate created! The other party will be notified.', 
          type: 'success' 
        });
      }
      
      // Navigate to debates page after a brief delay
      setTimeout(() => {
        navigate('/debates');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating debate:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setToast({ 
        message: `Failed to create debate: ${errorMessage}. Please try again.`, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const debateSuggestions = [
    "Pizza vs. Tacos 🍕🌮",
    "Dogs vs. Cats 🐶🐱", 
    "Early Bird vs. Night Owl 🐦🦉",
    "Beach vs. Mountains ⛱️🏔️",
    "Books vs. Movies 📚🎬",
    "Coffee vs. Tea ☕🍵",
    "Summer vs. Winter ☀️❄️",
    "iOS vs. Android 🍎🤖",
    "Chocolate vs. Vanilla 🍫🍦"
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
            onClick={() => navigate('/debates')}
            className="flex items-center space-x-2 text-dark-teal hover:text-vivid-orange transition-colors font-black"
          >
            <ArrowLeft size={20} />
            <span>BACK TO DEBATES</span>
          </button>
        </div>
        
        <h1 className="text-4xl font-black text-dark-teal mb-4 border-b-3 border-black pb-2">
          START A NEW DEBATE
        </h1>
        <p className="text-dark-teal font-bold text-lg">
          Challenge someone to a friendly debate. The community will vote on who makes the better case!
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 border-3 border-black shadow-brutal">
          <h2 className="text-xl font-black text-dark-teal mb-4 flex items-center">
            <span className="text-2xl mr-2">🎭</span> DEBATE DETAILS
          </h2>
          
          {/* Debate Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-black text-dark-teal mb-2">
              DEBATE TOPIC
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-3 border-black font-bold text-dark-teal focus:outline-none focus:border-vivid-orange transition-colors"
              placeholder="e.g., Pizza vs. Tacos"
              maxLength={100}
            />
            <div className="mt-2">
              <p className="text-xs text-dark-teal mb-2 font-bold">Need inspiration? Try one of these:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {debateSuggestions.map((suggestion, index) => (
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

          {/* Your Side */}
          <div className="mb-6">
            <label htmlFor="creatorSide" className="block text-sm font-black text-dark-teal mb-2">
              YOUR SIDE
            </label>
            <input
              id="creatorSide"
              name="creatorSide"
              type="text"
              value={formData.creatorSide}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-3 border-black font-bold text-dark-teal focus:outline-none focus:border-vivid-orange transition-colors"
              placeholder="e.g., Pizza"
              maxLength={50}
            />
          </div>

          {/* Your Position */}
          <div className="mb-6">
            <label htmlFor="creatorPosition" className="block text-sm font-black text-dark-teal mb-2">
              YOUR ARGUMENT
            </label>
            <textarea
              id="creatorPosition"
              name="creatorPosition"
              value={formData.creatorPosition}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border-3 border-black font-bold text-dark-teal resize-none focus:outline-none focus:border-vivid-orange transition-colors"
              placeholder="Make your case for your side of the debate..."
              maxLength={500}
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-dark-teal font-bold">
                {formData.creatorPosition.length}/500
              </span>
            </div>
          </div>

          {/* Opponent Side */}
          <div className="mb-6">
            <label htmlFor="opponentSide" className="block text-sm font-black text-dark-teal mb-2">
              OPPONENT'S SIDE
            </label>
            <input
              id="opponentSide"
              name="opponentSide"
              type="text"
              value={formData.opponentSide}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-3 border-black font-bold text-dark-teal focus:outline-none focus:border-vivid-orange transition-colors"
              placeholder="e.g., Tacos"
              maxLength={50}
            />
          </div>

          {/* Opponent Email */}
          <div className="mb-6">
            <label htmlFor="opponentEmail" className="block text-sm font-black text-dark-teal mb-2">
              OPPONENT'S EMAIL
            </label>
            <input
              id="opponentEmail"
              name="opponentEmail"
              type="email"
              value={formData.opponentEmail}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-3 border-black font-bold text-dark-teal focus:outline-none focus:border-vivid-orange transition-colors"
              placeholder="their.email@example.com"
            />
            
            {/* Email Status Indicator */}
            {formData.opponentEmail && (
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
                    <span>✓</span>
                    <span>This person has a Squashie account</span>
                  </div>
                ) : userExists === false ? (
                  <div className="p-3 bg-lime-chartreuse border-2 border-black">
                    <div className="flex items-start space-x-2 text-sm text-dark-teal">
                      <span className="mt-0.5 flex-shrink-0 text-dark-teal">📧</span>
                      <div>
                        <p className="font-black">This person doesn't have an account yet</p>
                        <p className="text-dark-teal mt-1 font-bold">
                          They'll receive an email invitation to join the debate!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-lime-chartreuse p-6 border-3 border-black shadow-brutal">
          <h3 className="text-lg font-black text-dark-teal mb-3 flex items-center">
            <span className="text-2xl mr-2">💡</span> DEBATE GUIDELINES
          </h3>
          <ul className="space-y-3 text-sm text-dark-teal font-bold">
            <li className="flex items-start border-2 border-black bg-white p-2">
              <span className="text-xl mr-2">⏱️</span>
              <span>Debates run for 7 days after both sides have submitted their arguments.</span>
            </li>
            <li className="flex items-start border-2 border-black bg-white p-2">
              <span className="text-xl mr-2">🗳️</span>
              <span>Community members vote on which side made the better case.</span>
            </li>
            <li className="flex items-start border-2 border-black bg-white p-2">
              <span className="text-xl mr-2">👑</span>
              <span>The winner gets a crown on their profile and SquashCred points.</span>
            </li>
            <li className="flex items-start border-2 border-black bg-white p-2">
              <span className="text-xl mr-2">🤝</span>
              <span>Keep it friendly and respectful - this is for fun!</span>
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => navigate('/debates')}
            className="flex-1 bg-white hover:bg-gray-100 text-dark-teal font-black py-3 px-4 border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1"
          >
            CANCEL
          </button>
          <button
            type="submit"
            disabled={loading || !formData.title.trim() || !formData.creatorSide.trim() || !formData.creatorPosition.trim() || !formData.opponentSide.trim() || !formData.opponentEmail.trim()}
            className="flex-1 bg-vivid-orange hover:bg-orange-600 text-white font-black py-3 px-4 border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-3 border-white border-t-transparent"></div>
                <span>CREATING DEBATE...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>START DEBATE</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewDebatePage;