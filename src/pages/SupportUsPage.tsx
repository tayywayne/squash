import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ExternalLink, Gift, Crown, Ban as Bandage } from 'lucide-react';

const SupportUsPage: React.FC = () => {
  const navigate = useNavigate();

  const supportTiers = [
    {
      id: 'tip_1',
      name: 'Buy Us a Band-Aid',
      emoji: '🩹',
      price: '$1',
      description: 'For when we helped patch up a tiny disagreement',
      stripeUrl: 'https://buy.stripe.com/test_9B6aEZ51rdSBczi5IS77O02',
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
      stripeUrl: 'https://buy.stripe.com/test_00w9AV8dD29Tara2wG77O01',
      icon: Heart,
      color: 'from-pink-400 to-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      id: 'tip_3',
      name: 'Chaos Patron',
      emoji: '🔥👑',
      price: '$10',
      description: 'You create drama, we solve it. Fair trade.',
      stripeUrl: 'https://buy.stripe.com/test_3cIeVfgK9bKt9n68V477O00',
      icon: Crown,
      color: 'from-orange-400 to-red-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
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
            
            <a
              href={tier.stripeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full bg-gradient-to-r ${tier.color} hover:opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 group`}
            >
              <span>{tier.emoji} {tier.name} – {tier.price}</span>
              <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        ))}
      </div>

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
            <p>Get a shiny supporter badge next to your name across the app!</p>
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
              <span>Keep our AI mediator caffeinated and sassy</span>
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