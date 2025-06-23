import React from 'react';
import { Heart, Sparkles, Calendar } from 'lucide-react';

interface SupporterCardProps {
  supporterLevel: 'tip_1' | 'tip_2' | 'tip_3';
  supporterEmoji: string;
  supporterSince: string;
  className?: string;
}

const SupporterCard: React.FC<SupporterCardProps> = ({
  supporterLevel,
  supporterEmoji,
  supporterSince,
  className = ''
}) => {
  const supporterConfig = {
    tip_1: {
      title: 'Band-Aid Buyer',
      gradient: 'bg-gradient-to-r from-emerald-100 to-emerald-300',
      borderColor: 'border-emerald-300',
      textColor: 'text-emerald-800',
      blurb: 'Thanks for patching up our server costs! 🩹'
    },
    tip_2: {
      title: "I'm the Problem",
      gradient: 'bg-gradient-to-r from-pink-100 to-pink-400',
      borderColor: 'border-pink-300',
      textColor: 'text-pink-800',
      blurb: 'Self-awareness is the first step to recovery! 💅'
    },
    tip_3: {
      title: 'Chaos Patron',
      gradient: 'bg-gradient-to-r from-yellow-100 to-red-400',
      borderColor: 'border-orange-300',
      textColor: 'text-orange-900',
      blurb: 'You create drama, we solve it. Fair trade! 🔥👑'
    }
  };

  const config = supporterConfig[supporterLevel];
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`${config.gradient} p-6 rounded-xl border-2 ${config.borderColor} shadow-lg relative overflow-hidden ${className}`}>
      {/* Decorative sparkles */}
      <div className="absolute top-2 right-2 opacity-30">
        <Sparkles className="h-6 w-6 text-white" />
      </div>
      <div className="absolute bottom-2 left-2 opacity-20">
        <Heart className="h-4 w-4 text-white" />
      </div>
      
      <div className="relative z-10">
        {/* Badge Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="text-4xl">{supporterEmoji}</div>
          <div>
            <h3 className={`text-xl font-bold ${config.textColor}`}>
              {config.title}
            </h3>
            <div className="flex items-center space-x-1 text-sm opacity-80">
              <Calendar className="h-3 w-3" />
              <span className={config.textColor}>
                Since {formatDate(supporterSince)}
              </span>
            </div>
          </div>
        </div>

        {/* Blurb */}
        <div className={`${config.textColor} text-sm font-medium opacity-90 italic`}>
          {config.blurb}
        </div>

        {/* Supporter Badge */}
        <div className="mt-4 inline-flex items-center space-x-2 bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full">
          <Sparkles className="h-4 w-4 text-yellow-600" />
          <span className={`text-sm font-semibold ${config.textColor}`}>
            Official Supporter
          </span>
        </div>
      </div>
    </div>
  );
};

export default SupporterCard;