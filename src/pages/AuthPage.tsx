import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Toast from '../components/Toast';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const validateSignUpForm = () => {
    if (!isLogin) {
      if (!firstName.trim()) {
        setToast({ message: 'First name is required', type: 'error' });
        return false;
      }
      if (!lastName.trim()) {
        setToast({ message: 'Last name is required', type: 'error' });
        return false;
      }
      if (!username.trim()) {
        setToast({ message: 'Username is required', type: 'error' });
        return false;
      }
      if (username.length < 3) {
        setToast({ message: 'Username must be at least 3 characters long', type: 'error' });
        return false;
      }
      if (email !== confirmEmail) {
        setToast({ message: 'Email addresses do not match', type: 'error' });
        return false;
      }
      if (password !== confirmPassword) {
        setToast({ message: 'Passwords do not match', type: 'error' });
        return false;
      }
      if (password.length < 6) {
        setToast({ message: 'Password must be at least 6 characters long', type: 'error' });
        return false;
      }
    }
    return true;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignUpForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password, firstName, lastName, username);

      if (error) {
        let errorMessage = 'Authentication failed';
        
        if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email address to log in. Check your inbox for a verification link.';
        } else if (error.message.includes('email_address_invalid')) {
          errorMessage = 'This email address is not valid. Please check your email format or try a different email address.';
        } else if (error.message.includes('Email address') && error.message.includes('invalid')) {
          errorMessage = 'This email address is not accepted. Please try a different email address.';
        } else if (error.message.includes('duplicate key value violates unique constraint "profiles_username_key"')) {
          errorMessage = 'This username is already taken. Please choose a different username.';
        } else {
          errorMessage = error.message || 'Authentication failed';
        }
        
        setToast({ message: errorMessage, type: 'error' });
      } else {
        setToast({ 
          message: isLogin ? 'Welcome back, conflict resolver!' : 'Account created! Time to squash some beef.', 
          type: 'success' 
        });
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setToast({ message: 'Something went wrong. Please try again with a different email address.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 via-lavender-50 to-teal-50 flex items-center justify-center p-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="max-w-md w-full">
        {/* Logo & Welcome */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🥊</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Squash'n'Go</h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Welcome to Squash'n'Go – because not everyone can afford a therapist.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Settle your beef with AI-powered mediation. It's like couples therapy, but sassier.
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  isLogin
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  !isLogin
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sign Up Fields */}
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors"
                        placeholder="John"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors"
                        placeholder="Doe"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors"
                      placeholder="johndoe"
                      required={!isLogin}
                      minLength={3}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Only lowercase letters, numbers, and underscores. Minimum 3 characters.
                  </p>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            {/* Confirm Email for Sign Up */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmEmail"
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors"
                    placeholder="your.email@example.com"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={isLogin ? undefined : 6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password for Sign Up */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors"
                    placeholder="••••••••"
                    required={!isLogin}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-coral-500 hover:bg-coral-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "New to conflict resolution?" : "Already have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-coral-500 hover:text-coral-600 font-medium"
              >
                {isLogin ? 'Sign up here' : 'Sign in instead'}
              </button>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By signing up, you agree to resolve conflicts like a civilized human being. 
            Mostly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;