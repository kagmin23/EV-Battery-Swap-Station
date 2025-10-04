import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { loginUser, logoutUser } from '../apis/authAPI';

// Shape of the auth user (adjust when backend shape known)
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
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
    setLoading(true);
    try {
      // Call real API
      const response = await loginUser({ email: email.trim(), password });
      
      if (response.success && response.data) {
        const { token, user: userInfo } = response.data;
        
        // Create user object matching our AuthUser interface
        const authUser: AuthUser = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.fullName,
          fullName: userInfo.fullName,
          role: userInfo.role || 'user'
        };
        
        // Store token and user data
        await AsyncStorage.setItem(TOKEN_KEY, token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(authUser));
        setUser(authUser);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      // Handle different types of errors
      const isEmailVerificationError = error?.requireEmailVerification || 
        error?.message?.includes('Account not verified') ||
        error?.message?.includes('verify') ||
        error?.message?.includes('OTP');
      
      // Only log as error if it's not an email verification case
      if (!isEmailVerificationError) {
        console.log('🔍 AuthContext login error:', error);
      }
      
      if (error?.message) {
        // Preserve additional error properties for email verification detection
        const errorToThrow = new Error(error.message);
        // Add custom properties to help identify email verification errors
        if (isEmailVerificationError) {
          (errorToThrow as any).requireEmailVerification = true;
        }
        throw errorToThrow;
      } else if (error?.errors) {
        // Handle validation errors from backend
        const errorMessages = Object.values(error.errors).join(', ');
        throw new Error(errorMessages);
      } else {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Try to call logout API - token added automatically by axios interceptor
      try {
        await logoutUser();
      } catch (error) {
        // Continue with logout even if API call fails
        console.warn('Logout API call failed:', error);
      }
      
      // Always clear local storage
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
