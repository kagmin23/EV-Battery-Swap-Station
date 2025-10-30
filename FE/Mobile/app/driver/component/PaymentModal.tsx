import { useCreateBooking } from '@/features/driver/apis/booking';
import { useVnPay } from '@/store/payment';
import { useSubscriptionPlans } from '@/store/subcription';
import { toCamelCase } from '@/utils/caseConverter';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
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
    checkDuplicateBooking: (vehicleId: string, stationId: string, scheduledTime: Date) => boolean;
}

export default function PaymentModal({
    visible,
    onClose,
    selectedVehicleId,
    station,
    date,
    time,
    vehicles,
    getSelectedBatteryId,
    checkDuplicateBooking,
}: PaymentModalProps) {
    const router = useRouter();
    const createBookingMutation = useCreateBooking();
    const createBooking = createBookingMutation.mutateAsync;
    const bookingLoading = createBookingMutation.status === 'pending';
    const { createPayment, loading: vnpayLoading } = useVnPay();
    const subscriptions = useSubscriptionPlans();

    const hasInUseSubscription = React.useMemo(() => {
        try {
            return (subscriptions || []).some((s: any) => (s.userSubscription?.status || '').toString().toLowerCase() === 'in-use');
        } catch {
            return false;
        }
    }, [subscriptions]);

    const scheduled = useMemo(() => new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes(),
        0
    ), [date, time]);

    // ------------------- Pay at Station -------------------
    const handlePayAtStation = useCallback(async () => {
        const vehicle = vehicles.find(x => x.vehicleId === selectedVehicleId);
        if (!vehicle) return showErrorToast('Vehicle not found');

        if (checkDuplicateBooking(vehicle.vehicleId!, station.id, scheduled)) {
            return showErrorToast('Duplicate booking within 20 minutes');
        }

        const batteryId = getSelectedBatteryId();
        if (!batteryId) return showErrorToast('No battery available');

        try {
            const res = await createBooking({
                stationId: station.id,
                vehicleId: vehicle.vehicleId!,
                scheduledTime: scheduled.toISOString(),
                batteryId,
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
    }, [vehicles, selectedVehicleId, scheduled, station, getSelectedBatteryId, checkDuplicateBooking, createBooking, onClose, router]);

    const handlePayWithVnPay = useCallback(async () => {
        const vehicle = vehicles.find(x => x.vehicleId === selectedVehicleId);
        if (!vehicle) return showErrorToast('Vehicle not found');

        const batteryId = getSelectedBatteryId();
        if (!batteryId) return showErrorToast('No battery available');

        try {
            // 1. create booking (no toast success)
            const bookingRes = await createBooking({
                stationId: station.id,
                vehicleId: vehicle.vehicleId!,
                scheduledTime: scheduled.toISOString(),
                batteryId,
            });

            const data = toCamelCase(bookingRes);
            const bookingId = data.data.bookingId;

            if (!data.success || !bookingId) {
                return showErrorToast(data.message || 'Booking failed');
            }

            // If backend immediately confirmed the booking (e.g. user has an active subscription),
            // skip VNPay payment and treat booking as successful.
            const bookingStatus = (data.data.status || '').toString().toLowerCase();
            if (bookingStatus === 'confirmed') {
                showSuccessToast(data.message || 'Booking confirmed');
                onClose();
                router.push('/(tabs)/my_booking');
                return;
            }

            // 2. create payment VNPAY
            // Dùng deep link của Expo
            const returnUrl = "exp://192.168.1.38:8081/--/payment-success";

            const paymentRes = await createPayment({
                amount: vehicle.price || 100000,
                bookingId: bookingId,
                returnUrl,
            });

            if (!paymentRes) {
                return showErrorToast('Payment failed - no response');
            }

            if (!paymentRes.url) {
                return showErrorToast('Payment failed - no URL returned');
            }

            onClose();

            // open payment URL
            const supported = await Linking.canOpenURL(paymentRes.url);

            if (supported) {
                await Linking.openURL(paymentRes.url);
            } else {
                showErrorToast('Cannot open payment URL');
            }
        } catch (err: any) {
            console.error('❌ VNPAY Error:', err);
            showErrorToast(err?.response?.data?.message || err.message || 'Payment failed');
        }
    }, [
        vehicles, selectedVehicleId, station, scheduled,
        getSelectedBatteryId, createBooking, createPayment, onClose, router
    ]);

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

                    {!hasInUseSubscription ? (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]}
                            onPress={handlePayWithVnPay}
                            disabled={vnpayLoading}
                        >
                            <Text style={[styles.actionText, { color: '#fff' }]}>\
                                {vnpayLoading ? 'Processing...' : 'Pay with VNPAY'}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={[styles.actionBtn, { backgroundColor: 'transparent' }]}> 
                            <Text style={[styles.actionText, { color: '#bfa8ff', textAlign: 'center' }]}>You have an active subscription</Text>
                        </View>
                    )}

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

const styles = StyleSheet.create({
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '100%', maxWidth: 480, backgroundColor: '#1a0f3e', borderRadius: 16, padding: 16 },
    modalTitle: { color: '#bfb6ff', fontWeight: '700', fontSize: 16, marginBottom: 12, textAlign: 'center' },
    actionBtn: { paddingVertical: 12, borderRadius: 12, marginVertical: 6 },
    actionText: { color: '#bfb6ff', fontWeight: '700', textAlign: 'center' },
});
