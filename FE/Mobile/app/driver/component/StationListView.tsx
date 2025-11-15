import { getListStationNear, initFavorites, isFavorite, sSelectedStation, toggleFavorite, useFavorites, useStation, clearFavorites, getAllStationInMap, useStationInMap } from '@/store/station';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
    Animated,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';




interface StationListViewProps {
    onClose: () => void;
    listY: Animated.Value;
    showListView: boolean;
    searchQuery?: string;
}

// Station List Component
const StationList: React.FC<{
    onClose: () => void;
    searchQuery?: string;
}> = ({ onClose, searchQuery }) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = React.useState<'nearby' | 'favorites'>('nearby');
    const favoriteStations = useFavorites();
    const [isLoading, setIsLoading] = React.useState(false);
    const [processingFavorites, setProcessingFavorites] = React.useState<Set<string>>(new Set());
    const nearStation = useStation();
    const allStations = useStationInMap(); // Get all stations for favorites tab

    useFocusEffect(
        useCallback(() => {
            (async () => {
                try {
                    setIsLoading(true);

                    // Fetch all stations for favorites
                    await getAllStationInMap();

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

    const handleClearFavorites = async () => {
        Alert.alert(
            'Clear All Favorites',
            'Are you sure you want to remove all favorite stations? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearFavorites();
                            console.log('Favorites cache cleared successfully');
                        } catch (error) {
                            console.error(' Failed to clear favorites cache:', error);
                        }
                    },
                },
            ]
        );
    };

    const availableStations = nearStation.length > 0 ? nearStation : [];

    // Filter stations based on active tab
    const filteredStations = activeTab === 'favorites'
        ? allStations.filter(station => isFavorite(station.id)) // Use all stations for favorites
        : availableStations; // Use nearby stations for nearby tab


    // Loading skeleton component
    const LoadingSkeleton = () => (
        <View style={styles.skeletonCard}>
            <View style={styles.skeletonHeader}>
                <View style={styles.skeletonBrand} />
                <View style={styles.skeletonDistance} />
            </View>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonAddress} />
            <View style={styles.skeletonInfo}>
                <View style={styles.skeletonPower} />
                <View style={styles.skeletonAvailability} />
            </View>
            <View style={styles.skeletonFooter}>
                <View style={styles.skeletonDate} />
                <View style={styles.skeletonDate} />
            </View>
        </View>
    );
    const renderStationCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.stationCard}
            onPress={() => {
                const selected = {
                    ...item,
                    title: item.stationName,
                    description: item.address,
                    // Add coordinates for map focus
                    coordinates: {
                        lat: item.location?.coordinates?.[1] || item.latitude || 0,
                        lng: item.location?.coordinates?.[0] || item.longitude || 0,
                    }
                };
                sSelectedStation.set(selected as any);
                router.push('/(tabs)');
                onClose();
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                    <View style={styles.stationCardHeader}>
                        <View style={styles.brandLogo}>
                            <Text style={styles.brandText}>{item.brand || 'STATION'}</Text>
                        </View>
                        <Text style={styles.distanceKmStation} numberOfLines={2}>
                            {" "} - away from you {item.distanceKm || 'Unknown Station'}km
                        </Text>
                    </View>
                </View>
                <View>
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
            </View>

            <View>
                <Text style={styles.stationName} numberOfLines={2}>
                    <MaterialCommunityIcons name="ev-station" size={24} color="white" />{" "}{item.stationName || 'Unknown Station'}
                </Text>
                <Text style={styles.addressStation} numberOfLines={2}>
                    {item.address || 'Unknown Station'}, {item.district}, {item.city}
                </Text>
            </View>

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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.updatedStation} numberOfLines={2}>
                    Created: {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'Unknown'}
                </Text>
                <Text style={styles.updatedStation} numberOfLines={2}>
                    Updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('vi-VN') : 'Unknown'}
                </Text>
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
                    <View style={styles.favoritesHeader}>
                        <Text style={styles.locationText}>
                            {`${favoriteStations.length} favorite locations`}
                        </Text>
                        {favoriteStations.length > 0 && (
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={handleClearFavorites}
                            >
                                <Ionicons name="trash-outline" size={16} color="#ff4757" />
                                <Text style={styles.clearButtonText}>Clear All</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {isLoading ? (
                <View style={styles.stationList}>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <LoadingSkeleton key={index} />
                    ))}
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
    onClose,
    listY,
    showListView,
    searchQuery,
}) => {
    if (!showListView) return null;

    return (
        <Animated.View style={[styles.listViewContainer, { transform: [{ translateY: listY }] }]}>
            <StationList
                onClose={onClose}
                searchQuery={searchQuery}
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
    favoritesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ff4757',
        backgroundColor: 'rgba(255, 71, 87, 0.1)',
    },
    clearButtonText: {
        color: '#ff4757',
        fontSize: 12,
        fontWeight: '600',
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
    },
    brandLogo: {
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    brandText: {
        color: '#120935',
        fontSize: 10,
        fontWeight: 'bold',
    },
    favoriteButton: {
        padding: 4,
    },
    stationName: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 3,
        lineHeight: 22,
    },
    addressStation: {
        color: 'white',
        fontSize: 12,
        fontWeight: '300',
        marginBottom: 15,
        lineHeight: 22,
    },
    updatedStation: {
        color: 'white',
        fontSize: 12,
        fontWeight: '300',
        marginTop: 7,
        lineHeight: 22,
    },
    distanceKmStation: {
        color: 'white',
        fontSize: 12,
        fontWeight: '300',
        lineHeight: 22,
        fontStyle: 'italic'
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
    // Skeleton styles
    skeletonCard: {
        backgroundColor: '#0b0624',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        opacity: 0.6,
    },
    skeletonHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    skeletonBrand: {
        width: 60,
        height: 24,
        backgroundColor: '#2a1f4e',
        borderRadius: 6,
    },
    skeletonDistance: {
        width: 80,
        height: 16,
        backgroundColor: '#2a1f4e',
        borderRadius: 4,
    },
    skeletonTitle: {
        width: '70%',
        height: 22,
        backgroundColor: '#2a1f4e',
        borderRadius: 4,
        marginBottom: 8,
    },
    skeletonAddress: {
        width: '90%',
        height: 16,
        backgroundColor: '#2a1f4e',
        borderRadius: 4,
        marginBottom: 15,
    },
    skeletonInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    skeletonPower: {
        width: 100,
        height: 16,
        backgroundColor: '#2a1f4e',
        borderRadius: 4,
    },
    skeletonAvailability: {
        width: 120,
        height: 16,
        backgroundColor: '#2a1f4e',
        borderRadius: 4,
    },
    skeletonFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 7,
    },
    skeletonDate: {
        width: 100,
        height: 14,
        backgroundColor: '#2a1f4e',
        borderRadius: 4,
    },
});

export default StationListView;
