import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, History, User, LogOut, Trophy } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import UserDisplayName from './UserDisplayName';
import SquashCredDisplay from './SquashCredDisplay';
import Toast from './Toast';
import AchievementToast from './AchievementToast';
import GeneralAchievementToast from './GeneralAchievementToast';
import { useArchetypeAchievements } from '../hooks/useArchetypeAchievements';
import { useGeneralAchievements } from '../hooks/useGeneralAchievements';
import { archetypeService } from '../utils/archetypes';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const previousArchetypeRef = useRef<string | undefined>(undefined);
  const { pendingNotification, clearNotification } = useArchetypeAchievements();
  const { pendingNotification: pendingGeneralNotification, clearNotification: clearGeneralNotification } = useGeneralAchievements();

  // Watch for archetype changes and show toast notification
  useEffect(() => {
    const currentArchetype = user?.conflict_archetype;
    const previousArchetype = previousArchetypeRef.current;

    // Check if archetype has changed and is not the initial load
    if (currentArchetype && 
        previousArchetype !== undefined && 
        currentArchetype !== previousArchetype) {
      
      // Get archetype info to show in toast
      const archetypeInfo = archetypeService.getArchetypeInfo(currentArchetype);
      
      if (archetypeInfo) {
        setToast({
          message: `🎭 Your conflict archetype has been updated to: ${archetypeInfo.emoji} ${archetypeInfo.title}!`,
          type: 'info'
        });
      }
    }

    // Always update the ref with current archetype for next comparison
    previousArchetypeRef.current = currentArchetype;
  }, [user?.conflict_archetype]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, emoji: '🏠' },
    { name: 'Public Shame', href: '/public-shame', icon: Trophy, emoji: '⚖️' },
    { name: 'Leaderboard',  href: '/leaderboard', icon: Trophy, emoji: '🏆' },
    { name: 'Support Us', href: '/support-us', icon: User, emoji: '💝' },
    { name: 'Reddit Drama', href: '/reddit-conflict', icon: MessageSquare, emoji: '🤔' },
    { name: 'Profile', href: '/profile', icon: User, emoji: '👤' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (location.pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={6000}
        />
      )}

      {/* Achievement Notification */}
      {pendingNotification && (
        <AchievementToast
          archetype={pendingNotification}
          onClose={clearNotification}
        />
      )}

      {/* General Achievement Notification */}
      {pendingGeneralNotification && !pendingNotification && (
        <GeneralAchievementToast
          achievement={pendingGeneralNotification}
          onClose={clearGeneralNotification}
        />
      )}

      {/* Top Navigation */}
      <nav className="bg-dark-teal border-b-3 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="text-3xl animate-float">💣</div>
              <h1 className="text-2xl font-black text-white tracking-tight">SQUASHIE</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-white font-bold">
                  HEY, <UserDisplayName 
                    username={user?.username}
                    archetypeEmoji={user?.archetype_emoji}
                    supporterEmoji={user?.supporter_emoji}
                    fallback={user?.first_name || user?.email || 'User'}
                  />
                </span>
                {user?.id && (
                  <SquashCredDisplay 
                    userId={user.id} 
                    showTier={false}
                    size="sm"
                    className="hidden sm:flex"
                  />
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-white hover:text-vivid-orange transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline font-bold">LOGOUT</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r-3 border-black hidden md:block">
          <nav className="mt-6 px-4">
            <ul className="space-y-4">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => navigate(item.href)}
                      className={`w-full flex items-center space-x-3 px-4 py-4 text-left transition-colors border-3 ${
                        isActive
                          ? 'bg-lime-chartreuse text-dark-teal border-black shadow-brutal'
                          : 'text-dark-teal border-transparent hover:border-black hover:shadow-brutal-sm'
                      }`}
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="font-black">{item.name.toUpperCase()}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-3 border-black md:hidden z-10">
          <nav className="flex justify-around py-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                    isActive ? 'text-vivid-orange' : 'text-dark-teal'
                  }`}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-xs font-bold">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 pb-16 md:pb-0 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;