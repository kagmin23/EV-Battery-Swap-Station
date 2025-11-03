import { createSubscriptionPaymentApi, getSubscriptionPlansApi, useSubscriptionPlans } from '@/store/subcription';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ExpoLinking from 'expo-linking';

function ListSubscriptions() {
    const router = useRouter();
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'expired' | 'cancelled'>('all');
    const [loading, setLoading] = useState(false);
    const subscriptions = useSubscriptionPlans();

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                setLoading(true);
                await getSubscriptionPlansApi();
            } catch (err) {
                console.warn('Failed to load subscriptions', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, []);

    const statusOptions = useMemo(
        () => [
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'expired', label: 'Expired' },
            { key: 'cancelled', label: 'Cancelled' },
        ],
        []
    );

    const filtered = useMemo(() => {
        if (selectedStatus === 'all') return subscriptions || [];
        return (subscriptions || []).filter((s) => (s.status || '').toLowerCase() === selectedStatus);
    }, [selectedStatus, subscriptions]);

    // If the current driver already has a subscription in-use, they cannot purchase
    // another plan until that subscription ends. Compute this once for the list.
    const hasInUseSubscription = useMemo(() => {
        return (subscriptions || []).some((s) => ((s as any).userSubscription?.status || '').toString().toLowerCase() === 'in-use');
    }, [subscriptions]);

    const capitalize = (value?: string) => {
        if (!value) return '';
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    };

    const getStatusColor = (value?: string) => {
        const s = (value || '').toLowerCase();
        if (s === 'active') return '#0fc48f'; // green
        if (s === 'expired') return '#8b8b8b'; // gray
        if (s === 'cancelled') return '#ff8a00'; // orange
        return '#6d4aff'; // default/purple
    };

    const formatDate = (iso?: string) => {
        if (!iso) return '';
        try {
            const d = new Date(iso);
            return d.toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return iso;
        }
    };

    const [modalVisible, setModalVisible] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const [modalLoading, setModalLoading] = useState(false);

    const openModal = (item: any) => {
        setSelected(item);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelected(null);
    };

    const onPurchase = async (item: any) => {
        // Global guard: if driver already has an active/in-use subscription for any plan,
        // they are not allowed to purchase another plan until end_date. Allow operations
        // only when the item itself is the one "in-use" (to view/manage it).
        const curHasInUse = hasInUseSubscription;
        const itemUsStatus = (item?.userSubscription?.status || '').toString().toLowerCase();
        if (curHasInUse && itemUsStatus !== 'in-use') {
            Alert.alert('Subscription', 'You already have an active subscription. You cannot purchase another plan until it ends.');
            return;
        }
        const returnUrl = ExpoLinking.createURL('payment-success-sub');
        // const  = 'exp://10.1.185.232:8081/--/payment-success-sub';

        // inner flow to create payment and open VNPay URL
        const runPayment = async () => {
            setModalLoading(true);
            try {
                // defensive: some API responses may use `id` instead of `_id`
                const planId = item._id ?? item.id ?? item.planId ?? null;
                console.log('[create-subscription-payment] item', item);

                if (!planId) {
                    Alert.alert('Payment error', 'Missing plan id for this subscription.');
                    return;
                }

                const payload = { planId, returnUrl };
                console.log('[create-subscription-payment] payload', payload);
                const paymentRes = await createSubscriptionPaymentApi(payload);
                console.log('[create-subscription-payment] response', paymentRes);

                if (!paymentRes) {
                    Alert.alert('Payment error', 'No response from payment API');
                    return;
                }

                if (!paymentRes.success) {
                    Alert.alert('Payment error', paymentRes.message || 'Failed to create payment');
                    return;
                }

                const paymentData = paymentRes.data;

                if (!paymentData || !paymentData.url) {
                    Alert.alert('Payment error', 'Payment URL not returned');
                    return;
                }

                closeModal();

                const supported = await Linking.canOpenURL(paymentData.url);
                if (supported) {
                    await Linking.openURL(paymentData.url);
                } else {
                    Alert.alert('Payment error', 'Cannot open payment URL');
                }
            } catch (err: any) {
                console.error('Subscription VNPay error:', err);

                // Attempt to recover: if the server error still contains a payment URL
                // (some backend implementations may return url even on partial failures),
                // open it so the user can complete VNPay.
                const tryExtractUrl = (e: any) => {
                    if (!e) return null;
                    // common shapes: e.data, e.data.data, e.data.data.url, e.url
                    if (e.data && typeof e.data === 'object') {
                        if (e.data.url) return e.data.url;
                        if (e.data.data && e.data.data.url) return e.data.data.url;
                    }
                    if (e.url) return e.url;
                    if (e.data && typeof e.data === 'string' && e.data.includes('http')) return e.data;
                    return null;
                };

                const fallbackUrl = tryExtractUrl(err) || tryExtractUrl(err?.response) || tryExtractUrl(err?.response?.data);

                if (fallbackUrl) {
                    Alert.alert(
                        'Payment partially failed',
                        'Subscription creation failed on server, but a payment URL was returned. Proceed to payment?',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Proceed',
                                onPress: async () => {
                                    try {
                                        const supported = await Linking.canOpenURL(fallbackUrl);
                                        if (supported) await Linking.openURL(fallbackUrl);
                                        else Alert.alert('Payment error', 'Cannot open payment URL');
                                    } catch (openErr) {
                                        console.warn('Failed to open fallback URL', openErr);
                                        Alert.alert('Payment error', 'Cannot open payment URL');
                                    }
                                },
                            },
                        ]
                    );
                } else {
                    // show raw error to help server-side debugging
                    const text = err && typeof err === 'object' ? JSON.stringify(err) : String(err);
                    Alert.alert('Payment error', err?.message || 'Payment failed', [
                        { text: 'Details', onPress: () => Alert.alert('Error details', text) },
                        { text: 'OK' },
                    ]);
                }
            } finally {
                setModalLoading(false);
            }
        };

        // If the current user already has an active subscription for this plan,
        // ask whether they want to proceed to payment anyway (renew/extend).
        if (item?.userSubscription && item.userSubscription.status === 'active') {
            Alert.alert(
                'Subscription',
                'You already have an active subscription for this plan. Do you want to proceed to payment anyway (renew/extend)?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Proceed', onPress: () => { runPayment().catch(() => { }); } },
                ]
            );
            return;
        }

        // otherwise run payment immediately
        await runPayment();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={22} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Subscriptions</Text>
                <View style={{ width: 36 }} />
            </View>

            {/* Filter bar */}
            <View style={styles.filterBar}>
                {statusOptions.map((opt) => (
                    <TouchableOpacity
                        key={opt.key}
                        onPress={() => setSelectedStatus(opt.key as any)}
                        style={[
                            styles.filterButton,
                            selectedStatus === opt.key && styles.filterButtonActive,
                        ]}
                    >
                        <Text style={[styles.filterLabel, selectedStatus === opt.key && styles.filterLabelActive]}>
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={{ padding: 24 }}>
                    <ActivityIndicator size="large" color="#6d4aff" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {filtered.map((s, idx) => (
                        <View key={`${s._id ?? 'sub'}-${idx}`} style={styles.card}>
                            {/* Top row: title and status */}
                            <View style={[styles.row, { marginBottom: 8 }]}>
                                <Text style={styles.name}>{s.subscriptionName}</Text>
                                <View style={[styles.statusPill, { backgroundColor: getStatusColor(s.status) }]}>
                                    <Text style={styles.statusPillText}>{capitalize(s.status)}</Text>
                                </View>
                            </View>

                            <Text style={styles.desc}>{s.description}</Text>

                            <View style={styles.metaColumn}>
                                <Text style={styles.meta}>Duration: {s.durations} days</Text>
                                <Text style={styles.meta}>Swaps: {s.countSwap ?? 0}</Text>
                                <Text style={styles.meta}>Slots: {s.quantitySlot ?? 0}</Text>
                                <Text style={styles.createdAt}>Created: {formatDate(s.createdAt)}</Text>
                            </View>

                            {/* Footer: Purchase / Extend / In use */}
                            {(() => {
                                const usStatus = ((s as any).userSubscription?.status || '').toString().toLowerCase();
                                if (hasInUseSubscription) {
                                    if (usStatus === 'in-use') {
                                        return (
                                            <View style={styles.inUseContainer}>
                                                <Text style={styles.inUseText}>In use</Text>
                                            </View>
                                        );
                                    }

                                    return (
                                        <View style={styles.disabledContainer}>
                                            <Text style={styles.disabledText}>You cannot subscribe to this package because another package is in use.</Text>
                                        </View>
                                    );
                                }

                                if (usStatus === 'in-use') {
                                    return (
                                        <View style={styles.inUseContainer}>
                                            <Text style={styles.inUseText}>In use</Text>
                                        </View>
                                    );
                                }

                                if (usStatus === 'expired') {
                                    return (
                                        <TouchableOpacity
                                            style={[styles.priceButton, styles.extendButton]}
                                            onPress={() => openModal(s)}
                                            activeOpacity={0.9}
                                        >
                                            <Text style={styles.priceButtonText}>Extend • ₫{(s.price ?? 0).toLocaleString()}</Text>
                                        </TouchableOpacity>
                                    );
                                }

                                return (
                                    <TouchableOpacity style={styles.priceButton} onPress={() => openModal(s)} activeOpacity={0.9}>
                                        <Text style={styles.priceButtonText}>Purchase • ₫{(s.price ?? 0).toLocaleString()}</Text>
                                    </TouchableOpacity>
                                );
                            })()}
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Modal for subscription detail */}
            {selected && (
                <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeModal}>
                    <Pressable style={styles.modalOverlay} onPress={closeModal} />
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{selected.subscriptionName}</Text>
                            <TouchableOpacity onPress={closeModal} style={styles.modalClose}>
                                <Ionicons name="close" size={22} color="white" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={styles.modalDesc}>{selected.description}</Text>
                            <Text style={styles.modalLabel}>Price: ₫{selected.price.toLocaleString()}</Text>
                            <Text style={styles.modalLabel}>Duration: {selected.durations} days</Text>
                            <Text style={styles.modalMeta}>Swaps: {selected.countSwap ?? 0} • Slots: {selected.quantitySlot ?? 0}</Text>
                            <Text style={styles.modalDate}>Created: {formatDate(selected.createdAt)}</Text>
                        </View>

                        <View style={styles.modalFooter}>
                            {selected.status && selected.status.toLowerCase() === 'active' ? (
                                <TouchableOpacity
                                    style={[styles.buttonPrimary, modalLoading && { opacity: 0.7 }]}
                                    onPress={() => onPurchase(selected)}
                                    disabled={modalLoading}
                                >
                                    {modalLoading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text style={styles.buttonPrimaryText}>Purchase</Text>
                                    )}
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.buttonDisabled}>
                                    <Text style={styles.buttonDisabledText}>Not available</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </Modal>
            )}
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0520' },
    header: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderBottomWidth: 0,
    },
    backButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: { color: 'white', fontSize: 18, fontWeight: '700' },
    content: { padding: 16, paddingBottom: 40 },
    card: {
        backgroundColor: '#1a0f3e',
        borderRadius: 12,
        padding: 14,
        minHeight: 180,
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { color: 'white', fontSize: 16, fontWeight: '700' },
    price: { color: '#00d4aa', fontWeight: '700' },
    desc: { color: '#a0a0a0', marginTop: 8, marginBottom: 8 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    meta: { color: '#bfa8ff', fontSize: 14 },
    status: { color: '#00d4aa', fontWeight: '700' },
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
        marginBottom: 8,
    },
    filterButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#2a1f4e',
    },
    filterButtonActive: {
        backgroundColor: '#6d4aff',
        borderColor: '#6d4aff',
    },
    filterLabel: {
        color: '#bfa8ff',
        fontWeight: '700',
    },
    filterLabelActive: {
        color: 'white',
    },
    statusPill: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusPillText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 12,
    },
    modalOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        position: 'absolute',
        left: 20,
        right: 20,
        top: '25%',
        backgroundColor: '#120935',
        borderRadius: 16,
        padding: 16,
    },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    modalClose: { padding: 6 },
    modalTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
    modalBody: { marginTop: 12 },
    modalLabel: { color: '#bfa8ff', fontWeight: '700', marginBottom: 6 },
    modalDesc: { color: '#a0a0a0', marginBottom: 20 },
    modalMeta: { color: '#bfa8ff' },
    modalFooter: { marginTop: 14, flexDirection: 'row', justifyContent: 'flex-end' },
    buttonPrimary: { backgroundColor: '#6d4aff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    buttonPrimaryText: { color: 'white', fontWeight: '700' },
    buttonDisabled: {
        backgroundColor: '#1a0f3e',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2a1f4e',
    },
    buttonDisabledText: { color: '#bfa8ff', fontWeight: '700' },
    createdAt: { color: '#8b7bb8', fontSize: 12, marginTop: 6 },
    modalDate: { color: '#8b7bb8', marginTop: 8, fontSize: 13 },
    metaColumn: { marginTop: 20, flexDirection: 'column', gap: 15 },
    priceButton: {
        marginTop: 16,
        backgroundColor: '#6d4aff',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    priceButtonText: { color: 'white', fontWeight: '800' },
    extendButton: {
        backgroundColor: '#ff8a00',
    },
    inUseContainer: {
        marginTop: 16,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    inUseText: { color: '#0fc48f', fontWeight: '800' },
    disabledContainer: {
        marginTop: 16,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#2a233d',
    },
    disabledText: { color: '#bfa8ff', fontWeight: '700', textAlign: 'center' },
});

export default ListSubscriptions;


