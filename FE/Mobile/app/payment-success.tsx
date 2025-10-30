import { formatDateVN, formatTimeVN } from '@/utils/dateTime';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function PaymentSuccessScreen() {
    const { amount, stationName } = useLocalSearchParams<{ amount: string; transactionId: string; stationName: string }>();
    const router = useRouter();
    const now = useMemo(() => new Date(), []);
    const formattedDate = useMemo(() => formatDateVN(now), [now]);
    const formattedTime = useMemo(() => formatTimeVN(now), [now]);

    const displayAmount = useMemo(() => {
        if (!amount) return '—';
        const n = Number(amount);
        if (Number.isNaN(n)) return amount;
        return n.toLocaleString('en-US', { style: 'currency', currency: 'VND' });
    }, [amount]);

    return (
        <SafeAreaView edges={["top", "left", "right"]} style={styles.container}>
            <View style={styles.centerWrapper}>
                <View style={styles.card}>
                    <View style={styles.successBadge}>
                        <Ionicons name="checkmark" size={48} color="#fff" />
                    </View>

                    <Text style={styles.title}>Payment Successful</Text>
                    <Text style={styles.subtitle}>
                        Thank you for using our service!
                    </Text>

                    <View style={styles.infoBox}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Amount:</Text>
                            <Text style={styles.infoValue}>{displayAmount}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Station:</Text>
                            <Text style={styles.infoValue}>{stationName ?? '—'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Time:</Text>
                            <Text style={styles.infoValue}>{formattedDate} · {formattedTime}</Text>
                        </View>
                    </View>

                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={styles.actionBtnOutline}
                            onPress={() => router.push('/(tabs)/my_booking')}
                        >
                            <Text style={styles.actionBtnOutlineText}>View Booking</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => router.push('/(tabs)')}
                        >
                            <Text style={styles.actionBtnText}>Back to Map</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#120935' },

    centerWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },

    card: {
        backgroundColor: '#1a0f3e',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },

    successBadge: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#4ade80',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 6,
    },

    title: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 8 },
    subtitle: { color: '#bfb6ff', fontSize: 14, marginTop: 8, textAlign: 'center' },

    infoBox: {
        width: '100%',
        backgroundColor: '#120935',
        borderRadius: 12,
        marginTop: 24,
        padding: 16,
        gap: 10,
    },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
    infoLabel: { color: '#bfb6ff', fontSize: 13 },
    infoValue: { color: '#fff', fontWeight: '700', fontSize: 13 },

    actionsRow: { flexDirection: 'row', width: '100%', gap: 12, marginTop: 24 },
    actionBtn: {
        flex: 1,
        backgroundColor: '#4ade80',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionBtnText: { color: '#052e16', fontWeight: '800' },
    actionBtnOutline: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#6C63FF',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionBtnOutlineText: { color: '#bfb6ff', fontWeight: '800' },
});
