import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

// Shape of the auth user (adjust when backend shape known)
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restore: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const restore = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const rawUser = await AsyncStorage.getItem(USER_KEY);
      if (token && rawUser) {
        setUser(JSON.parse(rawUser));
      } else {
        setUser(null);
      }
    } catch (e) {
      console.warn('Failed to restore auth state', e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restore();
  }, [restore]);

  const login = async (email: string, password: string) => {
    // TODO: replace with real API call
    setLoading(true);
    try {
      // Simulate request delay
      await new Promise(r => setTimeout(r, 800));
      const fakeToken = 'demo-token';
      const fakeUser: AuthUser = { id: '1', email, name: 'Demo User' };
      await AsyncStorage.setItem(TOKEN_KEY, fakeToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(fakeUser));
      setUser(fakeUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, restore, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
