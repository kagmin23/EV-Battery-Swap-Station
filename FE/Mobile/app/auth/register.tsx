import { registerUser } from '@/features/auth/apis/authAPI';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const loginPic = require('../../assets/images/loginPic2.png');

export default function RegisterScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Please enter your full name';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Please enter your email';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Please enter your phone number';
        } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
            newErrors.phoneNumber = 'Please enter a valid phone number';
        }

        if (!formData.password) {
            newErrors.password = 'Please enter a password';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const response = await registerUser({
                fullName: formData.fullName.trim(),
                email: formData.email.trim().toLowerCase(),
                phoneNumber: formData.phoneNumber.trim(),
                password: formData.password,
                confirmPassword: formData.confirmPassword,
            });

            if (response && (response.success === true || response.message)) {
                const successMessage = response.message || 'Your account has been created successfully.';
                Alert.alert(
                    'Registration Successful! 🎉',
                    `${successMessage} Please check your email to verify your account.`,
                    [
                        {
                            text: 'Verify Email',
                            onPress: () => router.replace(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`)
                        }
                    ]
                );
            } else {
                throw new Error(response?.message || 'Registration failed');
            }
        } catch (error: any) {
            // Show error message
            let errorMessage = 'Registration failed. Please try again.';
            if (error?.message) {
                errorMessage = error.message;
            } else if (error?.errors) {
                // Handle validation errors from backend
                const errorMessages = Object.values(error.errors).join('\n');
                errorMessage = errorMessages;
            }
            
            Alert.alert('Registration Failed', errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0520" />
            
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Sign Up</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Background Illustration */}
                <View style={styles.backgroundContainer}>
                    <View style={styles.illustration}>
                        {/* Floating Elements */}
                        <View style={styles.floatingElements}>
                            <View style={[styles.floatingBall, styles.ball1]} />
                            <View style={[styles.floatingBall, styles.ball2]} />
                            <View style={[styles.floatingBall, styles.ball3]} />
                            <View style={[styles.floatingBall, styles.ball4]} />
                            <View style={[styles.floatingBall, styles.ball5]} />

                            {/* Stars */}
                            <View style={styles.star1}>
                                <Ionicons name="star" size={8} color="#ffd700" />
                            </View>
                            <View style={styles.star2}>
                                <Ionicons name="star" size={6} color="#ff69b4" />
                            </View>
                            <View style={styles.star3}>
                                <Ionicons name="star" size={10} color="#00d4aa" />
                            </View>
                        </View>

                        {/* Center Illustration Image */}
                        <Image source={loginPic} style={styles.loginImage} />
                    </View>
                </View>

                {/* Form Card Overlay */}
                <View style={styles.formCard}>
                    <Text style={styles.subtitle}>Create your account to get started</Text>

                    {/* Form */}
                    <View style={styles.form}>
                    {/* Full Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color="#a0a0a0" />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                placeholderTextColor="#a0a0a0"
                                value={formData.fullName}
                                onChangeText={(value) => updateField('fullName', value)}
                                autoCapitalize="words"
                            />
                        </View>
                        {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color="#a0a0a0" />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#a0a0a0"
                                value={formData.email}
                                onChangeText={(value) => updateField('email', value)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    {/* Phone Number */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="call-outline" size={20} color="#a0a0a0" />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your phone number"
                                placeholderTextColor="#a0a0a0"
                                value={formData.phoneNumber}
                                onChangeText={(value) => updateField('phoneNumber', value)}
                                keyboardType="phone-pad"
                            />
                        </View>
                        {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#a0a0a0" />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor="#a0a0a0"
                                value={formData.password}
                                onChangeText={(value) => updateField('password', value)}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color="#a0a0a0"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#a0a0a0" />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm your password"
                                placeholderTextColor="#a0a0a0"
                                value={formData.confirmPassword}
                                onChangeText={(value) => updateField('confirmPassword', value)}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeButton}
                            >
                                <Ionicons
                                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color="#a0a0a0"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Sign Up</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => router.replace('/auth/login')}
                    >
                        <Text style={styles.loginText}>
                            Already have an account? <Text style={styles.loginLinkText}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0520',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    backgroundContainer: {
        position: 'absolute',
        top: 120,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    formCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 24,
        padding: 24,
        marginTop: 200,
        zIndex: 2,
        backdropFilter: 'blur(10px)',
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    illustration: {
        width: 300,
        height: 300,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginImage: {
        width: 260,
        height: 200,
        resizeMode: 'contain',
        opacity: 0.6,
    },
    floatingElements: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    floatingBall: {
        position: 'absolute',
        borderRadius: 50,
    },
    ball1: {
        width: 12,
        height: 12,
        backgroundColor: '#ff69b4',
        top: 10,
        left: 5,
    },
    ball2: {
        width: 10,
        height: 10,
        backgroundColor: '#6d4aff',
        top: 60,
        right: 15,
    },
    ball3: {
        width: 14,
        height: 14,
        backgroundColor: '#00d4aa',
        bottom: 20,
        left: 0,
    },
    ball4: {
        width: 11,
        height: 11,
        backgroundColor: '#ffd700',
        bottom: 70,
        right: 5,
    },
    ball5: {
        width: 8,
        height: 8,
        backgroundColor: '#ff6b6b',
        top: 0,
        right: 60,
    },
    star1: {
        position: 'absolute',
        top: 30,
        left: 80,
    },
    star2: {
        position: 'absolute',
        top: 100,
        right: 20,
    },
    star3: {
        position: 'absolute',
        bottom: 20,
        left: 120,
    },
    form: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#140a30',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#2a1f4d',
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        paddingVertical: 12,
        paddingLeft: 12,
    },
    eyeButton: {
        padding: 4,
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500',
    },
    submitButton: {
        backgroundColor: '#6d4aff',
        borderRadius: 25,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loginLink: {
        alignItems: 'center',
        marginTop: 20,
    },
    loginText: {
        color: '#a0a0a0',
        fontSize: 14,
    },
    loginLinkText: {
        color: '#6d4aff',
        fontWeight: '600',
    },
});
