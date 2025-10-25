import { useSelectedStation } from '@/store/station';
import { getAllVehicle, useVehicles, Vehicle } from '@/store/vehicle';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { formatDateVN, formatTimeVN } from '@/utils/dateTime';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateBooking } from '@/features/driver/apis/booking';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { useBookings } from '@/store/booking';
import { getAllBatteryByStationId, useBatteriesInStation } from '@/store/baterry';


export default function BookingScreen() {
    const router = useRouter();
    const vehicles = useVehicles();
    const station = useSelectedStation();
    const createBookingMutation = useCreateBooking();
    const bookings = useBookings();
    const batteriesInStation = useBatteriesInStation();

    const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(undefined);

    // Get available battery models from station
    const availableBatteryModels = useMemo(() => {
        if (!batteriesInStation || !batteriesInStation.batteries || !Array.isArray(batteriesInStation.batteries) || batteriesInStation.batteries.length === 0) return [];
        return batteriesInStation.batteries.map((battery: any) => battery.model);
    }, [batteriesInStation]);

    console.log('batteriesInStation type:', typeof batteriesInStation);
    console.log('batteriesInStation:', batteriesInStation);
    console.log('batteriesInStation is array:', Array.isArray(batteriesInStation));
    console.log('batteriesInStation.batteries:', batteriesInStation?.batteries);
    console.log('availableBatteryModels:', availableBatteryModels);

    // Check if vehicle is compatible with station batteries
    const isVehicleCompatible = useCallback((vehicle: Vehicle) => {
        return availableBatteryModels.includes(vehicle.batteryModel);
    }, [availableBatteryModels]);

    // Get selected battery ID for the selected vehicle
    const getSelectedBatteryId = useCallback(() => {
        if (!selectedVehicleId || !batteriesInStation?.batteries) return null;

        const selectedVehicle = vehicles.find(v => v.vehicleId === selectedVehicleId);
        if (!selectedVehicle) return null;

        // Find the first available battery with matching model
        const matchingBattery = batteriesInStation.batteries.find((battery: any) =>
            battery.model === selectedVehicle.batteryModel &&
            (battery.status === 'full' || battery.status === 'idle') // Only get fully and  charged batteries
        );

        return matchingBattery?.id || null;
    }, [selectedVehicleId, batteriesInStation, vehicles]);

    // Get selected battery info for display
    const getSelectedBatteryInfo = useCallback(() => {
        if (!selectedVehicleId || !batteriesInStation?.batteries) return null;

        const selectedVehicle = vehicles.find(v => v.vehicleId === selectedVehicleId);
        if (!selectedVehicle) return null;

        // Find the first available battery with matching model
        const matchingBattery = batteriesInStation.batteries.find((battery: any) =>
            battery.model === selectedVehicle.batteryModel &&
            (battery.status === 'full' || battery.status === 'idle')
        );

        return matchingBattery || null;
    }, [selectedVehicleId, batteriesInStation, vehicles]);

    // Auto-select first compatible vehicle
    useEffect(() => {
        if (vehicles.length > 0 && availableBatteryModels.length > 0 && !selectedVehicleId) {
            const compatibleVehicle = vehicles.find(v => isVehicleCompatible(v));
            if (compatibleVehicle) {
                setSelectedVehicleId(compatibleVehicle.vehicleId || '');
            }
        }
    }, [vehicles, availableBatteryModels, selectedVehicleId, isVehicleCompatible]);

    useFocusEffect(
        useCallback(() => {
            getAllVehicle();
            // getAllBookings();
            getAllBatteryByStationId(station?.id || '')
        }, [station?.id])
    )

    const [date, setDate] = useState<Date>(new Date());
    const [time, setTime] = useState<Date>(() => {
        const now = new Date();
        return new Date(now.getTime() + 15 * 60 * 1000);
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date>(new Date());
    const [tempTime, setTempTime] = useState<Date>(() => {
        const now = new Date();
        return new Date(now.getTime() + 15 * 60 * 1000);
    });

    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 3);

    const formattedDate = useMemo(() => formatDateVN(date), [date]);

    const formattedTime = useMemo(() => formatTimeVN(time), [time]);
    // Function to check for duplicate bookings
    const checkDuplicateBooking = (vehicleId: string, stationId: string, scheduledTime: Date): boolean => {
        const scheduledDateTime = new Date(scheduledTime);
        const timeWindow = 20 * 60 * 1000;

        return bookings.some(booking => {
            if (booking.vehicleId === vehicleId && booking.stationId === stationId) {
                const bookingTime = new Date(booking.scheduledTime);
                const timeDiff = Math.abs(scheduledDateTime.getTime() - bookingTime.getTime());
                return timeDiff <= timeWindow;
            }
            return false;
        });
    };

    const onConfirm = async () => {
        const vehicle = vehicles.find(x => x.vehicleId === selectedVehicleId);
        if (!vehicle) {
            showErrorToast('Please select a vehicle.', 'Validation error');
            return;
        }
        if (!date) {
            showErrorToast('Please select a date.', 'Validation error');
            return;
        }
        if (!time) {
            showErrorToast('Please select a time.', 'Validation error');
            return;
        }
        if (!station) {
            showErrorToast('Missing station information.', 'Validation error');
            return;
        }

        console.log('station object:', station);
        console.log('vehicle object:', vehicle);

        const scheduled = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            time.getHours(),
            time.getMinutes(),
            0,
            0
        );

        // Check for duplicate booking
        const stationId = station.id;
        console.log('stationId:', stationId);
        console.log('scheduled time:', scheduled.toISOString());

        if (!stationId) {
            showErrorToast('Invalid station ID.', 'Validation error');
            return;
        }

        if (checkDuplicateBooking(vehicle.vehicleId!, stationId, scheduled)) {
            showErrorToast('This vehicle already has a booking at this station within 20 minutes.', 'Duplicate booking');
            return;
        }

        // Get the actual battery ID for the selected vehicle
        const selectedBatteryId = getSelectedBatteryId();
        if (!selectedBatteryId) {
            showErrorToast('No available battery found for this vehicle model.', 'Battery not available');
            return;
        }

        console.log('Selected battery ID:', selectedBatteryId);
        console.log('Vehicle battery model:', vehicle.batteryModel);

        createBookingMutation.mutate({
            stationId: stationId,
            vehicleId: vehicle.vehicleId!,
            scheduledTime: scheduled.toISOString(),
            batteryId: selectedBatteryId,
        }, {
            onSuccess: (response) => {
                showSuccessToast(response.message || 'Booking successful!');
                setTimeout(() => {
                    router.push('/(tabs)');
                }, 1500);
            },
            onError: (error) => {
                showErrorToast(error.message || 'Booking failed, please try again.');
            }
        });
    };

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
            <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.iconBtn}>
                        <Ionicons name="chevron-back" size={22} color="#fff" />
                        <Text style={styles.backText}>Map</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Booking</Text>
                    <View style={{ width: 36 }} />
                </View>

                {/* Station card */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Ionicons name="location" size={18} color="#6C63FF" />
                        <Text style={styles.cardHeader}>Station</Text>
                    </View>
                    <Text style={styles.stationTitle}>{station?.stationName || 'EV Battery Swap Station'}</Text>
                    {!!station?.address && <Text style={styles.stationSub}>{station?.address}</Text>}
                    <View style={styles.statRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="battery-charging" size={16} color="#bfb6ff" />
                            <Text style={styles.statValue}>{station?.availableBatteries ?? '--'}</Text>
                            <Text style={styles.statLabel}>Available</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="albums-outline" size={16} color="#bfb6ff" />
                            <Text style={styles.statValue}>{station?.capacity ?? '--'}</Text>
                            <Text style={styles.statLabel}>Capacity</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={[styles.statusDot, { backgroundColor: station?.availableBatteries && station?.availableBatteries > 0 ? '#22c55e' : '#facc15' }]} />
                            <Text style={styles.statValue}>{station?.availableBatteries && station?.availableBatteries > 0 ? 'Available' : 'Busy'}</Text>
                            <Text style={styles.statLabel}>Status</Text>
                        </View>
                    </View>
                </View>

                {/* Vehicle card */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Ionicons name="car" size={18} color="#6C63FF" />
                        <Text style={styles.cardHeader}>Vehicle</Text>
                        {availableBatteryModels.length > 0 && (
                            <Text style={styles.compatibilityInfo}>
                                Compatible models: {availableBatteryModels.join(', ')}
                            </Text>
                        )}
                    </View>
                    <View style={{ gap: 10 }}>
                        {vehicles.map(v => {
                            const isCompatible = availableBatteryModels.includes(v.batteryModel);
                            const isDisabled = !isCompatible;

                            return (
                                <TouchableOpacity
                                    key={v.vehicleId}
                                    style={[
                                        styles.vehicleRow,
                                        selectedVehicleId === v.vehicleId && styles.vehicleRowActive,
                                        isDisabled && styles.vehicleRowDisabled
                                    ]}
                                    onPress={() => {
                                        if (!isDisabled) {
                                            setSelectedVehicleId(v.vehicleId || '');
                                        }
                                    }}
                                    disabled={isDisabled}
                                >
                                    <View style={styles.vehicleRowLeft}>
                                        <Ionicons
                                            name="car"
                                            size={18}
                                            color={isDisabled ? '#666' : (selectedVehicleId === v.vehicleId ? '#bfb6ff' : '#bfb6ff')}
                                        />
                                        <Text style={[
                                            styles.vehicleName,
                                            selectedVehicleId === v.vehicleId && styles.vehicleNameActive,
                                            isDisabled && styles.vehicleNameDisabled
                                        ]}>
                                            {v.carName}
                                        </Text>
                                        {isDisabled && (
                                            <Text style={styles.incompatibleText}>(Incompatible)</Text>
                                        )}
                                    </View>
                                    <View style={styles.vehicleRowRight}>
                                        <Text style={[
                                            styles.plate,
                                            selectedVehicleId === v.vehicleId && styles.plateActive,
                                            isDisabled && styles.plateDisabled
                                        ]}>
                                            {v.licensePlate}
                                        </Text>
                                        {selectedVehicleId === v.vehicleId && !isDisabled && (
                                            <Text style={styles.batteryInfo}>
                                                Battery: {getSelectedBatteryInfo()?.model || 'N/A'}
                                            </Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Date & Time */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Ionicons name="time" size={18} color="#6C63FF" />
                        <Text style={styles.cardHeader}>Schedule</Text>
                    </View>
                    <View style={{ gap: 10 }}>
                        <TouchableOpacity
                            style={styles.inputRow}
                            onPress={() => {
                                setTempDate(date);
                                setShowDatePicker(true);
                            }}
                        >
                            <View style={styles.inputLeft}>
                                <Text style={styles.inputLabel}>Date</Text>
                                <Text style={styles.inputValue}>{formattedDate}</Text>
                            </View>
                            <Ionicons name="calendar" size={18} color="#bfb6ff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.inputRow}
                            onPress={() => {
                                // If today is selected, set minimum time to 15 minutes from now
                                const now = new Date();
                                const isToday = date.toDateString() === now.toDateString();
                                if (isToday) {
                                    const minTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
                                    setTempTime(minTime);
                                } else {
                                    setTempTime(time);
                                }
                                setShowTimePicker(true);
                            }}
                        >
                            <View style={styles.inputLeft}>
                                <Text style={styles.inputLabel}>Time</Text>
                                <Text style={styles.inputValue}>{formattedTime}</Text>
                            </View>
                            <Ionicons name="time" size={18} color="#bfb6ff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Notes */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Ionicons name="document-text" size={18} color="#6C63FF" />
                        <Text style={styles.cardHeader}>Notes</Text>
                    </View>
                    <Text style={{ color: '#bfb6ff' }}>Please arrive 5 minutes early to ensure availability.</Text>
                </View>

                {/* Confirm */}
                <TouchableOpacity
                    style={[styles.confirmBtn, createBookingMutation.isPending && styles.confirmBtnDisabled]}
                    onPress={onConfirm}
                    disabled={createBookingMutation.isPending}
                >
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.confirmText}>
                        {createBookingMutation.isPending ? 'Creating...' : 'Confirm Booking'}
                    </Text>
                </TouchableOpacity>

                <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select Date</Text>
                            <DateTimePicker
                                value={tempDate}
                                mode="date"
                                minimumDate={today}
                                maximumDate={maxDate}
                                display={Platform.select({ ios: 'spinner', android: 'spinner' }) as any}
                                onChange={(_e: any, selected?: Date) => {
                                    if (selected) setTempDate(selected);
                                }}
                            />
                            <View style={styles.modalActions}>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.actionBtn}>
                                    <Text style={styles.actionText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setDate(tempDate);
                                        setShowDatePicker(false);
                                    }}
                                    style={[styles.actionBtn, styles.actionPrimary]}
                                >
                                    <Text style={[styles.actionText, styles.actionPrimaryText]}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
                <Modal visible={showTimePicker} transparent animationType="fade" onRequestClose={() => setShowTimePicker(false)}>
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select Time</Text>
                            {date.toDateString() === today.toDateString() && (
                                <Text style={styles.modalSubtitle}>
                                    For today&apos;s booking, please select a time at least 15 minutes from now.
                                </Text>
                            )}
                            <DateTimePicker
                                value={tempTime}
                                mode="time"
                                is24Hour
                                display={Platform.select({ ios: 'spinner', android: 'spinner' }) as any}
                                onChange={(_e: any, selected?: Date) => {
                                    if (selected) {
                                        // If today is selected, validate time is at least 15 minutes in the future
                                        const isToday = date.toDateString() === today.toDateString();
                                        if (isToday) {
                                            const minTime = new Date(today.getTime() + 15 * 60 * 1000); // 15 minutes from now
                                            if (selected < minTime) {
                                                showErrorToast(`Please select a time after ${minTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} for today's booking.`, 'Invalid time');
                                                return;
                                            }
                                        }
                                        setTempTime(selected);
                                    }
                                }}
                            />
                            <View style={styles.modalActions}>
                                <TouchableOpacity onPress={() => setShowTimePicker(false)} style={styles.actionBtn}>
                                    <Text style={styles.actionText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setTime(tempTime);
                                        setShowTimePicker(false);
                                    }}
                                    style={[styles.actionBtn, styles.actionPrimary]}
                                >
                                    <Text style={[styles.actionText, styles.actionPrimaryText]}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#120935' },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    iconBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    backText: { color: '#bfa8ff', fontSize: 16, fontWeight: '600' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    card: { backgroundColor: '#1a0f3e', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    cardHeader: { color: '#bfb6ff', fontWeight: '700' },
    compatibilityInfo: { color: '#4ade80', fontSize: 12, fontStyle: 'italic', marginLeft: 'auto' },
    stationTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
    stationSub: { color: '#bfb6ff', marginTop: 4 },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 12 },
    statItem: { flex: 1, backgroundColor: '#120935', borderRadius: 12, alignItems: 'center', paddingVertical: 12, gap: 4 },
    statValue: { color: 'white', fontWeight: '800' },
    statLabel: { color: '#bfb6ff', fontSize: 12 },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    vehicleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#120935', borderRadius: 12, padding: 12 },
    vehicleRowActive: { backgroundColor: '#2d1c82', borderWidth: 1, borderColor: '#6C63FF' },
    vehicleRowDisabled: { backgroundColor: '#2a2a2a', opacity: 0.5 },
    vehicleRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    vehicleRowRight: { alignItems: 'flex-end' },
    vehicleName: { color: 'white', fontWeight: '700' },
    vehicleNameActive: { color: '#bfb6ff' },
    vehicleNameDisabled: { color: '#666' },
    plate: { color: '#bfb6ff' },
    plateActive: { color: '#bfb6ff' },
    plateDisabled: { color: '#666' },
    incompatibleText: { color: '#ff6b6b', fontSize: 12, fontStyle: 'italic' },
    batteryInfo: { color: '#4ade80', fontSize: 11, fontStyle: 'italic', marginTop: 2 },
    inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#120935', borderRadius: 12, padding: 12 },
    inputLeft: { gap: 2 },
    inputLabel: { color: '#bfb6ff', fontSize: 12 },
    inputValue: { color: 'white', fontWeight: '700' },
    confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#6C63FF', height: 52, borderRadius: 14, marginTop: 8 },
    confirmBtnDisabled: { backgroundColor: '#4a4a4a', opacity: 0.6 },
    confirmText: { color: 'white', fontWeight: '800' },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '100%', maxWidth: 480, backgroundColor: '#1a0f3e', borderRadius: 16, padding: 16 },
    modalTitle: { color: '#bfb6ff', fontWeight: '700', fontSize: 14, marginBottom: 8, textAlign: 'center' },
    modalSubtitle: { color: '#f59e0b', fontSize: 12, textAlign: 'center', marginBottom: 12, fontStyle: 'italic' },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    actionBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#120935' },
    actionText: { color: '#bfb6ff', fontWeight: '700' },
    actionPrimary: { backgroundColor: '#6C63FF' },
    actionPrimaryText: { color: '#fff' },
});


