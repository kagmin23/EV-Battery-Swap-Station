import { usePurchasedSubscription } from '@/store/subcription';
import { formatDateVN, formatTimeVN } from '@/utils/dateTime';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentSuccessScreen() {
    const router = useRouter();

    // @ts-ignore
    const routeParams = (router as any).params ?? {};

    const purchased = usePurchasedSubscription();

    const amountParam = routeParams.amount as string | undefined;
    const transactionId = routeParams.transactionId as string | undefined;
    const stationName = routeParams.stationName as string | undefined;

    const now = useMemo(() => new Date(), []);
    const formattedDate = useMemo(() => formatDateVN(now), [now]);
    const formattedTime = useMemo(() => formatTimeVN(now), [now]);

    const displayAmount = useMemo(() => {
        if (!amountParam) return '—';
        const n = Number(amountParam);
        if (Number.isNaN(n)) return amountParam;
        return n.toLocaleString('en-US', { style: 'currency', currency: 'VND' });
    }, [amountParam]);

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

                    {/* <View style={styles.infoBox}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Amount:</Text>
                            <Text style={styles.infoValue}>{displayAmount}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Station:</Text>
                            <Text style={styles.infoValue}>{stationName ?? '—'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Transaction ID:</Text>
                            <Text style={styles.infoValue}>{transactionId ?? '—'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Time:</Text>
                            <Text style={styles.infoValue}>{formattedDate} · {formattedTime}</Text>
                        </View>

                        {purchased ? (
                            <>
                                <View style={[styles.infoRow, { marginTop: 8 }]}> 
                                    <Text style={styles.infoLabel}>Subscription Status:</Text>
                                    <Text style={styles.infoValue}>{(purchased.status ?? '—').toString()}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Plan ID:</Text>
                                    <Text style={styles.infoValue}>{purchased.plan ?? '—'}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Type:</Text>
                                    <Text style={styles.infoValue}>{purchased.type ?? '—'}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Start:</Text>
                                    <Text style={styles.infoValue}>{purchased.start_date ? formatDateVN(new Date(purchased.start_date)) : '—'}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>End:</Text>
                                    <Text style={styles.infoValue}>{purchased.end_date ? formatDateVN(new Date(purchased.end_date)) : '—'}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Remaining swaps:</Text>
                                    <Text style={styles.infoValue}>{purchased.remaining_swaps ?? '—'}</Text>
                                </View>
                            </>
                        ) : (
                            <View style={[styles.infoRow, { marginTop: 8 }]}> 
                                <Text style={styles.infoLabel}>Subscription:</Text>
                                <Text style={styles.infoValue}>Not available</Text>
                            </View>
                        )}
                    </View> */}

                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={async () => {
                                // Removed automatic confirm call. This button simply navigates back.
                                // Cast to any to satisfy the generated route union types
                                router.push('/driver/ListSubscriptions' as any);
                            }}
                        >
                            <Text style={styles.actionBtnText}>View Subciption</Text>
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
