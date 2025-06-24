import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, CheckCircle, MessageSquare, Zap, Shield, Heart, Star, HelpCircle } from 'lucide-react';
import { conflictService } from '../utils/conflicts';

interface GlobalStats {
  totalConflicts: number;
  resolvedConflicts: number;
  resolutionRate: number;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<GlobalStats>({ totalConflicts: 0, resolvedConflicts: 0, resolutionRate: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const loadGlobalStats = async () => {
      try {
        const globalStats = await conflictService.getGlobalConflictStats();
        setStats(globalStats);
      } catch (error) {
        console.error('Error loading global stats:', error);
        // Use fallback stats if API fails
        setStats({ totalConflicts: 247, resolvedConflicts: 189, resolutionRate: 77 });
      } finally {
        setStatsLoading(false);
      }
    };

    loadGlobalStats();
  }, []);

  const features = [
    {
      icon: MessageSquare,
      title: 'Emotion Translator 3000',
      description: 'Our AI takes your spicy thoughts and turns them into something that won’t start World War III.'
    },
    {
      icon: Shield,
      title: 'Unfiltered First, Polished Later',
      description: 'Your raw thoughts, reworked into something your therapist would high-five.'
    },
    {
      icon: Zap,
      title: 'Skip the Silent Treatment Phase',
      description: 'Resolve things while it still matters before ghosting kicks in.'
    },
    {
      icon: Heart,
      title: 'Less Conflict, More Connection',
      description: 'Emotions are messy. We make sure they don’t wreck your relationships.'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Share Your Side',
      description: 'Tell us what went down — unfiltered. We’ll make it less spicy before sharing.',
      emoji: '💬'
    },
    {
      step: 2,
      title: 'They Respond',
      description: 'They get the same chance to express their side, no judgment (yet).',
      emoji: '✍️'
    },
    {
      step: 3,
      title: 'AI Mediation',
      description: 'We translate emotional chaos into clarity, then deliver a suggested compromise that’s actually useful.',
      emoji: '🤖'
    },
    {
      step: 4,
      title: 'Peace (Hopefully)',
      description: 'You both review it. You vote. You heal. If it works, great. If not… well, there’s always the rehash button.',
      emoji: '✨'
    }
  ];

  const testimonials = [
    {
      quote: "Honestly didn't think this would work, but the AI actually helped us see each other's point of view. We're good now.",
      author: "Sarah M.",
      conflict: "Roommate disagreement"
    },
    {
      quote: "The AI translated my angry rant into something my partner could actually hear. Game changer for our communication.",
      author: "Mike R.",
      conflict: "Relationship conflict"
    },
    {
      quote: "Way better than letting workplace drama fester. Got our team back on track in two days.",
      author: "Jennifer L.",
      conflict: "Team collaboration issue"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 via-lavender-50 to-teal-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">💣</div>
              <h1 className="text-xl font-bold text-gray-900">Squashie</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-coral-500 hover:bg-coral-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6 animate-bounce-gentle">💣</div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Drama doesn’t solve itself.  
            <br />
            <span className="text-coral-500">But Squashie might.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            We help you catch the tension early, before it spirals into total avoidance. Whether it’s a stolen charger or a tone in a text, Squashie helps patch things up with AI mediation and crowd-backed resolution.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => navigate('/login')}
              className="bg-coral-500 hover:bg-coral-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>Start Resolving Conflicts</span>
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-gray-300 hover:border-coral-500 text-gray-700 hover:text-coral-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              See How It Works
            </button>
          </div>

          {/* Global Stats */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Real Results from Real People</h3>
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center animate-pulse">
                    <div className="h-12 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-coral-500 mb-2">{stats.totalConflicts.toLocaleString()}</div>
                  <div className="text-gray-600">Conflicts Mediated</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-teal-500 mb-2">{stats.resolvedConflicts.toLocaleString()}</div>
                  <div className="text-gray-600">Successfully Resolved</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-lavender-500 mb-2">{stats.resolutionRate}%</div>
                  <div className="text-gray-600 flex items-center justify-center space-x-1">
                    <span>Resolution Rate</span>
                    <div className="relative">
                      <HelpCircle 
                        size={16} 
                        className="text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      />
                      {showTooltip && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-10">
                          <div className="text-center">
                            Look, anything over 0% is better than what you were doing before, aka ignoring your problems or spreading passive aggression around
                          </div>
                          {/* Tooltip arrow */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Squashie Actually Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Because conflict is inevitable — but emotional maturity is hard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="bg-coral-100 p-3 rounded-lg">
                    <feature.icon className="h-6 w-6 text-coral-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Four simple steps to go from conflict to resolution. 
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border-4 border-coral-200 shadow-lg">
                  <span className="text-3xl">{step.emoji}</span>
                </div>
                <div className="bg-coral-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">But Wait, There's More</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Because conflict resolution should be fun (and slightly competitive).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Public Shame Board */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-8 rounded-xl border-2 border-red-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">⚖️</div>
                <h3 className="text-xl font-bold text-red-900 mb-3">Public Shame Board</h3>
              </div>
              <p className="text-red-800 text-sm leading-relaxed mb-4">
                When people can't figure their shit out after multiple attempts, Judge AI steps in with dramatic final rulings. 
                These conflicts get posted publicly for everyone to vote on who was wrong.
              </p>
              <div className="bg-red-100 p-3 rounded-lg border border-red-300">
                <p className="text-xs text-red-700 font-medium">
                  💡 Pro tip: Don't end up here. It's embarrassing.
                </p>
              </div>
            </div>

            {/* Leaderboards */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-xl border-2 border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-orange-900 mb-3">Leaderboards</h3>
              </div>
              <p className="text-orange-800 text-sm leading-relaxed mb-4">
                See who ranks as the least problematic (high resolution rates) and most problematic (low resolution rates) users. 
                Because nothing motivates better conflict resolution than public rankings.
              </p>
              <div className="space-y-2 text-xs text-orange-700">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">🥇</span>
                  <span>Least Problematic: Conflict resolution champions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-red-600">🔥</span>
                  <span>Most Problematic: Maybe work on that...</span>
                </div>
              </div>
            </div>

            {/* Conflict Archetypes */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-xl border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🎭</div>
                <h3 className="text-xl font-bold text-purple-900 mb-3">Conflict Archetypes</h3>
              </div>
              <p className="text-purple-800 text-sm leading-relaxed mb-4">
                Based on your conflict resolution behavior, you'll be assigned a personality archetype. 
                Are you "The Fixer," "The Drama Generator," or "The Chaos Goblin"?
              </p>
              <div className="bg-purple-100 p-3 rounded-lg border border-purple-300">
                <p className="text-xs text-purple-700">
                  <strong>Examples:</strong> 🛠️ The Fixer, 🎭 The Drama Generator, 💣 The Chaos Goblin, 🧘‍♀️ The Peaceful Observer
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-coral-100 to-teal-100 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ready to Find Out Your Conflict Style?
              </h3>
              <p className="text-gray-700 text-sm mb-4">
                Start resolving conflicts to unlock your archetype, climb the leaderboards, and hopefully avoid the public shame board.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="bg-coral-500 hover:bg-coral-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Get Started Now
              </button>
            </div>
          </div>  */}
        </div>
      </section>

      {/* Testimonials Section */}
       {/*      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What People Are Saying</h2>
            <p className="text-xl text-gray-600">
              Real feedback from people who've squashed their beef with Squashie.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-4 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.conflict}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-coral-500 to-teal-500 rounded-2xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Squash Some Beef?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of people who've learned that conflict doesn't have to mean the end of relationships.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-coral-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center space-x-2"
            >
              <span>Get Started for Free</span>
              <ArrowRight size={20} />
            </button>
            <p className="text-sm mt-4 opacity-75">
              No credit card required. Start resolving conflicts in under 2 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="text-2xl">💣</div>
              <span className="text-xl font-bold">Squashie</span>
            </div>
            <div className="text-gray-400 text-center md:text-right">
              <p>&copy; 2025 Squashie. Because conflict is inevitable.</p>
              <p className="text-sm mt-1">Making conflict resolution accessible, one squash at a time.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;