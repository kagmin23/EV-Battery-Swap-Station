import { config } from '@/config/env';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useChangeAvatar, useChangePassword, useUpdateProfile } from '@/features/driver/apis/profileAPI';
import { ChangePasswordRequest } from '@/features/driver/types/change-password.types';
import { IProfile } from '@/features/driver/types/profile.types';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileTabScreen() {
    const { user, restore } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [refreshing, setRefreshing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [localProfile, setLocalProfile] = useState<IProfile | null>(null);
    const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [passwordErrors, setPasswordErrors] = useState<{ [k: string]: string }>({});
    const [showChangePassword, setShowChangePassword] = useState(false);

    const { mutate: changeAvatar, isPending } = useChangeAvatar();
    const { mutate: changePassword } = useChangePassword();
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

    const resolveAvatarUrl = (avatar?: string) => {
        if (!avatar) return '';
        if (/^https?:\/\//i.test(avatar)) return avatar;
        const base = config.API_BASE_URL.replace(/\/?api\/?$/, '');
        return `${base}${avatar.startsWith('/') ? avatar : `/${avatar}`}`;
    };

    const profile: IProfile | null = useMemo(() => {
        if (!user) return null;
        const mapped: IProfile = {
            email: user.email ?? '-',
            fullName: user.fullName ?? '-',
            phoneNumber: user.phoneNumber ?? '-',
            role: (user as any).role ?? 'driver',
            isVerified: Boolean(user.isVerified),
            status: (user as any).status ?? 'active',
            avatar: resolveAvatarUrl((user as any).avatar),
        };
        return localProfile ?? mapped;
    }, [user, localProfile]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await restore();
        } finally {
            setRefreshing(false);
        }
    }, [restore]);

    const startEdit = () => {
        if (profile) setLocalProfile({ ...profile });
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setLocalProfile(null);
    };

    const setField = (key: keyof IProfile, value: string) => {
        if (!localProfile) return;
        setLocalProfile({ ...localProfile, [key]: value });
    };

    const isDirty = useMemo(() => {
        if (!isEditing || !localProfile || !profile) return false;
        return (
            (localProfile.fullName ?? '') !== (profile.fullName ?? '') ||
            (localProfile.phoneNumber ?? '') !== (profile.phoneNumber ?? '')
        );
    }, [isEditing, localProfile, profile]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled) {
            const uri = result.assets[0].uri;
            const formData = new FormData();
            formData.append('avatar', {
                uri,
                name: 'avatar.png',
                type: 'image/png',
            } as any);
            changeAvatar(formData, {
                onSuccess: async (res) => {
                    const absolute = resolveAvatarUrl(res.data.avatar);
                    setLocalProfile((prev) => ({
                        ...(prev || {
                            email: user?.email ?? '-',
                            fullName: user?.fullName ?? '-',
                            phoneNumber: user?.phoneNumber ?? '-',
                            role: (user as any)?.role ?? 'driver',
                            isVerified: Boolean((user as any)?.isVerified),
                            status: (user as any)?.status ?? 'active',
                            avatar: '',
                        }),
                        avatar: absolute,
                    }));

                    // Persist to storage so restored user also has latest avatar
                    try {
                        const raw = await AsyncStorage.getItem('auth_user');
                        if (raw) {
                            const parsed = JSON.parse(raw);
                            parsed.avatar = absolute;
                            await AsyncStorage.setItem('auth_user', JSON.stringify(parsed));
                            await restore();
                        }
                    } catch {}
                },
            });
        }
    };

    const validatePassword = (f: ChangePasswordRequest) => {
        const errs: { [k: string]: string } = {};
        if (!f.oldPassword) errs.oldPassword = 'Current password is required';
        if (!f.newPassword) errs.newPassword = 'New password is required';
        if (f.newPassword && f.newPassword.length < 6) errs.newPassword = 'At least 6 characters';
        if (!f.confirmNewPassword) errs.confirmNewPassword = 'Confirm password is required';
        if (f.newPassword && f.confirmNewPassword && f.newPassword !== f.confirmNewPassword) {
            errs.confirmNewPassword = 'Passwords do not match';
        }
        return errs;
    };

    const onSubmitChangePassword = () => {
        const errs = validatePassword(passwordForm);
        setPasswordErrors(errs);
        if (Object.keys(errs).length > 0) return;
        changePassword(passwordForm, {
            onSuccess: () => {
                setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
                setShowChangePassword(false);
            },
        });
    };

    const handleSave = () => {
        if (!localProfile) return;
        const payload = {
            fullName: (localProfile.fullName || '').trim(),
            phoneNumber: (localProfile.phoneNumber || '').trim(),
        };
        updateProfile(payload, {
            onSuccess: async (res) => {
                // Persist updated fields locally so UI and future sessions reflect changes
                try {
                    const raw = await AsyncStorage.getItem('auth_user');
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        parsed.fullName = res?.data?.fullName ?? payload.fullName;
                        parsed.phoneNumber = res?.data?.phoneNumber ?? payload.phoneNumber;
                        await AsyncStorage.setItem('auth_user', JSON.stringify(parsed));
                    }
                } catch {}
                await restore();
                setIsEditing(false);
                setLocalProfile(null);
            },
        });
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#0a0520' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={insets.top}
        >
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, gap: 16 }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'interactive'}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity onPress={() => router.push('/driver/ProfileScreen')} style={{ marginTop: 25 }}>
                        <Ionicons name="arrow-back" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: 'white', marginTop: 24, marginRight: 'auto' }}>My Profile</Text>
                    {profile && (
                        <TouchableOpacity onPress={isEditing ? cancelEdit : startEdit}>
                            <Ionicons style={styles.btnBack} name={isEditing ? 'close' : 'create-outline'} size={22} color="#ffffff" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ alignItems: 'center', marginBottom: 10, top: 30 }}>
                    <TouchableOpacity disabled={!isEditing || isPending} onPress={pickImage}>
                        {profile?.avatar ? (
                            <View>
                                <Image source={{ uri: profile.avatar }} style={{ width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: '#795cf2' }} />
                                {isEditing && (
                                    <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#795cf2', borderRadius: 16, padding: 6 }}>
                                        <Ionicons name="camera" size={22} color="white" />
                                    </View>
                                )}
                            </View>
                        ) : (
                            <Ionicons name="person-circle-outline" size={110} color="#795cf2" />
                        )}
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 7 }}>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                            {profile?.fullName}
                        </Text>
                        <MaterialIcons name="verified" size={15} color="white" style={{ marginLeft: 5 }} />
                    </View>
                    <View style={{ flexDirection: 'row', gap: 5, alignItems: 'flex-end' }}>
                        <AntDesign name="car" size={15} color="white" style={{ color: 'white', fontStyle: 'italic', opacity: 0.7 }} />
                        <Text style={{ color: 'white', fontStyle: 'italic', fontSize: 14, opacity: 0.7 }}>{profile?.role}</Text>
                    </View>
                </View>

                {profile ? (
                    <View style={{ backgroundColor: '#1a0f3e', borderRadius: 16, padding: 16, top: 30 }}>
                        <Row label="Email"><Text style={{ color: 'white' }}>{profile.email}</Text></Row>
                        <Row label="Full name">
                            {isEditing ? (
                                <TextInput
                                    value={localProfile?.fullName ?? ''}
                                    onChangeText={(t) => setField('fullName', t)}
                                    placeholder="Your full name"
                                    placeholderTextColor="#7e7ea0"
                                    style={{ color: 'white', backgroundColor: '#241a4b', padding: 10, borderRadius: 8 }}
                                />
                            ) : (
                                <Text style={{ color: 'white' }}>{profile.fullName}</Text>
                            )}
                        </Row>
                        <Row label="Phone">
                            {isEditing ? (
                                <TextInput
                                    value={localProfile?.phoneNumber ?? ''}
                                    onChangeText={(t) => setField('phoneNumber', t)}
                                    placeholder="Your phone number"
                                    placeholderTextColor="#7e7ea0"
                                    keyboardType="phone-pad"
                                    style={{ color: 'white', backgroundColor: '#241a4b', padding: 10, borderRadius: 8 }}
                                />
                            ) : (
                                <Text style={{ color: 'white' }}>{profile.phoneNumber}</Text>
                            )}
                        </Row>
                        <Row label="Role"><Text style={{ color: 'white' }}>{String(profile.role)}</Text></Row>
                        <Row label="Verified"><Text style={{ color: 'white' }}>{profile.isVerified ? 'Yes' : 'No'}</Text></Row>
                        <Row label="Status"><Text style={{ color: 'white' }}>{String(profile.status)}</Text></Row>

                        {isEditing && (
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                                <TouchableOpacity onPress={cancelEdit}><Text style={[styles.btnTextPrimary, styles.btn]}>Cancel</Text></TouchableOpacity>
                                <TouchableOpacity onPress={handleSave} disabled={!isDirty || isUpdating}>
                                    <Text style={[styles.btnPrimary, styles.btn, (!isDirty || isUpdating) && { opacity: 0.6 }]}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ) : (
                    <View><Text style={{ color: '#a7a7c7' }}>You are not logged in.</Text></View>
                )}

                {profile && (
                    <View style={{ backgroundColor: '#1a0f3e', borderRadius: 16, padding: 16, top: 30 }}>
                        {!showChangePassword && (
                            <TouchableOpacity onPress={() => setShowChangePassword(true)}>
                                <Text style={{ color: '#795cf2', textAlign: 'center' }}>Change Password</Text>
                            </TouchableOpacity>
                        )}
                        {showChangePassword && (
                            <>
                                <Field label="Current Password" secure value={passwordForm.oldPassword}
                                    onChangeText={(t) => setPasswordForm((s) => ({ ...s, oldPassword: t }))} error={passwordErrors.oldPassword} />
                                <Field label="New Password" secure value={passwordForm.newPassword}
                                    onChangeText={(t) => setPasswordForm((s) => ({ ...s, newPassword: t }))} error={passwordErrors.newPassword} />
                                <Field label="Confirm Password" secure value={passwordForm.confirmNewPassword}
                                    onChangeText={(t) => setPasswordForm((s) => ({ ...s, confirmNewPassword: t }))} error={passwordErrors.confirmNewPassword} />

                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                                    <TouchableOpacity onPress={() => {
                                        setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
                                        setPasswordErrors({});
                                        setShowChangePassword(false);
                                    }}>
                                        <Text style={[styles.btnTextPrimary, styles.btn]}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={onSubmitChangePassword}>
                                        <Text style={[styles.btnPrimary, styles.btn]}>Update</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 }}>
            <Text style={{ color: '#a7a7c7' }}>{label}</Text>
            <View style={{ maxWidth: '65%' }}>{children}</View>
        </View>
    );
}

function Field({
    label, value, onChangeText, secure, error,
}: { label: string; value: string; onChangeText: (t: string) => void; secure?: boolean; error?: string }) {
    return (
        <View style={{ marginTop: 12 }}>
            <Text style={{ color: '#a7a7c7' }}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={label}
                placeholderTextColor="#7e7ea0"
                secureTextEntry={secure}
                style={{ color: 'white', backgroundColor: '#241a4b', padding: 10, borderRadius: 8 }}
            />
            {!!error && <Text style={{ color: '#ff7a7a', marginTop: 4 }}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0520' },
    content: { padding: 20, gap: 16 },
    headerRow: { flexDirection: 'row', gap: 10 },
    avatarContainer: { alignItems: 'center', marginBottom: 10, },
    avatarImage: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: '#795cf2', },
    cameraOverlay: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#795cf2', borderRadius: 16, padding: 6, },
    avatarName: { color: 'white', fontSize: 16, fontWeight: '600', marginTop: 8, },
    headerTop: { display: 'flex', flexDirection: 'row', gap: 7, textAlign: 'center', alignContent: 'center', alignItems: 'flex-end' },
    roleTop: { color: 'white', fontWeight: '200', marginTop: 5, fontStyle: 'italic' },
    btnBack: { marginTop: 25, },
    title: { fontSize: 18, fontWeight: '600', color: 'white', marginTop: 24, marginRight: "auto" },
    btnEdit: { marginTop: 20 },
    card: { backgroundColor: '#1a0f3e', borderRadius: 16, padding: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2a2350' },
    label: { color: '#a7a7c7' },
    value: { color: 'white', fontWeight: '600' },
    empty: { color: '#a7a7c7' },
    sectionTitle: { color: 'white', fontWeight: '700', fontSize: 16, marginBottom: 8 },
    smallLabel: { color: '#a7a7c7', marginBottom: 6, fontSize: 12 },
    input: { backgroundColor: '#241a4b', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: 'white' },
    errorText: { color: '#ff7a7a', marginTop: 6, fontSize: 12 },
    editActions: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end', marginTop: 20, paddingBottom: 10 },
    btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
    btnPrimary: { backgroundColor: '#795cf2', color: "white" },
    btnSecondary: { backgroundColor: '#2a2350' },
    btnTextPrimary: { color: 'white', fontWeight: '500' },
    btnTextSecondary: { color: 'white' },
});
