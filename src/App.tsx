import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import NewConflictPage from './pages/NewConflictPage';
import ConflictPage from './pages/ConflictPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coral-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce-gentle">🥊</div>
          <p className="text-lg text-gray-600">Loading your conflict resolution portal...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
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
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/new-conflict" element={<NewConflictPage />} />
                    <Route path="/conflicts" element={<DashboardPage />} />
                    <Route path="/history" element={<DashboardPage />} />
                    <Route path="/conflict/:conflictId" element={<ConflictPage />} />
                    <Route path="/resolution/:resolutionId" element={<ConflictPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              }
            />
          </>
        ) : (
          // Unauthenticated routes
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;