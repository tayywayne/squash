import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ExternalLink, Gift, Crown, Ban as Bandage } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { stripeService } from '../utils/stripe';
import Toast from '../components/Toast';

const SupportUsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const supportTiers = [
    {
      id: 'tip_1',
      name: 'Buy Us a Band-Aid',
      emoji: '🩹',
      price: '$1',
      description: 'For when we helped patch up a tiny disagreement',
      icon: Bandage,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'tip_2',
      name: "I'm the Problem",
      emoji: '💅',
      price: '$5',
      description: 'Admitting you were wrong? That takes courage (and cash)',
      icon: Heart,
      color: 'from-pink-400 to-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      id: 'tip_3',
      name: 'Chaos Patron',
      emoji: '👑',
      price: '$10',
      description: 'You create drama, we solve it. Fair trade.',
      icon: Crown,
      color: 'from-orange-400 to-red-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  const handleTipClick = async (tierId: string) => {
    if (!user) {
      //setToast({ message: 'Please log in to support us', type: 'error' });
      return;
    }

    setLoading(tierId);
    
    try {
      const { url, error } = await stripeService.createCheckoutSession({
        user_id: user.id,
        tip_level: tierId as 'tip_1' | 'tip_2' | 'tip_3'
      });

      if (error) {
        setToast({ message: error, type: 'error' });
      } else if (url) {
        // Redirect to Stripe checkout
        window.location.href = url;
      } else {
        setToast({ message: 'Failed to create checkout session', type: 'error' });
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setToast({ message: 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setLoading(null);
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
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        
        <div className="text-center">
          <div className="text-6xl mb-4">💝</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Support Squashie
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Did we help you avoid a friendship apocalypse? Prevent a roommate war? 
            Keep your group chat from imploding? Show some love!
          </p>
        </div>
      </div>

      {/* Support Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {supportTiers.map((tier) => (
          <div key={tier.id} className={`${tier.bgColor} p-6 rounded-xl border-2 ${tier.borderColor} hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">{tier.emoji}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
              <div className={`text-3xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent mb-3`}>
                {tier.price}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {tier.description}
              </p>
            </div>
            
            <button
              onClick={() => handleTipClick(tier.id)}
              disabled={loading === tier.id || !user}
              className={`w-full bg-gradient-to-r ${tier.color} hover:opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 group disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === tier.id ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Creating checkout...</span>
                </>
              ) : (
                <>
                  <span>{tier.emoji} {tier.name} – {tier.price}</span>
                  <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Login Required Notice */}
      {!user && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-8">
          <h3 className="font-medium text-yellow-900 mb-2">
            🔒 Login Required
          </h3>
          <p className="text-sm text-yellow-800">
            You need to be logged in to support us and get your supporter badge. 
            <button 
              onClick={() => navigate('/login')}
              className="text-yellow-900 underline hover:text-yellow-700 ml-1"
            >
              Log in here
            </button>
          </p>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Gift className="h-5 w-5 mr-2 text-coral-500" />
          How It Works
        </h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-coral-100 rounded-full flex items-center justify-center text-coral-600 font-bold text-xs mt-0.5">1</div>
            <p>Click one of the tip buttons above to go to Stripe checkout</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-coral-100 rounded-full flex items-center justify-center text-coral-600 font-bold text-xs mt-0.5">2</div>
            <p>Complete your payment securely through Stripe</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-coral-100 rounded-full flex items-center justify-center text-coral-600 font-bold text-xs mt-0.5">3</div>
            <p>You'll be redirected back to our success page to confirm your tip</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-coral-100 rounded-full flex items-center justify-center text-coral-600 font-bold text-xs mt-0.5">4</div>
            <p>Get a shiny supporter badge next to your name and a new profile background color!</p>
          </div>
        </div>
      </div>

      {/* Why Support Us */}
      <div className="bg-gradient-to-r from-coral-50 to-teal-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Why Support Squashie?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="space-y-2">
            <p className="flex items-start">
              <span className="w-2 h-2 bg-coral-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Keep our AI mediator plugged in to power.</span>
            </p>
            <p className="flex items-start">
              <span className="w-2 h-2 bg-coral-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Help us add more conflict resolution features</span>
            </p>
            <p className="flex items-start">
              <span className="w-2 h-2 bg-coral-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Support a platform that actually helps people communicate</span>
            </p>
          </div>
          <div className="space-y-2">
            <p className="flex items-start">
              <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Show off your supporter status to other users</span>
            </p>
            <p className="flex items-start">
              <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Feel good about preventing friendship casualties</span>
            </p>
            <p className="flex items-start">
              <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Because therapy is expensive, but tips are cheap</span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          All payments are processed securely through Stripe. 
          Your supporter status will be visible to other users in conflicts and on the leaderboard.
        </p>
      </div>
    </div>
  );
};

export default SupportUsPage;