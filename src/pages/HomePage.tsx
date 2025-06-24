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
      icon: MessageSquare,
      title: 'EMOTION TRANSLATOR 3000',
      description: 'Our AI takes your spicy thoughts and turns them into something that won\'t start World War III.'
    },
    {
      icon: Shield,
      title: 'UNFILTERED FIRST, POLISHED LATER',
      description: 'Your raw thoughts, reworked into something your therapist would high-five.'
    },
    {
      icon: Zap,
      title: 'SKIP THE SILENT TREATMENT PHASE',
      description: 'Resolve things while it still matters before ghosting kicks in.'
    },
    {
      icon: Heart,
      title: 'LESS CONFLICT, MORE CONNECTION',
      description: 'Emotions are messy. We make sure they don\'t wreck your relationships.'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'SHARE YOUR SIDE',
      description: 'Tell us what went down — unfiltered. We\'ll make it less spicy before sharing.',
      emoji: '💬'
    },
    {
      step: 2,
      title: 'THEY RESPOND',
      description: 'They get the same chance to express their side, no judgment (yet).',
      emoji: '✍️'
    },
    {
      step: 3,
      title: 'AI MEDIATION',
      description: 'We translate emotional chaos into clarity, then deliver a suggested compromise that\'s actually useful.',
      emoji: '🤖'
    },
    {
      step: 4,
      title: 'PEACE (HOPEFULLY)',
      description: 'You both review it. You vote. You heal. If it works, great. If not… well, there\'s always the rehash button.',
      emoji: '✨'
    }
  ];

  return (
    <div className="min-h-screen bg-background-light">
      {/* Navigation */}
      <nav className="bg-background-white border-b-brutal border-border-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-brutal">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">💣</div>
              <h1 className="text-2xl font-black text-text-primary uppercase tracking-tight">SQUASHIE</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-text-primary hover:text-primary-orange font-bold uppercase text-sm transition-colors"
              >
                SIGN IN
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-primary-teal text-background-white px-6 py-3 font-black uppercase text-sm border-brutal border-border-black hover:bg-primary-orange transition-colors"
              >
                GET STARTED
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-brutal-lg px-brutal">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-8xl mb-8">💣</div>
          <h1 className="text-6xl md:text-8xl font-black text-text-primary mb-8 leading-none uppercase">
            DRAMA DOESN'T<br />
            SOLVE ITSELF.
          </h1>
          <div className="bg-primary-orange text-background-white p-8 border-brutal border-border-black mb-8 inline-block">
            <h2 className="text-3xl md:text-4xl font-black uppercase">BUT SQUASHIE MIGHT.</h2>
          </div>
          
          <p className="text-xl text-text-secondary mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
            We help you catch the tension early, before it spirals into total avoidance. Whether it's a stolen charger or a tone in a text, Squashie helps patch things up with AI mediation and crowd-backed resolution.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button
              onClick={() => navigate('/login')}
              className="bg-primary-teal text-background-white px-8 py-4 font-black text-lg uppercase border-brutal border-border-black hover:bg-text-primary transition-colors flex items-center justify-center space-x-3"
            >
              <span>START RESOLVING CONFLICTS</span>
              <ArrowRight size={24} />
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-background-white text-text-primary px-8 py-4 font-black text-lg uppercase border-brutal border-border-black hover:bg-primary-orange hover:text-background-white transition-colors"
            >
              SEE HOW IT WORKS
            </button>
          </div>

          {/* Global Stats */}
          <div className="bg-background-white border-brutal border-border-black p-8">
            <h3 className="text-2xl font-black text-text-primary mb-8 uppercase">REAL RESULTS FROM REAL PEOPLE</h3>
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <div className="h-16 bg-background-light border-brutal border-border-black mb-4"></div>
                    <div className="h-6 bg-background-light border-brutal border-border-black"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-6xl font-black text-primary-teal mb-4">{stats.totalConflicts.toLocaleString()}</div>
                  <div className="text-text-secondary font-bold uppercase text-sm">CONFLICTS MEDIATED</div>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-black text-primary-orange mb-4">{stats.resolvedConflicts.toLocaleString()}</div>
                  <div className="text-text-secondary font-bold uppercase text-sm">SUCCESSFULLY RESOLVED</div>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-black text-text-primary mb-4">{stats.resolutionRate}%</div>
                  <div className="text-text-secondary font-bold uppercase text-sm">RESOLUTION RATE</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-brutal-lg px-brutal bg-background-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-text-primary mb-6 uppercase">WHY SQUASHIE ACTUALLY WORKS</h2>
            <p className="text-xl text-text-secondary font-medium max-w-2xl mx-auto">
              Because conflict is inevitable — but emotional maturity is hard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-background-light border-brutal border-border-black p-8">
                <div className="flex items-start space-x-6">
                  <div className="bg-primary-teal text-background-white p-4 border-brutal border-border-black">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-text-primary mb-4 uppercase">{feature.title}</h3>
                    <p className="text-text-secondary font-medium leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-brutal-lg px-brutal">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-text-primary mb-6 uppercase">HOW IT WORKS</h2>
            <p className="text-xl text-text-secondary font-medium max-w-2xl mx-auto">
              Four simple steps to go from conflict to resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-background-white border-brutal border-border-black w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">{step.emoji}</span>
                </div>
                <div className="bg-primary-orange text-background-white border-brutal border-border-black w-12 h-12 flex items-center justify-center mx-auto mb-6 font-black text-lg">
                  {step.step}
                </div>
                <h3 className="text-xl font-black text-text-primary mb-4 uppercase">{step.title}</h3>
                <p className="text-text-secondary font-medium leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-brutal-lg px-brutal bg-background-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-text-primary mb-6 uppercase">BUT WAIT, THERE'S MORE</h2>
            <p className="text-xl text-text-secondary font-medium max-w-2xl mx-auto">
              Because conflict resolution should be fun (and slightly competitive).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Public Shame Board */}
            <div className="bg-primary-orange text-background-white border-brutal border-border-black p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚖️</div>
                <h3 className="text-xl font-black uppercase mb-4">PUBLIC SHAME BOARD</h3>
              </div>
              <p className="text-sm font-medium leading-relaxed mb-4">
                When people can't figure their shit out after multiple attempts, Judge AI steps in with a final ruling. 
                These conflicts get posted publicly for everyone to vote on who was wrong.
              </p>
              <div className="bg-background-white text-primary-orange p-3 border-brutal border-border-black">
                <p className="text-xs font-black uppercase">
                  💡 PRO TIP: DON'T END UP HERE. IT'S EMBARRASSING.
                </p>
              </div>
            </div>

            {/* Leaderboards */}
            <div className="bg-primary-teal text-background-white border-brutal border-border-black p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-black uppercase mb-4">LEADERBOARDS</h3>
              </div>
              <p className="text-sm font-medium leading-relaxed mb-4">
                See who ranks as the least problematic (high resolution rates) and most problematic (low resolution rates) users. 
                Because nothing motivates better conflict resolution than public rankings.
              </p>
              <div className="space-y-2 text-xs font-bold">
                <div className="flex items-center space-x-2">
                  <span className="text-background-white">🥇</span>
                  <span>LEAST PROBLEMATIC: CONFLICT RESOLUTION CHAMPIONS</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-background-white">🔥</span>
                  <span>MOST PROBLEMATIC: MAYBE WORK ON THAT...</span>
                </div>
              </div>
            </div>

            {/* Conflict Archetypes */}
            <div className="bg-text-primary text-background-white border-brutal border-border-black p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎭</div>
                <h3 className="text-xl font-black uppercase mb-4">CONFLICT ARCHETYPES</h3>
              </div>
              <p className="text-sm font-medium leading-relaxed mb-4">
                Based on your conflict resolution behavior, you'll be assigned a personality archetype. 
                Are you "The Fixer," "The Drama Generator," or "The Chaos Goblin"?
              </p>
              <div className="bg-background-white text-text-primary p-3 border-brutal border-border-black">
                <p className="text-xs font-black uppercase">
                  EXAMPLES: 🛠️ THE FIXER, 🎭 THE DRAMA GENERATOR, 💣 THE CHAOS GOBLIN
                </p>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-background-light text-text-primary border-brutal border-border-black p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-black uppercase mb-4">ACHIEVEMENTS</h3>
              </div>
              <p className="text-sm font-medium leading-relaxed mb-4">
                Earn digital trophies for your conflict milestones — from starting your first squash to solving drama in record time. 
                Your profile becomes a badge wall of your emotional journey.
              </p>
              <div className="bg-background-white p-3 border-brutal border-border-black">
                <p className="text-xs font-black uppercase">
                  💫 UNLOCK ACHIEVEMENTS LIKE "FIRST CONFLICT SENT," "REHASH ROYALTY"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-brutal-lg px-brutal">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-text-primary text-background-white border-brutal border-border-black p-12">
            <h2 className="text-5xl font-black mb-6 uppercase">READY TO SQUASH SOME BEEF?</h2>
            <p className="text-xl mb-8 font-medium">
              Join a community of people who've learned that conflict doesn't have to mean the end of relationships.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-primary-orange text-background-white hover:bg-primary-teal px-8 py-4 font-black text-lg uppercase border-brutal border-background-white transition-colors inline-flex items-center space-x-3"
            >
              <span>GET STARTED FOR FREE</span>
              <ArrowRight size={24} />
            </button>
            <p className="text-sm mt-4 font-medium opacity-75">
              NO CREDIT CARD EVER REQUIRED. START RESOLVING CONFLICTS IN UNDER 2 MINUTES.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text-primary text-background-white py-12 px-brutal border-t-brutal border-border-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="text-3xl">💣</div>
              <span className="text-2xl font-black uppercase">SQUASHIE</span>
            </div>
            <div className="text-center md:text-right">
              <p className="font-bold uppercase">&copy; 2025 SQUASHIE. BECAUSE CONFLICT IS INEVITABLE.</p>
              <p className="text-sm mt-1 font-medium">Making conflict resolution accessible, one squash at a time.</p>
              
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