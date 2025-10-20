import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import LinkVehicleSheet from './component/LinkVehicleSheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllVehicle, useVehicles } from '@/store/vehicle';



export default function EVs() {
    const router = useRouter();
    const vehicles = useVehicles();
    // console.log(vehicles)
    const [isAddEvOpen, setIsAddEvOpen] = useState(false);

    useFocusEffect(
        useCallback(() => {
            getAllVehicle();
        }, [])
    )
    const handleDeleteAll = () => {

    };

    const openAddSheet = () => setIsAddEvOpen(true);
    const closeAddSheet = () => setIsAddEvOpen(false);

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
            <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.backRow} onPress={() => router.push('/(tabs)/profile')}>
                        <Ionicons name="chevron-back" size={22} color="#bfa8ff" />
                        <Text style={styles.backText}>Profile</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>EVs</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.headerBtn} onPress={handleDeleteAll}>
                            <Ionicons name="trash-outline" size={18} color="#bfa8ff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.headerBtn, { backgroundColor: '#6d4aff' }]} onPress={openAddSheet}>
                            <Ionicons name="add" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {vehicles.map((v, index) => (
                    <View key={index} style={styles.card}>
                        {/* Header Section */}
                        <View style={styles.headerCard}>
                            <View style={styles.titleRow}>
                                <Ionicons name="car-sport" size={18} color="#bfa8ff" />
                                <Text style={styles.vehicleName}>{v.carName}</Text>
                            </View>
                            <View style={styles.metaRow}>
                                <View style={styles.metaChip}>
                                    <Ionicons name="pricetag" size={14} color="#6d4aff" />
                                    <Text style={styles.metaText}>{v.brand}</Text>
                                </View>
                                <View style={styles.metaChip}>
                                    <Ionicons name="battery-charging-outline" size={14} color="#6d4aff" />
                                    <Text style={styles.metaText}>{v.batteryModel}</Text>
                                </View>
                                {!!v.vin && (
                                    <View style={[styles.metaChip, { backgroundColor: '#0b0624', borderColor: '#2a1f4e' }]}>
                                        <Ionicons name="barcode-outline" size={14} color="#6d4aff" />
                                        <Text style={styles.metaText}>{v.vin}</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Vehicle Info Sections */}
                        <View style={[styles.section, { marginTop: 12 }]}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="information-circle" size={16} color="#bfa8ff" />
                                <Text style={styles.sectionTitle}>Vehicle</Text>
                            </View>
                            <View style={styles.rowBetween}><Text style={styles.key}>Brand</Text><Text style={styles.val}>{v.brand}</Text></View>
                            <View style={styles.rowBetween}><Text style={styles.key}>Battery model</Text><Text style={styles.val}>{v.batteryModel}</Text></View>
                            <View style={styles.rowBetween}><Text style={styles.key}>VIN</Text><Text style={styles.val}>{v.vin}</Text></View>
                        </View>

                        {index < vehicles.length - 1 && <View style={styles.divider} />}
                    </View>
                ))}

                {/* Floating Add button */}

            </ScrollView>
            {/* Add EV Sheet outside ScrollView to overlay full screen */}
            <LinkVehicleSheet visible={isAddEvOpen} onClose={closeAddSheet} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0520' },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 0 },
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    backText: { color: '#bfa8ff', fontSize: 16, fontWeight: '600' },
    headerActions: { flexDirection: 'row', gap: 10 },
    headerBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#2a1f4e', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: 'white', fontSize: 22, fontWeight: '800' },
    card: { backgroundColor: 'transparent', borderRadius: 16, padding: 0, marginBottom: 14, marginHorizontal: 16 },
    headerCard: { backgroundColor: '#1a0f3e', borderRadius: 16, padding: 16 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    vehicleName: { color: 'white', fontSize: 20, fontWeight: '900' },
    headerSub: { color: '#bfa8ff', fontSize: 16, marginTop: 8 },
    headerMeta: { color: '#bfa8ff', fontSize: 14, marginTop: 8 },
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
    metaChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#120935', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#241a3f' },
    metaText: { color: '#bfa8ff', fontSize: 12 },
    section: { backgroundColor: '#120935', borderRadius: 12, padding: 14 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    sectionTitle: { color: 'white', fontSize: 14, fontWeight: '800' },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    key: { color: '#bfa8ff' },
    val: { color: 'white', fontWeight: '700' },
    divider: { height: 1, backgroundColor: '#241a3f', opacity: 0.7, marginTop: 16, marginBottom: 8 },
});
