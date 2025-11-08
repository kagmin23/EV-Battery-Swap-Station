import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePillarGrid, usePillarGridLoading, usePillarGridError, getPillarGrid, clearPillarGrid, GridSlot } from '@/store/pillarGrid';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { initiateBatterySwap, SwapResponse } from '@/features/driver/apis/swap_simulate';

export default function BatterySwapSimulation() {
    const router = useRouter();
    const { pillarId, vehicleId, bookingId, id } = useLocalSearchParams<{
        pillarId?: string;
        vehicleId?: string;
        bookingId?: string;
        id?: string; // MongoDB ObjectId
    }>();
    const pillarGrid = usePillarGrid();
    const loading = usePillarGridLoading();
    const error = usePillarGridError();

    const [selectedSlot, setSelectedSlot] = useState<GridSlot | null>(null);
    const [swapProgress, setSwapProgress] = useState<'idle' | 'removing' | 'inserting' | 'completed'>('idle');
    const [swapData, setSwapData] = useState<SwapResponse | null>(null);
    const [initiating, setInitiating] = useState(false);

    useEffect(() => {
        if (pillarId) {
            console.log('Fetching pillar grid for:', pillarId);
            getPillarGrid(pillarId, 2, 5)
                .then(data => {
                })
                .catch(err => {
                    console.error('Failed to load pillar grid:', err);
                    showErrorToast(err.message || 'Failed to load pillar grid');
                });
        }

        return () => {
            clearPillarGrid();
        };
    }, [pillarId]);

    const getSlotColor = (slot: GridSlot) => {
        if (slot.status === 'empty') return '#4a4a4a';
        if (slot.status === 'reserved') return '#8b5cf6';
        if (slot.status === 'occupied') return '#10b981';
        if (slot.status === 'charging') return '#3b82f6';
        return '#6b7280';
    };

    const getBatteryStatusIcon = (status: string) => {
        switch (status) {
            case 'full': return { name: 'battery-full' as const, color: '#10b981' };
            case 'charging': return { name: 'battery-charging' as const, color: '#3b82f6' };
            case 'idle': return { name: 'battery-half' as const, color: '#a3e635' };
            case 'in-use': return { name: 'battery-charging' as const, color: '#f97316' };
            case 'is-booking': return { name: 'battery-charging' as const, color: '#8b5cf6' };
            case 'faulty': return { name: 'battery-dead' as const, color: '#ef4444' };
            default: return { name: 'battery-half' as const, color: '#9ca3af' };
        }
    };

    const handleSlotPress = (slot: GridSlot) => {
        if (slot.status !== 'empty' && slot.battery) {
            setSelectedSlot(slot);
        }
    };

    const handleInitiateSwap = async () => {
        if (!pillarId) {
            showErrorToast('Pillar ID is missing');
            return;
        }

        if (!vehicleId || !bookingId) {
            showErrorToast('Missing required booking information');
            return;
        }

        setInitiating(true);
        try {
            const data = await initiateBatterySwap({
                vehicleId,
                bookingId, // UUID fallback
                id // MongoDB ObjectId (preferred)
            });
            console.log('Swap initiated:', data);

            setSwapData(data);
            showSuccessToast(data.message || 'Battery swap initiated successfully');
        } catch (err: any) {
            console.error('Failed to initiate swap:', err);
            showErrorToast(err.message || 'Failed to initiate swap');
        } finally {
            setInitiating(false);
        }
    };

    const handleStartSwap = () => {
        if (!selectedSlot) return;

        setSwapProgress('removing');

        // Simulate removing battery (2 seconds)
        setTimeout(() => {
            setSwapProgress('inserting');

            // Simulate inserting new battery (2 seconds)
            setTimeout(() => {
                setSwapProgress('completed');

                // Auto navigate back after completion
                setTimeout(() => {
                    router.back();
                }, 2000);
            }, 2000);
        }, 2000);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6C63FF" />
                    <Text style={styles.loadingText}>Loading pillar grid...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !pillarGrid) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={48} color="#ef4444" />
                    <Text style={styles.errorText}>{error || 'Failed to load grid'}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => {
                        if (pillarId) {
                            getPillarGrid(pillarId, 2, 5);
                        } else {
                            router.back();
                        }
                    }}>
                        <Text style={styles.retryButtonText}>{pillarId ? 'Retry' : 'Go Back'}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Additional validation for grid structure
    if (!pillarGrid.grid || !Array.isArray(pillarGrid.grid) || pillarGrid.grid.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={48} color="#f59e0b" />
                    <Text style={styles.errorText}>Invalid grid data structure</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
                        <Text style={styles.retryButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
            <ScrollView>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#bfa8ff" />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Battery Swap</Text>
                    <View style={{ width: 60 }} />
                </View>

                {/* Pillar Info */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Ionicons name="albums" size={20} color="#6C63FF" />
                        <Text style={styles.infoTitle}>{pillarGrid.pillar.pillarName}</Text>
                    </View>
                    <Text style={styles.infoSubtitle}>{pillarGrid.pillar.station.stationName}</Text>
                    <Text style={styles.infoAddress}>{pillarGrid.pillar.station.address}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{pillarGrid.pillar.slotStats.total}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={[styles.statValue, { color: '#10b981' }]}>{pillarGrid.pillar.slotStats.occupied}</Text>
                            <Text style={styles.statLabel}>Available</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={[styles.statValue, { color: '#8b5cf6' }]}>{pillarGrid.pillar.slotStats.reserved}</Text>
                            <Text style={styles.statLabel}>Reserved</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={[styles.statValue, { color: '#6b7280' }]}>{pillarGrid.pillar.slotStats.empty}</Text>
                            <Text style={styles.statLabel}>Empty</Text>
                        </View>
                    </View>
                </View>

                {/* Slot Grid */}
                <View style={styles.gridContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Select Battery Slot</Text>
                        {!swapData && (
                            <TouchableOpacity
                                style={[styles.startButton, initiating && styles.startButtonDisabled]}
                                onPress={handleInitiateSwap}
                                disabled={initiating}
                            >
                                {initiating ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="play-circle" size={20} color="#fff" />
                                        <Text style={styles.startButtonText}>Start Swap</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Swap Instructions */}
                    {swapData && (
                        <View style={styles.instructionsCard}>
                            <View style={styles.instructionsHeader}>
                                <Ionicons name="list-circle" size={24} color="#6C63FF" />
                                <Text style={styles.instructionsTitle}>Swap Instructions</Text>
                            </View>
                            <View style={styles.swapInfoRow}>
                                <Text style={styles.swapInfoLabel}>Swap ID:</Text>
                                <Text style={styles.swapInfoValue}>{swapData.swapId}</Text>
                            </View>
                            <View style={styles.instructionsList}>
                                <View style={styles.instructionItem}>
                                    <View style={styles.instructionNumber}>
                                        <Text style={styles.instructionNumberText}>1</Text>
                                    </View>
                                    <Text style={styles.instructionText}>{swapData.instructions.step1}</Text>
                                </View>
                                <View style={styles.instructionItem}>
                                    <View style={styles.instructionNumber}>
                                        <Text style={styles.instructionNumberText}>2</Text>
                                    </View>
                                    <Text style={styles.instructionText}>{swapData.instructions.step2}</Text>
                                </View>
                                <View style={styles.instructionItem}>
                                    <View style={styles.instructionNumber}>
                                        <Text style={styles.instructionNumberText}>3</Text>
                                    </View>
                                    <Text style={styles.instructionText}>{swapData.instructions.step3}</Text>
                                </View>
                                <View style={styles.instructionItem}>
                                    <View style={styles.instructionNumber}>
                                        <Text style={styles.instructionNumberText}>4</Text>
                                    </View>
                                    <Text style={styles.instructionText}>{swapData.instructions.step4}</Text>
                                </View>
                            </View>

                            {/* New Battery Info */}
                            <View style={styles.batteryInfoCard}>
                                <Text style={styles.batteryInfoTitle}>Booked Battery (New)</Text>
                                <View style={styles.batteryInfoRow}>
                                    <Text style={styles.batteryInfoLabel}>Serial:</Text>
                                    <Text style={styles.batteryInfoValue}>{swapData.bookedBattery.serial}</Text>
                                </View>
                                <View style={styles.batteryInfoRow}>
                                    <Text style={styles.batteryInfoLabel}>Model:</Text>
                                    <Text style={styles.batteryInfoValue}>{swapData.bookedBattery.model}</Text>
                                </View>
                                <View style={styles.batteryInfoRow}>
                                    <Text style={styles.batteryInfoLabel}>Slot:</Text>
                                    <Text style={styles.batteryInfoValue}>#{swapData.bookedBattery.slotNumber}</Text>
                                </View>
                                <View style={styles.batteryInfoRow}>
                                    <Text style={styles.batteryInfoLabel}>SOH:</Text>
                                    <Text style={[styles.batteryInfoValue, { color: '#10b981' }]}>
                                        {swapData.bookedBattery.soh}%
                                    </Text>
                                </View>
                            </View>

                            {/* Empty Slot Info */}
                            <View style={styles.emptySlotCard}>
                                <Text style={styles.emptySlotTitle}>Empty Slot for Old Battery</Text>
                                <View style={styles.batteryInfoRow}>
                                    <Text style={styles.batteryInfoLabel}>Pillar:</Text>
                                    <Text style={styles.batteryInfoValue}>{swapData.pillar.pillarName}</Text>
                                </View>
                                <View style={styles.batteryInfoRow}>
                                    <Text style={styles.batteryInfoLabel}>Slot:</Text>
                                    <Text style={styles.batteryInfoValue}>#{swapData.emptySlot.slotNumber}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    <View style={styles.gridWrapper}>
                        {pillarGrid.grid && Array.isArray(pillarGrid.grid) && pillarGrid.grid.map((row, rowIndex) => (
                            <View key={rowIndex} style={styles.gridRow}>
                                {Array.isArray(row) && row.map((slot) => {
                                    const batteryIcon = slot.battery ? getBatteryStatusIcon(slot.battery.status) : null;
                                    const isSelected = selectedSlot?.id === slot.id;

                                    return (
                                        <TouchableOpacity
                                            key={slot.id}
                                            style={[
                                                styles.slotCard,
                                                { backgroundColor: getSlotColor(slot) },
                                                isSelected && styles.slotCardSelected
                                            ]}
                                            onPress={() => handleSlotPress(slot)}
                                            disabled={slot.status === 'empty' || swapProgress !== 'idle'}
                                        >
                                            <Text style={styles.slotNumber}>{slot.slotNumber}</Text>
                                            {batteryIcon && (
                                                <Ionicons name={batteryIcon.name} size={24} color={batteryIcon.color} />
                                            )}
                                            <Text style={styles.slotStatus}>{slot.status}</Text>
                                            {slot.battery && (
                                                <Text style={styles.batterySOH}>SOH: {slot.battery.soh}%</Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Selected Slot Details */}
                {selectedSlot && (
                    <View style={styles.detailsCard}>
                        <Text style={styles.detailsTitle}>Selected Slot: {selectedSlot.slotCode}</Text>

                        {selectedSlot.battery && (
                            <>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Serial:</Text>
                                    <Text style={styles.detailValue}>{selectedSlot.battery.serial}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Model:</Text>
                                    <Text style={styles.detailValue}>{selectedSlot.battery.model}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>SOH:</Text>
                                    <Text style={[styles.detailValue, { color: '#10b981' }]}>{selectedSlot.battery.soh}%</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Manufacturer:</Text>
                                    <Text style={styles.detailValue}>{selectedSlot.battery.manufacturer || 'N/A'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Capacity:</Text>
                                    <Text style={styles.detailValue}>{selectedSlot.battery.capacityKwh || 'N/A'} kWh</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Voltage:</Text>
                                    <Text style={styles.detailValue}>{selectedSlot.battery.voltage || 'N/A'}V</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Price:</Text>
                                    <Text style={[styles.detailValue, { color: '#fbbf24' }]}>
                                        {selectedSlot.battery.price?.toLocaleString('vi-VN') || 'N/A'} VND
                                    </Text>
                                </View>

                                {selectedSlot.reservation && (
                                    <>
                                        <View style={styles.divider} />
                                        <Text style={styles.reservationTitle}>Reservation Info</Text>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>User:</Text>
                                            <Text style={styles.detailValue}>{selectedSlot.reservation.user.fullName}</Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Booking ID:</Text>
                                            <Text style={styles.detailValue}>{selectedSlot.reservation.booking.bookingId}</Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Status:</Text>
                                            <Text style={[styles.detailValue, { color: '#8b5cf6' }]}>
                                                {selectedSlot.reservation.booking.status}
                                            </Text>
                                        </View>
                                    </>
                                )}
                            </>
                        )}
                    </View>
                )}

                {/* Swap Progress */}
                {swapProgress !== 'idle' && (
                    <View style={styles.progressCard}>
                        <ActivityIndicator size="large" color="#6C63FF" />
                        <Text style={styles.progressTitle}>
                            {swapProgress === 'removing' && 'Removing old battery...'}
                            {swapProgress === 'inserting' && 'Inserting new battery...'}
                            {swapProgress === 'completed' && 'Swap completed! ✅'}
                        </Text>
                    </View>
                )}

                {/* Action Button */}
                {selectedSlot && swapProgress === 'idle' && (
                    <TouchableOpacity style={styles.swapButton} onPress={handleStartSwap}>
                        <Ionicons name="swap-horizontal" size={24} color="#fff" />
                        <Text style={styles.swapButtonText}>Start Battery Swap</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#120935',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#bfa8ff',
        marginTop: 12,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 16,
        marginTop: 12,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: '#6C63FF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: '700',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    backText: {
        color: '#bfa8ff',
        fontSize: 16,
        fontWeight: '600',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    infoCard: {
        backgroundColor: '#1a0f3e',
        margin: 16,
        marginTop: 0,
        padding: 16,
        borderRadius: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    infoTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    infoSubtitle: {
        color: '#bfa8ff',
        fontSize: 14,
        marginBottom: 4,
    },
    infoAddress: {
        color: '#9ca3af',
        fontSize: 12,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#120935',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    statValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        color: '#9ca3af',
        fontSize: 11,
        marginTop: 4,
    },
    sectionTitle: {
        color: '#bfa8ff',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    gridContainer: {
        padding: 16,
    },
    gridWrapper: {
        gap: 12,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 12,
    },
    slotCard: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 12,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    slotCardSelected: {
        borderWidth: 3,
        borderColor: '#fbbf24',
        shadowColor: '#fbbf24',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
    },
    slotNumber: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    slotStatus: {
        color: '#d1d5db',
        fontSize: 10,
        textTransform: 'capitalize',
    },
    batterySOH: {
        color: '#a3e635',
        fontSize: 9,
        fontWeight: '600',
    },
    detailsCard: {
        backgroundColor: '#1a0f3e',
        margin: 16,
        padding: 16,
        borderRadius: 16,
    },
    detailsTitle: {
        color: '#6C63FF',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        color: '#9ca3af',
        fontSize: 13,
    },
    detailValue: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#374151',
        marginVertical: 12,
    },
    reservationTitle: {
        color: '#8b5cf6',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
    },
    progressCard: {
        backgroundColor: '#1a0f3e',
        margin: 16,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
    },
    progressTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    swapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#6C63FF',
        margin: 16,
        padding: 16,
        borderRadius: 14,
    },
    swapButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#10b981',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    startButtonDisabled: {
        backgroundColor: '#6b7280',
        opacity: 0.6,
    },
    startButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    instructionsCard: {
        backgroundColor: '#1a0f3e',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    instructionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    instructionsTitle: {
        color: '#6C63FF',
        fontSize: 16,
        fontWeight: '700',
    },
    swapInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    swapInfoLabel: {
        color: '#9ca3af',
        fontSize: 13,
    },
    swapInfoValue: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    instructionsList: {
        gap: 12,
        marginBottom: 16,
    },
    instructionItem: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
    },
    instructionNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#6C63FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    instructionNumberText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    instructionText: {
        flex: 1,
        color: '#d1d5db',
        fontSize: 14,
        lineHeight: 20,
    },
    batteryInfoCard: {
        backgroundColor: '#120935',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    batteryInfoTitle: {
        color: '#10b981',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
    },
    batteryInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    batteryInfoLabel: {
        color: '#9ca3af',
        fontSize: 13,
    },
    batteryInfoValue: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    emptySlotCard: {
        backgroundColor: '#120935',
        padding: 12,
        borderRadius: 12,
    },
    emptySlotTitle: {
        color: '#f59e0b',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
    },
});
