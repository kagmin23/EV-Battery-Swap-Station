import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllBookings, useBookings } from '@/store/booking';
import { extractDateAndTime } from '@/utils/dateTime';
import { getAllStationInMap, getNameStationById, useStationInMap } from '@/store/station';
import { getAllVehicle, getNameVehicleById, useVehicles } from '@/store/vehicle';
import { getAllBatteryByStationId, useBatteriesInStation } from '@/store/baterry';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'approved': return '#4CAF50';
        case 'pending': return '#FFC107';
        case 'cancelled': return '#F44336';
        case 'completed': return '#6C63FF';
        default: return '#999';
    }
};

export default function BookingDetailsScreen() {
    const router = useRouter();
    const { bookingId } = useLocalSearchParams<{ bookingId: string }>();

    const mybookings = useBookings();
    const stationInMap = useStationInMap();
    const vehicles = useVehicles();
    const batteriesInStation = useBatteriesInStation();

    const [selectedBooking, setSelectedBooking] = useState<any>(null);

    useFocusEffect(
        useCallback(() => {
            getAllBookings();
            getAllStationInMap();
            getAllVehicle();
        }, [])
    );

    // Find the selected booking
    useEffect(() => {
        if (bookingId && mybookings.length > 0) {
            const booking = mybookings.find(b => b.bookingId === bookingId);
            setSelectedBooking(booking);

            // Load battery info for the station
            if (booking?.stationId) {
                getAllBatteryByStationId(booking.stationId);
            }
        }
    }, [bookingId, mybookings]);

    // Get battery info for the booking
    const getBatteryInfo = useCallback(() => {
        if (!selectedBooking || !batteriesInStation?.batteries) return null;

        // Find battery by ID (assuming booking has batteryId field)
        const battery = batteriesInStation.batteries.find((b: any) => b.id === selectedBooking.batteryId);
        return battery;
    }, [selectedBooking, batteriesInStation]);

    if (!selectedBooking) {
        return (
            <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={22} color="#bfa8ff" />
                        <Text style={styles.backText}>Profile</Text>
                    </TouchableOpacity>
                    <Text style={styles.header}>Booking Details</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading booking details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const station = getNameStationById(stationInMap, selectedBooking.stationId);
    const vehicle = getNameVehicleById(vehicles, selectedBooking.vehicleId);
    const battery = getBatteryInfo();
    const dateTime = extractDateAndTime(selectedBooking.scheduledTime);

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backRow} onPress={() => router.push('/(tabs)/my_booking')}>
                    <Ionicons name="chevron-back" size={22} color="#bfa8ff" />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.header}>Booking Details</Text>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Station Information */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="business-outline" size={20} color="#6C63FF" />
                        <Text style={styles.cardTitle}>Station Information</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="storefront-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>Station Name:</Text>
                        </View>
                        <Text style={styles.value}>{station?.stationName || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="location-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>Address:</Text>
                        </View>
                        <Text style={styles.value}>{station?.address || 'N/A'}</Text>
                    </View>
                </View>

                {/* Vehicle Information */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="car-sport-outline" size={20} color="#6C63FF" />
                        <Text style={styles.cardTitle}>Vehicle Information</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="car-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>Car Name:</Text>
                        </View>
                        <Text style={styles.value}>{vehicle?.carName || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="card-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>License Plate:</Text>
                        </View>
                        <Text style={styles.value}>{vehicle?.licensePlate || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="diamond-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>Brand:</Text>
                        </View>
                        <Text style={styles.value}>{vehicle?.brand || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="battery-half-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>Battery Model:</Text>
                        </View>
                        <Text style={styles.value}>{vehicle?.batteryModel || 'N/A'}</Text>
                    </View>
                </View>

                {/* Battery Information */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="battery-charging-outline" size={20} color="#6C63FF" />
                        <Text style={styles.cardTitle}>Battery Information</Text>
                    </View>
                    {battery ? (
                        <>
                            <View style={styles.infoRow}>
                                <View style={styles.labelWithIcon}>
                                    <Ionicons name="finger-print-outline" size={16} color="#9EA0A5" />
                                    <Text style={styles.label}>Battery Serial:</Text>
                                </View>
                                <Text style={styles.value}>{battery.serial || 'N/A'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <View style={styles.labelWithIcon}>
                                    <Ionicons name="cube-outline" size={16} color="#9EA0A5" />
                                    <Text style={styles.label}>Battery Model:</Text>
                                </View>
                                <Text style={styles.value}>{battery.model || 'N/A'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <View style={styles.labelWithIcon}>
                                    <Ionicons name="business-outline" size={16} color="#9EA0A5" />
                                    <Text style={styles.label}>Manufacturer:</Text>
                                </View>
                                <Text style={styles.value}>{battery.manufacturer || 'N/A'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <View style={styles.labelWithIcon}>
                                    <Ionicons name="flash-outline" size={16} color="#9EA0A5" />
                                    <Text style={styles.label}>Capacity:</Text>
                                </View>
                                <Text style={styles.value}>{battery.capacityKWh || 'N/A'} kWh</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <View style={styles.labelWithIcon}>
                                    <Ionicons name="thunderstorm-outline" size={16} color="#9EA0A5" />
                                    <Text style={styles.label}>Voltage:</Text>
                                </View>
                                <Text style={styles.value}>{battery.voltage || 'N/A'} V</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <View style={styles.labelWithIcon}>
                                    <Ionicons name="heart-outline" size={16} color="#9EA0A5" />
                                    <Text style={styles.label}>SOH (State of Health):</Text>
                                </View>
                                <Text style={styles.value}>{battery.soh || 'N/A'}%</Text>
                            </View>
                        </>
                    ) : (
                        <View style={styles.noDataContainer}>
                            <Ionicons name="battery-dead-outline" size={32} color="#9EA0A5" />
                            <Text style={styles.noDataText}>Battery information not available</Text>
                        </View>
                    )}
                </View>

                {/* Booking Information */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="receipt-outline" size={20} color="#6C63FF" />
                        <Text style={styles.cardTitle}>Booking Information</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="document-text-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>Booking ID:</Text>
                        </View>
                        <Text style={styles.value}>{selectedBooking.bookingId || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="calendar-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>Scheduled Date:</Text>
                        </View>
                        <Text style={styles.value}>{dateTime.date || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="time-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>Scheduled Time:</Text>
                        </View>
                        <Text style={styles.value}>{dateTime.time || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="checkmark-circle-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>Status:</Text>
                        </View>
                        <View style={styles.statusContainer}>
                            <Text style={[styles.value, { color: getStatusColor(selectedBooking.status), flexDirection: 'row', alignItems: 'center', textAlign: 'right' }]}>
                                <Ionicons
                                    name={selectedBooking.status === 'approved' ? 'checkmark-circle' :
                                        selectedBooking.status === 'pending' ? 'time' :
                                            selectedBooking.status === 'cancelled' ? 'close-circle' : 'checkmark-done-circle'}
                                    size={16}
                                    color={getStatusColor(selectedBooking.status)}
                                    style={{ marginRight: 4, marginLeft: 0, top: 1 }}
                                />
                                {selectedBooking.status?.charAt(0).toUpperCase() + selectedBooking.status?.slice(1) || 'N/A'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="create-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>Created At:</Text>
                        </View>
                        <Text style={styles.value}>{extractDateAndTime(selectedBooking.createdAt).date} - {extractDateAndTime(selectedBooking.createdAt).time}</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0C0121' },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 16, paddingTop: 4 },
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    backText: { color: '#bfa8ff', fontSize: 16, fontWeight: '600' },
    header: { fontSize: 22, fontWeight: '700', color: '#FFF', flex: 1, textAlign: 'center' },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 14, paddingVertical: 16, paddingBottom: 32 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#bfa8ff', fontSize: 16 },
    card: {
        backgroundColor: '#1E103E',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
    cardTitle: { color: '#FFF', fontWeight: '700', fontSize: 16 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    labelWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
    label: { color: '#9EA0A5', fontSize: 14 },
    value: { color: '#FFF', fontSize: 14, fontWeight: '500', flex: 2, textAlign: 'right' },
    statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 2, justifyContent: 'flex-end' },
    noDataContainer: { alignItems: 'center', paddingVertical: 20, gap: 8 },
    noDataText: { color: '#9EA0A5', fontSize: 14, textAlign: 'center', fontStyle: 'italic' },
});
