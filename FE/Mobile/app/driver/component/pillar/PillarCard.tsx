import { Pillar } from '@/store/pillars';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PillarCardProps {
    pillar: Pillar;
    onPress: (pillar: Pillar) => void;
}

export const PillarCard: React.FC<PillarCardProps> = ({ pillar, onPress }) => {
    const { slotStats, pillarName, pillarCode, status, totalSlots } = pillar;
    const occupancyPercentage = totalSlots > 0 ? (slotStats.occupied / totalSlots) * 100 : 0;

    // Determine status color
    const getStatusColor = () => {
        switch (status) {
            case 'active':
                return '#10b981'; // green
            case 'inactive':
                return '#6b7280'; // gray
            case 'maintenance':
                return '#f59e0b'; // orange
            default:
                return '#6b7280';
        }
    };

    // Determine occupancy color
    const getOccupancyColor = () => {
        if (occupancyPercentage >= 80) return '#ef4444'; // red - almost full
        if (occupancyPercentage >= 50) return '#f59e0b'; // orange - half full
        return '#10b981'; // green - plenty of space
    };

    return (
        <TouchableOpacity
            style={[styles.card, status !== 'active' && styles.inactiveCard]}
            onPress={() => onPress(pillar)}
            activeOpacity={0.7}
            disabled={status !== 'active'}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="battery-charging" size={24} color="#a78bfa" />
                    </View>
                    <View>
                        <Text style={styles.pillarName}>{pillarName}</Text>
                        <Text style={styles.pillarCode}>{pillarCode}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                    <Text style={[styles.statusText, { color: getStatusColor() }]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                </View>
            </View>

            {/* Slot Statistics */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Total Slots</Text>
                    <Text style={styles.statValue}>{slotStats.total}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Empty</Text>
                    <Text style={[styles.statValue, { color: '#ef4444' }]}>{slotStats.empty}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Available</Text>
                    <Text style={[styles.statValue, { color: '#10b981' }]}>{slotStats.occupied}</Text>
                </View>
            </View>

            {/* Occupancy Bar */}
            <View style={styles.occupancyContainer}>
                <Text style={styles.occupancyLabel}>Occupancy</Text>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${occupancyPercentage}%`,
                                backgroundColor: getOccupancyColor(),
                            },
                        ]}
                    />
                </View>
                <Text style={styles.occupancyPercent}>{occupancyPercentage.toFixed(0)}%</Text>
            </View>

            {/* Reserved Indicator */}
            {slotStats.reserved > 0 && (
                <View style={styles.reservedContainer}>
                    <Ionicons name="alert-circle" size={16} color="#f59e0b" />
                    <Text style={styles.reservedText}>
                        {slotStats.reserved} slot{slotStats.reserved > 1 ? 's' : ''} reserved
                    </Text>
                </View>
            )}

            {/* View Details Arrow */}
            <View style={styles.footer}>
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Ionicons name="chevron-forward" size={20} color="#a78bfa" />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1e1b2e',
        borderRadius: 16,
        padding: 16,
        marginBottom: 0, // Changed from 16 to 0 for horizontal scroll
        borderWidth: 1,
        borderColor: '#2d2a3f',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inactiveCard: {
        opacity: 0.6,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#2d2a3f',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pillarName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 4,
    },
    pillarCode: {
        fontSize: 12,
        color: '#9ca3af',
        fontFamily: 'monospace',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#2d2a3f',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#3d3a4f',
        marginHorizontal: 8,
    },
    statLabel: {
        fontSize: 11,
        color: '#9ca3af',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
    },
    occupancyContainer: {
        marginBottom: 12,
    },
    occupancyLabel: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 8,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#2d2a3f',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    occupancyPercent: {
        fontSize: 11,
        color: '#9ca3af',
        textAlign: 'right',
    },
    reservedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f59e0b20',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
        marginBottom: 12,
    },
    reservedText: {
        fontSize: 12,
        color: '#f59e0b',
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#2d2a3f',
    },
    viewDetailsText: {
        fontSize: 14,
        color: '#a78bfa',
        fontWeight: '600',
    },
});
