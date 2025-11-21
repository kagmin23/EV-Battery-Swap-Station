import { useCreateBooking } from '@/features/driver/apis/booking';
// import { getAllBatteryByStationId, useBatteriesInStation } from '@/store/baterry'; // No longer needed
import { PillarCard } from '@/app/driver/component/pillar/PillarCard';
import { PillarDetailModal } from '@/app/driver/component/pillar/PillarDetailModal';
import { useBookings } from '@/store/booking';
import { getPillarDetailsById, getPillarsByStationId, Pillar, usePillars } from '@/store/pillars';
import { useSelectedStation } from '@/store/station';
import { getAllVehicle, useVehicles, Vehicle } from '@/store/vehicle';
import { formatDateVN, formatTimeVN } from '@/utils/dateTime';
import { showErrorToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PaymentModal from '../driver/component/PaymentModal';


export default function BookingScreen() {
    const router = useRouter();
    const vehicles = useVehicles();
    const station = useSelectedStation();
    const createBookingMutation = useCreateBooking();
    const bookings = useBookings();
    // const batteriesInStation = useBatteriesInStation(); // No longer needed - using pillars instead
    const pillars = usePillars();
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(undefined);
    const [selectedPillarId, setSelectedPillarId] = useState<string | null>(null);
    const [selectedPillarForBooking, setSelectedPillarForBooking] = useState<string | null>(null);
    const [showPillarDetail, setShowPillarDetail] = useState(false);
    // console.log(pillars);

    // Get the current pillar data based on selectedPillarId
    const selectedPillar = selectedPillarId
        ? pillars.find(p => p.id === selectedPillarId) || null
        : null;

    // Handler for opening pillar details
    const handlePillarPress = (pillar: Pillar) => {
        setSelectedPillarId(pillar.id);
        setShowPillarDetail(true);
    };

    // Handler for closing pillar details
    const handleClosePillarDetail = () => {
        setShowPillarDetail(false);
        setSelectedPillarId(null);
    };

    // Handler for refreshing pillar details
    const handleRefreshPillarDetails = async () => {
        if (selectedPillarId) {
            await getPillarDetailsById(selectedPillarId);
        }
    };

    // Handler for selecting pillar for booking
    const handleSelectPillarForBooking = (pillar: Pillar) => {
        // Only allow selecting compatible pillars
        if (isPillarCompatible(pillar)) {
            setSelectedPillarForBooking(pillar.id);
        }
    };

    // Check if pillar has compatible battery for selected vehicle
    const isPillarCompatible = useCallback((pillar: Pillar): boolean => {
        if (!selectedVehicleId || !vehicles.length) return false;

        const selectedVehicle = vehicles.find(v => v.vehicleId === selectedVehicleId);
        if (!selectedVehicle) return false;

        // Check if any slot in this pillar has:
        // 1. A battery (slot.battery exists)
        // 2. Slot status is 'occupied' (battery is ready in the slot)
        // 3. Battery model matches vehicle's battery model
        return pillar.slots.some(slot =>
            slot.battery &&
            slot.status === 'occupied' &&
            slot.battery.model === selectedVehicle.batteryModel
        );
    }, [selectedVehicleId, vehicles]);



    // Get compatible pillars for selected vehicle
    const compatiblePillars = useMemo(() => {
        if (!selectedVehicleId || !pillars.length) return [];
        return pillars.filter(pillar => isPillarCompatible(pillar));
    }, [pillars, selectedVehicleId, isPillarCompatible]);


    // Get available battery models from pillars' slots (only occupied slots)
    const availableBatteryModels = useMemo(() => {
        if (!pillars || pillars.length === 0) return [];

        const batteryModels = new Set<string>();

        // Loop through all pillars and their slots
        pillars.forEach(pillar => {
            pillar.slots.forEach(slot => {
                // Only consider occupied slots with batteries
                if (slot.status === 'occupied' && slot.battery) {
                    batteryModels.add(slot.battery.model);
                }
            });
        });

        return Array.from(batteryModels);
    }, [pillars]);


    // Check if vehicle is compatible with batteries in pillar slots
    const isVehicleCompatible = useCallback((vehicle: Vehicle) => {
        return availableBatteryModels.includes(vehicle.batteryModel);
    }, [availableBatteryModels]);

    // Get selected battery ID for the selected vehicle from pillar slots
    const getSelectedBatteryId = useCallback(() => {
        if (!selectedVehicleId || !pillars || pillars.length === 0) return null;

        const selectedVehicle = vehicles.find(v => v.vehicleId === selectedVehicleId);
        if (!selectedVehicle) return null;

        // Find the first occupied slot with matching battery model in any pillar
        for (const pillar of pillars) {
            const matchingSlot = pillar.slots.find(slot =>
                slot.status === 'occupied' &&
                slot.battery &&
                slot.battery.model === selectedVehicle.batteryModel
            );

            if (matchingSlot?.battery) {
                return matchingSlot.battery.id || null;
            }
        }

        return null;
    }, [selectedVehicleId, pillars, vehicles]);

    // Get pillar ID for the selected battery
    const getSelectedPillarId = useCallback(() => {
        if (!selectedVehicleId || !pillars || pillars.length === 0) return null;

        const selectedVehicle = vehicles.find(v => v.vehicleId === selectedVehicleId);
        if (!selectedVehicle) return null;

        // Find the pillar containing matching battery
        for (const pillar of pillars) {
            const matchingSlot = pillar.slots.find(slot =>
                slot.status === 'occupied' &&
                slot.battery &&
                slot.battery.model === selectedVehicle.batteryModel
            );

            if (matchingSlot?.battery) {
                return pillar.id || null;
            }
        }

        return null;
    }, [selectedVehicleId, pillars, vehicles]);

    // Get selected battery info for display from pillar slots
    const getSelectedBatteryInfo = useCallback(() => {
        if (!selectedVehicleId || !pillars || pillars.length === 0) {
            return null;
        }

        const selectedVehicle = vehicles.find(v => v.vehicleId === selectedVehicleId);
        if (!selectedVehicle) {
            return null;
        }

        // Find the first occupied slot with matching battery model in any pillar
        for (const pillar of pillars) {
            const matchingSlot = pillar.slots.find(slot =>
                slot.status === 'occupied' &&
                slot.battery &&
                slot.battery.model === selectedVehicle.batteryModel
            );

            if (matchingSlot?.battery) {
                return matchingSlot.battery;
            }
        }

        return null;
    }, [selectedVehicleId, pillars, vehicles]);

    // Auto-select first compatible vehicle
    useEffect(() => {
        if (vehicles.length > 0 && availableBatteryModels.length > 0 && !selectedVehicleId) {
            const compatibleVehicle = vehicles.find(v => isVehicleCompatible(v));
            if (compatibleVehicle) {
                setSelectedVehicleId(compatibleVehicle.vehicleId || '');
            }
        }
    }, [vehicles, availableBatteryModels, selectedVehicleId, isVehicleCompatible]);

    // Auto-select first compatible pillar when vehicle changes
    useEffect(() => {
        if (selectedVehicleId && compatiblePillars.length > 0) {
            // Check if current selected pillar is still compatible
            const currentPillarStillCompatible = selectedPillarForBooking &&
                compatiblePillars.some(p => p.id === selectedPillarForBooking);

            if (!currentPillarStillCompatible) {
                // Auto-select first compatible pillar
                setSelectedPillarForBooking(compatiblePillars[0].id);
            }
        } else {
            // Clear selection if no compatible pillars
            setSelectedPillarForBooking(null);
        }
    }, [selectedVehicleId, compatiblePillars, selectedPillarForBooking]);

    // Fetch data when station changes
    useEffect(() => {
        if (station?.id) {
            getPillarsByStationId(station.id);
        }
    }, [station?.id]);

    useFocusEffect(
        useCallback(() => {
            getAllVehicle();
            // getAllBookings();
            if (station?.id) {
                getPillarsByStationId(station.id);
            }
            // getAllBatteryByStationId(station?.id || '') // No longer needed - using pillars
        }, [station?.id])
    )

    const [date, setDate] = useState<Date>(new Date());
    const [time, setTime] = useState<Date>(() => {
        const now = new Date();
        return new Date(now.getTime() + 15 * 60 * 1000);
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date>(new Date());
    const [tempTime, setTempTime] = useState<Date>(() => {
        const now = new Date();
        return new Date(now.getTime() + 15 * 60 * 1000);
    });
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 3);

    const formattedDate = useMemo(() => formatDateVN(date), [date]);

    const formattedTime = useMemo(() => formatTimeVN(time), [time]);
    // Function to check for duplicate bookings
    const checkDuplicateBooking = (vehicleId: string, stationId: string, scheduledTime: Date): boolean => {
        const scheduledDateTime = new Date(scheduledTime);
        const timeWindow = 20 * 60 * 1000;

        return bookings.some(booking => {
            if (booking.vehicleId === vehicleId && booking.stationId === stationId) {
                const bookingTime = new Date(booking.scheduledTime);
                const timeDiff = Math.abs(scheduledDateTime.getTime() - bookingTime.getTime());
                return timeDiff <= timeWindow;
            }
            return false;
        });
    };

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
            <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.iconBtn}>
                        <Ionicons name="chevron-back" size={22} color="#fff" />
                        <Text style={styles.backText}>Map</Text>
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
                    <Text style={styles.stationTitle}>{station?.stationName || 'EV Battery Swap Station'}</Text>
                    {!!station?.address && <Text style={styles.stationSub}>{station?.address}</Text>}
                    <View style={styles.statRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="albums-outline" size={16} color="#bfb6ff" />
                            <Text style={styles.statValue}>{pillars?.length ?? '--'}</Text>
                            <Text style={styles.statLabel}>Pillars</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="battery-charging" size={16} color="#bfb6ff" />
                            <Text style={styles.statValue}>{station?.capacity ?? '--'}</Text>
                            <Text style={styles.statLabel}>Capacity</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={[styles.statusDot, { backgroundColor: station?.availableBatteries && station?.availableBatteries > 0 ? '#22c55e' : '#facc15' }]} />
                            <Text style={styles.statValue}>{station?.availableBatteries && station?.availableBatteries > 0 ? 'Available' : 'Busy'}</Text>
                            <Text style={styles.statLabel}>Status</Text>
                        </View>
                    </View>
                </View>

                {/* Vehicle card */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <View style={{}}>
                            <View style={{ flexDirection: 'row', gap: 4, marginBottom: 5 }}>
                                <Ionicons name="car" size={18} color="#6C63FF" />
                                <Text style={styles.cardHeader}>Vehicle</Text>
                            </View>
                            {availableBatteryModels.length > 0 && (
                                <Text style={styles.compatibilityInfo}>
                                    <Text style={{ color: '#fff' }}>Compatible Models:</Text> {availableBatteryModels.join(', ')}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View style={{ gap: 10 }}>
                        {vehicles.map(v => {
                            const isCompatible = availableBatteryModels.includes(v.batteryModel);
                            const isDisabled = !isCompatible;

                            return (
                                <TouchableOpacity
                                    key={v.vehicleId}
                                    style={[
                                        styles.vehicleRow,
                                        selectedVehicleId === v.vehicleId && styles.vehicleRowActive,
                                        isDisabled && styles.vehicleRowDisabled
                                    ]}
                                    onPress={() => {
                                        if (!isDisabled) {
                                            setSelectedVehicleId(v.vehicleId || '');
                                        }
                                    }}
                                    disabled={isDisabled}
                                >
                                    <View style={styles.vehicleRowLeft}>
                                        <Ionicons
                                            name="car"
                                            size={18}
                                            color={isDisabled ? '#666' : (selectedVehicleId === v.vehicleId ? '#bfb6ff' : '#bfb6ff')}
                                        />
                                        <Text style={[
                                            styles.vehicleName,
                                            selectedVehicleId === v.vehicleId && styles.vehicleNameActive,
                                            isDisabled && styles.vehicleNameDisabled
                                        ]}>
                                            {v.carName}
                                        </Text>
                                        {isDisabled && (
                                            <Text style={styles.incompatibleText}>(Incompatible)</Text>
                                        )}
                                    </View>
                                    <View style={styles.vehicleRowRight}>
                                        <Text style={[
                                            styles.plate,
                                            selectedVehicleId === v.vehicleId && styles.plateActive,
                                            isDisabled && styles.plateDisabled
                                        ]}>
                                            {v.licensePlate}
                                        </Text>
                                        {selectedVehicleId === v.vehicleId && !isDisabled && (
                                            (() => {
                                                const battery = getSelectedBatteryInfo();
                                                const hasBattery = !!battery;
                                                return (
                                                    <Text>
                                                        <Text style={[styles.batteryInfo, !hasBattery && { color: '#ff6b6b' }]}>
                                                            Battery: {battery?.model || 'No battery available'}
                                                            {battery?.soh ? ` (SOH: ${battery.soh}%)` : ''}
                                                        </Text>
                                                        {battery?.price && (
                                                            <Text style={styles.batteryPrice}>
                                                                Price: {battery.price.toLocaleString('vi-VN')} VND
                                                            </Text>
                                                        )}
                                                    </Text>
                                                );
                                            })()
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}

                    </View>
                </View>

                {/* Pillars Section - Only show when vehicle is selected */}
                {selectedVehicleId && pillars && pillars.length > 0 && (
                    <View style={styles.pillarsSection}>
                        <View style={styles.pillarsSectionHeader}>
                            <Ionicons name="battery-charging" size={18} color="#6C63FF" />
                            <Text style={styles.cardHeader}>
                                Select Battery Pillar
                                {compatiblePillars.length > 0 && ` (${compatiblePillars.length} compatible)`}
                            </Text>
                            {pillars.length > 1 && (
                                <View style={styles.scrollHint}>
                                    <Ionicons name="chevron-forward" size={14} color="#9ca3af" />
                                    <Text style={styles.scrollHintText}>Swipe</Text>
                                </View>
                            )}
                        </View>

                        {/* Selected Pillar Info */}
                        {selectedPillarForBooking && (
                            <View style={styles.selectedPillarInfo}>
                                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                <Text style={styles.selectedPillarInfoText}>
                                    Selected: {pillars.find(p => p.id === selectedPillarForBooking)?.pillarName || 'Unknown'}
                                </Text>
                            </View>
                        )}

                        {compatiblePillars.length === 0 && (
                            <View style={styles.noPillarsMessage}>
                                <Ionicons name="alert-circle-outline" size={24} color="#f59e0b" />
                                <Text style={styles.noPillarsText}>
                                    No pillars available with occupied batteries matching your vehicle&apos;s battery model ({vehicles.find(v => v.vehicleId === selectedVehicleId)?.batteryModel}).
                                </Text>
                            </View>
                        )}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.pillarsScrollContent}
                            style={styles.pillarsScrollView}
                            decelerationRate="fast"
                            snapToInterval={332} // card width (320) + gap (12)
                            snapToAlignment="start"
                        >
                            {pillars.map((pillar, index) => {
                                const isCompatible = isPillarCompatible(pillar);
                                const isSelected = selectedPillarForBooking === pillar.id;

                                return (
                                    <View key={pillar.id} style={[
                                        styles.pillarCardWrapper,
                                        index === 0 && styles.firstPillarCard,
                                        index === pillars.length - 1 && styles.lastPillarCard
                                    ]}>
                                        <TouchableOpacity
                                            activeOpacity={isCompatible ? 0.7 : 1}
                                            onPress={() => {
                                                if (isCompatible) {
                                                    handleSelectPillarForBooking(pillar);
                                                }
                                            }}
                                            disabled={!isCompatible}
                                        >
                                            <View style={[
                                                isSelected && styles.selectedPillarWrapper,
                                                !isCompatible && styles.incompatiblePillarWrapper
                                            ]}>
                                                <PillarCard
                                                    pillar={pillar}
                                                    onPress={handlePillarPress}
                                                />

                                                {/* Selected Indicator */}
                                                {isSelected && (
                                                    <View style={styles.selectedIndicator}>
                                                        <Ionicons name="checkmark-circle" size={24} color="#6C63FF" />
                                                    </View>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* Date & Time */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Ionicons name="time" size={18} color="#6C63FF" />
                        <Text style={styles.cardHeader}>Schedule</Text>
                    </View>
                    <View style={{ gap: 10 }}>
                        <TouchableOpacity
                            style={styles.inputRow}
                            onPress={() => {
                                setTempDate(date);
                                setShowDatePicker(true);
                            }}
                        >
                            <View style={styles.inputLeft}>
                                <Text style={styles.inputLabel}>Date</Text>
                                <Text style={styles.inputValue}>{formattedDate}</Text>
                            </View>
                            <Ionicons name="calendar" size={18} color="#bfb6ff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.inputRow}
                            onPress={() => {
                                // If today is selected, set minimum time to 15 minutes from now
                                const now = new Date();
                                const isToday = date.toDateString() === now.toDateString();
                                if (isToday) {
                                    const minTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
                                    setTempTime(minTime);
                                } else {
                                    setTempTime(time);
                                }
                                setShowTimePicker(true);
                            }}
                        >
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
                <TouchableOpacity
                    style={[styles.confirmBtn, createBookingMutation.isPending && styles.confirmBtnDisabled]}
                    onPress={() => setShowPaymentModal(true)}
                    disabled={createBookingMutation.isPending}
                >
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.confirmText}>
                        {createBookingMutation.isPending ? 'Creating...' : 'Confirm Booking'}
                    </Text>
                </TouchableOpacity>

                <PaymentModal
                    visible={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    selectedVehicleId={selectedVehicleId!}
                    station={station}
                    date={date}
                    time={time}
                    vehicles={vehicles}
                    getSelectedBatteryId={getSelectedBatteryId}
                    getSelectedPillarId={getSelectedPillarId}
                    checkDuplicateBooking={checkDuplicateBooking}
                    batteryPrice={getSelectedBatteryInfo()?.price || 0}
                />

                <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select Date</Text>
                            <DateTimePicker
                                value={tempDate}
                                mode="date"
                                minimumDate={today}
                                maximumDate={maxDate}
                                display={Platform.select({ ios: 'spinner', android: 'spinner' }) as any}
                                onChange={(_e: any, selected?: Date) => {
                                    if (selected) setTempDate(selected);
                                }}
                            />
                            <View style={styles.modalActions}>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.actionBtn}>
                                    <Text style={styles.actionText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setDate(tempDate);
                                        setShowDatePicker(false);
                                    }}
                                    style={[styles.actionBtn, styles.actionPrimary]}
                                >
                                    <Text style={[styles.actionText, styles.actionPrimaryText]}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
                <Modal visible={showTimePicker} transparent animationType="fade" onRequestClose={() => setShowTimePicker(false)}>
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select Time</Text>
                            {date.toDateString() === today.toDateString() && (
                                <Text style={styles.modalSubtitle}>
                                    For today&apos;s booking, please select a time at least 15 minutes from now.
                                </Text>
                            )}
                            <DateTimePicker
                                value={tempTime}
                                mode="time"
                                is24Hour
                                display={Platform.select({ ios: 'spinner', android: 'spinner' }) as any}
                                onChange={(_e: any, selected?: Date) => {
                                    if (selected) {
                                        // If today is selected, validate time is at least 15 minutes in the future
                                        const isToday = date.toDateString() === today.toDateString();
                                        if (isToday) {
                                            const minTime = new Date(today.getTime() + 15 * 60 * 1000); // 15 minutes from now
                                            if (selected < minTime) {
                                                showErrorToast(`Please select a time after ${minTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} for today's booking.`, 'Invalid time');
                                                return;
                                            }
                                        }
                                        setTempTime(selected);
                                    }
                                }}
                            />
                            <View style={styles.modalActions}>
                                <TouchableOpacity onPress={() => setShowTimePicker(false)} style={styles.actionBtn}>
                                    <Text style={styles.actionText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setTime(tempTime);
                                        setShowTimePicker(false);
                                    }}
                                    style={[styles.actionBtn, styles.actionPrimary]}
                                >
                                    <Text style={[styles.actionText, styles.actionPrimaryText]}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Pillar Detail Modal */}
                <PillarDetailModal
                    visible={showPillarDetail}
                    pillar={selectedPillar}
                    onClose={handleClosePillarDetail}
                    onRefresh={handleRefreshPillarDetails}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#120935' },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    iconBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    backText: { color: '#bfa8ff', fontSize: 16, fontWeight: '600' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    card: { backgroundColor: '#1a0f3e', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    cardHeader: { color: '#bfb6ff', fontWeight: '700' },
    compatibilityInfo: { color: '#4ade80', fontSize: 12, fontStyle: 'italic', marginLeft: 'auto' },
    stationTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
    stationSub: { color: '#bfb6ff', marginTop: 4 },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 12, marginBottom: 'auto' },
    statItem: { flex: 1, backgroundColor: '#120935', borderRadius: 12, alignItems: 'center', paddingVertical: 12, gap: 4, marginBottom: 'auto' },
    statValue: { color: 'white', fontWeight: '800' },
    statLabel: { color: '#bfb6ff', fontSize: 12, margin: 'auto' },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    vehicleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#120935', borderRadius: 12, padding: 12 },
    vehicleRowActive: { backgroundColor: '#2d1c82', borderWidth: 1, borderColor: '#6C63FF' },
    vehicleRowDisabled: { backgroundColor: '#2a2a2a', opacity: 0.5 },
    vehicleRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    vehicleRowRight: { alignItems: 'flex-end' },
    vehicleName: { color: 'white', fontWeight: '700' },
    vehicleNameActive: { color: '#bfb6ff' },
    vehicleNameDisabled: { color: '#666' },
    plate: { color: '#bfb6ff' },
    plateActive: { color: '#bfb6ff' },
    plateDisabled: { color: '#666' },
    incompatibleText: { color: '#ff6b6b', fontSize: 12, fontStyle: 'italic' },
    batteryInfo: { color: '#4ade80', fontSize: 12, fontStyle: 'italic', marginTop: 10 },
    batteryPrice: { color: '#fbbf24', fontSize: 12, fontWeight: '600', marginTop: 4 },
    inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#120935', borderRadius: 12, padding: 12 },
    inputLeft: { gap: 2 },
    inputLabel: { color: '#bfb6ff', fontSize: 12 },
    inputValue: { color: 'white', fontWeight: '700' },
    confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#6C63FF', height: 52, borderRadius: 14, marginTop: 8 },
    confirmBtnDisabled: { backgroundColor: '#4a4a4a', opacity: 0.6 },
    confirmText: { color: 'white', fontWeight: '800' },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '100%', maxWidth: 480, backgroundColor: '#1a0f3e', borderRadius: 16, padding: 16 },
    modalTitle: { color: '#bfb6ff', fontWeight: '700', fontSize: 14, marginBottom: 8, textAlign: 'center' },
    modalSubtitle: { color: '#f59e0b', fontSize: 12, textAlign: 'center', marginBottom: 12, fontStyle: 'italic' },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    actionBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#120935' },
    actionText: { color: '#bfb6ff', fontWeight: '700' },
    actionPrimary: { backgroundColor: '#6C63FF' },
    actionPrimaryText: { color: '#fff' },
    // Pillars horizontal scroll styles
    pillarsSection: {
        marginBottom: 14,
    },
    pillarsSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    selectedPillarInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#10b98120',
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#10b98140',
    },
    selectedPillarInfoText: {
        color: '#10b981',
        fontSize: 13,
        fontWeight: '600',
    },
    scrollHint: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto',
        backgroundColor: '#1a0f3e',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    scrollHintText: {
        color: '#9ca3af',
        fontSize: 11,
        fontWeight: '600',
    },
    pillarsScrollView: {
        marginHorizontal: -16, // Negative margin to allow full-width scroll
    },
    pillarsScrollContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    pillarCardWrapper: {
        width: 320, // Fixed width for horizontal scroll
    },
    firstPillarCard: {
        marginLeft: 0,
    },
    lastPillarCard: {
        marginRight: 16,
    },
    // Pillar selection styles
    selectedPillarWrapper: {
        borderWidth: 3,
        borderColor: '#6C63FF',
        borderRadius: 18,
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
    },
    incompatiblePillarWrapper: {
        opacity: 0.4,
    },
    compatibleBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10b98180',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
        borderWidth: 1,
        borderColor: '#10b981',
    },
    compatibleBadgeText: {
        color: '#10b981',
        fontSize: 11,
        fontWeight: '700',
    },
    incompatibleBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ef444480',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    incompatibleBadgeText: {
        color: '#ef4444',
        fontSize: 11,
        fontWeight: '700',
    },
    selectedIndicator: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: '#1e1b2e',
        borderRadius: 20,
        padding: 4,
    },
    noPillarsMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#f59e0b20',
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f59e0b40',
    },
    noPillarsText: {
        flex: 1,
        color: '#f59e0b',
        fontSize: 13,
        lineHeight: 18,
    },
});


