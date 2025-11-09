import { getMyTransaction, useTransactions } from '@/store/transaction';
import { getAllStationInMap, getNameStationById, useStationInMap } from '@/store/station';
import { getAllVehicle, getNameVehicleById, useVehicles } from '@/store/vehicle';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBatteryById, useBatteries } from '@/store/baterry';

export default function TransactionsScreen() {
    const router = useRouter();
    const transactions = useTransactions();
    const stations = useStationInMap();
    const vehicles = useVehicles();
    const batteries = useBatteries();
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                setLoading(true);
                try {
                    await Promise.all([
                        getMyTransaction(),
                        getAllStationInMap(),
                        getAllVehicle()
                    ]);
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }, [])
    );

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '';
        }
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    const totalCost = transactions.reduce((sum, t) => sum + (t.cost || 0), 0);

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity
                    style={[styles.backRow, { position: 'absolute', left: 0 }]}
                    onPress={() => router.push('/(tabs)/profile')}
                >
                    <Ionicons name="chevron-back" size={22} color="#bfa8ff" />
                    <Text style={styles.backText}>Profile</Text>
                </TouchableOpacity>
                <Text style={styles.header}>Transaction History</Text>
            </View>

            {/* Summary Card */}
            <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Ionicons name="receipt-outline" size={24} color="#6C63FF" />
                        <Text style={styles.summaryLabel}>Total Transactions</Text>
                        <Text style={styles.summaryValue}>{transactions.length}</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Ionicons name="cash-outline" size={24} color="#4CAF50" />
                        <Text style={styles.summaryLabel}>Total Spent</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(totalCost)}</Text>
                    </View>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6C63FF" />
                    <Text style={styles.loadingText}>Loading transactions...</Text>
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.transactionId}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={64} color="#6C63FF" />
                            <Text style={styles.emptyTitle}>No Transactions Yet</Text>
                            <Text style={styles.emptyText}>
                                Your transaction history will appear here
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => {
                        const station = getNameStationById(stations, item.stationId);
                        const vehicle = getNameVehicleById(vehicles, item.vehicleId);

                        return (
                            <View style={styles.card}>
                                {/* Header */}
                                <View style={styles.cardHeader}>
                                    <View style={styles.iconBadge}>
                                        <Ionicons name="swap-horizontal" size={20} color="#fff" />
                                    </View>
                                    <View style={styles.cardHeaderText}>
                                        <Text style={styles.transactionId} numberOfLines={1}>
                                            #{item.transactionId ? item.transactionId.slice(0, 8) : 'N/A'}...
                                        </Text>
                                        <Text style={styles.transactionDate}>
                                            {formatDate(item.transactionTime)} • {formatTime(item.transactionTime)}
                                        </Text>
                                    </View>
                                    <Text style={styles.cost}>{formatCurrency(item.cost)}</Text>
                                </View>

                                {/* Details */}
                                <View style={styles.divider} />

                                <View style={styles.detailRow}>
                                    <Ionicons name="location-outline" size={16} color="#9EA0A5" />
                                    <Text style={styles.detailLabel}>Station:</Text>
                                    <Text style={styles.detailValue} numberOfLines={1}>
                                        {station?.stationName || 'Unknown Station'}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Ionicons name="car-sport-outline" size={16} color="#9EA0A5" />
                                    <Text style={styles.detailLabel}>Vehicle:</Text>
                                    <Text style={styles.detailValue} numberOfLines={1}>
                                        {vehicle?.carName || 'Unknown Vehicle'}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Ionicons name="battery-charging-outline" size={16} color="#9EA0A5" />
                                    <Text style={styles.detailLabel}>Battery Given:</Text>
                                    <Text style={styles.detailValue} numberOfLines={1}>
                                        {getBatteryById(batteries, item.batteryId)?.model || 'Unknown Battery'}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Ionicons name="calendar-outline" size={16} color="#9EA0A5" />
                                    <Text style={styles.detailLabel}>Booking ID:</Text>
                                    <Text style={styles.detailValue} numberOfLines={1}>
                                        {item.bookingId ? item.bookingId.slice(0, 12) : 'N/A'}...
                                    </Text>
                                </View>
                            </View>
                        );
                    }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0C0121',
        padding: 16
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        paddingTop: 4
    },
    backRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    backText: {
        color: '#bfa8ff',
        fontSize: 16,
        fontWeight: '600'
    },
    header: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFF'
    },
    summaryCard: {
        backgroundColor: '#1E103E',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#6C63FF',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
    },
    summaryDivider: {
        width: 1,
        height: 60,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 16,
    },
    summaryLabel: {
        color: '#9EA0A5',
        fontSize: 12,
        fontWeight: '600',
    },
    summaryValue: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    listContent: {
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#1E103E',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6C63FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardHeaderText: {
        flex: 1,
    },
    transactionId: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    transactionDate: {
        color: '#9EA0A5',
        fontSize: 12,
    },
    cost: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    detailLabel: {
        color: '#9EA0A5',
        fontSize: 13,
        width: 80,
    },
    detailValue: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        color: '#9EA0A5',
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        marginTop: 16,
    },
    emptyText: {
        color: '#9EA0A5',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
