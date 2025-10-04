import { authAPI } from '@/services/auth/authServices';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ResendOtpRequest, ResendOtpResponse, VerifyEmailRequest, VerifyEmailResponse } from '../types/auth.types';

// Re-export types for easier imports
export type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ResendOtpRequest, ResendOtpResponse, VerifyEmailRequest, VerifyEmailResponse };

export const loginUser = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await authAPI.login(credentials);
    return response;
  } catch (error: any) {
    // Check if this is an email verification error (not a real error)
    const isEmailVerificationError = error?.message?.includes('Account not verified') ||
      error?.message?.includes('verify') ||
      error?.message?.includes('OTP');
    
    // Only log as error if it's not an email verification case
    if (!isEmailVerificationError) {
      console.error("Login error:", error);
    }
    throw error;
  }
};

export const registerUser = async (
  userData: RegisterRequest
): Promise<RegisterResponse> => {
  try {
    console.log('📝 Calling authAPI.register with:', userData);
    const response = await authAPI.register(userData);
    console.log('✅ authAPI.register success response:', response);
    return response;
  } catch (error) {
    console.error("💥 Registration error in authAPI:", error);
    throw error;
  }
};

export const logoutUser = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await authAPI.logout();
    return response;
  } catch (error) {
    console.error("Logout error:", error);
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
    console.error("Forgot password error:", error);
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
    console.error("Reset password error:", error);
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
    console.error("Verify email error:", error);
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
    console.error("Resend OTP error:", error);
    throw error;
  }
};
