import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    Platform,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

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

const MapComponent: React.FC<MapComponentProps> = ({
    initialRegion = {
        latitude: 10.8231,
        longitude: 106.6297,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    },
    onStationSelect,
    showUserLocation = true,
    style,
}) => {
    const mapRef = useRef<MapView>(null);

    const [userLocation, setUserLocation] = useState<Region | null>(null);

    // 🚀 Lấy vị trí user
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const region: Region = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };
            setUserLocation(region);

            // Zoom đến vị trí user
            mapRef.current?.animateToRegion(region, 1000);
        })();
    }, []);

    // Sample battery swap stations data
    const batteryStations: BatteryStation[] = [
        {
            id: '1',
            title: 'University Station',
            description: 'University of Health Sciences',
            latitude: 10.8231,
            longitude: 106.6297,
            availableBatteries: 8,
            totalBatteries: 12,
            status: 'available',
            rating: 4.5,
        },
        {
            id: '2',
            title: 'District 1 Station',
            description: 'Central Business District',
            latitude: 10.7769,
            longitude: 106.7009,
            availableBatteries: 3,
            totalBatteries: 10,
            status: 'busy',
            rating: 4.2,
        },
    ];

    const handleMarkerPress = (station: BatteryStation) => {
        if (onStationSelect) {
            onStationSelect(station);
        }

        Alert.alert(
            station.title,
            `${station.description}\n\nAvailable: ${station.availableBatteries}/${station.totalBatteries} batteries\nStatus: ${station.status}\nRating: ${station.rating}/5`,
            [
                { text: 'Close', style: 'cancel' },
                { text: 'Navigate', onPress: () => console.log('Navigate to station') },
            ]
        );
    };

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
                showsUserLocation={showUserLocation} // ✅ hiện chấm xanh
                showsMyLocationButton={true}
                showsCompass={true}
                showsScale={true}
                zoomEnabled={true}
                mapType="standard"
            >
                {batteryStations.map((station) => (
                    <Marker
                        key={station.id}
                        coordinate={{
                            latitude: station.latitude,
                            longitude: station.longitude,
                        }}
                        title={station.title}
                        description={`${station.availableBatteries}/${station.totalBatteries} batteries available`}
                        onPress={() => handleMarkerPress(station)}
                        pinColor={getMarkerColor(station.status)}
                    />
                ))}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
});

export default MapComponent;
