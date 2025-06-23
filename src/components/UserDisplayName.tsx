import React from 'react';

interface UserDisplayNameProps {
  username?: string;
  archetypeEmoji?: string;
  fallback?: string;
  showEmoji?: boolean;
  className?: string;
}

const UserDisplayName: React.FC<UserDisplayNameProps> = ({ 
  username, 
  archetypeEmoji, 
  fallback = 'Anonymous User',
  showEmoji = true,
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
    </span>
  );
};

export default UserDisplayName;