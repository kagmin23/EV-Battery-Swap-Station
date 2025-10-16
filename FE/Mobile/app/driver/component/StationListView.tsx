import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getListStationNear, sSelectedStation, useStation, useFavorites, toggleFavorite, isFavorite, initFavorites } from '@/store/station';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Location from 'expo-location';



// Mock station data based on the image
export const mockStations = [
    {
        id: '1',
        stationName: 'PhayuKhunHan, KhunHan',
        address: 'Đông Hòa, KhunHan District',
        availableBatteries: 1,
        totalBatteries: 1,
        power: '22kW',
        brand: 'SAASCHARGE',
        status: 'available',
        latitude: 10.8231,
        longitude: 106.6297,
    },
    {
        id: '2',
        stationName: 'บริเวณลานจอดรถ SCG HOME บุญถาวร - จันทบุร, จันทบุรี',
        address: 'SCG HOME บุญถาวร, จันทบุรี',
        availableBatteries: 3,
        totalBatteries: 5,
        power: '180kW',
        brand: 'VIRTA',
        status: 'available',
        latitude: 10.8231,
        longitude: 106.6297,
    },
    {
        id: '3',
        stationName: 'Tha Mai, Tha Mai',
        address: 'Tha Mai District, Chanthaburi',
        availableBatteries: 1,
        totalBatteries: 1,
        power: '7kW',
        brand: 'SAASCHARGE',
        status: 'available',
        latitude: 10.8231,
        longitude: 106.6297,
    },
    {
        id: '4',
        stationName: 'สำหรับพนักงาน WD เท่านั้น 203,205 นิคมอุสา, ปราจีนบุรี',
        address: 'นิคมอุสา, ปราจีนบุรี',
        availableBatteries: 2,
        totalBatteries: 4,
        power: '50kW',
        brand: 'VIRTA',
        status: 'busy',
        latitude: 10.8231,
        longitude: 106.6297,
    },
];

interface UIStation {
    id: string;
    stationName: string;
    address: string;
    city?: string;
    district?: string;
    mapUrl?: string;
    capacity?: number;
    sohAvg?: number;
    availableBatteries: number;
    totalBatteries?: number;
    power?: string;
    brand?: string;
    status?: string;
    latitude?: number;
    longitude?: number;
}

interface StationListViewProps {
    stations: UIStation[];
    onClose: () => void;
    listY: Animated.Value;
    showListView: boolean;
}

// Station List Component
const StationList: React.FC<{
    stations: UIStation[];
    onClose: () => void;
}> = ({ stations, onClose }) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = React.useState<'nearby' | 'favorites'>('nearby');
    const favoriteStations = useFavorites();
    const [isLoading, setIsLoading] = React.useState(false);
    const [processingFavorites, setProcessingFavorites] = React.useState<Set<string>>(new Set());
    const nearStation = useStation()




    useFocusEffect(
        useCallback(() => {
            (async () => {
                try {
                    setIsLoading(true);
                    let { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        console.warn('Permission to access location was denied');
                        return;
                    }

                    let location = await Location.getCurrentPositionAsync({});

                    await getListStationNear({
                        lat: location.coords.latitude,
                        lng: location.coords.longitude
                    });
                } catch (error) {
                    console.error('Error fetching nearby stations:', error);
                } finally {
                    setIsLoading(false);
                }
            })();
        }, [])
    );
    React.useEffect(() => { initFavorites(); }, []);

    const onToggleFavorite = async (stationId: string) => {
        if (!stationId || processingFavorites.has(stationId)) return;
        setProcessingFavorites(prev => new Set(prev).add(stationId));
        try { await toggleFavorite(stationId); } finally {
            setProcessingFavorites(prev => { const s = new Set(prev); s.delete(stationId); return s; });
        }
    };

    const availableStations = nearStation.length > 0 ? nearStation : stations;

    // Filter stations based on active tab
    const filteredStations = activeTab === 'favorites'
        ? availableStations.filter(station => isFavorite(station.id))
        : availableStations;
    const renderStationCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.stationCard}
            onPress={() => {
                const selected = {
                    ...item,
                    title: item.stationName,
                    description: item.address,
                };
                sSelectedStation.set(selected as any);
                router.push('/(tabs)');
                onClose();
            }}
        >
            <View style={styles.stationCardHeader}>
                <View style={styles.brandLogo}>
                    <Text style={styles.brandText}>{item.brand || 'STATION'}</Text>
                </View>
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => onToggleFavorite(item.id)}
                    disabled={processingFavorites.has(item.id)}
                >
                    <Ionicons
                        name={processingFavorites.has(item.id) ? "hourglass" : (isFavorite(item.id) ? "star" : "star-outline")}
                        size={20}
                        color={processingFavorites.has(item.id) ? "#6d4aff" : (isFavorite(item.id) ? "#FFD700" : "white")}
                    />
                </TouchableOpacity>
            </View>

            <Text style={styles.stationName} numberOfLines={2}>
                {item.stationName || 'Unknown Station'}
            </Text>

            <View style={styles.stationInfo}>
                <View style={styles.powerInfo}>
                    <Ionicons name="flash" size={16} color="#6d4aff" />
                    <Text style={styles.powerText}>{item.sohAvg || 'N/A'} SOH AVG</Text>
                </View>

                <View style={styles.availabilityInfo}>
                    <View style={styles.availabilityDot} />
                    <Text style={styles.availabilityText}>
                        {item.availableBatteries}/{item.totalBatteries || item.capacity || 0} Available
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.listContainer}>
            <View style={styles.listHeader}>
                <View style={styles.titleRow}>
                    <Text style={styles.nearbyTitle}>
                        {activeTab === 'nearby' ? 'Nearby' : 'Favourites'}
                    </Text>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'nearby' && styles.activeTab]}
                        onPress={() => setActiveTab('nearby')}
                    >
                        <Text style={activeTab === 'nearby' ? styles.activeTabText : styles.tabText}>
                            Nearby
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
                        onPress={() => setActiveTab('favorites')}
                    >
                        <Text style={activeTab === 'favorites' ? styles.activeTabText : styles.tabText}>
                            Favourites
                        </Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'favorites' && (
                    <Text style={styles.locationText}>
                        {`${favoriteStations.length} favorite locations`}
                    </Text>
                )}
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <Ionicons name="refresh" size={32} color="#6d4aff" />
                    <Text style={styles.loadingText}>Loading nearby stations...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredStations}
                    renderItem={renderStationCard}
                    keyExtractor={(item) => item.id}
                    style={styles.stationList}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.stationListContent}
                    ListEmptyComponent={
                        activeTab === 'favorites' ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="heart-outline" size={48} color="#6d4aff" />
                                <Text style={styles.emptyStateTitle}>No Favorites Yet</Text>
                                <Text style={styles.emptyStateText}>
                                    Tap the star icon on any station to add it to your favorites
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="location-outline" size={48} color="#6d4aff" />
                                <Text style={styles.emptyStateTitle}>No Stations Found</Text>
                                <Text style={styles.emptyStateText}>
                                    No charging stations found in your area
                                </Text>
                            </View>
                        )
                    }
                />
            )}
        </View>
    );
};

const StationListView: React.FC<StationListViewProps> = ({
    stations,
    onClose,
    listY,
    showListView,
}) => {
    if (!showListView) return null;

    return (
        <Animated.View style={[styles.listViewContainer, { transform: [{ translateY: listY }] }]}>
            <StationList
                stations={stations}
                onClose={onClose}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    listViewContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#120935',
        zIndex: 60,
    },
    listContainer: {
        flex: 1,
        backgroundColor: '#120935',
    },
    listHeader: {
        paddingTop: 80,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    listStatusBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    timeText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    batteryText: {
        fontSize: 14,
        fontWeight: '600',
        backgroundColor: 'white',
        color: '#120935',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    nearbyTitle: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 8,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'white',
    },
    activeTab: {
        backgroundColor: '#6d4aff',
        borderColor: '#6d4aff',
    },
    activeTabText: {
        color: 'white',
        fontWeight: '600',
    },
    tabText: {
        color: 'white',
        fontWeight: '600',
    },
    locationText: {
        color: 'white',
        fontSize: 14,
        marginBottom: 20,
    },
    stationList: {
        flex: 1,
    },
    stationListContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    stationCard: {
        backgroundColor: '#0b0624',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    stationCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    brandLogo: {
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    brandText: {
        color: '#120935',
        fontSize: 12,
        fontWeight: 'bold',
    },
    favoriteButton: {
        padding: 4,
    },
    stationName: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        lineHeight: 22,
    },
    stationInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    powerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    powerText: {
        color: '#6d4aff',
        fontSize: 14,
        fontWeight: '600',
    },
    availabilityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    availabilityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#22c55e',
    },
    availabilityText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
    },
    emptyStateTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        color: '#bfa8ff',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        color: 'white',
        fontSize: 16,
        marginTop: 12,
        fontWeight: '600',
    },
});

export default StationListView;
