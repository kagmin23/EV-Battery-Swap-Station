import { useCreateBooking } from '@/features/driver/apis/booking';
import { useVnPay } from '@/store/payment';
// import { useSubscriptionPlans } from '@/store/subcription'; // Commented out - subscription logic disabled
import { toCamelCase } from '@/utils/caseConverter';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ExpoLinking from 'expo-linking';

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
    // const subscriptions = useSubscriptionPlans();

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
        const vehicle = vehicles.find(x => x.vehicleId === selectedVehicleId);
        if (!vehicle) return showErrorToast('Vehicle not found');
        if (!vehicle.id) return showErrorToast('Vehicle ID missing');

        if (checkDuplicateBooking(vehicle.vehicleId!, station.id, scheduled)) {
            return showErrorToast('Duplicate booking within 20 minutes');
        }

        const batteryId = getSelectedBatteryId();
        if (!batteryId) return showErrorToast('No battery available');

        const pillarId = getSelectedPillarId();
        if (!pillarId) return showErrorToast('No pillar available');

        try {
            const res = await createBooking({
                stationId: station.id,
                vehicleId: vehicle.id, // Use MongoDB ObjectId instead of UUID
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
        const vehicle = vehicles.find(x => x.vehicleId === selectedVehicleId);
        if (!vehicle) return showErrorToast('Vehicle not found');

        const batteryId = getSelectedBatteryId();
        if (!batteryId) return showErrorToast('No battery available');

        const pillarId = getSelectedPillarId();
        if (!pillarId) return showErrorToast('No pillar available');

        try {
            // 1. Create booking first
            const bookingRes = await createBooking({
                stationId: station.id,
                vehicleId: vehicle.vehicleId!,
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
            console.error('❌ VNPAY Error:', err);
            showErrorToast(err?.message || 'Payment failed');
        }
    }, [vehicles, selectedVehicleId, station, scheduled, getSelectedBatteryId, getSelectedPillarId, createBooking, createPayment, onClose, router, batteryPrice]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalBackdrop}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Payment Method</Text>

                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#22c55e' }]}
                        onPress={handlePayAtStation}
                        disabled={bookingLoading}
                    >
                        <Text style={[styles.actionText, { color: '#fff' }]}>
                            {bookingLoading ? 'Booking...' : 'Pay at Station'}
                        </Text>
                    </TouchableOpacity>

                    {/* VNPay payment option - Always visible (subscription check disabled) */}
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]}
                        onPress={handlePayWithVnPay}
                        disabled={vnpayLoading}
                    >
                        <Text style={[styles.actionText, { color: '#fff' }]}>
                            {vnpayLoading ? 'Processing...' : 'Pay with VNPAY'}
                        </Text>
                    </TouchableOpacity>

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