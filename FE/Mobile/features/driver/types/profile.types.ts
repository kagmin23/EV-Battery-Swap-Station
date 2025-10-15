export type UserRole = "driver" | "staff" | "admin" | string;
export type AccountStatus = "active" | "locked" | string;

export interface IProfile {
  email: string;
  fullName: string;
  phoneNumber: string;
  avatar: string;
  role: UserRole;
  isVerified: boolean;
  status: AccountStatus;
}

export interface ChangeAvatarResponse {
  success: boolean;
  data: {
    avatar: string;
  };
  message: string;
}

export interface UpdateProfile {
  fullName: string;
  phoneNumber: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    role: string;
    status: string;
    avatar: string;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}
