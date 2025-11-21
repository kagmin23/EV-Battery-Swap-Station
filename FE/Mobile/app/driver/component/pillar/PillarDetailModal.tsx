import { Pillar, Slot, getPillarDetailsById } from '@/store/pillars';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PillarDetailModalProps {
    visible: boolean;
    pillar: Pillar | null;
    onClose: () => void;
    onRefresh?: () => void;
}

export const PillarDetailModal: React.FC<PillarDetailModalProps> = ({
    visible,
    pillar,
    onClose,
    onRefresh,
}) => {
    // Fetch pillar details when modal opens
    useEffect(() => {
        if (visible && pillar?.id) {
            getPillarDetailsById(pillar.id);
        }
    }, [visible, pillar?.id]);

    if (!pillar) return null;

    const getBatteryIcon = (slot: Slot) => {
        if (!slot.battery) return null;

        const soh = slot.battery.soh;
        if (soh >= 80) return { name: 'battery-full' as const, color: '#10b981' };
        if (soh >= 50) return { name: 'battery-half' as const, color: '#f59e0b' };
        return { name: 'battery-dead' as const, color: '#ef4444' };
    };

    const getSlotColor = (slot: Slot) => {
        if (slot.status === 'empty') return '#4a4a4a';
        if (slot.status === 'reserved') return '#8b5cf6';
        if (slot.status === 'occupied') return '#10b981';
        if (slot.status === 'maintenance') return '#6b7280';
        return '#4a4a4a';
    };

    const renderSlotCard = (slot: Slot) => {
        const batteryIcon = getBatteryIcon(slot);

        return (
            <View
                key={slot.id}
                style={[
                    styles.slotCard,
                    { backgroundColor: getSlotColor(slot) }
                ]}
            >
                <Text style={styles.slotNumber}>{slot.slotNumber}</Text>
                {batteryIcon && (
                    <Ionicons name={batteryIcon.name} size={20} color={batteryIcon.color} />
                )}
                <Text style={styles.slotStatusText}>{slot.status}</Text>
                {slot.battery && (
                    <Text style={styles.batterySOH}>SOH: {slot.battery.soh}%</Text>
                )}
            </View>
        );
    };

    // Group slots into rows of 5
    const groupedSlots = pillar.slots.reduce((acc: Slot[][], slot, index) => {
        const rowIndex = Math.floor(index / 5);
        if (!acc[rowIndex]) acc[rowIndex] = [];
        acc[rowIndex].push(slot);
        return acc;
    }, []);

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <View style={styles.modalHeaderLeft}>
                            <Ionicons name="battery-charging" size={28} color="#a78bfa" />
                            <View>
                                <Text style={styles.modalTitle}>{pillar.pillarName}</Text>
                                <Text style={styles.modalSubtitle}>{pillar.pillarCode}</Text>
                            </View>
                        </View>
                        <View style={styles.modalHeaderRight}>
                            {onRefresh && (
                                <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                                    <Ionicons name="refresh" size={24} color="#a78bfa" />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={28} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Station Info */}
                    <View style={styles.stationInfo}>
                        <Ionicons name="location" size={20} color="#a78bfa" />
                        <View style={styles.stationDetails}>
                            <Text style={styles.stationName}>{pillar.station.stationName}</Text>
                            <Text style={styles.stationAddress}>{pillar.station.address}</Text>
                        </View>
                    </View>

                    {/* Summary Stats */}
                    <View style={styles.summaryStats}>
                        <View style={styles.summaryStatItem}>
                            <Text style={styles.summaryStatValue}>{pillar.slotStats.total}</Text>
                            <Text style={styles.summaryStatLabel}>Total</Text>
                        </View>
                        <View style={styles.summaryStatDivider} />
                        <View style={styles.summaryStatItem}>
                            <Text style={[styles.summaryStatValue, { color: '#ef4444' }]}>
                                {pillar.slotStats.empty}
                            </Text>
                            <Text style={styles.summaryStatLabel}>Empty</Text>
                        </View>
                        <View style={styles.summaryStatDivider} />
                        <View style={styles.summaryStatItem}>
                            <Text style={[styles.summaryStatValue, { color: '#10b981' }]}>
                                {pillar.slotStats.occupied}
                            </Text>
                            <Text style={styles.summaryStatLabel}>Available</Text>
                        </View>
                        {pillar.slotStats.reserved > 0 && (
                            <>
                                <View style={styles.summaryStatDivider} />
                                <View style={styles.summaryStatItem}>
                                    <Text style={[styles.summaryStatValue, { color: '#f59e0b' }]}>
                                        {pillar.slotStats.reserved}
                                    </Text>
                                    <Text style={styles.summaryStatLabel}>Reserved</Text>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Slots Grid */}
                    <Text style={styles.slotsTitle}>Battery Slots ({pillar.slots.length})</Text>
                    <ScrollView style={styles.slotsList} showsVerticalScrollIndicator={false}>
                        <View style={styles.gridWrapper}>
                            {groupedSlots.map((row, rowIndex) => (
                                <View key={rowIndex} style={styles.gridRow}>
                                    {row.map((slot) => renderSlotCard(slot))}
                                </View>
                            ))}
                        </View>
                        <View style={{ height: 20 }} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#0a0520',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#2d2a3f',
    },
    modalHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    modalHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1e1b2e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 13,
        color: '#9ca3af',
        fontFamily: 'monospace',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1e1b2e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        marginHorizontal: 20,
        marginTop: 16,
        backgroundColor: '#1e1b2e',
        borderRadius: 12,
    },
    stationDetails: {
        flex: 1,
    },
    stationName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },
    stationAddress: {
        fontSize: 13,
        color: '#9ca3af',
    },
    summaryStats: {
        flexDirection: 'row',
        backgroundColor: '#1e1b2e',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 20,
        marginTop: 16,
    },
    summaryStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryStatDivider: {
        width: 1,
        backgroundColor: '#2d2a3f',
        marginHorizontal: 12,
    },
    summaryStatValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 4,
    },
    summaryStatLabel: {
        fontSize: 12,
        color: '#9ca3af',
    },
    slotsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
        paddingHorizontal: 20,
        marginTop: 24,
        marginBottom: 12,
    },
    slotsList: {
        paddingHorizontal: 20,
    },
    gridWrapper: {
        gap: 12,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'center',
    },
    slotCard: {
        width: 75,
        height: 75,
        borderRadius: 12,
        padding: 6,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    slotNumber: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    slotStatusText: {
        color: '#d1d5db',
        fontSize: 9,
        textTransform: 'capitalize',
    },
    batterySOH: {
        color: '#a3e635',
        fontSize: 8,
        fontWeight: '600',
    },
});
