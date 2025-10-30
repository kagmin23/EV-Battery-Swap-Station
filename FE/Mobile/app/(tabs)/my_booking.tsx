import { getAllBookings, useBookings } from '@/store/booking';
import { getAllStationInMap, getNameStationById, useStationInMap } from '@/store/station';
import { getAllVehicle, getNameVehicleById, useVehicles } from '@/store/vehicle';
import { extractDateAndTime } from '@/utils/dateTime';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const getStatusColor = (status: string) => {
    switch (status) {
        case 'confirmed': return '#4CAF50';  // Green
        case 'ready': return '#2196F3';      // Blue
        case 'pending': return '#FFC107';    // Yellow
        case 'cancelled': return '#F44336';  // Red
        case 'completed': return '#6C63FF';  // Purple
        default: return '#999';
    }
};

export default function MyBookingsScreen() {
    const router = useRouter();
    const mybooking = useBookings()
    const stationInMap = useStationInMap()
    const vehicles = useVehicles()
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'ready' | 'cancelled' | 'completed'>('all');

    const STATUS_OPTIONS: { key: 'all' | 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled'; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'pending', label: 'Pending' },
        { key: 'confirmed', label: 'Confirmed' },
        { key: 'ready', label: 'Ready' },
        { key: 'completed', label: 'Completed' },
        { key: 'cancelled', label: 'Cancelled' },
    ];
    useFocusEffect((
        useCallback(() => {
            getAllBookings()
            getAllStationInMap()
            getAllVehicle()
        }, [])
    ))
    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={[styles.backRow, { position: 'absolute', left: 0 }]} onPress={() => router.push('/(tabs)/profile')}>
                    <Ionicons name="chevron-back" size={22} color="#bfa8ff" />
                    <Text style={styles.backText}>Profile</Text>
                </TouchableOpacity>
                <Text style={styles.header}>My Bookings</Text>
            </View>

            <FlatList
                ListHeaderComponent={() => (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterRowContainer}
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <TouchableOpacity
                                key={opt.key}
                                style={[styles.filterButton, statusFilter === opt.key && styles.filterButtonActive]}
                                onPress={() => setStatusFilter(opt.key)}
                            >
                                <Text style={[styles.filterText, statusFilter === opt.key && styles.filterTextActive]}>{opt.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
                stickyHeaderIndices={[0]}
                data={statusFilter === 'all' ? mybooking : mybooking.filter(b => b.status === statusFilter)}
                keyExtractor={(item) => item.bookingId}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => router.push(`/(tabs)/booking-details?bookingId=${item.bookingId}`)}
                    >
                        <View style={styles.row}>
                            <Ionicons name="location-outline" size={18} color="#9EA0A5" />
                            <Text style={styles.station}>{getNameStationById(stationInMap, item.stationId)?.stationName}</Text>
                        </View>
                        <Text style={styles.area}>{getNameStationById(stationInMap, item.stationId)?.address || "No address"}</Text>
                        <View style={styles.details}>
                            <Text style={styles.label}>🚗 {getNameVehicleById(vehicles, item.vehicleId)?.carName || "No vehicle"}</Text>
                            <Text style={styles.label}>📅 {extractDateAndTime(item.scheduledTime).date} - {extractDateAndTime(item.scheduledTime).time}</Text>
                        </View>

                        <View style={styles.statusContainer}>
                            <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
                                ● {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0C0121', padding: 16 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12, paddingTop: 4 },
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    backText: { color: '#bfa8ff', fontSize: 16, fontWeight: '600' },
    header: { fontSize: 22, fontWeight: '700', color: '#FFF' },
    card: {
        backgroundColor: '#1E103E',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    station: { color: '#FFF', fontWeight: '600', fontSize: 16, marginLeft: 6 },
    area: { color: '#9EA0A5', fontSize: 13, marginBottom: 8 },
    details: { marginBottom: 10 },
    label: { color: '#D3D3E0', fontSize: 14 },
    statusContainer: { alignItems: 'flex-end' },
    status: { fontWeight: '600' },
    filterRowContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 6, backgroundColor: '#0C0121' },
    filterButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginRight: 8 },
    filterButtonActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
    filterText: { color: '#D3D3E0', fontSize: 13, fontWeight: '600' },
    filterTextActive: { color: '#FFF' },
});
