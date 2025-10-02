import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const loginPic = require('../../assets/images/loginPic2.png');

const LoginScreen: React.FC = () => {
    const [showEmailLogin, setShowEmailLogin] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0520" />

            <View style={styles.content}>
                {/* Welcome Header */}
                <View style={styles.headerContainer}>
                    <Text style={styles.welcomeTitle}>Welcome!</Text>
                    <Text style={styles.welcomeSubtitle}>
                        Your Enery starts here
                    </Text>
                </View>

                {/* Illustration Container */}
                <View style={styles.illustrationContainer}>
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

                        {/* Platform */}
                        {/* <LinearGradient
                            colors={['#6d4aff', '#9b59b6']}
                            style={styles.platform}
                        /> */}
                    </View>
                </View>

                {/* Login Options */}
                <View style={styles.loginOptions}>
                    {/* Google Login */}
                    <TouchableOpacity style={styles.loginButton}>
                        <Ionicons name="logo-google" size={20} color="#4285F4" />
                        <Text style={styles.loginButtonText}>Continue with Google</Text>
                    </TouchableOpacity>

                    {/* Email Login */}
                    <TouchableOpacity
                        style={[styles.loginButton, styles.emailButton]}
                        onPress={() => setShowEmailLogin(true)}
                    >
                        <Ionicons name="mail" size={20} color="white" />
                        <Text style={[styles.loginButtonText, styles.emailButtonText]}>
                            Continue with email
                        </Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>Or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Business Login */}
                    <TouchableOpacity style={styles.businessButton}>
                        <Ionicons name="business" size={20} color="#6d4aff" />
                        <Text style={styles.businessButtonText}>Lorem for Business</Text>
                    </TouchableOpacity>
                </View>
                {/* Terms and Privacy */}
                <View style={styles.termsContainer}>
                    <Text style={styles.termsText}>
                        By continuing, you are agreeing to our{' '}
                        <Text style={styles.linkText}>Terms & Conditions</Text>
                        {' '}and{' '}
                        <Text style={styles.linkText}>Privacy Policy</Text>
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0520',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 12,
    },
    welcomeSubtitle: {
        fontSize: 18,
        color: '#a0a0a0',
        textAlign: 'center',
        lineHeight: 24,
    },
    illustrationContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 40,
    },
    illustration: {
        width: 280,
        height: 280,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginImage: {
        width: 260,
        height: 200,
        resizeMode: 'contain',
    },
    character: {
        position: 'relative',
        zIndex: 2,
    },
    characterBody: {
        width: 80,
        height: 100,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    characterFace: {
        alignItems: 'center',
        marginTop: 10,
    },
    eye: {
        width: 6,
        height: 6,
        backgroundColor: '#2c3e50',
        borderRadius: 3,
        marginHorizontal: 4,
        position: 'absolute',
        top: -5,
    },
    mouth: {
        width: 12,
        height: 6,
        backgroundColor: '#2c3e50',
        borderRadius: 6,
        marginTop: 8,
    },
    characterArm: {
        position: 'absolute',
        right: -15,
        top: 20,
        width: 30,
        height: 6,
        backgroundColor: '#00d4aa',
        borderRadius: 3,
        transform: [{ rotate: '45deg' }],
    },
    sparkle1: {
        position: 'absolute',
        top: -10,
        right: -20,
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
        width: 20,
        height: 20,
        backgroundColor: '#ff69b4',
        top: 20,
        left: 10,
    },
    ball2: {
        width: 16,
        height: 16,
        backgroundColor: '#6d4aff',
        top: 100,
        right: 20,
    },
    ball3: {
        width: 24,
        height: 24,
        backgroundColor: '#00d4aa',
        bottom: 40,
        left: 0,
    },
    ball4: {
        width: 18,
        height: 18,
        backgroundColor: '#ffd700',
        bottom: 120,
        right: 10,
    },
    ball5: {
        width: 14,
        height: 14,
        backgroundColor: '#ff6b6b',
        top: 0,
        right: 100,
    },
    star1: {
        position: 'absolute',
        top: 50,
        left: 110,
    },
    star2: {
        position: 'absolute',
        top: 180,
        right: 30,
    },
    star3: {
        position: 'absolute',
        bottom: 40,
        left: 180,
    },
    platform: {
        position: 'absolute',
        bottom: 0,
        width: 200,
        height: 40,
        borderRadius: 20,
        zIndex: 1,
    },
    loginOptions: {
        marginBottom: 30,
    },
    loginButton: {
        backgroundColor: 'white',
        borderRadius: 25,
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    emailButton: {
        backgroundColor: '#6d4aff',
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginLeft: 12,
    },
    emailButtonText: {
        color: 'white',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#333',
    },
    dividerText: {
        color: '#a0a0a0',
        fontSize: 14,
        marginHorizontal: 16,
    },
    businessButton: {
        borderWidth: 2,
        borderColor: '#6d4aff',
        borderRadius: 25,
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    businessButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6d4aff',
        marginLeft: 12,
    },
    termsContainer: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    termsText: {
        fontSize: 13,
        color: '#a0a0a0',
        textAlign: 'center',
        lineHeight: 18,
    },
    linkText: {
        color: '#6d4aff',
        fontWeight: '600',
    },
});

export default LoginScreen;