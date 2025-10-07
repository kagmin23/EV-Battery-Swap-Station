import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
    View,
    StyleSheet,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

interface BatteryStation {
    id: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    availableBatteries: number;
    totalBatteries: number;
    status: 'available' | 'busy' | 'maintenance';
    rating: number;
}

interface MapComponentProps {
    initialRegion?: Region;
    onStationSelect?: (station: BatteryStation) => void;
    showUserLocation?: boolean;
    style?: any;
}

export type MapComponentHandle = {
    centerOnUser: () => Promise<void>;
};

const MapComponent = forwardRef<MapComponentHandle, MapComponentProps>(({
    initialRegion = {
        latitude: 15.8231,
        longitude: 106.6297,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    },
    onStationSelect,
    showUserLocation = true,
    style,
}, ref) => {
    const mapRef = useRef<MapView>(null);

    const [userLocation, setUserLocation] = useState<Region | null>(null);
    const hasCenteredOnUserRef = useRef(false);

    // Theo dõi vị trí bằng Expo Location (đồng bộ với vị trí emulator/thiết bị)
    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.log('Permission to access location was denied');
                    return;
                }

                const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
                const region: Region = {
                    latitude: current.coords.latitude,
                    longitude: current.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                };
                setUserLocation(region);
                mapRef.current?.animateToRegion(region, 1000);
                hasCenteredOnUserRef.current = true;

                subscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Highest,
                        timeInterval: 2000,
                        distanceInterval: 1,
                    },
                    (loc) => {
                        const next: Region = {
                            latitude: loc.coords.latitude,
                            longitude: loc.coords.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        };
                        setUserLocation(next);
                        if (!hasCenteredOnUserRef.current) {
                            mapRef.current?.animateToRegion(next, 1000);
                            hasCenteredOnUserRef.current = true;
                        }
                    }
                );
            } catch (e) {
                console.log('Expo location error', e);
            }
        })();

        return () => {
            try { subscription && subscription.remove(); } catch { }
        };
    }, []);

    useImperativeHandle(ref, () => ({
        centerOnUser: async () => {
            try {
                let region = userLocation;
                if (!region) {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        console.log('Permission to access location was denied');
                        return;
                    }
                    const location = await Location.getCurrentPositionAsync({});
                    region = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    };
                    setUserLocation(region);
                }
                if (region) {
                    mapRef.current?.animateToRegion(region, 1000);
                }
            } catch (e) {
                console.log('centerOnUser error', e);
            }
        }
    }), [userLocation]);

    // Sample battery swap stations data
    const batteryStations: BatteryStation[] = [
        {
            id: '1',
            title: 'University Station',
            description: 'University of Health Sciences',
            latitude: 8.8231,
            longitude: 102.6297,
            availableBatteries: 8,
            totalBatteries: 12,
            status: 'available',
            rating: 4.5,
        },
        {
            id: '2',
            title: 'District 1 Station',
            description: 'Central Business District',
            latitude: 8.7769,
            longitude: 102.7009,
            availableBatteries: 3,
            totalBatteries: 10,
            status: 'busy',
            rating: 4.2,
        },
        {
            id: '3',
            title: 'Saigon Zoo Station',
            description: 'Near Saigon Zoo and Botanical Gardens',
            latitude: 10.7892,
            longitude: 106.7058,
            availableBatteries: 6,
            totalBatteries: 10,
            status: 'available',
            rating: 4.7,
        },
        {
            id: '4',
            title: 'Ben Thanh Station',
            description: 'Ben Thanh Market Area',
            latitude: 10.7723,
            longitude: 106.6983,
            availableBatteries: 1,
            totalBatteries: 8,
            status: 'busy',
            rating: 4.0,
        },
        {
            id: '5',
            title: 'Thu Duc Station',
            description: 'Thu Duc District Center',
            latitude: 10.8494,
            longitude: 106.7548,
            availableBatteries: 9,
            totalBatteries: 12,
            status: 'available',
            rating: 4.3,
        },
        {
            id: '6',
            title: 'Tan Son Nhat Station',
            description: 'Tan Son Nhat International Airport',
            latitude: 10.8188,
            longitude: 106.6518,
            availableBatteries: 5,
            totalBatteries: 15,
            status: 'maintenance',
            rating: 3.9,
        },
        {
            id: '7',
            title: 'Binh Thanh Station',
            description: 'Binh Thanh District Riverside',
            latitude: 10.8042,
            longitude: 106.7149,
            availableBatteries: 7,
            totalBatteries: 10,
            status: 'available',
            rating: 4.6,
        },
        {
            id: '8',
            title: 'Pham Ngu Lao Station',
            description: 'Backpacker Area',
            latitude: 10.7681,
            longitude: 106.6935,
            availableBatteries: 2,
            totalBatteries: 8,
            status: 'busy',
            rating: 4.1,
        },
        {
            id: '9',
            title: 'District 7 Station',
            description: 'Phu My Hung Urban Area',
            latitude: 10.7306,
            longitude: 106.7215,
            availableBatteries: 10,
            totalBatteries: 15,
            status: 'available',
            rating: 4.8,
        },
        {
            id: '10',
            title: 'Go Vap Station',
            description: 'Go Vap District Center',
            latitude: 10.8380,
            longitude: 106.6684,
            availableBatteries: 4,
            totalBatteries: 12,
            status: 'maintenance',
            rating: 3.7,
        },
        {
            id: '11',
            title: 'District 2 Station',
            description: 'Thao Dien Area',
            latitude: 10.8011,
            longitude: 106.7396,
            availableBatteries: 6,
            totalBatteries: 10,
            status: 'available',
            rating: 4.4,
        },
        {
            id: '12',
            title: 'Nguyen Hue Station',
            description: 'Walking Street',
            latitude: 10.7734,
            longitude: 106.7040,
            availableBatteries: 3,
            totalBatteries: 10,
            status: 'busy',
            rating: 4.2,
        },
        {
            id: '13',
            title: 'District 9 Station',
            description: 'High-Tech Park',
            latitude: 10.8415,
            longitude: 106.8096,
            availableBatteries: 8,
            totalBatteries: 12,
            status: 'available',
            rating: 4.6,
        },
        {
            id: '14',
            title: 'Cholon Station',
            description: 'Chinatown District 5',
            latitude: 10.7552,
            longitude: 106.6630,
            availableBatteries: 2,
            totalBatteries: 9,
            status: 'busy',
            rating: 3.9,
        },
        {
            id: '15',
            title: 'An Suong Station',
            description: 'An Suong Bus Terminal',
            latitude: 10.8526,
            longitude: 106.6138,
            availableBatteries: 11,
            totalBatteries: 15,
            status: 'available',
            rating: 4.7,
        },
        {
            id: '16',
            title: 'District 4 Station',
            description: 'Khanh Hoi Port',
            latitude: 10.7563,
            longitude: 106.7081,
            availableBatteries: 5,
            totalBatteries: 10,
            status: 'maintenance',
            rating: 3.8,
        },
        {
            id: '17',
            title: 'Tan Binh Station',
            description: 'Tan Binh District Center',
            latitude: 10.7935,
            longitude: 106.6525,
            availableBatteries: 7,
            totalBatteries: 10,
            status: 'available',
            rating: 4.5,
        },
        {
            id: '18',
            title: 'Hoc Mon Station',
            description: 'Hoc Mon District',
            latitude: 10.8899,
            longitude: 106.5945,
            availableBatteries: 6,
            totalBatteries: 12,
            status: 'available',
            rating: 4.3,
        },
        {
            id: '19',
            title: 'Cu Chi Station',
            description: 'Cu Chi Tunnels Area',
            latitude: 11.0536,
            longitude: 106.4950,
            availableBatteries: 4,
            totalBatteries: 10,
            status: 'busy',
            rating: 4.0,
        },
        {
            id: '20',
            title: 'Can Gio Station',
            description: 'Can Gio Mangrove Forest',
            latitude: 10.4114,
            longitude: 106.9545,
            availableBatteries: 9,
            totalBatteries: 12,
            status: 'available',
            rating: 4.6,
        },
    ];



    // const handleMarkerPress = (station: BatteryStation) => {
    //     if (onStationSelect) {
    //         onStationSelect(station);
    //     }

    //     Alert.alert(
    //         station.title,
    //         `${station.description}\n\nAvailable: ${station.availableBatteries}/${station.totalBatteries} batteries\nStatus: ${station.status}\nRating: ${station.rating}/5`,
    //         [
    //             { text: 'Close', style: 'cancel' },
    //             { text: 'Navigate', onPress: () => console.log('Navigate to station') },
    //         ]
    //     );
    // };

    const getMarkerColor = (status: string) => {
        switch (status) {
            case 'available':
                return '#057952';
            case 'busy':
                return '#F59E0B';
            case 'maintenance':
                return '#EF4444';
            default:
                return '#6B7280';
        }
    };

    return (
        <View style={[styles.container, style]}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={initialRegion}
                showsUserLocation={false}
                showsMyLocationButton={false}
                showsCompass={true}
                showsScale={true}
                zoomEnabled={true}
                mapType="standard"
            >
                {userLocation && (
                    <Marker
                        coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
                        title="Your location"
                    >
                        <View style={[styles.markerContainer, { backgroundColor: '#2563eb' }]}>
                            <Ionicons name="navigate" size={18} color="white" />
                        </View>
                    </Marker>
                )}
                {batteryStations.map((station) => (
                    <Marker
                        key={station.id}
                        coordinate={{
                            latitude: station.latitude,
                            longitude: station.longitude,
                        }}
                        title={station.title}
                        description={`${station.availableBatteries}/${station.totalBatteries} batteries available`}
                        onPress={() => {
                            if (onStationSelect) {
                                onStationSelect(station);
                            }
                        }}
                    >
                        <View style={[styles.markerContainer, { backgroundColor: getMarkerColor(station.status) }]}>
                            <Ionicons name="battery-charging" size={20} color="white" />
                        </View>
                    </Marker>
                ))}
            </MapView>
        </View>
    );
});

MapComponent.displayName = 'MapComponent';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
});

export default MapComponent;
