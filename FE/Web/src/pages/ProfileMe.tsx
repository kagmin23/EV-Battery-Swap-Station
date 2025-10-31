import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CommonHeader } from '../components/common/CommonHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Shield, Calendar, Edit, Lock, CheckCircle, X, Save, Eye, EyeOff, KeyRound, ArrowLeft, Camera } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: 'admin' | 'staff' | 'driver';
  status: string;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

const ProfileMe: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Avatar Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
  });

  // Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8001/api/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        setError('Unable to load profile information');
      }
    } catch (err) {
      const error = err as Error;
      setError(`Connection error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'staff':
        return 'Staff';
      case 'driver':
        return 'Driver';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'staff':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'driver':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300">
          <CheckCircle className="w-4 h-4 mr-1" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-300">
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEditProfile = () => {
    if (profile) {
      setEditForm({
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
      });
      setEditError(null);
      setIsEditModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditError(null);
    setEditForm({ fullName: '', phoneNumber: '' });
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    setEditError(null);
  };

  const validateEditForm = (): boolean => {
    if (!editForm.fullName.trim()) {
      setEditError('Full name is required');
      return false;
    }
    if (!editForm.phoneNumber.trim()) {
      setEditError('Phone number is required');
      return false;
    }
    // Basic phone validation
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(editForm.phoneNumber)) {
      setEditError('Invalid phone number (10-11 digits)');
      return false;
    }
    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateEditForm()) {
      return;
    }

    setEditLoading(true);
    setEditError(null);

    try {
      const response = await fetch('http://localhost:8001/api/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update profile state with new data
        if (result.data) {
          setProfile(result.data);
        } else {
          // If API doesn't return data, fetch again
          await fetchProfile();
        }
        setIsEditModalOpen(false);
        setEditForm({ fullName: '', phoneNumber: '' });
        
        // Show success toast
        toast.success('Profile updated successfully!', {
          description: 'Your information has been updated.',
        });
      } else {
        setEditError(result.message || 'Unable to update profile');
      }
    } catch (err) {
      const error = err as Error;
      setEditError(`Connection error: ${error.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file!');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must not exceed 5MB!');
      return;
    }

    setAvatarUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('http://localhost:8001/api/users/me/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update profile state with new avatar
        if (profile) {
          setProfile({
            ...profile,
            avatar: result.data.avatar,
          });
        }
        
        toast.success('Avatar updated successfully!', {
          description: 'Your profile picture has been updated.',
        });
      } else {
        toast.error('Unable to update avatar', {
          description: result.message || 'Please try again later.',
        });
      }
    } catch (err) {
      const error = err as Error;
      toast.error('Connection error', {
        description: error.message,
      });
    } finally {
      setAvatarUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleChangePassword = () => {
    setPasswordForm({
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    setShowPasswords({
      oldPassword: false,
      newPassword: false,
      confirmNewPassword: false,
    });
    setPasswordError(null);
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordError(null);
    setPasswordForm({
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    setShowPasswords({
      oldPassword: false,
      newPassword: false,
      confirmNewPassword: false,
    });
  };

  const handlePasswordFormChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    setPasswordError(null);
  };

  const togglePasswordVisibility = (field: 'oldPassword' | 'newPassword' | 'confirmNewPassword') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePasswordForm = (): boolean => {
    if (!passwordForm.oldPassword) {
      setPasswordError('Please enter current password');
      return false;
    }
    if (!passwordForm.newPassword) {
      setPasswordError('Please enter new password');
      return false;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return false;
    }
    if (!passwordForm.confirmNewPassword) {
      setPasswordError('Please confirm new password');
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError('New password and confirmation do not match');
      return false;
    }
    if (passwordForm.oldPassword === passwordForm.newPassword) {
      setPasswordError('New password must be different from current password');
      return false;
    }
    return true;
  };

  const handleSavePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);

    try {
      const response = await fetch('http://localhost:8001/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
          confirmNewPassword: passwordForm.confirmNewPassword,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsPasswordModalOpen(false);
        setPasswordForm({
          oldPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        
        // Show success toast
        toast.success('Password changed successfully!', {
          description: 'Your password has been updated.',
        });
      } else {
        setPasswordError(result.message || 'Unable to change password. Please check your current password.');
      }
    } catch (err) {
      const error = err as Error;
      setPasswordError(`Connection error: ${error.message}`);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <CommonHeader />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Spinner className="w-12 h-12 mx-auto mb-4" />
            <p className="text-gray-600">Loading profile information...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <CommonHeader />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to Load Profile
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchProfile} className="bg-purple-600 hover:bg-purple-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <CommonHeader />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          {/* Change Password Modal */}
          <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <KeyRound className="w-6 h-6 mr-2 text-purple-600" />
                  Change Password
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Change your password to secure your account.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-4">
                {/* Old Password */}
                <div className="space-y-2">
                  <Label htmlFor="oldPassword" className="text-sm font-semibold text-gray-700">
                    Current Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="oldPassword"
                      type={showPasswords.oldPassword ? 'text' : 'password'}
                      value={passwordForm.oldPassword}
                      onChange={(e) => handlePasswordFormChange('oldPassword', e.target.value)}
                      placeholder="Enter current password"
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 pr-10"
                      disabled={passwordLoading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('oldPassword')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={passwordLoading}
                    >
                      {showPasswords.oldPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">
                    New Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.newPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordFormChange('newPassword', e.target.value)}
                      placeholder="Enter new password (minimum 6 characters)"
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 pr-10"
                      disabled={passwordLoading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('newPassword')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={passwordLoading}
                    >
                      {showPasswords.newPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword" className="text-sm font-semibold text-gray-700">
                    Confirm New Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmNewPassword"
                      type={showPasswords.confirmNewPassword ? 'text' : 'password'}
                      value={passwordForm.confirmNewPassword}
                      onChange={(e) => handlePasswordFormChange('confirmNewPassword', e.target.value)}
                      placeholder="Re-enter new password"
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 pr-10"
                      disabled={passwordLoading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmNewPassword')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={passwordLoading}
                    >
                      {showPasswords.confirmNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 flex items-center">
                      <X className="w-4 h-4 mr-2 flex-shrink-0" />
                      {passwordError}
                    </p>
                  </div>
                )}

                {/* Security Tips */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 font-semibold mb-2">💡 Security Tips:</p>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Use at least 6 characters</li>
                    <li>Combine uppercase, lowercase and numbers</li>
                    <li>Avoid easily guessable passwords</li>
                  </ul>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={handleClosePasswordModal}
                  disabled={passwordLoading}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePassword}
                  disabled={passwordLoading}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  {passwordLoading ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Profile Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <Edit className="w-6 h-6 mr-2 text-purple-600" />
                  Edit Profile
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Update your personal information. Click save when done.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={editForm.fullName}
                    onChange={(e) => handleEditFormChange('fullName', e.target.value)}
                    placeholder="Enter full name"
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    disabled={editLoading}
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={editForm.phoneNumber}
                    onChange={(e) => handleEditFormChange('phoneNumber', e.target.value)}
                    placeholder="Enter phone number (10-11 digits)"
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    disabled={editLoading}
                  />
                </div>

                {/* Error Message */}
                {editError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 flex items-center">
                      <X className="w-4 h-4 mr-2 flex-shrink-0" />
                      {editError}
                    </p>
                  </div>
                )}

                {/* Info Note */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Email and role cannot be edited.
                  </p>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={handleCloseEditModal}
                  disabled={editLoading}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={editLoading}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  {editLoading ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Header Card */}
          <Card className="mb-6 overflow-hidden shadow-xl border-0">
            <div className="h-32 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700"></div>
            <CardContent className="relative pt-0 pb-8">
              {/* Avatar */}
              <div className="flex justify-center -mt-16 mb-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-white overflow-hidden">
                    {profile.avatar ? (
                      <img
                        src={`http://localhost:8001${profile.avatar}`}
                        alt={profile.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-purple-600" />
                    )}
                  </div>
                  
                  {/* Camera Overlay */}
                  <button
                    onClick={handleAvatarClick}
                    disabled={avatarUploading}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border-4 border-white disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Change avatar"
                  >
                    {avatarUploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5 text-white" />
                    )}
                  </button>
                  
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Name and Role */}
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.fullName}
                </h1>
                <div className="flex items-center justify-center gap-3">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold border ${getRoleBadgeColor(profile.role)}`}>
                    <Shield className="w-4 h-4 mr-1.5" />
                    {getRoleLabel(profile.role)}
                  </span>
                  {getStatusBadge(profile.status)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleEditProfile}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  onClick={handleChangePassword}
                  variant="outline"
                  className="border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-gray-900 font-medium break-all">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <Phone className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    <p className="text-gray-900 font-medium">{profile.phoneNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Account ID</p>
                    <p className="text-gray-900 font-mono text-sm break-all">{profile.id}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Created Date</p>
                    <p className="text-gray-900 font-medium text-sm">
                      {formatDate(profile.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                    <p className="text-gray-900 font-medium text-sm">
                      {formatDate(profile.updatedAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileMe;

