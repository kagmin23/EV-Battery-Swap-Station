import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { loginUser, logoutUser } from '../apis/authAPI';
import { IUser } from '../types/auth.types';

interface AuthContextValue {
  user: IUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restore: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  const restore = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const rawUser = await AsyncStorage.getItem(USER_KEY);
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (token && rawUser) {
        const userData = JSON.parse(rawUser);
        // Make sure refresh token is included in user data
        if (refreshToken && !userData.refreshToken) {
          userData.refreshToken = refreshToken;
        }
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch {
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
      const response = await loginUser({ email: email.trim(), password });
      
      if (response.success && response.data) {
        const { accessToken, refreshToken, user: userInfo } = response.data;
        
        // Store tokens and user info
        await AsyncStorage.setItem(TOKEN_KEY, accessToken);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        
        // Create user object with additional token info
        const userWithToken = {
          ...userInfo,
          _id: userInfo.id, // Map id to _id for consistency
          refreshToken,
          avatar: (userInfo as any).avatar ?? '',
          refreshTokenExpiresAt: null, // Will be set by BE if needed
          isVerified: true, // If login succeeds, user must be verified
          emailOTP: '',
          emailOTPExpires: '',
          emailOTPLastSentAt: '',
          emailOTPResendCount: 0,
          emailOTPResendWindowStart: '',
          createdAt: '',
          updatedAt: '',
          __v: 0,
          password: '' // Don't store password in client
        };
        
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userWithToken));
        setUser(userWithToken);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      // Handle different types of errors
      const isEmailVerificationError = error?.requireEmailVerification || 
        error?.message?.includes('Account not verified') ||
        error?.message?.includes('verify') ||
        error?.message?.includes('OTP');
      
      // Only log error for unexpected/technical issues (not user input errors or BE messages)
      const isBackendError = error?.message || error?.errors;
      if (!isEmailVerificationError && !isBackendError) {
        console.error('Login error:', error);
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
      // Try to call logout API with refreshToken
      try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        
        // Only call API if we have a refreshToken
        if (refreshToken) {
          await logoutUser(refreshToken);
        } else {
        }
      } catch {
        // Continue with logout even if API call fails
      }
      
      // Always clear local storage
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, REFRESH_TOKEN_KEY]);
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
