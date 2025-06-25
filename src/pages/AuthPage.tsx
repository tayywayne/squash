import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-dark-teal flex items-center justify-center p-4">
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
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-white hover:text-lime-chartreuse mb-6 transition-colors mx-auto font-black"
          >
            <ArrowLeft size={20} />
            <span>BACK TO HOME</span>
          </button>
          
          <div className="text-6xl mb-4">💣</div>
          <h1 className="text-3xl font-black text-white mb-2">SQUASHIE</h1>
          <p className="text-lime-chartreuse text-lg font-bold leading-relaxed">
            Welcome to Squashie – because not everyone can afford a therapist.
          </p>
          <p className="text-white text-sm mt-2 font-bold">
            Settle your beef with AI-powered mediation. It's like couples therapy, but sassier.
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white border-3 border-black shadow-brutal p-8">
          <div className="mb-6">
            <div className="flex bg-gray-100 border-3 border-black p-1">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-sm font-black transition-colors ${
                  isLogin
                    ? 'bg-lime-chartreuse text-dark-teal border-2 border-black'
                    : 'text-dark-teal hover:text-vivid-orange'
                }`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-sm font-black transition-colors ${
                  !isLogin
                    ? 'bg-lime-chartreuse text-dark-teal border-2 border-black'
                    : 'text-dark-teal hover:text-vivid-orange'
                }`}
              >
                SIGN UP
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sign Up Fields */}
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-black text-dark-teal mb-2">
                      FIRST NAME
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-teal" />
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-3 border-black focus:border-vivid-orange transition-colors font-bold text-dark-teal"
                        placeholder="John"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-black text-dark-teal mb-2">
                      LAST NAME
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-teal" />
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-3 border-black focus:border-vivid-orange transition-colors font-bold text-dark-teal"
                        placeholder="Doe"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-black text-dark-teal mb-2">
                    USERNAME
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-teal" />
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="w-full pl-10 pr-4 py-3 border-3 border-black focus:border-vivid-orange transition-colors font-bold text-dark-teal"
                      placeholder="johndoe"
                      required={!isLogin}
                      minLength={3}
                    />
                  </div>
                  <p className="text-xs text-dark-teal mt-1 font-bold">
                    Only lowercase letters, numbers, and underscores. Minimum 3 characters.
                  </p>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-black text-dark-teal mb-2">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-teal" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-3 border-black focus:border-vivid-orange transition-colors font-bold text-dark-teal"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            {/* Confirm Email for Sign Up */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmEmail" className="block text-sm font-black text-dark-teal mb-2">
                  CONFIRM EMAIL
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-teal" />
                  <input
                    id="confirmEmail"
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-3 border-black focus:border-vivid-orange transition-colors font-bold text-dark-teal"
                    placeholder="your.email@example.com"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-black text-dark-teal mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-teal" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border-3 border-black focus:border-vivid-orange transition-colors font-bold text-dark-teal"
                  placeholder="••••••••"
                  required
                  minLength={isLogin ? undefined : 6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-teal hover:text-vivid-orange"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password for Sign Up */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-black text-dark-teal mb-2">
                  CONFIRM PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-teal" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border-3 border-black focus:border-vivid-orange transition-colors font-bold text-dark-teal"
                    placeholder="••••••••"
                    required={!isLogin}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-teal hover:text-vivid-orange"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-vivid-orange hover:bg-orange-600 text-white font-black py-3 px-4 border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'PROCESSING...' : isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-dark-teal font-bold">
              {isLogin ? "New to conflict resolution?" : "Already have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-vivid-orange hover:text-orange-600 font-black"
              >
                {isLogin ? 'SIGN UP HERE' : 'SIGN IN INSTEAD'}
              </button>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-lime-chartreuse font-bold">
            By signing up, you agree to resolve conflicts like a civilized human being. 
            Mostly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;