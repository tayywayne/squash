import React, { useState } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DebateInvite } from '../types/debate';
import UserDisplayName from './UserDisplayName';

interface DebateInviteCardProps {
  invite: DebateInvite;
}

const DebateInviteCard: React.FC<DebateInviteCardProps> = ({ invite }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return `${Math.floor(diffInDays / 7)} weeks ago`;
  };
  
  return (
    <div className="bg-white border-3 border-black shadow-brutal mb-4 hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1">
      <div className="p-4 border-b-3 border-black bg-lime-chartreuse">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-dark-teal">{invite.title}</h3>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-dark-teal hover:text-vivid-orange transition-colors"
          >
            {expanded ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 border-b-3 border-black">
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="bg-lime-chartreuse text-dark-teal px-2 py-1 border-2 border-black font-black text-sm">
                {invite.creator_side}
              </div>
              <span className="text-dark-teal font-bold">vs.</span>
              <div className="bg-vivid-orange text-white px-2 py-1 border-2 border-black font-black text-sm">
                {invite.opponent_side}
              </div>
            </div>
            
            <p className="text-dark-teal font-bold mb-2">
              <span className="font-black">From:</span>{' '}
              <UserDisplayName 
                username={invite.creator_username}
                fallback="Another user"
              />
            </p>
            
            <div className="bg-gray-100 p-3 border-2 border-black mb-3">
              <p className="text-dark-teal font-bold">{invite.creator_position}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-dark-teal">
          <Clock size={16} />
          <span className="font-bold">Invited {formatTimeAgo(invite.created_at)}</span>
        </div>
        
        <button
          onClick={() => navigate(`/debates/respond/${invite.id}`)}
          className="bg-vivid-orange hover:bg-orange-600 text-white px-4 py-2 font-black border-2 border-black shadow-brutal-sm hover:shadow-none transition-all transform hover:translate-x-0.5 hover:translate-y-0.5 flex items-center space-x-1"
        >
          <span>RESPOND</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default DebateInviteCard;