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



    const getSlotStatusColor = (status: string) => {
        switch (status) {
            case 'occupied':
                return '#10b981';
            case 'empty':
                return '#ef4444';
            case 'reserved':
                return '#f59e0b';
            case 'maintenance':
                return '#6b7280';
            default:
                return '#6b7280';
        }
    };

    const getBatteryStatusIcon = (status: string) => {
        switch (status) {
            case 'full':
                return 'battery-full';
            case 'charging':
                return 'battery-charging';
            case 'idle':
                return 'battery-half';
            case 'in-use':
                return 'swap-horizontal';
            case 'is-booking':
                return 'time';
            case 'faulty':
                return 'battery-dead';
            default:
                return 'help-circle-outline';
        }
    };

    const getBatteryStatusColor = (status: string) => {
        switch (status) {
            case 'full':
                return '#10b981'; // Green - ready to use
            case 'charging':
                return '#3b82f6'; // Blue - charging
            case 'idle':
                return '#22c55e'; // Light green - available
            case 'in-use':
                return '#f59e0b'; // Orange - currently being used
            case 'is-booking':
                return '#a855f7'; // Purple - reserved/booked
            case 'faulty':
                return '#ef4444'; // Red - error/broken
            default:
                return '#6b7280'; // Gray - unknown
        }
    };

    const renderSlotCard = (slot: Slot) => {
        return (
            <View key={slot.id} style={styles.slotCard}>
                <View style={styles.slotHeader}>
                    <View style={styles.slotHeaderLeft}>
                        <View
                            style={[
                                styles.slotNumberBadge,
                                { backgroundColor: `${getSlotStatusColor(slot.status)}20` },
                            ]}
                        >
                            <Text style={[styles.slotNumber, { color: getSlotStatusColor(slot.status) }]}>
                                #{slot.slotNumber}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.slotCode}>{slot.slotCode}</Text>
                            <View style={styles.slotStatusContainer}>
                                <View
                                    style={[styles.slotStatusDot, { backgroundColor: getSlotStatusColor(slot.status) }]}
                                />
                                <Text style={[styles.slotStatusText, { color: getSlotStatusColor(slot.status) }]}>
                                    {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Battery Info */}
                {slot.battery ? (
                    <View style={styles.batteryInfo}>
                        <View style={styles.batteryHeader}>
                            <Ionicons
                                name={getBatteryStatusIcon(slot.battery.status) as any}
                                size={24}
                                color={getBatteryStatusColor(slot.battery.status)}
                            />
                            <View style={styles.batteryDetails}>
                                <Text style={styles.batterySerial}>{slot.battery.serial}</Text>
                                <Text style={styles.batteryModel}>{slot.battery.model}</Text>
                            </View>
                        </View>
                        <View style={styles.batteryStats}>
                            <View style={styles.batteryStat}>
                                <Text style={styles.batteryStatLabel}>SOH</Text>
                                <Text style={[styles.batteryStatValue, { color: slot.battery.soh >= 80 ? '#10b981' : '#f59e0b' }]}>
                                    {slot.battery.soh}%
                                </Text>
                            </View>
                            <View style={styles.batteryStatDivider} />
                            <View style={styles.batteryStat}>
                                <Text style={styles.batteryStatLabel}>Status</Text>
                                <Text style={[styles.batteryStatValue, { color: getBatteryStatusColor(slot.battery.status) }]}>
                                    {slot.battery.status}
                                </Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.emptySlot}>
                        <Ionicons name="cube-outline" size={24} color="#6b7280" />
                        <Text style={styles.emptySlotText}>Empty Slot</Text>
                    </View>
                )}

                {/* Last Activity */}
                {slot.lastActivity && (
                    <View style={styles.lastActivity}>
                        <Ionicons name="time-outline" size={14} color="#9ca3af" />
                        <Text style={styles.lastActivityText}>
                            Last {slot.lastActivity.action}:{' '}
                            {new Date(slot.lastActivity.timestamp).toLocaleString()}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

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

                    {/* Slots List */}
                    <Text style={styles.slotsTitle}>Slots ({pillar.slots.length})</Text>
                    <ScrollView style={styles.slotsList} showsVerticalScrollIndicator={false}>
                        {pillar.slots.map(renderSlotCard)}
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
    slotCard: {
        backgroundColor: '#1e1b2e',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2d2a3f',
    },
    slotHeader: {
        marginBottom: 12,
    },
    slotHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    slotNumberBadge: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    slotNumber: {
        fontSize: 16,
        fontWeight: '700',
    },
    slotCode: {
        fontSize: 13,
        color: '#ffffff',
        fontWeight: '600',
        marginBottom: 4,
        fontFamily: 'monospace',
    },
    slotStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    slotStatusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    slotStatusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    batteryInfo: {
        backgroundColor: '#2d2a3f',
        borderRadius: 10,
        padding: 12,
    },
    batteryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    batteryDetails: {
        flex: 1,
    },
    batterySerial: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 2,
    },
    batteryModel: {
        fontSize: 12,
        color: '#9ca3af',
    },
    batteryStats: {
        flexDirection: 'row',
        backgroundColor: '#1e1b2e',
        borderRadius: 8,
        padding: 10,
    },
    batteryStat: {
        flex: 1,
        alignItems: 'center',
    },
    batteryStatDivider: {
        width: 1,
        backgroundColor: '#2d2a3f',
        marginHorizontal: 12,
    },
    batteryStatLabel: {
        fontSize: 11,
        color: '#9ca3af',
        marginBottom: 4,
    },
    batteryStatValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    emptySlot: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 20,
        backgroundColor: '#2d2a3f',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#3d3a4f',
        borderStyle: 'dashed',
    },
    emptySlotText: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    lastActivity: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#2d2a3f',
    },
    lastActivityText: {
        fontSize: 11,
        color: '#9ca3af',
    },
});
