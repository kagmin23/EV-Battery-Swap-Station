import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ResendOtpRequest, ResendOtpResponse, VerifyEmailRequest, VerifyEmailResponse } from "@/features/auth/types/auth.types";
import httpClient from "../rootAPI";

export const authAPI = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return httpClient.post<LoginResponse>('/auth/login', credentials);
  },

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return httpClient.post<RegisterResponse>('/auth/register', userData);
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    return httpClient.post('/auth/logout');
  },

  // Refresh token - token added automatically by interceptor
  async refreshToken(): Promise<LoginResponse> {
    return httpClient.post<LoginResponse>('/auth/refresh');
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return httpClient.post('/auth/forgot-password', { email });
  },

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return httpClient.post('/auth/reset-password', { token, password: newPassword });
  },

  // Verify email with OTP
  async verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    return httpClient.post<VerifyEmailResponse>('/auth/verify-email', data);
  },

  // Resend OTP
  async resendOtp(data: ResendOtpRequest): Promise<ResendOtpResponse> {
    return httpClient.post<ResendOtpResponse>('/auth/resend-otp', data);
  },
};
