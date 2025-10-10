import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const bookings = [
    {
        id: '1',
        station: 'Tan Son Nhat Station',
        area: 'Tan Son Nhat Airport',
        date: '08/10/2025',
        time: '19:04',
        vehicle: 'Abarth 500e',
        status: 'Approved',
    },
    {
        id: '2',
        station: 'District 2 Station',
        area: 'Thao Dien',
        date: '09/10/2025',
        time: '10:00',
        vehicle: 'Model 3',
        status: 'Pending',
    },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Approved': return '#4CAF50';
        case 'Pending': return '#FFC107';
        case 'Cancelled': return '#F44336';
        case 'Completed': return '#6C63FF';
        default: return '#999';
    }
};

export default function MyBookingsScreen() {
    const router = useRouter();
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
                data={bookings}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card}>
                        <View style={styles.row}>
                            <Ionicons name="location-outline" size={18} color="#9EA0A5" />
                            <Text style={styles.station}>{item.station}</Text>
                        </View>
                        <Text style={styles.area}>{item.area}</Text>

                        <View style={styles.details}>
                            <Text style={styles.label}>🚗 {item.vehicle}</Text>
                            <Text style={styles.label}>📅 {item.date} - {item.time}</Text>
                        </View>

                        <View style={styles.statusContainer}>
                            <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
                                ● {item.status}
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
