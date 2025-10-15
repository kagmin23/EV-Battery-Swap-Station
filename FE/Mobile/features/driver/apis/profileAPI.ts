import { ChangeAvatarResponse, UpdateProfile, UpdateProfileResponse } from "@/features/driver/types/profile.types";
import { authAPI } from "@/services/auth/authServices";
import { changeAvatarAPI, updateProfileAPI } from "@/services/profile/profile.services";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import { ChangePasswordRequest, ChangePasswordResponse } from "../types/change-password.types";

export const useChangeAvatar = () => {
  return useMutation<ChangeAvatarResponse, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      return await changeAvatarAPI.uploadAvatar(formData);
    },
    onSuccess: (data) => {
      Alert.alert("Success", data.message || "Avatar updated successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to upload avatar");
    },
  });
};

export const useChangePassword = () => {
  return useMutation<ChangePasswordResponse, Error, ChangePasswordRequest>({
    mutationFn: async (data: ChangePasswordRequest) => {
      return await authAPI.changePassword(data);
    },
    onSuccess: (response) => {
      Alert.alert('Success', response.message || 'Password changed successfully.');
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to change password. Please try again.');
    },
  });
};

export const useUpdateProfile = () => {
  return useMutation<UpdateProfileResponse, Error, UpdateProfile>({
    mutationFn: async (data: UpdateProfile) => {
      return await updateProfileAPI.updateProfile(data);
    },
    onSuccess: (response) => {
      Alert.alert("Success", response.message || "Profile updated successfully!");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to update profile. Please try again.");
    },
  });
};
