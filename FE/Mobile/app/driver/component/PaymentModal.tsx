import { useCreateBooking } from '@/features/driver/apis/booking';
import { useVnPay } from '@/store/payment';
import { getPillarDetailsById } from '@/store/pillars';
import { useSubscriptionPlans } from '@/store/subcription';
import { toCamelCase } from '@/utils/caseConverter';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import * as ExpoLinking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PaymentModalProps {
    visible: boolean;
    onClose: () => void;
    selectedVehicleId: string;
    station: any;
    date: Date;
    time: Date;
    vehicles: any[];
    getSelectedBatteryId: () => string | null;
    getSelectedPillarId: () => string | null;
    checkDuplicateBooking: (vehicleId: string, stationId: string, scheduledTime: Date) => boolean;
    batteryPrice: number;
}

const styles = StyleSheet.create({
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 480,
        backgroundColor: '#1a0f3e',
        borderRadius: 16,
        padding: 16,
    },
    modalTitle: {
        color: '#bfb6ff',
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 12,
        textAlign: 'center',
    },
    actionBtn: {
        paddingVertical: 12,
        borderRadius: 12,
        marginVertical: 6,
    },
    actionText: {
        color: '#bfb6ff',
        fontWeight: '700',
        textAlign: 'center',
    },
    subscriptionNotice: {
        color: '#bfb6ff',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 6,
        fontSize: 13,
    },
});

export default function PaymentModal({
    visible,
    onClose,
    selectedVehicleId,
    station,
    date,
    time,
    vehicles,
    getSelectedBatteryId,
    getSelectedPillarId,
    checkDuplicateBooking,
    batteryPrice,
}: PaymentModalProps) {
    const router = useRouter();
    const createBookingMutation = useCreateBooking();
    const createBooking = createBookingMutation.mutateAsync;
    const bookingLoading = createBookingMutation.status === 'pending';
    const { createPayment, loading: vnpayLoading } = useVnPay();
    const subscriptions = useSubscriptionPlans();

    const hasInUseSubscription = useMemo(() => {
        try {
            return (subscriptions || []).some((s: any) =>
                (s.userSubscription?.status || '').toString().toLowerCase() === 'in-use'
            );
        } catch {
            return false;
        }
    }, [subscriptions]);

    // const hasInUseSubscription = useMemo(() => {
    //     try {
    //         return (subscriptions || []).some((s: any) =>
    //             (s.userSubscription?.status || '').toString().toLowerCase() === 'in-use'
    //         );
    //     } catch {
    //         return false;
    //     }
    // }, [subscriptions]);

    const scheduled = useMemo(() => new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes(),
        0
    ), [date, time]);

    const handlePayAtStation = useCallback(async () => {
        // Find vehicle by either `vehicleId` (UUID) or `id` (MongoDB _id)
        const vehicle = vehicles.find(x => x.vehicleId === selectedVehicleId || (x as any).id === selectedVehicleId);
        if (!vehicle) return showErrorToast('Vehicle not found. Please select a vehicle.');
        const vehicleIdForApi = (vehicle as any).id ?? vehicle.vehicleId;
        if (!vehicleIdForApi) return showErrorToast('Vehicle internal id missing.');

        if (checkDuplicateBooking(vehicle.vehicleId!, station.id, scheduled)) {
            return showErrorToast('Duplicate booking within 20 minutes');
        }

        const batteryId = getSelectedBatteryId();
        if (!batteryId) return showErrorToast('No battery available');

        const pillarId = getSelectedPillarId();
        if (!pillarId) return showErrorToast('No pillar available');

        try {
                // Debug info before sending booking
                console.log('🔎 Booking debug:', {
                    selectedVehicleId,
                    vehicle,
                    vehicleIdForApi,
                    batteryId,
                    pillarId,
                    stationId: station?.id,
                });

                // Refresh pillar details to ensure latest battery/slot info
                if (pillarId) {
                    try {
                        await getPillarDetailsById(pillarId);
                    } catch (e) {
                        console.warn('Failed to refresh pillar details', e);
                    }
                }

                const res = await createBooking({
                stationId: station.id,
                vehicleId: vehicleIdForApi,
                scheduledTime: scheduled.toISOString(),
                batteryId,
                pillarId, // Use pillar ID from selected battery
            });

            if (res.success) {
                showSuccessToast(res.message || 'Booking successful!');
                onClose();
                router.push('/(tabs)/my_booking');
            } else {
                showErrorToast(res.message || 'Booking failed');
            }
        } catch (err: any) {
            showErrorToast(err.message || 'Booking failed');
        }
    }, [vehicles, selectedVehicleId, scheduled, station, getSelectedBatteryId, getSelectedPillarId, checkDuplicateBooking, createBooking, onClose, router]);

    const handlePayWithVnPay = useCallback(async () => {
        const vehicle = vehicles.find(x => x.vehicleId === selectedVehicleId || (x as any).id === selectedVehicleId);
        if (!vehicle) return showErrorToast('Vehicle not found. Please select a vehicle.');

        const vehicleIdForApi = (vehicle as any).id ?? vehicle.vehicleId;
        if (!vehicleIdForApi) return showErrorToast('Vehicle internal id missing.');

        const batteryId = getSelectedBatteryId();
        if (!batteryId) return showErrorToast('No battery available');

        const pillarId = getSelectedPillarId();
        if (!pillarId) return showErrorToast('No pillar available');

        try {
            // 1. Create booking first
            // Debug info before creating booking via VNPay flow
            console.log('🔎 Booking (VNPay) debug:', {
                selectedVehicleId,
                vehicle,
                vehicleIdForApi,
                batteryId,
                pillarId,
                stationId: station?.id,
            });

            // Refresh pillar details to ensure latest battery/slot info
            if (pillarId) {
                try {
                    await getPillarDetailsById(pillarId);
                } catch (e) {
                    console.warn('Failed to refresh pillar details', e);
                }
            }

            const bookingRes = await createBooking({
                stationId: station.id,
                vehicleId: vehicleIdForApi as string,
                scheduledTime: scheduled.toISOString(),
                batteryId,
                pillarId, // Use pillar ID from selected battery
            });

            const data = toCamelCase(bookingRes);
            const bookingId = data.data.bookingId;

            if (!data.success || !bookingId) {
                return showErrorToast(data.message || 'Booking failed');
            }

            // If booking is already confirmed (e.g. subscription), skip payment
            const bookingStatus = (data.data.status || '').toString().toLowerCase();
            if (bookingStatus === 'confirmed') {
                showSuccessToast(data.message || 'Booking confirmed with subscription');
                onClose();
                router.push('/(tabs)/my_booking');
                return;
            }

            // 2. Create VNPay payment URL with deep linking
            // Create deep link URL with all necessary params
            const returnUrl = ExpoLinking.createURL('/payment-success', {
                queryParams: {
                    amount: String(batteryPrice),
                    stationName: station.name || station.stationName || '',
                    bookingId: bookingId,

                },
            });

            const paymentRes = await createPayment({
                amount: batteryPrice,
                bookingId: bookingId,
                orderInfo: `Booking #${bookingId} - Battery Swap`,
                returnUrl,
            });

            if (!paymentRes?.url) {
                return showErrorToast('Payment URL creation failed');
            }

            onClose();

            // Open payment URL in device browser
            const supported = await Linking.canOpenURL(paymentRes.url);

            if (supported) {
                await Linking.openURL(paymentRes.url);
            } else {
                showErrorToast('Cannot open payment URL. Please try again.');
            }
        } catch (err: any) {
            showErrorToast(err?.message || 'Payment failed');
        }
    }, [vehicles, selectedVehicleId, station, scheduled, getSelectedBatteryId, getSelectedPillarId, createBooking, createPayment, onClose, router, batteryPrice]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalBackdrop}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Payment Method</Text>

                    {hasInUseSubscription ? (
                        // When user has an active subscription, show a single Booking Now button
                        // (uses same logic as Pay at Station but presented as 'Booking Now')
                        <>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: '#22c55e' }]}
                                onPress={handlePayAtStation}
                                disabled={bookingLoading}
                            >
                                <Text style={[styles.actionText, { color: '#fff' }]}> 
                                    {bookingLoading ? 'Booking...' : 'Booking Now'}
                                </Text>
                            </TouchableOpacity>

                            <Text style={styles.subscriptionNotice}>You have an active subscription — Booking Now!</Text>
                        </>
                    ) : (
                        // No active subscription: show Pay at Station and VNPay options
                        <>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: '#22c55e' }]}
                                onPress={handlePayAtStation}
                                disabled={bookingLoading}
                            >
                                <Text style={[styles.actionText, { color: '#fff' }]}>
                                    {bookingLoading ? 'Booking...' : 'Pay at Station'}
                                </Text>
                            </TouchableOpacity>

                            {/* VNPay payment option - hidden when user has an in-use subscription */}
                            {!hasInUseSubscription && (
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]}
                                    onPress={handlePayWithVnPay}
                                    disabled={vnpayLoading}
                                >
                                    <Text style={[styles.actionText, { color: '#fff' }]}> 
                                        {vnpayLoading ? 'Processing...' : 'Pay with VNPAY'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}

                    {/* 
                    OLD CODE - Subscription logic (currently disabled):
                    {!hasInUseSubscription ? (
                        <TouchableOpacity ... VNPay button ... />
                    ) : (
                        <View ... "You have an active subscription" ... />
                    )}
                    */}

                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#120935' }]}
                        onPress={onClose}
                    >
                        <Text style={styles.actionText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}