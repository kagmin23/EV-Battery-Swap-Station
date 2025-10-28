import { formatDateVN, formatTimeVN } from '@/utils/dateTime';
import { showSuccessToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentSuccessScreen() {
    const router = useRouter();

    // NOTE: some expo-router versions don't export useSearchParams —
    // to keep compatibility we accept params passed manually via navigation
    // for now this component reads params from router?.params if available.
    // If you prefer search params, replace this with useSearchParams() where supported.
    // @ts-ignore
    const routeParams = (router as any).params ?? {};

    // Optional params: amount, transactionId, stationName
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
        return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }, [amountParam]);

    return (
        <SafeAreaView edges={["top", "left", "right"]} style={styles.container}>
            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                        <Ionicons name="chevron-back" size={20} color="#fff" />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <View style={styles.successBadge}>
                        <Ionicons name="checkmark" size={40} color="#fff" />
                    </View>
                    <Text style={styles.title}>Thanh toán thành công</Text>
                    <Text style={styles.subtitle}>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</Text>

                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Số tiền</Text>
                            <Text style={styles.infoValue}>{displayAmount}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Trạm</Text>
                            <Text style={styles.infoValue}>{stationName ?? '—'}</Text>
                        </View>
                    </View>

                    <View style={[styles.metaRow, { marginTop: 12 }]}>
                        <Text style={styles.metaText}>Mã giao dịch: <Text style={styles.metaValue}>{transactionId ?? '—'}</Text></Text>
                        <Text style={styles.metaText}>Thời gian: <Text style={styles.metaValue}>{formattedDate} · {formattedTime}</Text></Text>
                    </View>

                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={() => {
                            showSuccessToast('Biên nhận sẽ được gửi qua ứng dụng.');
                        }}
                    >
                        <Text style={styles.primaryBtnText}>Tải biên nhận</Text>
                    </TouchableOpacity>

                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={styles.actionBtnOutline}
                            onPress={() => router.push('/(tabs)/booking')}
                        >
                            <Text style={styles.actionBtnOutlineText}>Xem đặt chỗ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => router.push('/(tabs)')}
                        >
                            <Text style={styles.actionBtnText}>Về trang chủ</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#120935' },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    iconBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    backText: { color: '#bfa8ff', fontSize: 15, fontWeight: '600' },
    card: { backgroundColor: '#1a0f3e', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    successBadge: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#4ade80', alignItems: 'center', justifyContent: 'center', marginTop: -64, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, elevation: 6 },
    title: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 6 },
    subtitle: { color: '#bfb6ff', fontSize: 13, marginTop: 6, textAlign: 'center' },
    infoRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 16, gap: 12 },
    infoItem: { flex: 1, backgroundColor: '#120935', borderRadius: 12, padding: 12, alignItems: 'flex-start' },
    infoLabel: { color: '#bfb6ff', fontSize: 12 },
    infoValue: { color: '#fff', fontWeight: '800', marginTop: 6 },
    metaRow: { width: '100%', marginTop: 10 },
    metaText: { color: '#bfb6ff', fontSize: 12, marginTop: 6 },
    metaValue: { color: '#fff', fontWeight: '700' },
    primaryBtn: { marginTop: 16, backgroundColor: '#6C63FF', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, width: '100%', alignItems: 'center' },
    primaryBtnText: { color: '#fff', fontWeight: '800' },
    actionsRow: { flexDirection: 'row', width: '100%', gap: 12, marginTop: 12 },
    actionBtn: { flex: 1, backgroundColor: '#4ade80', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    actionBtnText: { color: '#052e16', fontWeight: '800' },
    actionBtnOutline: { flex: 1, borderWidth: 1, borderColor: '#6C63FF', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    actionBtnOutlineText: { color: '#bfb6ff', fontWeight: '800' },
});
