import { useCreateBooking } from '@/features/driver/apis/booking';
import { useVnPay } from '@/store/payment';
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
            // 1. Tạo booking (không toast success)
            const bookingRes = await createBooking({
                stationId: station.id,
                vehicleId: vehicle.vehicleId!,
                scheduledTime: scheduled.toISOString(),
                batteryId,
            });

            if (!bookingRes.success || !bookingRes.bookingId) {
                return showErrorToast(bookingRes.message || 'Booking failed');
            }

            // KHÔNG toast success ở đây → vì chưa thanh toán xong

            // 2. Tạo payment VNPAY
            const returnUrl = `https://unimpulsive-unhumorously-lera.ngrok-free.dev/api/payments/vnpay/return`;
            // HOẶC dùng deep link nếu bạn có app scheme:
            // const returnUrl = `myapp://payment-result`;

            const paymentRes = await createPayment({
                amount: vehicle.price || 100000,
                bookingId: bookingRes.bookingId,
                returnUrl,
            });

            // Expect `createPayment` returns the payment data object `{ url, txnRef, payment_id }`
            if (paymentRes?.url) {
                onClose();

                // Use Linking.canOpenURL before opening
                const supported = await Linking.canOpenURL(paymentRes.url);
                if (supported) {
                    await Linking.openURL(paymentRes.url);
                } else {
                    showErrorToast('Cannot open payment URL');
                }
            } else {
                showErrorToast('Failed to get VNPAY URL');
            }
        } catch (err: any) {
            console.error('VNPAY Error:', err);
            showErrorToast(err?.response?.data?.message || err.message || 'Payment failed');
        }
    }, [
        vehicles, selectedVehicleId, station, scheduled,
        getSelectedBatteryId, createBooking, createPayment, onClose
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

                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]}
                        onPress={handlePayWithVnPay}
                        disabled={vnpayLoading}
                    >
                        <Text style={[styles.actionText, { color: '#fff' }]}>
                            {vnpayLoading ? 'Processing...' : 'Pay with VNPAY'}
                        </Text>
                    </TouchableOpacity>

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
