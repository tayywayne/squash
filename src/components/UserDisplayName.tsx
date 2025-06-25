import React from 'react';

interface UserDisplayNameProps {
  username?: string;
  archetypeEmoji?: string;
  supporterEmoji?: string;
  fallback?: string;
  showEmoji?: boolean;
  showSupporterEmoji?: boolean;
  className?: string;
}

const UserDisplayName: React.FC<UserDisplayNameProps> = ({ 
  username, 
  archetypeEmoji, 
  supporterEmoji,
  fallback = 'Anonymous User',
  showEmoji = true,
  showSupporterEmoji = true,
  className = ''
}) => {
  const displayName = username || fallback;
  
  return (
    <span className={`inline-flex items-center font-bold ${className}`}>
      {displayName}
      {showEmoji && archetypeEmoji && (
        <span className="ml-1 inline-block" title="Conflict Archetype">
          {archetypeEmoji}
        </span>
      )}
      {showSupporterEmoji && supporterEmoji && (
        <span className="ml-1 inline-block animate-pulse" title="Supporter" style={{ filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))' }}>
          {supporterEmoji}
        </span>
      )}
    </span>
  );
};

export default UserDisplayName;