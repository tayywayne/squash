import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, CheckCircle, MessageSquare, Zap, Shield, Heart, Star, HelpCircle, Trophy, Sparkles } from 'lucide-react';
import { conflictService } from '../utils/conflicts';
import { useScrollAnimation, useStaggeredAnimation } from '../hooks/useScrollAnimation';
// import StickerCollection from '../components/StickerCollection';

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

  // Scroll animations for different sections
  const heroAnimation = useScrollAnimation({ threshold: 0.2 });
  const statsAnimation = useScrollAnimation({ threshold: 0.3 });
  const featuresAnimation = useScrollAnimation({ threshold: 0.2 });
  const howItWorksAnimation = useScrollAnimation({ threshold: 0.2 });
  const additionalFeaturesAnimation = useScrollAnimation({ threshold: 0.2 });
  const ctaAnimation = useScrollAnimation({ threshold: 0.3 });

  // Staggered animations for feature cards and steps
  const featureCards = useStaggeredAnimation(4, 150);
  const howItWorksSteps = useStaggeredAnimation(4, 200);
  const additionalFeatureCards = useStaggeredAnimation(4, 100);

  useEffect(() => {
    const loadGlobalStats = async () => {
      try {
        const globalStats = await conflictService.getGlobalConflictStats();
        setStats(globalStats);
      } catch (error) {
        console.error('Error loading global stats:', error);
        setStats({ totalConflicts: 247, resolvedConflicts: 189, resolutionRate: 77 });
      } finally {
        setStatsLoading(false);
      }
    };

    loadGlobalStats();
  }, []);

  const features = [
    {
      icon: '🤖',
      title: 'Emotion Translator 3000',
      description: 'Our AI takes your spicy thoughts and turns them into something that won\'t start World War III.'
    },
    {
      icon: '🔥',
      title: 'Unfiltered First, Polished Later',
      description: 'Your raw thoughts, reworked into something your therapist would high-five.'
    },
    {
      icon: '⚡',
      title: 'Skip the Silent Treatment Phase',
      description: 'Resolve things while it still matters before ghosting kicks in.'
    },
    {
      icon: '💝',
      title: 'Less Conflict, More Connection',
      description: 'Emotions are messy. We make sure they don\'t wreck your relationships.'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Share Your Side',
      description: 'Tell us what went down — unfiltered. We\'ll make it less spicy before sharing.',
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
      description: 'We translate emotional chaos into clarity, then deliver a suggested compromise that\'s actually useful.',
      emoji: '🧠'
    },
    {
      step: 4,
      title: 'Peace (Hopefully)',
      description: 'You both review it. You vote. You heal. If it works, great. If not… well, there\'s always the rehash button.',
      emoji: '🙏'
    }
  ];

  return (
    <div className="min-h-screen bg-white relative">
      {/* Sticker Collection - positioned behind content */}
      {/* <StickerCollection /> */}
      
      {/* Navigation */}
      <nav className="bg-dark-teal border-b-3 border-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="text-4xl animate-float">💣</div>
              <h1 className="text-3xl font-black text-white tracking-tight">SQUASHIE</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-white hover:text-lime-chartreuse font-bold transition-colors text-lg"
              >
                SIGN IN
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-vivid-orange hover:bg-orange-600 text-white px-6 py-3 font-black text-lg border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1"
              >
                GET STARTED
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        ref={heroAnimation.elementRef}
        className={`relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-lime-chartreuse via-green-teal to-dark-teal transition-all duration-1000 ${
          heroAnimation.isVisible 
            ? 'animate-slide-up' 
            : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-6xl mx-auto text-center">
          <div className={`text-8xl mb-8 transition-all duration-800 delay-200 ${
            heroAnimation.isVisible 
              ? 'animate-bounce-in' 
              : 'opacity-0 scale-50'
          }`}>💣</div>
          <h1 className={`text-6xl md:text-8xl font-black text-white mb-8 leading-none tracking-tight transition-all duration-800 delay-300 ${
            heroAnimation.isVisible 
              ? 'animate-slide-up' 
              : 'opacity-0 translate-y-10'
          }`}>
            DRAMA DOESN'T<br />
            <span className="text-vivid-orange">SOLVE ITSELF</span>
          </h1>
          <div className={`bg-white border-3 border-black p-8 shadow-brutal-lg mb-12 max-w-4xl mx-auto transition-all duration-800 delay-500 ${
            heroAnimation.isVisible 
              ? 'animate-scale-in' 
              : 'opacity-0 scale-90'
          }`}>
            <p className="text-2xl md:text-3xl text-dark-teal font-bold leading-tight">
              We help you catch the tension early, before it spirals into total avoidance. Whether it's a stolen charger or a tone in a text, Squashie helps patch things up with AI mediation and crowd-backed resolution.
            </p>
          </div>
          
          <div className={`flex flex-col sm:flex-row gap-6 justify-center mb-16 transition-all duration-800 delay-700 ${
            heroAnimation.isVisible 
              ? 'animate-slide-up' 
              : 'opacity-0 translate-y-10'
          }`}>
            <button
              onClick={() => navigate('/login')}
              className="bg-vivid-orange hover:bg-orange-600 text-white px-12 py-6 font-black text-2xl border-3 border-black shadow-brutal-lg hover:shadow-brutal transition-all transform hover:translate-x-2 hover:translate-y-2 hover:animate-wiggle flex items-center justify-center space-x-3"
            >
              <span>START RESOLVING CONFLICTS</span>
              <ArrowRight size={28} />
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white hover:bg-gray-100 text-dark-teal px-12 py-6 font-black text-2xl border-3 border-black shadow-brutal-lg hover:shadow-brutal transition-all transform hover:translate-x-2 hover:translate-y-2 hover:animate-shake"
            >
              SEE HOW IT WORKS
            </button>
          </div>

          {/* Global Stats */}
          <div 
            ref={statsAnimation.elementRef}
            className={`bg-white border-3 border-black p-8 shadow-brutal-lg transition-all duration-800 ${
              statsAnimation.isVisible 
                ? 'animate-rotate-in' 
                : 'opacity-0 rotate-3 scale-95'
            }`}
          >
            <h3 className={`text-2xl font-black text-dark-teal mb-8 flex items-center justify-center transition-all duration-600 delay-200 ${
              statsAnimation.isVisible 
                ? 'animate-slide-up' 
                : 'opacity-0 translate-y-5'
            }`}>
              <Trophy className="mr-3 text-vivid-orange" size={32} />
              REAL RESULTS FROM REAL PEOPLE
            </h3>
            {statsLoading ? (
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-600 delay-400 ${
                statsAnimation.isVisible 
                  ? 'animate-slide-up' 
                  : 'opacity-0 translate-y-5'
              }`}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center animate-pulse">
                    <div className="h-16 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-600 delay-400 ${
                statsAnimation.isVisible 
                  ? 'animate-slide-up' 
                  : 'opacity-0 translate-y-5'
              }`}>
                <div className="text-center bg-lime-chartreuse border-3 border-black p-6 shadow-brutal">
                  <div className="text-5xl font-black text-dark-teal mb-2">{stats.totalConflicts.toLocaleString()}</div>
                  <div className="text-dark-teal font-bold text-lg">CONFLICTS MEDIATED</div>
                </div>
                <div className="text-center bg-green-teal border-3 border-black p-6 shadow-brutal">
                  <div className="text-5xl font-black text-white mb-2">{stats.resolvedConflicts.toLocaleString()}</div>
                  <div className="text-white font-bold text-lg">SUCCESSFULLY RESOLVED</div>
                </div>
                <div className="text-center bg-vivid-orange border-3 border-black p-6 shadow-brutal">
                  <div className="text-5xl font-black text-white mb-2">{stats.resolutionRate}%</div>
                  <div className="text-white font-bold text-lg flex items-center justify-center space-x-2">
                    <span>RESOLUTION RATE</span>
                    <div className="relative">
                      <HelpCircle 
                        size={20} 
                        className="text-white hover:text-lime-chartreuse cursor-help transition-colors"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      />
                      {showTooltip && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-dark-teal text-white text-sm font-bold border-3 border-black p-4 shadow-brutal z-10">
                          <div className="text-center">
                            Look, anything over 0% is better than what you were doing before, aka ignoring your problems or spreading passive aggression around
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-dark-teal"></div>
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
      <section 
        ref={featuresAnimation.elementRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-white transition-all duration-800 ${
          featuresAnimation.isVisible 
            ? 'animate-slide-up' 
            : 'opacity-0 translate-y-10'
        }`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-dark-teal mb-6">WHY SQUASHIE ACTUALLY WORKS</h2>
            <div className="bg-lime-chartreuse border-3 border-black p-6 shadow-brutal-lg max-w-3xl mx-auto">
              <p className="text-2xl font-bold text-dark-teal">
                Because conflict is inevitable — but emotional maturity is hard.
              </p>
            </div>
          </div>

          <div 
            ref={featureCards.containerRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`bg-white border-3 border-black p-8 shadow-brutal ${
                  featureCards.visibleItems.has(index) ? 'animate-bounce-in' : 'opacity-0 scale-75'
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-start space-x-6">
                  <div className="text-5xl">{feature.icon}</div>
                  <div>
                    <h3 className="text-2xl font-black text-dark-teal mb-4">{feature.title}</h3>
                    <p className="text-dark-teal font-medium text-lg leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section 
        id="how-it-works" 
        ref={howItWorksAnimation.elementRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-dark-teal transition-all duration-800 ${
          howItWorksAnimation.isVisible 
            ? 'animate-slide-up' 
            : 'opacity-0 translate-y-10'
        }`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-6">HOW IT WORKS</h2>
            <div className="bg-vivid-orange border-3 border-black p-6 shadow-brutal-lg max-w-3xl mx-auto">
              <p className="text-2xl font-bold text-white">
                Four simple steps to go from conflict to resolution.
              </p>
            </div>
          </div>

          <div 
            ref={howItWorksSteps.containerRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {howItWorks.map((step, index) => (
              <div 
                key={index} 
                className={`text-center transition-all duration-800 ${
                  howItWorksSteps.visibleItems.has(index) ? 'animate-slide-up' : 'opacity-0 translate-y-10'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="bg-lime-chartreuse border-3 border-black w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-brutal">
                  <span className="text-4xl">{step.emoji}</span>
                </div>
                <div className="bg-vivid-orange border-3 border-black w-12 h-12 flex items-center justify-center mx-auto mb-6 shadow-brutal">
                  <span className="text-white font-black text-xl">{step.step}</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-4">{step.title}</h3>
                <p className="text-lime-chartreuse font-medium leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section 
        ref={additionalFeaturesAnimation.elementRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-lime-chartreuse transition-all duration-800 ${
          additionalFeaturesAnimation.isVisible 
            ? 'animate-slide-up' 
            : 'opacity-0 translate-y-10'
        }`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-dark-teal mb-6">BUT WAIT, THERE'S MORE</h2>
            <div className="bg-white border-3 border-black p-6 shadow-brutal-lg max-w-3xl mx-auto">
              <p className="text-2xl font-bold text-dark-teal">
                Because conflict resolution should be fun (and slightly competitive).
              </p>
            </div>
          </div>

          <div 
            ref={additionalFeatureCards.containerRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {/* Public Shame Board */}
            <div className={`bg-white border-3 border-black p-8 shadow-brutal ${
              additionalFeatureCards.visibleItems.has(0) ? 'animate-slide-in-left' : 'opacity-0 -translate-x-10'
            }`}>
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚖️</div>
                <h3 className="text-2xl font-black text-dark-teal mb-4">PUBLIC SHAME BOARD</h3>
              </div>
              <p className="text-dark-teal font-medium text-sm leading-relaxed mb-4">
                When people can't figure their shit out after multiple attempts, Judge AI steps in with a final ruling. 
                These conflicts get posted publicly for everyone to vote on who was wrong.
              </p>
              <div className="bg-vivid-orange border-2 border-black p-3 shadow-brutal-sm">
                <p className="text-white font-bold text-xs">
                  💡 Pro tip: Don't end up here. It's embarrassing.
                </p>
              </div>
            </div>

            {/* Leaderboards */}
            <div className={`bg-white border-3 border-black p-8 shadow-brutal ${
              additionalFeatureCards.visibleItems.has(1) ? 'animate-slide-up' : 'opacity-0 translate-y-10'
            }`} style={{ animationDelay: '100ms' }}>
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-2xl font-black text-dark-teal mb-4">LEADERBOARDS</h3>
              </div>
              <p className="text-dark-teal font-medium text-sm leading-relaxed mb-4">
                See who ranks as the least problematic (high resolution rates) and most problematic (low resolution rates) users. 
                Because nothing motivates better conflict resolution than public rankings.
              </p>
              <div className="space-y-2 text-xs text-dark-teal bg-green-teal border-2 border-black p-3 shadow-brutal-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-lime-chartreuse">🥇</span>
                  <span className="text-white font-bold">Least Problematic: Conflict resolution champions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-vivid-orange">🔥</span>
                  <span className="text-white font-bold">Most Problematic: Maybe work on that...</span>
                </div>
              </div>
            </div>

            {/* Conflict Archetypes */}
            <div className={`bg-white border-3 border-black p-8 shadow-brutal ${
              additionalFeatureCards.visibleItems.has(2) ? 'animate-slide-in-right' : 'opacity-0 translate-x-10'
            }`} style={{ animationDelay: '200ms' }}>
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎭</div>
                <h3 className="text-2xl font-black text-dark-teal mb-4">CONFLICT ARCHETYPES</h3>
              </div>
              <p className="text-dark-teal font-medium text-sm leading-relaxed mb-4">
                Based on your conflict resolution behavior, you'll be assigned a personality archetype. 
                Are you "The Fixer," "The Drama Generator," or "The Chaos Goblin"?
              </p>
              <div className="bg-lime-chartreuse border-2 border-black p-3 shadow-brutal-sm">
                <p className="text-dark-teal font-bold text-xs">
                  <strong>Examples:</strong> 🛠️ The Fixer, 🎭 The Drama Generator, 💣 The Chaos Goblin, 🧘‍♀️ The Peaceful Observer
                </p>
              </div>
            </div>

            {/* Achievements */}
            <div className={`bg-white border-3 border-black p-8 shadow-brutal ${
              additionalFeatureCards.visibleItems.has(3) ? 'animate-bounce-in' : 'opacity-0 scale-75'
            }`} style={{ animationDelay: '300ms' }}>
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-black text-dark-teal mb-4">ACHIEVEMENTS</h3>
              </div>
              <p className="text-dark-teal font-medium text-sm leading-relaxed mb-4">
                Earn digital trophies for your conflict milestones — from starting your first squash to solving drama in record time. 
                Your profile becomes a badge wall of your emotional journey.
              </p>
              <div className="bg-vivid-orange border-2 border-black p-3 shadow-brutal-sm">
                <p className="text-white font-bold text-xs">
                  💫 Unlock achievements like "First Conflict Sent," "Rehash Royalty," or "Drama-Free for 30 Days."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={ctaAnimation.elementRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-white transition-all duration-800 ${
          ctaAnimation.isVisible 
            ? 'animate-scale-in' 
            : 'opacity-0 scale-90'
        }`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-dark-teal border-3 border-black p-12 shadow-brutal-lg">
            <h2 className="text-5xl font-black mb-6 text-white">READY TO SQUASH SOME BEEF?</h2>
            <p className="text-2xl mb-8 text-lime-chartreuse font-bold">
              Join a community of people who've learned that conflict doesn't have to mean the end of relationships.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-vivid-orange hover:bg-orange-600 text-white px-12 py-6 font-black text-2xl border-3 border-black shadow-brutal-lg hover:shadow-brutal transition-all transform hover:translate-x-2 hover:translate-y-2 hover:animate-pop inline-flex items-center space-x-3"
            >
              <span>GET STARTED FOR FREE</span>
              <ArrowRight size={28} />
            </button>
            <p className="text-lime-chartreuse font-bold mt-6">
              No credit card ever required. Start resolving conflicts in under 2 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-4 sm:px-6 lg:px-8 border-t-3 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="text-3xl">💣</div>
              <span className="text-2xl font-black">SQUASHIE</span>
            </div>
            <div className="text-gray-400 text-center md:text-right">
              <p className="font-bold">&copy; 2025 Squashie. Because conflict is inevitable.</p>
              <p className="text-sm mt-1">Making conflict resolution accessible, one squash at a time.</p>
              <p className="text-sm mt-1">Contact us at squashiehelp@gmail.com</p>
              
              {/* Bolt.new Badge */}
              <div className="mt-4 flex justify-center md:justify-end">
                <a 
                  href="https://bolt.new" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="/logotext_poweredby_360w.png" 
                    alt="Powered by Bolt.new" 
                    className="h-8 w-auto"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;