import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, History, User, LogOut, Trophy, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import UserDisplayName from './UserDisplayName';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const previousArchetypeRef = useRef<string | undefined>(undefined);
  const { pendingNotification, clearNotification } = useArchetypeAchievements();
  const { pendingNotification: pendingGeneralNotification, clearNotification: clearGeneralNotification } = useGeneralAchievements();

  // Watch for archetype changes and show toast notification
  useEffect(() => {
    const currentArchetype = user?.conflict_archetype;
    const previousArchetype = previousArchetypeRef.current;

    if (currentArchetype && 
        previousArchetype !== undefined && 
        currentArchetype !== previousArchetype) {
      
      const archetypeInfo = archetypeService.getArchetypeInfo(currentArchetype);
      
      if (archetypeInfo) {
        setToast({
          message: `🎭 Your conflict archetype has been updated to: ${archetypeInfo.emoji} ${archetypeInfo.title}!`,
          type: 'info'
        });
      }
    }

    previousArchetypeRef.current = currentArchetype;
  }, [user?.conflict_archetype]);

  const navigation = [
    { name: 'DASHBOARD', href: '/dashboard', icon: Home, emoji: '🏠' },
    { name: 'PUBLIC SHAME', href: '/public-shame', icon: Trophy, emoji: '⚖️' },
    { name: 'LEADERBOARD', href: '/leaderboard', icon: Trophy, emoji: '🏆' },
    { name: 'SUPPORT US', href: '/support-us', icon: User, emoji: '💝' },
    { name: 'PROFILE', href: '/profile', icon: User, emoji: '👤' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (location.pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background-light">
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

      {/* Top Navigation - Neobrutalist Style */}
      <nav className="bg-background-white border-b-brutal border-border-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-brutal">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="text-3xl">💣</div>
              <h1 className="text-2xl font-black text-text-primary uppercase tracking-tight">SQUASHIE</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.href)}
                    className={`px-4 py-2 font-bold text-sm uppercase tracking-wide transition-all border-brutal ${
                      isActive
                        ? 'bg-primary-teal text-background-white border-border-black'
                        : 'text-text-primary hover:bg-primary-orange hover:text-background-white border-transparent hover:border-border-black'
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
              
              {/* User Info */}
              <div className="flex items-center space-x-4 pl-4 border-l-brutal border-border-black">
                <div className="text-sm font-bold text-text-primary uppercase">
                  <UserDisplayName 
                    username={user?.username}
                    archetypeEmoji={user?.archetype_emoji}
                    supporterEmoji={user?.supporter_emoji}
                    fallback={user?.first_name || user?.email || 'USER'}
                  />
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 bg-text-primary text-background-white hover:bg-primary-orange transition-colors border-brutal border-border-black"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 bg-text-primary text-background-white border-brutal border-border-black"
            >
              {mobileMenuOpen ? <X size={20} /> : <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-background-white"></div>
                <div className="w-full h-0.5 bg-background-white"></div>
                <div className="w-full h-0.5 bg-background-white"></div>
              </div>}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t-brutal border-border-black bg-background-white">
              <div className="py-4 space-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.href);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 font-bold text-sm uppercase tracking-wide transition-all border-brutal ${
                        isActive
                          ? 'bg-primary-teal text-background-white border-border-black'
                          : 'text-text-primary hover:bg-primary-orange hover:text-background-white border-transparent hover:border-border-black'
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
                
                <div className="px-4 py-3 border-t-brutal border-border-black">
                  <div className="text-sm font-bold text-text-primary uppercase mb-2">
                    <UserDisplayName 
                      username={user?.username}
                      archetypeEmoji={user?.archetype_emoji}
                      supporterEmoji={user?.supporter_emoji}
                      fallback={user?.first_name || user?.email || 'USER'}
                    />
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full bg-text-primary text-background-white hover:bg-primary-orange transition-colors border-brutal border-border-black py-2 px-4 font-bold uppercase text-sm"
                  >
                    LOGOUT
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;