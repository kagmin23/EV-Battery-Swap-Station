import { LoginRequest, LoginResponse, LogoutResponse, RegisterRequest, RegisterResponse, ResendOtpRequest, ResendOtpResponse, VerifyEmailRequest, VerifyEmailResponse } from "@/features/auth/types/auth.types";
import { ChangePasswordRequest, ChangePasswordResponse } from "@/features/driver/types/change-password.types";
import httpClient from "../rootAPI";

export const authAPI = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return httpClient.post<LoginResponse>('/auth/login', credentials);
  },

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return httpClient.post<RegisterResponse>('/auth/register', userData);
  },

  async logout(refreshToken: string): Promise<LogoutResponse> {
    return httpClient.post<LogoutResponse>('/auth/logout', { refreshToken });
  },

  async refreshToken(): Promise<LoginResponse> {
    return httpClient.post<LoginResponse>('/auth/refresh');
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return httpClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return httpClient.post('/auth/reset-password', { token, password: newPassword });
  },

  async verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    return httpClient.post<VerifyEmailResponse>('/auth/verify-email', data);
  },

  async resendOtp(data: ResendOtpRequest): Promise<ResendOtpResponse> {
    return httpClient.post<ResendOtpResponse>('/auth/resend-otp', data);
  },

  async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    return httpClient.post<ChangePasswordResponse>('/auth/change-password', data);
  },
};
