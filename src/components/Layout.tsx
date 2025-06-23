import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, History, User, LogOut, Trophy } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import UserDisplayName from './UserDisplayName';
import Toast from './Toast';
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
    //{ name: 'Conflicts', href: '/conflicts', icon: MessageSquare, emoji: '💬' },
    //{ name: 'History', href: '/history', icon: History, emoji: '📚' },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy, emoji: '🏆' },
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
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 to-teal-50">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={6000}
        />
      )}

      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">💣</div>
              <h1 className="text-xl font-bold text-gray-900">Squashie</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Hey, <UserDisplayName 
                  username={user?.username}
                  archetypeEmoji={user?.archetype_emoji}
                  fallback={user?.first_name || user?.email || 'User'}
                />
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-gray-600 hover:text-coral-500 transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 hidden md:block">
          <nav className="mt-6 px-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => navigate(item.href)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        isActive
                          ? 'bg-coral-50 text-coral-600 border border-coral-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <span className="font-medium">{item.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-10">
          <nav className="flex justify-around py-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                    isActive ? 'text-coral-500' : 'text-gray-600'
                  }`}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-xs font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;