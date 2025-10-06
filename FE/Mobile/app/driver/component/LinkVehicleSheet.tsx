import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity, Pressable, Animated, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

type Option = { label: string; value: string };

type Props = {
    visible: boolean;
    onClose: () => void;
    onAdd: (data: { vin: string; brand: string; carName: string; batteryModel: string }) => void;
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
                        {filtered.map(opt => (
                            <TouchableOpacity
                                key={opt.value}
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

export default function LinkVehicleSheet({ visible, onClose, onAdd }: Props) {
    const sheetY = useRef(new Animated.Value(height)).current;

    const [vin, setVin] = useState('');
    const [brand, setBrand] = useState('');
    const [carName, setCarName] = useState('');
    const [batteryModel, setBatteryModel] = useState('');

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

    const batteryOptions: Option[] = useMemo(() => [
        { label: 'LFP-42', value: 'LFP-42' },
        { label: 'LFP-60', value: 'LFP-60' },
        { label: 'NMC-75', value: 'NMC-75' },
        { label: 'NCA-82', value: 'NCA-82' },
    ], []);

    React.useEffect(() => {
        if (visible) {
            sheetY.setValue(height);
            Animated.spring(sheetY, { toValue: 0, useNativeDriver: true, bounciness: 0, speed: 18 }).start();
        } else {
            Animated.spring(sheetY, { toValue: height, useNativeDriver: true, bounciness: 0, speed: 18 }).start();
        }
    }, [visible, sheetY]);

    const handleAdd = () => {
        onAdd({ vin, brand, carName, batteryModel });
    };

    return (
        <>
            {visible && <Pressable style={styles.scrim} onPress={onClose} />}
            <Animated.View
                pointerEvents={visible ? 'auto' : 'none'}
                style={[styles.sheetContainer, { transform: [{ translateY: sheetY }] }]}
            >
                <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>Add your EV</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={22} color="#bfa8ff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.formRow}>
                    <Text style={styles.inputLabel}>VIN</Text>
                    <TextInput
                        placeholder="1HGCM82633A004352"
                        placeholderTextColor="#7f6fb1"
                        value={vin}
                        onChangeText={setVin}
                        style={styles.input}
                    />
                </View>
                <SearchableDropdown label="Brand" value={brand} options={brandOptions} placeholder="Tesla, VinFast..." onSelect={setBrand} />
                <SearchableDropdown label="Car Name" value={carName} options={carOptions} placeholder="Model 3, VF 6..." onSelect={setCarName} />
                <SearchableDropdown label="Battery Model" value={batteryModel} options={batteryOptions} placeholder="LFP-60, NMC-75..." onSelect={setBatteryModel} />

                <View style={styles.actionsRow}>
                    <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleAdd}>
                        <Text style={styles.buttonPrimaryText}>Add Vehicle</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
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
});


