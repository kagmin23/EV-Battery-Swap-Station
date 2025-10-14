import { resendOtp, verifyEmail } from '@/features/auth/apis/authAPI';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Keyboard,

    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const loginPic = require('../../assets/images/loginPic2.png');

export default function VerifyEmailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const email = params.email as string || '';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Refs for OTP inputs
    const inputRefs = useRef<(TextInput | null)[]>([]);

    // Countdown timer for resend button
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Check if email is provided
    useEffect(() => {
        if (!email) {
            Alert.alert(
                'Email Required',
                'No email provided. Please go back to login page.',
                [
                    {
                        text: 'Go to Login',
                        onPress: () => router.replace('/auth/login')
                    }
                ]
            );
        }
    }, [email, router]);

    const handleOtpChange = (value: string, index: number) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-hide keyboard when all 6 digits are entered
        if (value && index === 5) {
            const completedOtp = [...newOtp];
            if (completedOtp.every(digit => digit !== '')) {
                setTimeout(() => {
                    Keyboard.dismiss();
                }, 100);
            }
        }
    };

    const handleBackspace = (value: string, index: number) => {
        if (value === '' && index > 0) {
            // Focus previous input on backspace when current is empty
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            Alert.alert('Invalid OTP', 'Please enter all 6 digits');
            return;
        }

        // Check if email is available
        if (!email) {
            Alert.alert('Error', 'Email is required. Please go back to login page.');
            return;
        }

        // Dismiss keyboard before showing loading
        Keyboard.dismiss();

        setSubmitting(true);
        try {
            const response = await verifyEmail({
                email: email,
                otp: otpCode,
            });
            if (response && (response.success === true || response.message)) {
                Alert.alert(
                    'Email Verified! ✅',
                    response.message || 'Your email has been verified successfully. You can now login.',
                    [
                        {
                            text: 'Go to Login',
                            onPress: () => router.replace('/auth/login')
                        }
                    ]
                );
            } else {
                throw new Error(response?.message || 'Verification failed');
            }
        } catch (error: any) {
            let errorMessage = 'Verification failed. Please try again.';
            if (error?.message) {
                errorMessage = error.message;
            }

            Alert.alert('Verification Failed', errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleResendOtp = async () => {
        if (countdown > 0) return;

        // Check if email is available
        if (!email) {
            Alert.alert('Error', 'Email is required. Please go back to login page.');
            return;
        }

        setResending(true);
        try {
            const response = await resendOtp({ email });
            Alert.alert(
                '📧 OTP Sent!',
                response.message || 'A new OTP has been sent to your email.',
                [{ text: 'OK' }]
            );

            setCountdown(60);

            // Clear current OTP
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();

        } catch (error: any) {
            let errorMessage = 'Failed to resend OTP. Please try again.';
            if (error?.message) {
                errorMessage = error.message;
            }

            Alert.alert('Resend Failed', errorMessage);
        } finally {
            setResending(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0520" />

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Verify Email</Text>
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
                        <View style={styles.emailContainer}>
                            <Ionicons name="mail" size={32} color="#6d4aff" />
                            <Text style={styles.subtitle}>
                                We sent a verification code to
                            </Text>

                            <View style={styles.emailInputContainer}>
                                <TextInput
                                    style={styles.emailInput}
                                    value={email}
                                    editable={false}
                                    placeholder="Email address"
                                    placeholderTextColor="#a0a0a0"
                                />
                                <Ionicons name="lock-closed" size={16} color="#a0a0a0" style={styles.lockIcon} />
                            </View>

                            <Text style={styles.description}>
                                Enter the 6-digit code to verify your email
                            </Text>
                        </View>

                        {/* OTP Input */}
                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => {
                                        inputRefs.current[index] = ref;
                                    }}
                                    style={[
                                        styles.otpInput,
                                        digit ? styles.otpInputFilled : null
                                    ]}
                                    value={digit}
                                    onChangeText={(value) => handleOtpChange(value, index)}
                                    onKeyPress={({ nativeEvent }) => {
                                        if (nativeEvent.key === 'Backspace') {
                                            handleBackspace(digit, index);
                                        }
                                    }}
                                    maxLength={1}
                                    keyboardType="numeric"
                                    textAlign="center"
                                    selectTextOnFocus
                                    autoFocus={index === 0}
                                />
                            ))}
                        </View>

                        {/* Verify Button */}
                        <TouchableOpacity
                            style={[styles.verifyButton, submitting && styles.verifyButtonDisabled]}
                            onPress={handleVerify}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.verifyButtonText}>Verify Email</Text>
                            )}
                        </TouchableOpacity>

                        {/* Resend OTP */}
                        <View style={styles.resendContainer}>
                            <Text style={styles.resendText}>
                                Didn&apos;t receive the code?{' '}
                            </Text>
                            <TouchableOpacity
                                onPress={handleResendOtp}
                                disabled={countdown > 0 || resending}
                            >
                                <Text style={[
                                    styles.resendLink,
                                    (countdown > 0 || resending) && styles.resendDisabled
                                ]}>
                                    {resending ? 'Sending...' :
                                        countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0520',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
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
    emailContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    emailInputContainer: {
        position: 'relative',
        width: '100%',
        marginVertical: 12,
    },
    emailInput: {
        backgroundColor: '#140a30',
        borderWidth: 2,
        borderColor: '#2a1f4d',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: '#c0c0c0ff',
        fontSize: 16,
        textAlign: 'center',
    },
    lockIcon: {
        position: 'absolute',
        right: 16,
        top: '50%',
        marginTop: -8,
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    emailText: {
        fontSize: 16,
        color: '#6d4aff',
        fontWeight: '600',
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        color: '#a0a0a0',
        textAlign: 'center',
        lineHeight: 20,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
        gap: 12,
    },
    otpInput: {
        width: 45,
        height: 55,
        borderRadius: 12,
        backgroundColor: '#140a30',
        borderWidth: 2,
        borderColor: '#2a1f4d',
        color: '#fff',
        fontSize: 24,
        fontWeight: '600',
    },
    otpInputFilled: {
        borderColor: '#6d4aff',
        backgroundColor: 'rgba(109, 74, 255, 0.1)',
    },
    verifyButton: {
        backgroundColor: '#6d4aff',
        borderRadius: 25,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    verifyButtonDisabled: {
        opacity: 0.7,
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    resendText: {
        color: '#a0a0a0',
        fontSize: 14,
    },
    resendLink: {
        color: '#6d4aff',
        fontSize: 14,
        fontWeight: '600',
    },
    resendDisabled: {
        color: '#666',
    },
});