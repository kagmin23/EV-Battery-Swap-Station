import { authAPI } from '@/services/auth/authServices';
import { LoginRequest, LoginResponse, LogoutResponse, RegisterRequest, RegisterResponse, ResendOtpRequest, ResendOtpResponse, VerifyEmailRequest, VerifyEmailResponse } from '../types/auth.types';

// Re-export types for easier imports
export type { LoginRequest, LoginResponse, LogoutResponse, RegisterRequest, RegisterResponse, ResendOtpRequest, ResendOtpResponse, VerifyEmailRequest, VerifyEmailResponse };

export const loginUser = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await authAPI.login(credentials);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const registerUser = async (
  userData: RegisterRequest
): Promise<RegisterResponse> => {
  try {
    const response = await authAPI.register(userData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async (refreshToken: string): Promise<LogoutResponse> => {
  try {
    const response = await authAPI.logout(refreshToken);
    return response;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await authAPI.forgotPassword(email);
    return response;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await authAPI.resetPassword(token, newPassword);
    return response;
  } catch (error) {
    throw error;
  }
};

export const verifyEmail = async (
  data: VerifyEmailRequest
): Promise<VerifyEmailResponse> => {
  try {
    const response = await authAPI.verifyEmail(data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const resendOtp = async (
  data: ResendOtpRequest
): Promise<ResendOtpResponse> => {
  try {
    const response = await authAPI.resendOtp(data);
    return response;
  } catch (error) {
    throw error;
  }
};
