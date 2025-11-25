import { getAllBattery, useBatteries } from '@/store/baterry';
import { creatVehicle } from '@/store/vehicle';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { Camera as ExpoCamera, CameraView } from 'expo-camera';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal } from 'react-native';

const { height } = Dimensions.get('window');

type Option = { label: string; value: string; key?: string };

type Props = {
    visible: boolean;
    onClose: () => void;
};

const SearchableDropdown: React.FC<{
    label: string;
    value: string;
    options: Option[];
    placeholder?: string;
    onSelect: (v: string) => void;
}> = ({ label, value, options, placeholder, onSelect }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter(o => o.label.toLowerCase().includes(q));
    }, [options, query]);

    return (
        <View style={styles.formRow}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setOpen(!open)}
                style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
            >
                <Text style={{ color: value ? 'white' : '#7f6fb1' }}>{value || (placeholder || 'Select...')}</Text>
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#bfa8ff" />
            </TouchableOpacity>
            {open && (
                <View style={styles.dropdownPanel}>
                    <View style={styles.dropdownSearchRow}>
                        <Ionicons name="search" size={16} color="#bfa8ff" style={{ marginRight: 8 }} />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder={placeholder || 'Search'}
                            placeholderTextColor="#7f6fb1"
                            style={styles.dropdownSearchInput}
                        />
                        {query ? (
                            <TouchableOpacity onPress={() => setQuery('')}>
                                <Ionicons name="close" size={16} color="#bfa8ff" />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                    <ScrollView style={{ maxHeight: 180 }} keyboardShouldPersistTaps="handled">
                        {filtered.map((opt, idx) => (
                            <TouchableOpacity
                                key={opt.key ?? opt.value ?? String(idx)}
                                style={styles.dropdownItem}
                                onPress={() => {
                                    onSelect(opt.value);
                                    setOpen(false);
                                    setQuery('');
                                }}
                            >
                                <Text style={styles.dropdownItemText}>{opt.label}</Text>
                                {value === opt.value && <Ionicons name="checkmark" size={16} color="#6d4aff" />}
                            </TouchableOpacity>
                        ))}
                        {filtered.length === 0 && (
                            <View style={styles.dropdownEmpty}>
                                <Text style={{ color: '#7f6fb1' }}>No results</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

export default function LinkVehicleSheet({ visible, onClose }: Props) {
    const sheetY = useRef(new Animated.Value(height)).current;

    const [vin, setVin] = useState('');
    const [brand, setBrand] = useState('');
    const [carName, setCarName] = useState('');
    const [batteryModel, setBatteryModel] = useState('');
    const [batterySerial, setBatterySerial] = useState('');
    const [batteryManufacturer, setBatteryManufacturer] = useState('');
    const [batteryCapacity, setBatteryCapacity] = useState('');
    const [batteryVoltage, setBatteryVoltage] = useState('');
    const [batteryPrice, setBatteryPrice] = useState('');
    const [batteryStationId, setBatteryStationId] = useState('');
    const [batteryPanelOpen, setBatteryPanelOpen] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [hasScannerPermission, setHasScannerPermission] = useState<boolean | null>(null);
    const [modelYear, setModelYear] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const batteries = useBatteries();

    useFocusEffect((
        useCallback(() => {
            getAllBattery();
        }, [])
    ));

    const batteryOptionsFromStore: Option[] = useMemo(() => {
        // Get unique battery models to avoid duplicates
        const uniqueModels = Array.from(
            new Map(
                (batteries || []).map(b => [b.model, b])
            ).values()
        );

        return uniqueModels.map(b => ({
            label: `${b.model} - ${b.capacityKWh} kWh`,
            value: b.model,
            key: b.id ?? b.model
        }));
    }, [batteries]);




    const brandOptions: Option[] = useMemo(() => [
        { label: 'VinFast', value: 'VinFast' },
        { label: 'Tesla', value: 'Tesla' },
        { label: 'BYD', value: 'BYD' },
        { label: 'Hyundai', value: 'Hyundai' },
        { label: 'Kia', value: 'Kia' },
        { label: 'Toyota', value: 'Toyota' },
    ], []);

    const carOptions: Option[] = useMemo(() => [
        { label: 'VF 3', value: 'VF 3' },
        { label: 'VF 5', value: 'VF 5' },
        { label: 'VF 6', value: 'VF 6' },
        { label: 'Model 3', value: 'Model 3' },
        { label: 'Model Y', value: 'Model Y' },
    ], []);



    const yearOptions: Option[] = useMemo(() => {
        const current = new Date().getFullYear();
        const years: Option[] = [];
        for (let y = current; y >= 1990; y--) {
            const s = String(y);
            years.push({ label: s, value: s });
        }
        return years;
    }, []);

    React.useEffect(() => {
        if (visible) {
            sheetY.setValue(height);
            Animated.spring(sheetY, { toValue: 0, useNativeDriver: true, bounciness: 0, speed: 18 }).start();
        } else {
            Animated.spring(sheetY, { toValue: height, useNativeDriver: true, bounciness: 0, speed: 18 }).start();
        }
    }, [visible, sheetY]);

    // Check if all required fields are filled and VIN is exactly 17 characters
    const isFormValid = useMemo(() => {
        return (
            vin.trim().length === 17 &&
            brand.trim() !== '' &&
            carName.trim() !== '' &&
            batteryModel.trim() !== '' &&
            modelYear.trim() !== '' &&
            licensePlate.trim() !== ''
        );
    }, [vin, brand, carName, batteryModel, modelYear, licensePlate]);

    const handleAdd = async () => {
        const payload: any = {
            vin,
            brand,
            carName,
            modelYear: modelYear ? parseInt(modelYear, 10) : null,
            licensePlate,
        };

        // Attach battery object when provided
        if (batterySerial || batteryModel || batteryManufacturer) {
            payload.battery = {
                serial: batterySerial || '',
                model: batteryModel || '',
                manufacturer: batteryManufacturer || '',
                capacityKWh: batteryCapacity ? Number(batteryCapacity) : 0,
                price: batteryPrice ? Number(batteryPrice) : 0,
                voltage: batteryVoltage ? Number(batteryVoltage) : 0,
                stationId: batteryStationId || '',
            };
        }

        try {
            await creatVehicle(payload);
            showSuccessToast('Vehicle added successfully');
            onClose();
            router.push('/(tabs)/evs');
        } catch (err: any) {
            console.error('[LinkVehicleSheet] createVehicle failed', err);
            showErrorToast(err?.message || 'Failed to add vehicle');
        }
    };

    const requestScannerPermission = async () => {
        const { status } = await ExpoCamera.requestCameraPermissionsAsync();
        setHasScannerPermission(status === 'granted');
        return status === 'granted';
    };

    const handleOpenScanner = async () => {
        const ok = await requestScannerPermission();
        if (ok) setScannerOpen(true);
    };

    // Prevent handling the same QR multiple times in rapid succession
    const scannedRef = useRef(false);

    const handleBarCodeScanned = (scanningResult: { data: string } | any) => {
        // Guard: ignore duplicate rapid events
        if (scannedRef.current) return;
        scannedRef.current = true;

        const data = scanningResult?.data ?? '';
        // Log raw scanning result and data for debugging
        console.log('[LinkVehicleSheet] Scanned QR raw result:', scanningResult);
        console.log('[LinkVehicleSheet] Scanned QR data:', data);

        // Expect QR payload as JSON containing battery object
        let parsed: any = null;
        const tryParse = (str: string) => {
            try {
                return JSON.parse(str);
            } catch (e) {
                return null;
            }
        };

        // 1) Try direct parse
        parsed = tryParse(data);

        // 2) If that fails and the string looks like a fragment (e.g. '"battery": { ... }'), try to wrap with braces
        if (!parsed && data && data.includes('"battery"')) {
            // remove trailing commas before parsing
            const cleaned = data.replace(/,\s*(?=[}\]])/g, '');
            parsed = tryParse(`{${cleaned}}`);
        }

        // 3) If still not parsed, try to extract the first {...} substring and parse that
        if (!parsed && data) {
            const first = data.indexOf('{');
            const last = data.lastIndexOf('}');
            if (first !== -1 && last !== -1 && last > first) {
                const sub = data.substring(first, last + 1).replace(/,\s*(?=[}\]])/g, '');
                parsed = tryParse(sub) || parsed;
            }
        }

        if (!parsed) {
            console.warn('[LinkVehicleSheet] Failed to parse scanned QR data as JSON. Raw:', data);
        } else {
            const b = parsed.battery || parsed;
            if (b) {
                setBatterySerial(b.serial || '');
                setBatteryModel(b.model || '');
                setBatteryManufacturer(b.manufacturer || '');
                setBatteryCapacity(String(b.capacity_kWh ?? b.capacityKWh ?? b.capacity ?? ''));
                setBatteryPrice(String(b.price ?? ''));
                setBatteryVoltage(String(b.voltage ?? ''));
                // support station field returned by QR payload
                setBatteryStationId(String(b.station ?? b.stationId ?? ''));
            }
        }

        // close scanner and keep guard active for short period to avoid duplicates
        setScannerOpen(false);
        setTimeout(() => {
            scannedRef.current = false;
        }, 1500);
    };

    return (
        <>
            {visible ? (
                <>
                    <Pressable style={styles.scrim} onPress={onClose} />
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
                        style={{ flex: 1 }}
                    >
                        <Animated.View
                            pointerEvents="auto"
                            style={[styles.sheetContainer, { transform: [{ translateY: sheetY }] }, { minHeight: Math.floor(height * 0.82) }]}
                        >
                            <View style={styles.sheetHeader}>
                                <Text style={styles.sheetTitle}>Add your EV</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close" size={22} color="#bfa8ff" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }} style={{ maxHeight: height * 0.72 }}>
                                <View style={styles.formRow}>
                                    <Text style={styles.inputLabel}>VIN</Text>
                                    <TextInput
                                        placeholder="1HGCM82633A004352"
                                        placeholderTextColor="#7f6fb1"
                                        value={vin}
                                        onChangeText={setVin}
                                        style={[
                                            styles.input,
                                            vin.length > 0 && vin.length !== 17 && {
                                                borderColor: '#ef4444',
                                                borderWidth: 1.5,
                                            }
                                        ]}
                                        maxLength={17}
                                        autoCapitalize="characters"
                                    />
                                    {vin.length > 0 && vin.length !== 17 && (
                                        <Text style={styles.errorText}>
                                            VIN must be exactly 17 characters ({vin.length}/17)
                                        </Text>
                                    )}
                                    {vin.length === 17 && (
                                        <View style={styles.successRow}>
                                            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                                            <Text style={styles.successText}>Valid VIN</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.formRow}>
                                    <Text style={styles.inputLabel}>License Plate</Text>
                                    <TextInput
                                        placeholder="ABC-1234"
                                        placeholderTextColor="#7f6fb1"
                                        value={licensePlate}
                                        onChangeText={setLicensePlate}
                                        style={styles.input}
                                        autoCapitalize="characters"
                                    />
                                </View>
                                <SearchableDropdown label="Brand" value={brand} options={brandOptions} placeholder="Tesla, VinFast..." onSelect={setBrand} />
                                <SearchableDropdown label="Car Name" value={carName} options={carOptions} placeholder="Model 3, VF 6..." onSelect={setCarName} />
                                {/* <SearchableDropdown label="Battery Model" value={batteryModel} options={batteryOptionsFromStore} placeholder="LFP-60, NMC-75..." onSelect={setBatteryModel} /> */}
                                {/* Collapsible Battery Panel */}
                                <View style={[styles.formRow, { marginTop: 10 }]}>
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => setBatteryPanelOpen(!batteryPanelOpen)}
                                        style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                                    >
                                        <Text style={{ color: '#bfa8ff' }}>Battery (scan or enter)</Text>
                                        <Ionicons name={batteryPanelOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#bfa8ff" />
                                    </TouchableOpacity>
                                    {batteryPanelOpen && (
                                        <View style={{ marginTop: 8, gap: 8 }}>
                                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                                <TouchableOpacity style={[styles.button, { flex: 1, backgroundColor: '#6d4aff' }]} onPress={handleOpenScanner}>
                                                    <Text style={{ color: 'white', fontWeight: '700' }}>Scan QR</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[styles.button, { flex: 1, backgroundColor: '#3a2f5e' }]} onPress={() => { /* focus manual inputs */ }}>
                                                    <Text style={{ color: 'white', fontWeight: '700' }}>Manual</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <TextInput
                                                placeholder="Serial"
                                                placeholderTextColor="#7f6fb1"
                                                value={batterySerial}
                                                onChangeText={setBatterySerial}
                                                style={styles.input}
                                            />
                                            <TextInput
                                                placeholder="Model"
                                                placeholderTextColor="#7f6fb1"
                                                value={batteryModel}
                                                onChangeText={setBatteryModel}
                                                style={styles.input}
                                            />
                                            <TextInput
                                                placeholder="Manufacturer"
                                                placeholderTextColor="#7f6fb1"
                                                value={batteryManufacturer}
                                                onChangeText={setBatteryManufacturer}
                                                style={styles.input}
                                            />
                                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                                <TextInput
                                                    placeholder="Capacity (kWh)"
                                                    placeholderTextColor="#7f6fb1"
                                                    value={batteryCapacity}
                                                    onChangeText={setBatteryCapacity}
                                                    keyboardType="numeric"
                                                    style={[styles.input, { flex: 1 }]}
                                                />
                                                <TextInput
                                                    placeholder="Voltage"
                                                    placeholderTextColor="#7f6fb1"
                                                    value={batteryVoltage}
                                                    onChangeText={setBatteryVoltage}
                                                    keyboardType="numeric"
                                                    style={[styles.input, { flex: 1 }]}
                                                />
                                            </View>
                                            <TextInput
                                                placeholder="Price"
                                                placeholderTextColor="#7f6fb1"
                                                value={batteryPrice}
                                                onChangeText={setBatteryPrice}
                                                keyboardType="numeric"
                                                style={styles.input}
                                            />
                                        </View>
                                    )}
                                </View>

                                <SearchableDropdown label="Model Year" value={modelYear} options={yearOptions} placeholder="Select year" onSelect={setModelYear} />

                            </ScrollView>

                            {/* QR Scanner Modal */}
                            <Modal visible={scannerOpen} animationType="slide">
                                <View style={{ flex: 1, backgroundColor: '#000' }}>
                                    <View style={{ flex: 1 }}>
                                        <CameraView
                                            onBarcodeScanned={handleBarCodeScanned}
                                            style={{ flex: 1 }}
                                            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                                            active={true}
                                        />
                                    </View>
                                    <View style={{ padding: 12 }}>
                                        <TouchableOpacity onPress={() => setScannerOpen(false)} style={[styles.button, { backgroundColor: '#6d4aff' }]}>
                                            <Text style={{ color: '#fff', fontWeight: '700' }}>Close</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Modal>

                            <View style={styles.actionsRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        styles.buttonPrimary,
                                        !isFormValid && styles.buttonDisabled
                                    ]}
                                    onPress={handleAdd}
                                    disabled={!isFormValid}
                                >
                                    <Text style={[
                                        styles.buttonPrimaryText,
                                        !isFormValid && styles.buttonDisabledText
                                    ]}>Add Vehicle</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </KeyboardAvoidingView>
                </>
            ) : null}
        </>
    );
}

const styles = StyleSheet.create({
    scrim: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheetContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#120935',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
        gap: 12,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    sheetTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    formRow: {
        marginTop: 8,
    },
    inputLabel: {
        color: '#bfa8ff',
        marginBottom: 6,
        fontSize: 13,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#1a0f3e',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: 'white',
        borderWidth: 1,
        borderColor: '#2a1f4e',
    },
    dropdownPanel: {
        marginTop: 8,
        backgroundColor: '#0b0624',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2a1f4e',
        padding: 10,
        gap: 10,
    },
    dropdownSearchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#120935',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#2a1f4e',
    },
    dropdownSearchInput: {
        flex: 1,
        color: 'white',
        padding: 0,
        margin: 0,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#1a0f3e',
    },
    dropdownItemText: {
        color: 'white',
        fontSize: 14,
    },
    dropdownEmpty: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    actionsRow: {
        marginTop: 16,
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPrimary: {
        backgroundColor: '#6d4aff',
    },
    buttonPrimaryText: {
        color: 'white',
        fontWeight: '700',
    },
    buttonDisabled: {
        backgroundColor: '#3a2f5e',
        opacity: 0.5,
    },
    buttonDisabledText: {
        color: '#8b7bb8',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500',
    },
    successRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    successText: {
        color: '#10b981',
        fontSize: 12,
        fontWeight: '500',
    },
});


