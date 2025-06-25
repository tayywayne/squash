import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Sparkles, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Toast from '../components/Toast';

const SupportSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Get the tip ID from URL parameters
  const tipIdFromUrl = searchParams.get('tipId') as 'tip_1' | 'tip_2' | 'tip_3' | null;

  const supportTiers = [
    {
      id: 'tip_1',
      name: 'BUY US A BAND-AID',
      emoji: '🩹',
      price: '$1',
      color: 'bg-green-teal',
      textColor: 'text-white',
      borderColor: 'border-black'
    },
    {
      id: 'tip_2',
      name: "I'M THE PROBLEM",
      emoji: '💅',
      price: '$5',
      color: 'bg-vivid-orange',
      textColor: 'text-white',
      borderColor: 'border-black'
    },
    {
      id: 'tip_3',
      name: 'CHAOS PATRON',
      emoji: '🔥👑',
      price: '$10',
      color: 'bg-lime-chartreuse',
      textColor: 'text-dark-teal',
      borderColor: 'border-black'
    }
  ];

  // Filter to show only the selected tip tier
  const selectedTier = tipIdFromUrl ? supportTiers.find(tier => tier.id === tipIdFromUrl) : null;
  const displayTiers = selectedTier ? [selectedTier] : supportTiers;

  // Redirect if not logged in (only after auth loading is complete)
  React.useEffect(() => {
    if (!authLoading && !user) {
      setToast({ message: 'Please log in to confirm your tip', type: 'error' });
    }
  }, [user, authLoading, navigate]);

  // Auto-confirm tip if tipId is in URL and user is authenticated
  React.useEffect(() => {
    if (!authLoading && user && tipIdFromUrl && selectedTier && !confirmed && !loading) {
      console.log('Auto-confirming tip:', tipIdFromUrl);
      handleConfirmTip(selectedTier);
    }
  }, [user, authLoading, tipIdFromUrl, selectedTier, confirmed, loading]);

  const handleConfirmTip = async (tier: typeof supportTiers[0]) => {
    if (!user) {
      setToast({ message: 'Please log in to confirm your tip', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await updateProfile({
        supporter_level: tier.id as 'tip_1' | 'tip_2' | 'tip_3',
        supporter_emoji: tier.emoji,
        supporter_since: new Date().toISOString()
      });

      if (error) {
        setToast({ message: 'Failed to update supporter status. Please try again.', type: 'error' });
      } else {
        setConfirmed(true);
        setToast({ 
          message: `Thanks for the support! You're now a ${tier.name} ${tier.emoji}`, 
          type: 'success' 
        });
      }
    } catch (error) {
      console.error('Error updating supporter status:', error);
      setToast({ message: 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="animate-pulse-slow mb-4">
          <div className="text-6xl">💳</div>
        </div>
        <h1 className="text-2xl font-black text-dark-teal mb-2">LOADING...</h1>
        <p className="text-dark-teal font-bold">Checking your authentication status...</p>
      </div>
    );
  }

  // Show login required if user is not authenticated
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-black text-dark-teal mb-2">LOGIN REQUIRED</h1>
        <p className="text-dark-teal font-bold">Please log in to confirm your tip and get your supporter badge.</p>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-black text-dark-teal mb-4 border-b-3 border-black pb-2">
            YOU'RE OFFICIALLY A SUPPORTER!
          </h1>
          <p className="text-xl text-dark-teal font-bold mb-8">
            Your supporter badge is now live across the app. Thanks for keeping Squashie running!
          </p>
          
          <div className="bg-lime-chartreuse p-6 border-3 border-black shadow-brutal mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Sparkles className="h-6 w-6 text-dark-teal" />
              <h2 className="text-lg font-black text-dark-teal">WHAT'S NEXT?</h2>
              <Sparkles className="h-6 w-6 text-dark-teal" />
            </div>
            <div className="space-y-2 text-dark-teal font-bold">
              <p>✨ Your supporter emoji now appears next to your username</p>
              <p>🏆 Show off your status on the leaderboard</p>
              <p>💬 Other users will see your supporter badge in conflicts</p>
              <p>🎯 You're helping make conflict resolution accessible to everyone</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-vivid-orange hover:bg-orange-600 text-white font-black py-3 px-6 border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1"
            >
              BACK TO DASHBOARD
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="bg-white hover:bg-gray-100 text-dark-teal font-black py-3 px-6 border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1"
            >
              VIEW MY PROFILE
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          onClick={() => navigate('/support-us')}
          className="flex items-center space-x-2 text-dark-teal hover:text-vivid-orange mb-6 transition-colors font-black"
        >
          <ArrowLeft size={20} />
          <span>BACK TO SUPPORT</span>
        </button>
        
        <div className="text-center">
          <div className="text-6xl mb-4">💳</div>
          <h1 className="text-3xl font-black text-dark-teal mb-4 border-b-3 border-black pb-2">
            CONFIRM YOUR TIP
          </h1>
          <p className="text-lg text-dark-teal font-bold">
            Thanks for supporting Squashie! Which tip did you just complete?
          </p>
        </div>
      </div>

      {/* Confirmation Buttons */}
      <div className="space-y-4 mb-8">
        <h2 className="text-lg font-black text-dark-teal text-center mb-6">
          {tipIdFromUrl ? 'Confirming your tip...' : 'Select the tip you just completed:'}
        </h2>
        
        {displayTiers.map((tier) => (
          <button
            key={tier.id}
            onClick={() => handleConfirmTip(tier)}
            disabled={loading}
            className={`w-full ${tier.color} hover:shadow-brutal border-3 ${tier.borderColor} p-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{tier.emoji}</div>
                <div className="text-left">
                  <h3 className={`text-lg font-black ${tier.textColor}`}>{tier.name}</h3>
                  <p className={`text-xl font-black ${tier.textColor}`}>
                    {tier.price}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-3 border-black border-t-transparent"></div>
                ) : (
                  <CheckCircle className="h-6 w-6 text-black" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Help Text - only show if no tipId in URL */}
      {!tipIdFromUrl && (
        <div className="bg-lime-chartreuse p-4 border-3 border-black shadow-brutal">
          <h3 className="font-black text-dark-teal mb-2 flex items-center">
            <span className="text-2xl mr-2">💡</span> PAYMENT COMPLETED AUTOMATICALLY?
          </h3>
          <p className="text-dark-teal font-bold">
            If you used our new integrated checkout, your supporter status should update automatically! 
            If it doesn't appear within a few minutes, you can manually confirm it above.
          </p>
          <button
            onClick={() => navigate('/support-us')}
            className="mt-2 text-vivid-orange hover:text-orange-600 underline font-black text-sm flex items-center space-x-1"
          >
            <ExternalLink size={14} />
            <span>Go back to make a tip</span>
          </button>
        </div>
      )}
      
      {/* Show message if tipId is invalid */}
      {tipIdFromUrl && !selectedTier && (
        <div className="bg-vivid-orange p-4 border-3 border-black shadow-brutal">
          <h3 className="font-black text-white mb-2 flex items-center">
            <span className="text-2xl mr-2">⚠️</span> INVALID TIP REFERENCE
          </h3>
          <p className="text-white font-bold">
            The tip reference in the URL is not valid. Please select your tip manually above.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-dark-teal font-bold">
          Your supporter status will be visible to other users and will appear next to your username across the app.
        </p>
      </div>
    </div>
  );
};

export default SupportSuccessPage;