import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Station = {
    id?: string;
    title: string;
    description?: string;
    availableBatteries?: number;
    totalBatteries?: number;
    status?: 'available' | 'busy' | 'offline';
};

export default function BookingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const station: Station = useMemo(() => {
        try {
            const raw = params.station as string | undefined;
            return raw ? JSON.parse(raw) : {} as Station;
        } catch {
            return {} as Station;
        }
    }, [params]);

    // In real app, fetch user vehicles. For demo, mock a few.
    const vehicles = [
        { id: '1', name: 'Abarth 500e', plate: '30H-123.45' },
        { id: '2', name: 'Model 3', plate: '30G-678.90' },
        { id: '3', name: 'VF 6 Plus', plate: '88A-456.78' },
    ];
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id);
    const [date, setDate] = useState<Date>(new Date());
    const [time, setTime] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const formattedDate = useMemo(() => {
        try {
            return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
        } catch { return ''; }
    }, [date]);

    const formattedTime = useMemo(() => {
        try {
            return time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
        } catch { return ''; }
    }, [time]);

    const onConfirm = () => {
        const v = vehicles.find(x => x.id === selectedVehicleId);
        Alert.alert('Booking confirmed', `${station.title || 'Station'}\nVehicle: ${v?.name}\nWhen: ${formattedDate} ${formattedTime}`);
        router.back();
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingVertical: 30 }}>
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="chevron-back" size={22} color="#fff" />
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
                <Text style={styles.stationTitle}>{station.title || 'EV Battery Swap Station'}</Text>
                {!!station.description && <Text style={styles.stationSub}>{station.description}</Text>}
                <View style={styles.statRow}>
                    <View style={styles.statItem}>
                        <Ionicons name="battery-charging" size={16} color="#bfb6ff" />
                        <Text style={styles.statValue}>{station.availableBatteries ?? '--'}</Text>
                        <Text style={styles.statLabel}>Available</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="albums-outline" size={16} color="#bfb6ff" />
                        <Text style={styles.statValue}>{station.totalBatteries ?? '--'}</Text>
                        <Text style={styles.statLabel}>Total Slots</Text>
                    </View>
                    <View style={styles.statItem}>
                        <View style={[styles.statusDot, { backgroundColor: station.status === 'available' ? '#22c55e' : station.status === 'busy' ? '#facc15' : '#ef4444' }]} />
                        <Text style={styles.statValue}>{station.status ? station.status[0].toUpperCase() + station.status.slice(1) : '--'}</Text>
                        <Text style={styles.statLabel}>Status</Text>
                    </View>
                </View>
            </View>

            {/* Vehicle card */}
            <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                    <Ionicons name="car" size={18} color="#6C63FF" />
                    <Text style={styles.cardHeader}>Vehicle</Text>
                </View>
                <View style={{ gap: 10 }}>
                    {vehicles.map(v => (
                        <TouchableOpacity key={v.id} style={[styles.vehicleRow, selectedVehicleId === v.id && styles.vehicleRowActive]} onPress={() => setSelectedVehicleId(v.id)}>
                            <View style={styles.vehicleRowLeft}>
                                <Ionicons name="car" size={18} color={selectedVehicleId === v.id ? '#bfb6ff' : '#bfb6ff'} />
                                <Text style={[styles.vehicleName, selectedVehicleId === v.id && styles.vehicleNameActive]}>{v.name}</Text>
                            </View>
                            <Text style={[styles.plate, selectedVehicleId === v.id && styles.plateActive]}>{v.plate}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Date & Time */}
            <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                    <Ionicons name="time" size={18} color="#6C63FF" />
                    <Text style={styles.cardHeader}>Schedule</Text>
                </View>
                <View style={{ gap: 10 }}>
                    <TouchableOpacity style={styles.inputRow} onPress={() => setShowDatePicker(true)}>
                        <View style={styles.inputLeft}>
                            <Text style={styles.inputLabel}>Date</Text>
                            <Text style={styles.inputValue}>{formattedDate}</Text>
                        </View>
                        <Ionicons name="calendar" size={18} color="#bfb6ff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.inputRow} onPress={() => setShowTimePicker(true)}>
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
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.confirmText}>Confirm Booking</Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.select({ ios: 'spinner', android: 'calendar' }) as any}
                    onChange={(_e, selected) => {
                        setShowDatePicker(Platform.OS === 'ios');
                        if (selected) setDate(selected);
                    }}
                />
            )}
            {showTimePicker && (
                <DateTimePicker
                    value={time}
                    mode="time"
                    is24Hour
                    display={Platform.select({ ios: 'spinner', android: 'clock' }) as any}
                    onChange={(_e, selected) => {
                        setShowTimePicker(Platform.OS === 'ios');
                        if (selected) setTime(selected);
                    }}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#120935' },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    iconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#2E005D', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    card: { backgroundColor: '#1a0f3e', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    cardHeader: { color: '#bfb6ff', fontWeight: '700' },
    stationTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
    stationSub: { color: '#bfb6ff', marginTop: 4 },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 12 },
    statItem: { flex: 1, backgroundColor: '#120935', borderRadius: 12, alignItems: 'center', paddingVertical: 12, gap: 4 },
    statValue: { color: 'white', fontWeight: '800' },
    statLabel: { color: '#bfb6ff', fontSize: 12 },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    vehicleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#120935', borderRadius: 12, padding: 12 },
    vehicleRowActive: { backgroundColor: '#2d1c82', borderWidth: 1, borderColor: '#6C63FF' },
    vehicleRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    vehicleName: { color: 'white', fontWeight: '700' },
    vehicleNameActive: { color: '#bfb6ff' },
    plate: { color: '#bfb6ff' },
    plateActive: { color: '#bfb6ff' },
    inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#120935', borderRadius: 12, padding: 12 },
    inputLeft: { gap: 2 },
    inputLabel: { color: '#bfb6ff', fontSize: 12 },
    inputValue: { color: 'white', fontWeight: '700' },
    confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#6C63FF', height: 52, borderRadius: 14, marginTop: 8 },
    confirmText: { color: 'white', fontWeight: '800' },
});


