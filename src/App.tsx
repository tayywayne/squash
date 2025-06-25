import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import NewConflictPage from './pages/NewConflictPage';
import QuestsPage from './pages/QuestsPage';
import QuestDetailPage from './pages/QuestDetailPage';
import ConflictPage from './pages/ConflictPage';
import ProfilePage from './pages/ProfilePage';
import OtherUserProfilePage from './pages/OtherUserProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import SupportUsPage from './pages/SupportUsPage';
import SupportSuccessPage from './pages/SupportSuccessPage';
import AIJudgmentFeedPage from './pages/AIJudgmentFeedPage';
import RedditConflictPage from './pages/RedditConflictPage';
import OnboardingFlow from './components/OnboardingFlow';
import { achievementTracker } from './utils/achievementTracker';

function App() {
  const { user, loading } = useAuth();
  
  // Check for time-based achievements periodically
  useEffect(() => {
    if (user?.id) {
      // Check achievements on initial load
      achievementTracker.trackAchievementProgress(user.id);
      achievementTracker.checkTimeBasedAchievements(user.id);
      achievementTracker.checkSpecialDateAchievements(user.id);
      
      // Set up periodic checks
      const interval = setInterval(() => {
        achievementTracker.checkTimeBasedAchievements(user.id);
      }, 3600000); // Check every hour
      
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-light-pink flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 border-4 border-black shadow-brutal-lg transform rotate-1">
            <div className="text-6xl mb-4 animate-bounce-gentle">💣</div>
            <h2 className="text-2xl font-black text-dark-blue mb-2">LOADING...</h2>
            <p className="text-lg font-bold text-dark-blue">Your conflict resolution portal is starting up!</p>
            <div className="mt-4 flex justify-center">
              <div className="bg-lime-green px-4 py-2 border-3 border-black transform -rotate-1">
                <span className="text-dark-blue font-black text-sm">PLEASE WAIT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes - accessible to everyone */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <HomePage />} />
        <Route path="/support-success" element={<SupportSuccessPage />} />
        
        {user ? (
          // Authenticated routes
          <>
            <Route 
              path="/login" 
              element={<Navigate to="/dashboard" replace />} 
            />
            <Route
              path="/*"
              element={
                <Layout>
                  <OnboardingFlow />
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/new-conflict" element={<NewConflictPage />} />
                    <Route path="/conflicts" element={<DashboardPage />} />
                    <Route path="/history" element={<DashboardPage />} />
                    <Route path="/conflict/:conflictId" element={<ConflictPage />} />
                    <Route path="/resolution/:resolutionId" element={<ConflictPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/quests" element={<QuestsPage />} />
                    <Route path="/quest/:questId" element={<QuestDetailPage />} />
                    <Route path="/user-profile/:userId" element={<OtherUserProfilePage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/support-us" element={<SupportUsPage />} />
                    <Route path="/public-shame" element={<AIJudgmentFeedPage />} />
                    <Route path="/reddit-conflict" element={<RedditConflictPage />} />
                  </Routes>
                </Layout>
              }
            />
          </>
        ) : (
          // Unauthenticated routes
          <>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/public-shame" element={<AIJudgmentFeedPage />} />
            <Route path="/reddit-conflict" element={<RedditConflictPage />} />
            <Route path="/*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;