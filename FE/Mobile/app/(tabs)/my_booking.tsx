import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllBookings, useBookings } from '@/store/booking';
import { extractDateAndTime } from '@/utils/dateTime';
import { getAllStationInMap, getNameStationById, useStationInMap } from '@/store/station';
import { getAllVehicle, getNameVehicleById, useVehicles } from '@/store/vehicle';


const getStatusColor = (status: string) => {
    switch (status) {
        case 'approved': return '#4CAF50';
        case 'pending': return '#FFC107';
        case 'cancelled': return '#F44336';
        case 'completed': return '#6C63FF';
        default: return '#999';
    }
};

export default function MyBookingsScreen() {
    const router = useRouter();
    const mybooking = useBookings()
    const stationInMap = useStationInMap()
    const vehicles = useVehicles()
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
                data={mybooking}
                keyExtractor={(item) => item.bookingId}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card}>
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
});
