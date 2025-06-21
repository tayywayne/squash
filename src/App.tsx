import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
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
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        <Route
          path="/*"
          element={
            user ? (
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
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;