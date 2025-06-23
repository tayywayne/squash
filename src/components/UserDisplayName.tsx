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
    <span className={className}>
      {displayName}
      {showEmoji && archetypeEmoji && (
        <span className="ml-1" title="Conflict Archetype">
          {archetypeEmoji}
        </span>
      )}
      {showSupporterEmoji && supporterEmoji && (
        <span className="ml-1" title="Supporter">
          {supporterEmoji}
        </span>
      )}
    </span>
  );
};

export default UserDisplayName;