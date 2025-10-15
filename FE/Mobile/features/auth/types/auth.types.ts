export interface IUser {
  _id: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  avatar: string;
  refreshToken: string | null;
  refreshTokenExpiresAt: string | null;
  isVerified: boolean;
  emailOTP: string;
  emailOTPExpires: string;
  emailOTPLastSentAt: string;
  emailOTPResendCount: number;
  emailOTPResendWindowStart: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    user: {
      id: string;
      email: string;
      fullName: string;
      phoneNumber: string;
    };
  };
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    email: string;
  };
  message: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  data: {
    email: string;
  } | null;
  message: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ResendOtpResponse {
  success?: boolean;
  message: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { [key: string]: string };
}
