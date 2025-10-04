export interface IUser {
  _id: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
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
    token: string;
    user: IUser;
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
  success?: boolean;
  message: string;
  userId?: string;
  data?: {
    user: IUser;
  };
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface VerifyEmailResponse {
  success?: boolean;
  message: string;
  data?: IUser;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ResendOtpResponse {
  success?: boolean;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { [key: string]: string };
}
