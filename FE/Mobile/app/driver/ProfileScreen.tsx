import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    TextInput,
    Pressable,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';

const { height } = Dimensions.get('window');

type Option = { label: string; value: string };

const SearchableDropdown: React.FC<{
    label: string;
    value: string;
    options: Option[];
    placeholder?: string;
    onSelect: (v: string) => void;
}> = ({ label, value, options, placeholder, onSelect }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter(o => o.label.toLowerCase().includes(q));
    }, [options, query]);

    return (
        <View style={styles.formRow}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setOpen(!open)}
                style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
            >
                <Text style={{ color: value ? 'white' : '#7f6fb1' }}>
                    {value || (placeholder || 'Select...')}
                </Text>
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#bfa8ff" />
            </TouchableOpacity>
            {open && (
                <View style={styles.dropdownPanel}>
                    <View style={styles.dropdownSearchRow}>
                        <Ionicons name="search" size={16} color="#bfa8ff" style={{ marginRight: 8 }} />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder={placeholder || 'Search'}
                            placeholderTextColor="#7f6fb1"
                            style={styles.dropdownSearchInput}
                        />
                        {query ? (
                            <TouchableOpacity onPress={() => setQuery('')}>
                                <Ionicons name="close" size={16} color="#bfa8ff" />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                    <ScrollView style={{ maxHeight: 180 }} keyboardShouldPersistTaps="handled">
                        {filtered.map(opt => (
                            <TouchableOpacity
                                key={opt.value}
                                style={styles.dropdownItem}
                                onPress={() => {
                                    onSelect(opt.value);
                                    setOpen(false);
                                    setQuery('');
                                }}
                            >
                                <Text style={styles.dropdownItemText}>{opt.label}</Text>
                                {value === opt.value && <Ionicons name="checkmark" size={16} color="#6d4aff" />}
                            </TouchableOpacity>
                        ))}
                        {filtered.length === 0 && (
                            <View style={styles.dropdownEmpty}>
                                <Text style={{ color: '#7f6fb1' }}>No results</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [isAddEvOpen, setIsAddEvOpen] = useState(false);
    const [vin, setVin] = useState('');
    const [brand, setBrand] = useState('');
    const [carName, setCarName] = useState('');
    const [batteryModel, setBatteryModel] = useState('');
    const sheetY = useRef(new Animated.Value(height)).current;

    const openSheet = () => {
        setIsAddEvOpen(true);
        sheetY.setValue(height);
        Animated.spring(sheetY, { toValue: 0, useNativeDriver: true, bounciness: 0, speed: 18 }).start();
    };

    const closeSheet = () => {
        Animated.spring(sheetY, { toValue: height, useNativeDriver: true, bounciness: 0, speed: 18 }).start(() => {
            setIsAddEvOpen(false);
        });
    };

    const handleSave = () => {
        // TODO: integrate with backend later
        closeSheet();
    };

    // Hide/restore BottomTab when sheet opens/closes
    useEffect(() => {
        if (isAddEvOpen) {
            navigation.setOptions({ tabBarStyle: { display: 'none' } });
        } else {
            navigation.setOptions({
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    backgroundColor: '#190d35',
                    height: 80,
                    paddingTop: 8,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    shadowColor: '#FF74E2',
                    shadowOffset: { width: 0, height: -5 },
                    shadowOpacity: 1,
                    shadowRadius: 15,
                    elevation: 20,
                    borderTopWidth: 0,
                }
            });
        }
    }, [isAddEvOpen, navigation]);

    const brandOptions: Option[] = useMemo(() => [
        { label: 'VinFast', value: 'VinFast' },
        { label: 'Tesla', value: 'Tesla' },
        { label: 'BYD', value: 'BYD' },
        { label: 'Hyundai', value: 'Hyundai' },
        { label: 'Kia', value: 'Kia' },
        { label: 'Toyota', value: 'Toyota' },
    ], []);

    const carOptions: Option[] = useMemo(() => [
        { label: 'VF 3', value: 'VF 3' },
        { label: 'VF 5', value: 'VF 5' },
        { label: 'VF 6', value: 'VF 6' },
        { label: 'Model 3', value: 'Model 3' },
        { label: 'Model Y', value: 'Model Y' },
    ], []);

    const batteryOptions: Option[] = useMemo(() => [
        { label: 'LFP-42', value: 'LFP-42' },
        { label: 'LFP-60', value: 'LFP-60' },
        { label: 'NMC-75', value: 'NMC-75' },
        { label: 'NCA-82', value: 'NCA-82' },
    ], []);
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <LinearGradient
                    colors={['#6d4aff', '#ff74e2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.greetingCard}
                >
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={40} color="#d6d6d6" />
                        </View>
                    </View>
                    <Text style={styles.greeting}>Hi John!</Text>
                </LinearGradient>

                {/* Account Card */}
                <TouchableOpacity style={styles.actionCard}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="person" size={24} color="#6d4aff" />
                        <View style={styles.iconBadge}>
                            <Ionicons name="settings" size={12} color="#6d4aff" />
                        </View>
                        <View style={styles.iconDecor}>
                            <Ionicons name="heart" size={8} color="#ff69b4" />
                        </View>
                        <View style={styles.iconStar}>
                            <Ionicons name="star" size={8} color="#ffd700" />
                        </View>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>Account</Text>
                        <Text style={styles.cardSubtitle}>Manage my account</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="white" />
                </TouchableOpacity>

                {/* Add EV Card */}
                <TouchableOpacity style={styles.actionCard} onPress={openSheet}>
                    <View style={styles.dashedIconContainer}>
                        <Ionicons name="car" size={24} color="#6d4aff" />
                        <View style={styles.plusIcon}>
                            <Ionicons name="add" size={12} color="#6d4aff" />
                        </View>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>Add your EV</Text>
                        <Text style={styles.cardSubtitle}>Personalise your app by adding</Text>
                        <Text style={styles.cardSubtitle}>your EV!</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="white" />
                </TouchableOpacity>

                {/* Electrocard Card */}
                <TouchableOpacity style={styles.actionCard}>
                    <View style={styles.dashedIconContainer}>
                        <Ionicons name="card" size={24} color="#6d4aff" />
                        <View style={styles.plusIcon}>
                            <Ionicons name="add" size={12} color="#6d4aff" />
                        </View>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>Add your Bank</Text>
                        <Text style={styles.cardSubtitle}>
                            Link your bank account to enable seamless payments and manage your transactions easily.
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="white" />
                </TouchableOpacity>

                {/* Current Subscription Plan */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Current Subscription Plan</Text>
                </View>

                <TouchableOpacity style={styles.subscriptionCard}>
                    <View style={styles.subscriptionIcon}>
                        <Ionicons name="battery-charging" size={24} color="#00d4aa" />
                    </View>
                    <View style={styles.subscriptionContent}>
                        <Text style={styles.subscriptionTitle}>Premium Battery Plan</Text>
                        <Text style={styles.subscriptionSubtitle}>Unlimited swaps • Priority access</Text>
                        <Text style={styles.subscriptionPrice}>₫299,000/tháng</Text>
                        <View style={styles.subscriptionStatus}>
                            <View style={styles.activeIndicator} />
                            <Text style={styles.statusText}>Active</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.subscriptionCard}>
                    <View style={styles.subscriptionIcon}>
                        <Ionicons name="time" size={24} color="#6d4aff" />
                    </View>
                    <View style={styles.subscriptionContent}>
                        <Text style={styles.subscriptionTitle}>Battery Rental History</Text>
                        <Text style={styles.subscriptionSubtitle}>View previously used plans</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="white" />
                </TouchableOpacity>

                <View style={styles.socialIconsContainer}>
                    <TouchableOpacity style={styles.socialIconButton}>
                        <Ionicons name="logo-linkedin" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.socialIconButton}>
                        <Ionicons name="logo-twitter" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.socialIconButton}>
                        <Ionicons name="logo-facebook" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.socialIconButton}>
                        <Ionicons name="logo-instagram" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.socialIconButton}>
                        <Ionicons name="logo-youtube" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={styles.appVersion}>EV Battery Swap v1.0.0</Text>
                    <Text style={styles.appCopyright}>© 2025 EV Battery Solutions</Text>
                </View>
            </ScrollView>

            {/* Scrim */}
            {isAddEvOpen && (
                <Pressable style={styles.scrim} onPress={closeSheet} />
            )}

            {/* Add EV Sheet */}
            <Animated.View
                pointerEvents={isAddEvOpen ? 'auto' : 'none'}
                style={[
                    styles.sheetContainer,
                    { transform: [{ translateY: sheetY }] },
                ]}
            >
                <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>Add your EV</Text>
                    <TouchableOpacity onPress={closeSheet}>
                        <Ionicons name="close" size={22} color="#bfa8ff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.formRow}>
                    <Text style={styles.inputLabel}>VIN</Text>
                    <TextInput
                        placeholder="1HGCM82633A004352"
                        placeholderTextColor="#7f6fb1"
                        value={vin}
                        onChangeText={setVin}
                        style={styles.input}
                    />
                </View>
                <SearchableDropdown
                    label="Brand"
                    value={brand}
                    options={brandOptions}
                    placeholder="Tesla, VinFast..."
                    onSelect={setBrand}
                />
                <SearchableDropdown
                    label="Car Name"
                    value={carName}
                    options={carOptions}
                    placeholder="Model 3, VF 6..."
                    onSelect={setCarName}
                />
                <SearchableDropdown
                    label="Battery Model"
                    value={batteryModel}
                    options={batteryOptions}
                    placeholder="LFP-60, NMC-75..."
                    onSelect={setBatteryModel}
                />

                <View style={styles.actionsRow}>

                    <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleSave}>
                        <Text style={styles.buttonPrimaryText}>Add Vehicle</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0520',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100,
    },
    greetingCard: {

        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    actionCard: {
        backgroundColor: '#1a0f3e',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    progressCircle: {
        width: 50,
        height: 50,
        marginRight: 16,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressBar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 4,
        borderColor: '#333',
        position: 'absolute',
    },
    progressFill: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 4,
        borderColor: 'transparent',
        borderTopColor: '#ff6b6b',
        borderRightColor: '#ff6b6b',
        transform: [{ rotate: '-90deg' }],
    },
    progressText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white',
    },
    iconContainer: {
        width: 50,
        height: 50,
        marginRight: 16,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2a1f4e',
        borderRadius: 12,
    },
    iconBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#2a1f4e',
        borderRadius: 8,
        padding: 2,
    },
    iconDecor: {
        position: 'absolute',
        top: -4,
        right: 8,
    },
    iconStar: {
        position: 'absolute',
        top: 2,
        left: -4,
    },
    dashedIconContainer: {
        width: 50,
        height: 50,
        marginRight: 16,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#6d4aff',
        borderRadius: 12,
        borderStyle: 'dashed',
    },
    plusIcon: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#1a0f3e',
        borderRadius: 8,
        padding: 2,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        lineHeight: 22,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#a0a0a0',
        lineHeight: 18,
    },
    creditsContainer: {
        marginTop: 20,
        marginBottom: 16,
    },
    creditsLabel: {
        fontSize: 16,
        color: '#a0a0a0',
        marginBottom: 8,
    },
    creditsAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#00d4aa',
    },
    redeemCard: {
        backgroundColor: '#1a0f3e',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    redeemIcon: {
        width: 40,
        height: 40,
        backgroundColor: '#6d4aff',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    redeemText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        flex: 1,
    },
    sectionHeader: {
        marginTop: 30,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#a0a0a0',

    },
    subscriptionCard: {
        backgroundColor: '#1a0f3e',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    subscriptionIcon: {
        width: 50,
        height: 50,
        backgroundColor: '#2a1f4e',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    subscriptionContent: {
        flex: 1,
    },
    subscriptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4,
    },
    subscriptionSubtitle: {
        fontSize: 14,
        color: '#a0a0a0',
        marginBottom: 6,
    },
    subscriptionPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#00d4aa',
        marginBottom: 8,
    },
    subscriptionStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activeIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00d4aa',
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        color: '#00d4aa',
        fontWeight: '500',
    },
    socialIconsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    socialIconButton: {
        width: 50,
        height: 50,
        backgroundColor: '#6d4aff',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
        shadowColor: '#6d4aff',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    appInfo: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    appVersion: {
        fontSize: 14,
        color: '#8b7bb8',
        marginBottom: 4,
    },
    appCopyright: {
        fontSize: 12,
        color: '#666',
    },
    // Add EV sheet styles
    scrim: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheetContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#120935',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
        gap: 12,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    sheetTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    formRow: {
        marginTop: 8,
    },
    inputLabel: {
        color: '#bfa8ff',
        marginBottom: 6,
        fontSize: 13,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#1a0f3e',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: 'white',
        borderWidth: 1,
        borderColor: '#2a1f4e',
    },
    dropdownPanel: {
        marginTop: 8,
        backgroundColor: '#0b0624',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2a1f4e',
        padding: 10,
        gap: 10,
    },
    dropdownSearchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#120935',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#2a1f4e',
    },
    dropdownSearchInput: {
        flex: 1,
        color: 'white',
        padding: 0,
        margin: 0,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#1a0f3e',
    },
    dropdownItemText: {
        color: 'white',
        fontSize: 14,
    },
    dropdownEmpty: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    actionsRow: {
        marginTop: 16,
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonSecondary: {
        backgroundColor: '#1a0f3e',
        borderWidth: 1,
        borderColor: '#2a1f4e',
    },
    buttonSecondaryText: {
        color: '#bfa8ff',
        fontWeight: '700',
    },
    buttonPrimary: {
        backgroundColor: '#6d4aff',
    },
    buttonPrimaryText: {
        color: 'white',
        fontWeight: '700',
    },
});

export default ProfileScreen;
