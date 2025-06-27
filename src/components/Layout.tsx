import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, User, LogOut, Trophy, BookOpen, ChevronDown, ChevronUp, Menu, X, Flame, Sparkles } from 'lucide-react';
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
  const [showLearnDropdown, setShowLearnDropdown] = useState(false);
  const [showDramaDropdown, setShowDramaDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const learnDropdownRef = useRef<HTMLDivElement>(null);
  const dramaDropdownRef = useRef<HTMLDivElement>(null);

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
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (learnDropdownRef.current && !learnDropdownRef.current.contains(event.target as Node)) {
        setShowLearnDropdown(false);
      }
      if (dramaDropdownRef.current && !dramaDropdownRef.current.contains(event.target as Node)) {
        setShowDramaDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Close dropdowns when navigating
  useEffect(() => {
    setShowLearnDropdown(false);
    setShowDramaDropdown(false);
    setShowMobileMenu(false);
  }, [location.pathname]);

  // Main navigation items
  const mainNavigation = [
    { name: 'Home', href: '/dashboard', icon: Home, emoji: '🧃' },
  ];
  
  // Learn dropdown items
  const learnNavigation = [
    { name: 'Quests', href: '/quests', icon: BookOpen, emoji: '🧠' },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy, emoji: '👑' },
  ];
  
  // Drama dropdown items
  const dramaNavigation = [
    { name: 'Public Shame', href: '/public-shame', icon: Trophy, emoji: '⚖️' },
    { name: 'Public Spectacle', href: '/reddit-conflict', icon: MessageSquare, emoji: '🍿' },
  ];
  
  // Additional navigation items
  const additionalNavigation = [
    { name: 'Tip Us', href: '/support-us', icon: Sparkles, emoji: '✨' },
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
      <nav className="bg-dark-teal border-b-3 border-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="text-3xl animate-float">💣</div>
              <h1 className="text-2xl font-black text-white tracking-tight">SQUASHIE</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {mainNavigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`flex items-center space-x-1 px-2 py-2 text-white font-bold hover:text-lime-chartreuse transition-colors ${
                    location.pathname === item.href ? 'text-lime-chartreuse' : ''
                  }`}
                >
                  <span>{item.emoji}</span>
                  <span>{item.name}</span>
                </button>
              ))}
              
              {/* Learn Dropdown */}
              <div ref={learnDropdownRef} className="relative">
                <button
                  onClick={() => {
                    setShowLearnDropdown(!showLearnDropdown);
                    setShowDramaDropdown(false);
                  }}
                  className={`flex items-center space-x-1 px-2 py-2 text-white font-bold hover:text-lime-chartreuse transition-colors ${
                    learnNavigation.some(item => location.pathname === item.href) ? 'text-lime-chartreuse' : ''
                  }`}
                >
                  <span>📚</span>
                  <span>Learn</span>
                  {showLearnDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {showLearnDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border-3 border-black shadow-brutal z-50">
                    {learnNavigation.map((item) => (
                      <button
                        key={item.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(item.href);
                        }}
                        className={`flex items-center space-x-3 w-full text-left px-4 py-3 font-bold transition-colors ${
                          location.pathname === item.href
                            ? 'bg-lime-chartreuse text-dark-teal'
                            : 'text-dark-teal hover:bg-lime-chartreuse/20'
                        }`}
                      >
                        <span>{item.emoji}</span>
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Drama Dropdown */}
              <div ref={dramaDropdownRef} className="relative">
                <button
                  onClick={() => {
                    setShowDramaDropdown(!showDramaDropdown);
                    setShowLearnDropdown(false);
                  }}
                  className={`flex items-center space-x-1 px-2 py-2 text-white font-bold hover:text-lime-chartreuse transition-colors ${
                    dramaNavigation.some(item => location.pathname === item.href) ? 'text-lime-chartreuse' : ''
                  }`}
                >
                  <span>🔥</span>
                  <span>Drama</span>
                  {showDramaDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {showDramaDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border-3 border-black shadow-brutal z-50">
                    {dramaNavigation.map((item) => (
                      <button
                        key={item.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(item.href);
                        }}
                        className={`flex items-center space-x-3 w-full text-left px-4 py-3 font-bold transition-colors ${
                          location.pathname === item.href
                            ? 'bg-lime-chartreuse text-dark-teal'
                            : 'text-dark-teal hover:bg-lime-chartreuse/20'
                        }`}
                      >
                        <span>{item.emoji}</span>
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {additionalNavigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`flex items-center space-x-1 px-2 py-2 text-white font-bold hover:text-lime-chartreuse transition-colors ${
                    location.pathname === item.href ? 'text-lime-chartreuse' : ''
                  }`}
                >
                  <span>{item.emoji}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
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
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden text-white hover:text-lime-chartreuse transition-colors"
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center space-x-1 text-white hover:text-vivid-orange transition-colors whitespace-nowrap"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline font-bold">LOGOUT</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => {
          setShowMobileMenu(false);
        }}>
          <div className="absolute right-0 top-20 bottom-0 w-64 bg-white border-l-3 border-black shadow-brutal" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b-3 border-black">
              <span className="text-sm text-dark-teal font-bold">
                HEY, <UserDisplayName 
                  username={user?.username}
                  archetypeEmoji={user?.archetype_emoji}
                  supporterEmoji={user?.supporter_emoji}
                  fallback={user?.first_name || user?.email || 'User'}
                />
              </span>
            </div>
            
            <div className="overflow-y-auto h-full pb-20">
              <div className="p-4">
                {/* Main Navigation */}
                {mainNavigation.map((item) => (
                  <div
                    key={item.name}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors border-2 mb-2 ${
                      location.pathname === item.href
                        ? 'bg-lime-chartreuse text-dark-teal border-black'
                        : 'text-dark-teal border-transparent hover:border-black'
                    }`}
                  >
                    <button
                      onClick={() => {
                        navigate(item.href);
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 text-left"
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <span className="font-bold">{item.name}</span>
                    </button>
                  </div>
                ))}
                
                {/* Learn Section */}
                <div className="mb-2">
                  <button
                    className={`w-full flex items-center justify-between px-4 py-3 text-left border-2 bg-lime-chartreuse text-dark-teal border-black ${
                      learnNavigation.some(item => location.pathname === item.href)
                        ? 'bg-lime-chartreuse text-dark-teal border-black'
                        : 'text-dark-teal border-black'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">📚</span>
                      <span className="font-bold">Learn</span>
                    </div>
                  </button>
                  
                  <div className="pl-4 border-l-2 border-black ml-4 mt-1 mb-2">
                    {learnNavigation.map((item) => (
                      <div
                        key={item.name}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-left transition-colors border-2 mb-1 ${
                          location.pathname === item.href
                            ? 'bg-lime-chartreuse/50 text-dark-teal border-black'
                            : 'text-dark-teal border-transparent hover:border-black'
                        }`}
                      >
                        <button
                          onClick={() => {
                            navigate(item.href);
                            setShowMobileMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 text-left"
                        >
                          <span className="text-xl">{item.emoji}</span>
                          <span className="font-bold">{item.name}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Drama Section */}
                <div className="mb-2">
                  <button
                    className={`w-full flex items-center justify-between px-4 py-3 text-left border-2 bg-lime-chartreuse text-dark-teal border-black ${
                      dramaNavigation.some(item => location.pathname === item.href)
                        ? 'bg-lime-chartreuse text-dark-teal border-black'
                        : 'text-dark-teal border-black'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🔥</span>
                      <span className="font-bold">Drama</span>
                    </div>
                  </button>
                  
                  <div className="pl-4 border-l-2 border-black ml-4 mt-1 mb-2">
                    {dramaNavigation.map((item) => (
                      <div
                        key={item.name}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-left transition-colors border-2 mb-1 ${
                          location.pathname === item.href
                            ? 'bg-lime-chartreuse/50 text-dark-teal border-black'
                            : 'text-dark-teal border-transparent hover:border-black'
                        }`}
                      >
                        <button
                          onClick={() => {
                            navigate(item.href);
                            setShowMobileMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 text-left"
                        >
                          <span className="text-xl">{item.emoji}</span>
                          <span className="font-bold">{item.name}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Additional Navigation */}
                {additionalNavigation.map((item) => (
                  <div
                    key={item.name}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors border-2 mb-2 ${
                      location.pathname === item.href
                        ? 'bg-lime-chartreuse text-dark-teal border-black'
                        : 'text-dark-teal border-transparent hover:border-black'
                    }`}
                  >
                    <button
                      onClick={() => {
                        navigate(item.href);
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 text-left"
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <span className="font-bold">{item.name}</span>
                    </button>
                  </div>
                ))}
                
                {/* Logout Button */}
                <div
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors border-2 text-vivid-orange hover:bg-vivid-orange/10 border-vivid-orange"
                >
                  <button
                    onClick={() => {
                      handleSignOut();
                    }}
                    className="w-full flex items-center space-x-3 text-left"
                  >
                    <LogOut size={18} />
                    <span className="font-bold">LOGOUT</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {/* Main Content */}
        <main className="flex-1 pb-16 md:pb-0 bg-white w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;