import { ChangeAvatarResponse, UpdateProfile, UpdateProfileResponse } from "@/features/driver/types/profile.types";
import httpClient from "@/services/rootAPI";

export const changeAvatarAPI = {
  async uploadAvatar(formData: FormData): Promise<ChangeAvatarResponse> {
    return httpClient.post<ChangeAvatarResponse>(
      "/users/me/avatar",
      formData,
      { "Content-Type": "multipart/form-data" }
    );
  },
};

export const updateProfileAPI = {
  async updateProfile(data: UpdateProfile): Promise<UpdateProfileResponse> {
    return httpClient.put<UpdateProfileResponse>(
      "/users/me",
      data,
      { "Content-Type": "application/json" }
    );
  },
};
