import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Toast from '../components/Toast';

const SupportSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const supportTiers = [
    {
      id: 'tip_1',
      name: 'Buy Us a Band-Aid',
      emoji: '🩹',
      price: '$1',
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'tip_2',
      name: "I'm the Problem",
      emoji: '💅',
      price: '$5',
      color: 'from-pink-400 to-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      id: 'tip_3',
      name: 'Chaos Patron',
      emoji: '🔥👑',
      price: '$10',
      color: 'from-orange-400 to-red-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      setToast({ message: 'Please log in to confirm your tip', type: 'error' });
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [user, navigate]);

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

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
        <p className="text-gray-600">Please log in to confirm your tip and get your supporter badge.</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            You're Officially a Supporter!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your supporter badge is now live across the app. Thanks for keeping Squashie running!
          </p>
          
          <div className="bg-gradient-to-r from-coral-50 to-teal-50 p-6 rounded-lg border border-gray-200 mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Sparkles className="h-6 w-6 text-coral-500" />
              <h2 className="text-lg font-semibold text-gray-900">What's Next?</h2>
              <Sparkles className="h-6 w-6 text-coral-500" />
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p>✨ Your supporter emoji now appears next to your username</p>
              <p>🏆 Show off your status on the leaderboard</p>
              <p>💬 Other users will see your supporter badge in conflicts</p>
              <p>🎯 You're helping make conflict resolution accessible to everyone</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-coral-500 hover:bg-coral-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              View My Profile
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
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Support</span>
        </button>
        
        <div className="text-center">
          <div className="text-6xl mb-4">💳</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Confirm Your Tip
          </h1>
          <p className="text-lg text-gray-600">
            Thanks for supporting Squashie! Which tip did you just complete?
          </p>
        </div>
      </div>

      {/* Confirmation Buttons */}
      <div className="space-y-4 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 text-center mb-6">
          I just tipped:
        </h2>
        
        {supportTiers.map((tier) => (
          <button
            key={tier.id}
            onClick={() => handleConfirmTip(tier)}
            disabled={loading}
            className={`w-full ${tier.bgColor} hover:shadow-md border-2 ${tier.borderColor} p-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{tier.emoji}</div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
                  <p className={`text-xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                    {tier.price}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-coral-500 border-t-transparent"></div>
                ) : (
                  <CheckCircle className="h-6 w-6 text-gray-400" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Help Text */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h3 className="font-medium text-yellow-900 mb-2">
          💡 Can't find your tip amount?
        </h3>
        <p className="text-sm text-yellow-800">
          Make sure you completed the payment on Stripe first. If you're still having trouble, 
          you can always go back and try again, or contact us for help.
        </p>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Your supporter status will be visible to other users and will appear next to your username across the app.
        </p>
      </div>
    </div>
  );
};

export default SupportSuccessPage;