import React, { useState, useEffect } from 'react';
import { X, ArrowRight, MessageSquare, Brain, Award, Scale, Smile, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../utils/supabase';

interface OnboardingStep {
  title: string;
  emoji: string;
  content: React.ReactNode;
}

const OnboardingFlow: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const { user, updateProfile } = useAuth();

  useEffect(() => {
    // Check if user has completed onboarding
    if (user && user.id && user.onboarding_complete === false) {
      // Delay showing the onboarding to ensure the dashboard is loaded first
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleClose = async () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      
      // Mark onboarding as complete
      if (user?.id) {
        updateProfile({ onboarding_complete: true });
      }
    }, 300);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const steps: OnboardingStep[] = [
    {
      title: "Welcome to Squashie 💥",
      emoji: "💣",
      content: (
        <div>
          <p className="text-dark-teal font-bold mb-4">
            Squashie is your petty, emotionally evolved conflict resolution assistant. We help you squash drama, track your growth, and sometimes publicly shame you. Let's show you around.
          </p>
          <div className="bg-lime-chartreuse p-3 border-2 border-black">
            <p className="text-dark-teal text-sm font-bold">
              <span className="text-xl mr-2">💡</span>
              Think of us as the friend who tells you when you're being ridiculous, but in a way that actually helps.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Start Some Trouble",
      emoji: "💬",
      content: (
        <div>
          <p className="text-dark-teal font-bold mb-4">
            Got unresolved beef with a friend, roommate, coworker, or ghoster? Head to the "Start Conflict" button and spill the tea. You can go full unfiltered — we'll make it kind later.
          </p>
          <div className="bg-vivid-orange p-3 border-2 border-black">
            <p className="text-white text-sm font-bold">
              <span className="text-xl mr-2">🔥</span>
              Yes, you can write "WTF WERE YOU THINKING???" and we'll translate it to "I'm confused by your decision-making process."
            </p>
          </div>
          <div className="mt-4 flex items-center justify-center">
            <div className="bg-vivid-orange text-white px-4 py-2 border-3 border-black shadow-brutal">
              <span className="font-black">START NEW CONFLICT</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Don't Worry, We Translate Angry",
      emoji: "🧠",
      content: (
        <div>
          <p className="text-dark-teal font-bold mb-4">
            Our AI reads your messy text and turns it into something thoughtful and calm (even if you weren't). Both sides get a translated version. The raw stuff? Private, always.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-100 p-3 border-2 border-black">
              <p className="text-xs font-bold text-dark-teal">YOU WROTE:</p>
              <p className="text-sm italic">You ALWAYS leave dishes in the sink and it's driving me INSANE!!!</p>
            </div>
            <div className="bg-lime-chartreuse p-3 border-2 border-black">
              <p className="text-xs font-bold text-dark-teal">WE SENT:</p>
              <p className="text-sm">I'm feeling frustrated about the dishes being left in the sink regularly. It's becoming a concern for me.</p>
            </div>
          </div>
          <p className="text-dark-teal text-sm font-bold">
            <span className="text-xl">✨</span> Magic, right? We're basically couples therapy, but for everyone.
          </p>
        </div>
      )
    },
    {
      title: "Be Petty. Earn Points.",
      emoji: "🏆",
      content: (
        <div>
          <p className="text-dark-teal font-bold mb-4">
            You earn SquashCred and unlock Achievements for starting, resolving, and voting on conflicts. Yes, there's a leaderboard. Yes, being dramatic can get you points.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="bg-vivid-orange text-white p-2 border-2 border-black text-xs font-bold">
              <span className="mr-1">📬</span> First Conflict Sent
            </div>
            <div className="bg-vivid-orange text-white p-2 border-2 border-black text-xs font-bold">
              <span className="mr-1">🤝</span> Solved in Stage 1
            </div>
            <div className="bg-vivid-orange text-white p-2 border-2 border-black text-xs font-bold">
              <span className="mr-1">🔁</span> Rehashed Reality
            </div>
            <div className="bg-vivid-orange text-white p-2 border-2 border-black text-xs font-bold">
              <span className="mr-1">🧠</span> Core Issue Unlocked
            </div>
          </div>
          <div className="bg-dark-teal p-3 border-2 border-black">
            <p className="text-lime-chartreuse text-sm font-bold">
              <span className="text-xl mr-2">💰</span>
              SquashCred is our totally made-up currency that somehow still matters. Like Bitcoin, but for emotional intelligence.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Fail to Resolve? We Tell Everyone.",
      emoji: "⚖️",
      content: (
        <div>
          <p className="text-dark-teal font-bold mb-4">
            If your conflict survives two AI rehashes, it goes to the Public Shame Board for a final AI ruling — and public voting. Don't worry. Only everyone will see it.
          </p>
          <div className="bg-dark-teal p-4 border-2 border-black mb-4">
            <p className="text-white text-sm font-bold italic">
              "After careful consideration, I find that BOTH parties are being ridiculous. One of you needs therapy, and the other needs to learn what 'compromise' means. Case closed!"
            </p>
            <p className="text-lime-chartreuse text-xs font-bold text-right">— Judge AI</p>
          </div>
          <div className="flex justify-between items-center">
            <div className="bg-lime-chartreuse p-2 border-2 border-black text-xs font-bold text-dark-teal">
              <span className="mr-1">🙃</span> Both Wrong: 42
            </div>
            <div className="bg-lime-chartreuse p-2 border-2 border-black text-xs font-bold text-dark-teal">
              <span className="mr-1">🛋️</span> Get Therapy: 28
            </div>
          </div>
        </div>
      )
    },
    {
      title: "What Kind of Conflict Creature Are You?",
      emoji: "🎭",
      content: (
        <div>
          <p className="text-dark-teal font-bold mb-4">
            You'll get an archetype badge based on how you handle conflict. It can change over time. Collect them all. Judge yourself before others do.
          </p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-lime-chartreuse p-2 border-2 border-black text-center">
              <div className="text-2xl">🛠️</div>
              <p className="text-xs font-bold text-dark-teal">The Fixer</p>
            </div>
            <div className="bg-lime-chartreuse p-2 border-2 border-black text-center">
              <div className="text-2xl">🎭</div>
              <p className="text-xs font-bold text-dark-teal">Drama Generator</p>
            </div>
            <div className="bg-lime-chartreuse p-2 border-2 border-black text-center">
              <div className="text-2xl">💣</div>
              <p className="text-xs font-bold text-dark-teal">Chaos Goblin</p>
            </div>
          </div>
          <p className="text-dark-teal text-sm font-bold">
            <span className="text-xl">🔮</span> Your archetype appears next to your name. Choose your chaos wisely.
          </p>
        </div>
      )
    },
    {
      title: "You're Ready(ish)",
      emoji: "✅",
      content: (
        <div>
          <p className="text-dark-teal font-bold mb-4">
            You're in. Go squash some beef, solve some drama, and maybe learn something about yourself along the way.
          </p>
          <div className="bg-vivid-orange p-4 border-2 border-black mb-4">
            <p className="text-white text-sm font-bold">
              <span className="text-xl mr-2">💡</span>
              Pro tip: The "Start New Conflict" button is your gateway to either resolution or public humiliation. Choose wisely.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-bounce">
              <div className="text-4xl">🚀</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute inset-0 bg-black/50" onClick={handleClose}></div>
      
      <div className="relative bg-white border-3 border-black shadow-brutal-lg max-w-md w-full transform transition-all duration-300 animate-scale-in">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gray-200">
          <div 
            className="h-full bg-lime-chartreuse transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-3 border-black">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{steps[currentStep].emoji}</div>
            <h2 className="text-xl font-black text-dark-teal">{steps[currentStep].title}</h2>
          </div>
          <button 
            onClick={handleClose}
            className="text-dark-teal hover:text-vivid-orange transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {steps[currentStep].content}
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t-3 border-black">
          <div className="text-sm text-dark-teal font-bold">
            Step {currentStep + 1} of {steps.length}
          </div>
          <button
            onClick={handleNext}
            className="bg-vivid-orange hover:bg-orange-600 text-white px-4 py-2 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 flex items-center space-x-2"
          >
            <span>{currentStep < steps.length - 1 ? 'NEXT' : 'GET STARTED'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;