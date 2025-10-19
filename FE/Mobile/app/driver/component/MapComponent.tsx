import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import {
    View,
    StyleSheet,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { getAllStationInMap, useStationInMap, StationInMapResponse, getStationCoordinates } from '@/store/station';
import { useFocusEffect } from 'expo-router';


interface MapComponentProps {
    initialRegion?: Region;
    onStationSelect?: (station: StationInMapResponse) => void;
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
    const batteryStations = useStationInMap();


    // Debug each station coordinates

    useFocusEffect((
        useCallback(() => {
            getAllStationInMap()
        }, [])

    ))




    return (
        <View style={[styles.container, style]}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={userLocation || initialRegion}
                showsUserLocation={showUserLocation}
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
                        coordinate={getStationCoordinates(station)}
                        title={station.stationName}
                        description={`${station.availableBatteries}/${station.capacity} batteries available`}
                        onPress={() => {
                            if (onStationSelect) {
                                onStationSelect(station);
                            }
                        }}
                    >
                        <View style={[
                            styles.markerContainer,
                            {
                                backgroundColor: station.availableBatteries > 0 ? '#057952' : '#F59E0B'
                            }
                        ]}>
                            <Ionicons
                                name="battery-charging"
                                size={22}
                                color={station.availableBatteries > 0 ? '#ffd700' : '#f87171'} // gold when available, red highlight if not
                                style={{
                                    textShadowColor: 'rgba(0,0,0,0.33)',
                                    textShadowOffset: { width: 1, height: 1 },
                                    textShadowRadius: 4,
                                }}
                            />
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
