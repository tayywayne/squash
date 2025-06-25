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
      title: 'BAND-AID BUYER',
      bgColor: 'bg-primary',
      textColor: 'text-text',
      blurb: 'Thanks for patching up our server costs! 🩹'
    },
    tip_2: {
      title: "I'M THE PROBLEM",
      bgColor: 'bg-accent', 
      textColor: 'text-text',
      blurb: 'Self-awareness is the first step to recovery! 💅'
    },
    tip_3: {
      title: 'CHAOS PATRON',
      bgColor: 'bg-warning',
      textColor: 'text-dark',
      blurb: 'You create drama, we solve it. Fair trade! 👑'
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
    <div className={`${config.bgColor} p-6 border-3 border-black shadow-brutal relative overflow-hidden ${className}`}>
      {/* Decorative elements */}
      <div className="absolute top-2 right-2">
        <Sparkles className="h-6 w-6 text-text" />
      </div>
      <div className="absolute bottom-2 left-2">
        <Heart className="h-4 w-4 text-text" />
      </div>
      
      <div className="relative z-10">
        {/* Badge Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="text-4xl">{supporterEmoji}</div>
          <div>
            <h3 className={`text-xl font-black ${config.textColor}`}>
              {config.title}
            </h3>
            <div className="flex items-center space-x-1 text-sm">
              <Calendar className="h-3 w-3" />
              <span className={`${config.textColor} font-bold`}>
                Since {formatDate(supporterSince)}
              </span>
            </div>
          </div>
        </div>

        {/* Blurb */}
        <div className={`${config.textColor} text-sm font-bold italic`}>
          {config.blurb}
        </div>

        {/* Supporter Badge */}
        <div className="mt-4 inline-flex items-center space-x-2 bg-white border-2 border-black px-3 py-1">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className={`text-sm font-black text-dark-teal`}>
          <span className={`text-sm font-black text-dark`}>
            OFFICIAL SUPPORTER
          </span>
        </div>
      </div>
    </div>
  );
};

export default SupporterCard;
  )
}