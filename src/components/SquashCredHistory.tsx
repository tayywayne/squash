import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, Coins } from 'lucide-react';
import { squashCredService, SquashCredEvent } from '../utils/squashcred';

interface SquashCredHistoryProps {
  userId: string;
  limit?: number;
  className?: string;
}

const SquashCredHistory: React.FC<SquashCredHistoryProps> = ({
  userId,
  limit = 20,
  className = ''
}) => {
  const [events, setEvents] = useState<SquashCredEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventData = await squashCredService.getUserEvents(userId, limit);
        setEvents(eventData);
      } catch (error) {
        console.error('Error loading SquashCred history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [userId, limit]);

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

  if (loading) {
    return (
      <div className={`bg-white p-6 border-3 border-black shadow-brutal ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Coins className="h-5 w-5 text-vivid-orange" />
          <h3 className="text-lg font-black text-dark-teal">SQUASHCRED HISTORY</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-4 w-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 border-3 border-black shadow-brutal ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Coins className="h-5 w-5 text-vivid-orange" />
        <h3 className="text-lg font-black text-dark-teal">SQUASHCRED HISTORY</h3>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-dark-teal font-bold">
            No SquashCred activity yet. Start resolving conflicts to earn points!
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {events.map((event) => (
            <div key={event.id} className="flex items-center space-x-3 p-3 border-2 border-black">
              {/* Icon */}
              <div className={`flex-shrink-0 p-2 border-2 border-black ${
                event.amount > 0 
                  ? 'bg-lime-chartreuse text-dark-teal' 
                  : 'bg-vivid-orange text-white'
              }`}>
                {event.amount > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-dark-teal truncate">
                  {event.reason}
                </p>
                <div className="flex items-center space-x-2 text-xs text-dark-teal">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(event.created_at)}</span>
                </div>
              </div>

              {/* Points */}
              <div className={`flex-shrink-0 text-sm font-black ${
                event.amount > 0 ? 'text-green-teal' : 'text-vivid-orange'
              }`}>
                {event.amount > 0 ? '+' : ''}{event.amount}
              </div>
            </div>
          ))}
        </div>
      )}

      {events.length >= limit && (
        <div className="mt-4 text-center">
          <p className="text-xs text-dark-teal font-bold">
            Showing last {limit} events
          </p>
        </div>
      )}
    </div>
  );
};

export default SquashCredHistory;