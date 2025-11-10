import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePillarGrid, usePillarGridLoading, usePillarGridError, getPillarGrid, clearPillarGrid, GridSlot } from '@/store/pillarGrid';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { initiateBatterySwap, insertOldBattery, completeBatterySwap, SwapResponse } from '@/features/driver/apis/swap_simulate';
import { useVehicles, Vehicle } from '@/store/vehicle';

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
    const vehicles = useVehicles(); // Get vehicles from store

    const [selectedSlot, setSelectedSlot] = useState<GridSlot | null>(null);
    const [swapProgress, setSwapProgress] = useState<'idle' | 'removing' | 'inserting' | 'completed'>('idle');
    const [swapData, setSwapData] = useState<SwapResponse | null>(null);
    const [initiating, setInitiating] = useState(false);
    const [insertingOldBattery, setInsertingOldBattery] = useState(false);
    const [oldBatteryInserted, setOldBatteryInserted] = useState(false);
    const [completingSwap, setCompletingSwap] = useState(false);
    const [swapCompleted, setSwapCompleted] = useState(false);
    const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);

    // Animation values
    const emptySlotPulseAnim = useRef(new Animated.Value(1)).current;
    const bookedBatteryRiseAnim = useRef(new Animated.Value(0)).current;

    // Debug: Log when swapData changes
    useEffect(() => {
        console.log('🔔 swapData changed:', swapData ? 'HAS DATA' : 'NULL');
        if (swapData) {
            console.log('📋 swapData details:', {
                swapId: swapData.swapId,
                hasInstructions: !!swapData.instructions,
                hasBookedBattery: !!swapData.bookedBattery,
                hasEmptySlot: !!swapData.emptySlot
            });
        }
    }, [swapData]);

    // Find vehicle from store (instead of API call which returns 403 Forbidden)
    useEffect(() => {
        if (vehicleId && vehicles && vehicles.length > 0) {
            const vehicle = vehicles.find(v => v.vehicleId === vehicleId);
            if (vehicle) {
                setVehicleData(vehicle);
                console.log('✅ Vehicle found in store:', {
                    vehicleId: vehicle.vehicleId,
                    carName: vehicle.carName,
                    batteryModel: vehicle.batteryModel
                });
            } else {
                console.warn('⚠️ Vehicle not found in store. Will use defaults.');
            }
        }
    }, [vehicleId, vehicles]);

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

    // Animation effect: Pulsing empty slot after swap initiated
    useEffect(() => {
        if (swapData && !oldBatteryInserted) {
            // Start pulsing animation for empty slot
            const pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(emptySlotPulseAnim, {
                        toValue: 1.2,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(emptySlotPulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulseAnimation.start();

            return () => {
                pulseAnimation.stop();
                emptySlotPulseAnim.setValue(1);
            };
        }
    }, [swapData, oldBatteryInserted, emptySlotPulseAnim]);

    // Animation effect: Battery rising when old battery is inserted
    useEffect(() => {
        if (oldBatteryInserted && !swapCompleted) {
            // Reset and start rise animation
            bookedBatteryRiseAnim.setValue(0);

            Animated.spring(bookedBatteryRiseAnim, {
                toValue: 1,
                friction: 4,
                tension: 40,
                useNativeDriver: true,
            }).start();
        }
    }, [oldBatteryInserted, swapCompleted, bookedBatteryRiseAnim]);

    const getSlotColor = (slot: GridSlot) => {
        // Highlight slot that was booked after swap init (slot containing new battery)
        if (swapData && slot.slotNumber === swapData.bookedBattery.slotNumber) {
            return '#FFD700'; // Gold color for booked battery slot
        }

        // Highlight empty slot reserved for old battery
        if (swapData && slot.slotNumber === swapData.emptySlot.slotNumber && slot.status === 'reserved') {
            return '#8b5cf6'; // Purple color for reserved empty slot
        }

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
        // Nếu chưa init swap, cho phép xem bất kỳ slot nào có battery
        if (!swapData) {
            if (slot.status !== 'empty' && slot.battery) {
                setSelectedSlot(slot);
            }
            return;
        }

        // ✅ Sau khi init swap:

        // 1. If clicked on reserved empty slot (for inserting old battery)
        if (slot.status === 'reserved' && slot.slotNumber === swapData.emptySlot.slotNumber) {
            if (oldBatteryInserted) {
                showErrorToast('Old battery already inserted into this slot');
                return;
            }
            // Call function to insert old battery
            handleInsertOldBattery(slot);
            return;
        }

        // 2. If clicked on slot with booked battery (new battery)
        if (slot.status !== 'empty' && slot.battery) {
            // Check if this is the slot containing the booked battery (by slotNumber)
            if (slot.slotNumber === swapData.bookedBattery.slotNumber) {
                // ✅ If old battery inserted → Complete swap
                if (oldBatteryInserted && !swapCompleted) {
                    handleCompleteSwap(slot);
                } else if (!oldBatteryInserted) {
                    // Not inserted old battery yet → Reminder
                    showErrorToast(`Please insert old battery into slot #${swapData.emptySlot.slotNumber} first`);
                } else {
                    // Already completed
                    setSelectedSlot(slot);
                }
                console.log('✅ Selected booked battery slot:', slot.slotNumber);
            } else {
                showErrorToast(`Only slot #${swapData.bookedBattery.slotNumber} (${swapData.bookedBattery.serial}) is allowed`);
                console.log('❌ Wrong slot selected. Expected:', swapData.bookedBattery.slotNumber, 'Got:', slot.slotNumber);
            }
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
            console.log('🔄 Calling initiateBatterySwap...');
            const data = await initiateBatterySwap({
                vehicleId,
                bookingId, // UUID fallback
                id // MongoDB ObjectId (preferred)
            });
            console.log('✅ Swap initiated successfully:', data);
            console.log('📦 Setting swapData state...');

            // Force new object to ensure React detects change
            setSwapData({ ...data });

            console.log('✅ swapData state updated');

            // Refetch pillar grid to update slot statuses (empty slot is now reserved)
            console.log('🔄 Refetching pillar grid to update slot statuses...');
            await getPillarGrid(pillarId, 2, 5);
            console.log('✅ Pillar grid refreshed');

            showSuccessToast(data.message || 'Battery swap initiated successfully');
        } catch (err: any) {
            console.error('❌ Failed to initiate swap:', err);
            showErrorToast(err.message || 'Failed to initiate swap');
        } finally {
            setInitiating(false);
        }
    };

    const handleInsertOldBattery = async (slot: GridSlot) => {
        if (!swapData) {
            showErrorToast('Swap process not initiated');
            return;
        }

        if (!vehicleId) {
            showErrorToast('Missing vehicle information');
            return;
        }

        // ✅ Get battery model from vehicle (for defaults)
        const batteryModel = vehicleData?.batteryModel || 'LiFePO4-48V-100Ah';
        const carInfo = vehicleData ? `${vehicleData.carName} (${vehicleData.licensePlate})` : 'your vehicle';

        // Always prompt for battery serial (vehicle schema doesn't track current battery)
        Alert.prompt(
            'Insert Old Battery',
            `Enter old battery serial from ${carInfo}:\n(Model: ${batteryModel})`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async (inputSerial?: string) => {
                        if (!inputSerial || inputSerial.trim() === '') {
                            showErrorToast('Please enter battery serial number');
                            return;
                        }
                        await performInsertOldBattery(slot, inputSerial.trim(), batteryModel);
                    }
                }
            ],
            'plain-text'
        );
    };

    const performInsertOldBattery = async (
        slot: GridSlot,
        oldBatterySerial: string,
        batteryModel?: string
    ) => {
        if (!swapData) return;

        setInsertingOldBattery(true);
        try {
            console.log('🔄 Inserting old battery into slot...', {
                swapId: swapData.swapId,
                slotId: slot.id,
                oldBatterySerial
            });

            const result = await insertOldBattery({
                swapId: swapData.swapId,
                slotId: slot.id,
                oldBatterySerial: oldBatterySerial,
                // Include battery info (will be used if battery doesn't exist)
                model: batteryModel || vehicleData?.batteryModel,
                manufacturer: 'Unknown',
                capacity_kWh: 48,
                voltage: 48,
                price: 5000000 // Default price 5M VND
            });

            console.log('✅ Old battery inserted:', result);

            // Validate result
            if (!result || !result.swapId) {
                console.error('⚠️ Invalid response from insertOldBattery:', result);
                throw new Error('Invalid response from server');
            }

            setOldBatteryInserted(true);

            // Refetch grid to see updated slot status
            if (pillarId) {
                await getPillarGrid(pillarId, 2, 5);
            }

            showSuccessToast(result.message || 'Old battery received successfully');

            // Show success alert with proper fallbacks
            const alertMessage = result.message || 'Old battery received successfully';
            const nextStepText = result.nextStep || 'Take new battery and confirm completion';

            Alert.alert(
                'Success',
                `${alertMessage}\n\nNext step: ${nextStepText}`,
                [{ text: 'OK' }]
            );
        } catch (err: any) {
            console.error('❌ Failed to insert old battery:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response,
                stack: err.stack
            });
            showErrorToast(err.message || 'Error inserting old battery into slot');
        } finally {
            setInsertingOldBattery(false);
        }
    };

    const handleCompleteSwap = async (slot: GridSlot) => {
        if (!swapData) {
            showErrorToast('Swap process not initiated');
            return;
        }

        if (!oldBatteryInserted) {
            showErrorToast('Please insert old battery into empty slot first');
            return;
        }

        // Confirm before completing
        Alert.alert(
            'Complete Swap',
            `Confirm taking new battery from slot #${slot.slotNumber}?\n\nSerial: ${swapData.bookedBattery.serial}\nSOH: ${swapData.bookedBattery.soh}%`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setCompletingSwap(true);
                        try {
                            console.log('🔄 Completing swap...', swapData.swapId);

                            const result = await completeBatterySwap(swapData.swapId);

                            console.log('✅ Swap completed:', result);
                            setSwapCompleted(true);

                            // Refetch grid to see final state
                            if (pillarId) {
                                await getPillarGrid(pillarId, 2, 5);
                            }

                            showSuccessToast(result.message || 'Battery swap successful!');

                            // Show detailed summary
                            Alert.alert(
                                '🎉 Completed!',
                                `${result.message}\n\n` +
                                `Old battery: ${result.summary.oldBattery}\n` +
                                `New battery: ${result.summary.newBattery}\n` +
                                `Charge: ${result.summary.newBatteryCharge}%\n` +
                                `Duration: ${result.summary.swapDuration}s`,
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            // Navigate back after completion
                                            setTimeout(() => router.back(), 500);
                                        }
                                    }
                                ]
                            );
                        } catch (err: any) {
                            console.error('❌ Failed to complete swap:', err);
                            console.error('Error details:', {
                                message: err.message,
                                response: err.response,
                                stack: err.stack
                            });
                            showErrorToast(err.message || 'Error completing swap');
                        } finally {
                            setCompletingSwap(false);
                        }
                    }
                }
            ]
        );
    };

    const handleStartSwap = () => {
        if (!selectedSlot) {
            showErrorToast('Please select a battery slot');
            return;
        }

        // Validate: Must select the correct booked slot
        if (swapData && selectedSlot.slotNumber !== swapData.bookedBattery.slotNumber) {
            showErrorToast(`Only slot #${swapData.bookedBattery.slotNumber} (${swapData.bookedBattery.serial}) is allowed`);
            return;
        }

        console.log('🔄 Starting battery swap process...');
        setSwapProgress('removing');

        // Simulate removing old battery and placing in empty slot (2 seconds)
        setTimeout(() => {
            console.log('📤 Removing old battery...');
            setSwapProgress('inserting');

            // Simulate taking new battery (2 seconds)
            setTimeout(() => {
                console.log('📥 Taking new battery...');
                setSwapProgress('completed');

                // Auto navigate back after completion
                setTimeout(() => {
                    console.log('✅ Swap completed! Navigating back...');
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

                            {/* Important Notice */}
                            <View style={styles.noticeCard}>
                                <Ionicons name="warning" size={20} color="#f59e0b" />
                                <Text style={styles.noticeText}>
                                    {!oldBatteryInserted ? (
                                        <>
                                            <Text style={styles.highlightText}>Step 1:</Text> Click slot <Text style={styles.highlightText}>#{swapData.emptySlot.slotNumber}</Text> (purple) to insert old battery.{'\n'}
                                            <Text style={styles.highlightText}>Step 2:</Text> Select slot <Text style={styles.highlightText}>#{swapData.bookedBattery.slotNumber}</Text> (gold) to take new battery.
                                        </>
                                    ) : (
                                        <>
                                            ✅ Old battery inserted into slot #{swapData.emptySlot.slotNumber}.{'\n'}
                                            Now select slot <Text style={styles.highlightText}>#{swapData.bookedBattery.slotNumber}</Text> (gold) to take new battery.
                                        </>
                                    )}
                                </Text>
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

                                    // Allow clicking reserved empty slot (for inserting old battery)
                                    const isReservedEmptySlot = swapData &&
                                        slot.status === 'reserved' &&
                                        slot.slotNumber === swapData.emptySlot.slotNumber;

                                    const isDisabled = !isReservedEmptySlot &&
                                        (slot.status === 'empty' || swapProgress !== 'idle');

                                    // Check if this is the slot where new battery will come from
                                    const isBookedBatterySlot = swapData &&
                                        slot.slotNumber === swapData.bookedBattery.slotNumber;

                                    // Animated styles for slots
                                    const animatedStyle: any = {
                                        ...styles.slotCard,
                                        backgroundColor: getSlotColor(slot),
                                    };

                                    // Pulsing glow for empty slot waiting for old battery
                                    if (isReservedEmptySlot && !oldBatteryInserted) {
                                        animatedStyle.transform = [{ scale: emptySlotPulseAnim }];
                                        animatedStyle.shadowColor = '#8b5cf6';
                                        animatedStyle.shadowOffset = { width: 0, height: 0 };
                                        animatedStyle.shadowOpacity = 0.8;
                                        animatedStyle.shadowRadius = 10;
                                        animatedStyle.elevation = 8;
                                    }

                                    // Rising animation for new battery slot
                                    if (isBookedBatterySlot && oldBatteryInserted && !swapCompleted) {
                                        animatedStyle.transform = [
                                            {
                                                translateY: bookedBatteryRiseAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [30, 0]
                                                })
                                            }
                                        ];
                                    }

                                    // Add selected border
                                    if (isSelected) {
                                        animatedStyle.borderWidth = 3;
                                        animatedStyle.borderColor = '#fbbf24';
                                        animatedStyle.shadowColor = '#fbbf24';
                                        animatedStyle.shadowOpacity = 0.5;
                                        animatedStyle.shadowRadius = 10;
                                        animatedStyle.elevation = 8;
                                    }

                                    return (
                                        <TouchableOpacity
                                            key={slot.id}
                                            onPress={() => handleSlotPress(slot)}
                                            disabled={isDisabled}
                                            activeOpacity={0.7}
                                        >
                                            <Animated.View style={animatedStyle}>
                                                <Text style={styles.slotNumber}>{slot.slotNumber}</Text>
                                                {batteryIcon && (
                                                    <Ionicons name={batteryIcon.name} size={20} color={batteryIcon.color} />
                                                )}
                                                {/* Show "Tap to insert" hint for reserved empty slot */}
                                                {isReservedEmptySlot && !oldBatteryInserted && (
                                                    <Ionicons name="add-circle" size={16} color="#fff" />
                                                )}
                                                <Text style={styles.slotStatus}>{slot.status}</Text>
                                                {slot.battery && (
                                                    <Text style={styles.batterySOH}>SOH: {slot.battery.soh}%</Text>
                                                )}
                                            </Animated.View>
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
                {(swapProgress !== 'idle' || insertingOldBattery || completingSwap) && (
                    <View style={styles.progressCard}>
                        <ActivityIndicator size="large" color="#6C63FF" />
                        <Text style={styles.progressTitle}>
                            {insertingOldBattery && 'Receiving old battery...'}
                            {completingSwap && 'Completing swap...'}
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
        fontSize: 13,
        fontWeight: '700',
    },
    slotStatus: {
        color: '#d1d5db',
        fontSize: 9,
        textTransform: 'capitalize',
    },
    batterySOH: {
        color: '#a3e635',
        fontSize: 8,
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
    noticeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#fef3c7',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#f59e0b',
    },
    noticeText: {
        flex: 1,
        color: '#78350f',
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '500',
    },
    highlightText: {
        color: '#f59e0b',
        fontWeight: '700',
        fontSize: 14,
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
