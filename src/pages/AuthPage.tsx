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
    <div className="min-h-screen bg-background-light flex items-center justify-center p-brutal">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="max-w-md w-full">
        {/* Logo & Welcome */}
        <div className="text-center mb-brutal">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-text-secondary hover:text-text-primary mb-6 transition-colors mx-auto font-bold uppercase text-sm"
          >
            <ArrowLeft size={20} />
            <span>BACK TO HOME</span>
          </button>
          
          <div className="text-8xl mb-6">💣</div>
          <h1 className="text-4xl font-black text-text-primary mb-4 uppercase">SQUASHIE</h1>
          <div className="bg-primary-orange text-background-white p-4 border-brutal border-border-black mb-4">
            <p className="font-black uppercase text-lg">
              BECAUSE NOT EVERYONE CAN AFFORD A THERAPIST.
            </p>
          </div>
          <p className="text-sm text-text-secondary font-medium">
            Settle your beef with AI-powered mediation. It's like couples therapy, but sassier.
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-background-white border-brutal border-border-black p-brutal">
          <div className="mb-6">
            <div className="flex bg-background-light border-brutal border-border-black">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 text-sm font-black uppercase transition-colors border-brutal ${
                  isLogin
                    ? 'bg-primary-teal text-background-white border-border-black'
                    : 'text-text-secondary hover:text-text-primary border-transparent'
                }`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 text-sm font-black uppercase transition-colors border-brutal ${
                  !isLogin
                    ? 'bg-primary-teal text-background-white border-border-black'
                    : 'text-text-secondary hover:text-text-primary border-transparent'
                }`}
              >
                SIGN UP
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sign Up Fields */}
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-black text-text-primary mb-2 uppercase">
                      FIRST NAME
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 border-brutal border-border-black bg-background-white text-text-primary font-medium focus:bg-background-light transition-colors"
                      placeholder="JOHN"
                      required={!isLogin}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-black text-text-primary mb-2 uppercase">
                      LAST NAME
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 border-brutal border-border-black bg-background-white text-text-primary font-medium focus:bg-background-light transition-colors"
                      placeholder="DOE"
                      required={!isLogin}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-black text-text-primary mb-2 uppercase">
                    USERNAME
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full px-4 py-3 border-brutal border-border-black bg-background-white text-text-primary font-medium focus:bg-background-light transition-colors"
                    placeholder="JOHNDOE"
                    required={!isLogin}
                    minLength={3}
                  />
                  <p className="text-xs text-text-secondary mt-2 font-medium uppercase">
                    ONLY LOWERCASE LETTERS, NUMBERS, AND UNDERSCORES. MINIMUM 3 CHARACTERS.
                  </p>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-black text-text-primary mb-2 uppercase">
                EMAIL ADDRESS
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-brutal border-border-black bg-background-white text-text-primary font-medium focus:bg-background-light transition-colors"
                placeholder="YOUR.EMAIL@EXAMPLE.COM"
                required
              />
            </div>

            {/* Confirm Email for Sign Up */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmEmail" className="block text-sm font-black text-text-primary mb-2 uppercase">
                  CONFIRM EMAIL ADDRESS
                </label>
                <input
                  id="confirmEmail"
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="w-full px-4 py-3 border-brutal border-border-black bg-background-white text-text-primary font-medium focus:bg-background-light transition-colors"
                  placeholder="YOUR.EMAIL@EXAMPLE.COM"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-black text-text-primary mb-2 uppercase">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-brutal border-border-black bg-background-white text-text-primary font-medium focus:bg-background-light transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={isLogin ? undefined : 6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password for Sign Up */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-black text-text-primary mb-2 uppercase">
                  CONFIRM PASSWORD
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border-brutal border-border-black bg-background-white text-text-primary font-medium focus:bg-background-light transition-colors"
                    placeholder="••••••••"
                    required={!isLogin}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-teal hover:bg-primary-orange text-background-white font-black py-4 px-4 border-brutal border-border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              {loading ? 'PROCESSING...' : isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary font-medium">
              {isLogin ? "NEW TO CONFLICT RESOLUTION?" : "ALREADY HAVE AN ACCOUNT?"}{' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary-teal hover:text-primary-orange font-black uppercase"
              >
                {isLogin ? 'SIGN UP HERE' : 'SIGN IN INSTEAD'}
              </button>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-text-secondary font-medium uppercase">
            BY SIGNING UP, YOU AGREE TO RESOLVE CONFLICTS LIKE A CIVILIZED HUMAN BEING. MOSTLY.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;