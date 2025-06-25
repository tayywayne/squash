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
      name: 'BUY US A BAND-AID',
      emoji: '🩹',
      price: '$1',
      description: 'For when we helped patch up a tiny disagreement',
      icon: Bandage,
      color: 'bg-green-teal',
      textColor: 'text-white',
      borderColor: 'border-black'
    },
    {
      id: 'tip_2',
      name: "I'M THE PROBLEM",
      emoji: '💅',
      price: '$5',
      description: 'Admitting you were wrong? That takes courage (and cash)',
      icon: Heart,
      color: 'bg-vivid-orange',
      textColor: 'text-white',
      borderColor: 'border-black'
    },
    {
      id: 'tip_3',
      name: 'CHAOS PATRON',
      emoji: '👑',
      price: '$10',
      description: 'You create drama, we solve it. Fair trade.',
      icon: Crown,
      color: 'bg-lime-chartreuse',
      textColor: 'text-dark-teal',
      borderColor: 'border-black'
    }
  ];

  const handleTipClick = async (tierId: string) => {
    if (!user) {
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
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-dark-teal hover:text-vivid-orange mb-6 transition-colors font-black"
        >
          <ArrowLeft size={20} />
          <span>BACK TO DASHBOARD</span>
        </button>
        
        <div className="text-center">
          <div className="text-6xl mb-4">💝</div>
          <h1 className="text-4xl font-black text-dark-teal mb-4 border-b-3 border-black pb-2">
            SUPPORT SQUASHIE
          </h1>
          <p className="text-xl text-dark-teal font-bold max-w-2xl mx-auto leading-relaxed">
            Did we help you avoid a friendship apocalypse? Prevent a roommate war? 
            Keep your group chat from imploding? Show some love!
          </p>
        </div>
      </div>

      {/* Support Tiers */}
      <div className="space-y-6 mb-8">
        {supportTiers.map((tier) => (
          <div key={tier.id} className={`${tier.color} p-6 border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1`}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="text-5xl">{tier.emoji}</div>
                <div>
                  <h3 className={`text-2xl font-black ${tier.textColor} mb-2`}>{tier.name}</h3>
                  <div className={`text-3xl font-black ${tier.textColor} mb-3`}>
                    {tier.price}
                  </div>
                  <p className={`text-sm ${tier.textColor} font-bold leading-relaxed`}>
                    {tier.description}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => handleTipClick(tier.id)}
                disabled={loading === tier.id || !user}
                className={`bg-white hover:bg-gray-100 text-dark-teal font-black py-3 px-6 border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {loading === tier.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-3 border-dark-teal border-t-transparent"></div>
                    <span>PROCESSING...</span>
                  </>
                ) : (
                  <>
                    <span>SUPPORT {tier.price}</span>
                    <ExternalLink size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Login Required Notice */}
      {!user && (
        <div className="bg-lime-chartreuse p-6 border-3 border-black shadow-brutal mb-8">
          <h3 className="font-black text-dark-teal mb-2 flex items-center">
            <span className="text-2xl mr-2">🔒</span> LOGIN REQUIRED
          </h3>
          <p className="text-dark-teal font-bold">
            You need to be logged in to support us and get your supporter badge. 
            <button 
              onClick={() => navigate('/login')}
              className="text-vivid-orange hover:text-orange-600 underline ml-1 font-black"
            >
              LOG IN HERE
            </button>
          </p>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-white p-6 border-3 border-black shadow-brutal mb-8">
        <h2 className="text-xl font-black text-dark-teal mb-4 flex items-center">
          <Gift className="h-5 w-5 mr-2 text-vivid-orange" />
          HOW IT WORKS
        </h2>
        <div className="space-y-3 text-dark-teal font-bold">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-lime-chartreuse border-2 border-black flex items-center justify-center text-dark-teal font-black text-xs mt-0.5">1</div>
            <p>Click one of the tip buttons above to go to Stripe checkout</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-lime-chartreuse border-2 border-black flex items-center justify-center text-dark-teal font-black text-xs mt-0.5">2</div>
            <p>Complete your payment securely through Stripe</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-lime-chartreuse border-2 border-black flex items-center justify-center text-dark-teal font-black text-xs mt-0.5">3</div>
            <p>You'll be redirected back to our success page to confirm your tip</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-lime-chartreuse border-2 border-black flex items-center justify-center text-dark-teal font-black text-xs mt-0.5">4</div>
            <p>Get a shiny supporter badge next to your name and a new profile background color!</p>
          </div>
        </div>
      </div>

      {/* Why Support Us */}
      <div className="bg-dark-teal p-6 border-3 border-black shadow-brutal">
        <h2 className="text-xl font-black text-white mb-4">
          WHY SUPPORT SQUASHIE?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white font-bold">
          <div className="space-y-2">
            <p className="flex items-start">
              <span className="w-4 h-4 bg-lime-chartreuse border-2 border-black mt-1 mr-3 flex-shrink-0"></span>
              <span>Keep our AI mediator plugged in to power.</span>
            </p>
            <p className="flex items-start">
              <span className="w-4 h-4 bg-lime-chartreuse border-2 border-black mt-1 mr-3 flex-shrink-0"></span>
              <span>Help us add more conflict resolution features</span>
            </p>
            <p className="flex items-start">
              <span className="w-4 h-4 bg-lime-chartreuse border-2 border-black mt-1 mr-3 flex-shrink-0"></span>
              <span>Support a platform that actually helps people communicate</span>
            </p>
          </div>
          <div className="space-y-2">
            <p className="flex items-start">
              <span className="w-4 h-4 bg-vivid-orange border-2 border-black mt-1 mr-3 flex-shrink-0"></span>
              <span>Show off your supporter status to other users</span>
            </p>
            <p className="flex items-start">
              <span className="w-4 h-4 bg-vivid-orange border-2 border-black mt-1 mr-3 flex-shrink-0"></span>
              <span>Feel good about preventing friendship casualties</span>
            </p>
            <p className="flex items-start">
              <span className="w-4 h-4 bg-vivid-orange border-2 border-black mt-1 mr-3 flex-shrink-0"></span>
              <span>Because therapy is expensive, but tips are cheap</span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-center">
        <p className="text-xs text-dark-teal font-bold">
          All payments are processed securely through Stripe. 
          Your supporter status will be visible to other users in conflicts and on the leaderboard.
        </p>
      </div>
    </div>
  );
};

export default SupportUsPage;