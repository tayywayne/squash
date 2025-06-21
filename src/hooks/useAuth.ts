import { useState, useEffect } from 'react';
import { mockAuth } from '../utils/supabase';

interface AuthUser {
  id: string;
  email: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await mockAuth.getUser();
        setUser(data.user);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await mockAuth.signIn(email, password);
    if (data.user) {
      setUser(data.user);
    }
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await mockAuth.signUp(email, password);
    if (data.user) {
      setUser(data.user);
    }
    return { error };
  };

  const signOut = async () => {
    await mockAuth.signOut();
    setUser(null);
  };

  return { user, loading, signIn, signUp, signOut };
};