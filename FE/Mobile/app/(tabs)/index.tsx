
import { initFavorites, sSelectedStation, toggleFavorite, useFavorites, useSelectedStation } from '@/store/station';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Linking,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapComponent, { MapComponentHandle } from '../driver/component/MapComponent';
import StationListView, { mockStations } from '../driver/component/StationListView';

const { width, height } = Dimensions.get('window');


const SearchAndFilterBar: React.FC = () => {


  return (
    <View style={styles.searchBarContainer} pointerEvents="box-none">
      <View style={styles.searchInputWrapper}>
        <Ionicons name="search-outline" size={20} color="#fff" style={styles.searchIcon} />
        <TextInput
          placeholder="Search location"
          placeholderTextColor="#8b7bb8"
          style={styles.searchInput}
        />
      </View>
    </View>
  );
};

const FloatingActionButtons: React.FC<{
  onNavigatePress?: () => void;
  onListPress?: () => void;
}> = ({ onNavigatePress, onListPress }) => {
  const buttons = [
    { name: 'list-sharp', bgColor: '#0e012f', onPress: onListPress },
    { name: 'navigate-outline', bgColor: '#0e012f', onPress: onNavigatePress },
  ];

  return (
    <View style={styles.fabContainer} pointerEvents="box-none">
      {buttons.map((btn, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.fabButton, { backgroundColor: btn.bgColor }]}
          accessibilityLabel={btn.name}
          onPress={btn.onPress}
        >
          <Ionicons name={btn.name as keyof typeof Ionicons.glyphMap} color="white" size={24} />
        </TouchableOpacity>
      ))}
    </View>
  );
};


const LocationSation: React.FC = () => {
  const mapRef = useRef<MapComponentHandle>(null);
  const [selectedStation, setSelectedStation] = useState<any | null>(null);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [showListView, setShowListView] = useState(false);
  const sheetY = useRef(new Animated.Value(height)).current; // start off-screen
  const listY = useRef(new Animated.Value(height)).current; // list view animation
  const startOffsetRef = useRef(0);
  const navigation = useNavigation<any>();
  const router = useRouter();
  const selectedStationStore = useSelectedStation();
  const favoriteIds = useFavorites();

  useEffect(() => {
    if (selectedStationStore) {
      setSelectedStation(selectedStationStore);
    }
  }, [selectedStationStore]);

  useEffect(() => {
    initFavorites();
  }, []);

  const handleNavigatePress = () => {
    const station = selectedStationStore;

    const url = station?.mapUrl
    if (!url) {
      console.warn("No map URL available for this station");
      return;
    }

    Linking.openURL(url).catch((err) =>
      console.error("Could not open map URL:", err)
    );
  };

  const PEEK_OFFSET = Math.max(160, Math.floor(height * 0.45));

  const openTo = useCallback((to: number) => {
    Animated.spring(sheetY, { toValue: to, useNativeDriver: true, bounciness: 0, speed: 18 }).start();
  }, [sheetY]);

  const openListView = useCallback(() => {
    setShowListView(true);
    Animated.spring(listY, { toValue: 0, useNativeDriver: true, bounciness: 0, speed: 18 }).start();
  }, [listY]);

  const closeListView = useCallback(() => {
    Animated.spring(listY, { toValue: height, useNativeDriver: true, bounciness: 0, speed: 18 }).start(() => {
      setShowListView(false);
    });
  }, [listY]);

  const handleListPress = () => {
    if (showListView) {
      closeListView();
    } else {
      openListView();
    }
  };

  useEffect(() => {
    if (selectedStation) {
      sheetY.setValue(height);
      setTimeout(() => openTo(0), 0);
      setIsSheetExpanded(true);
    }
  }, [selectedStation, sheetY, PEEK_OFFSET, openTo]);

  // Hide bottom tab bar while sheet or list view is visible
  useEffect(() => {
    // expo-router Tabs parent
    if (selectedStation || showListView) {
      navigation.setOptions({ tabBarStyle: { display: 'none' } });
    } else {
      // Restore original tab bar style from _layout.tsx
      navigation.setOptions({
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          backgroundColor: '#190d35',
          height: 80,
          paddingTop: 8,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: '#FF74E2',
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 1,
          shadowRadius: 15,
          elevation: 20,
          borderTopWidth: 0,
        }
      });
    }
  }, [navigation, selectedStation, showListView]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      // @ts-ignore private API to fetch current value synchronously
      startOffsetRef.current = (sheetY as any)._value ?? PEEK_OFFSET;
    },
    onPanResponderMove: (_evt, gesture) => {
      const next = Math.min(Math.max(0, startOffsetRef.current + gesture.dy), height);
      sheetY.setValue(next);
    },
    onPanResponderRelease: (_evt, gesture) => {
      // decide snap
      // @ts-ignore
      const current = (sheetY as any)._value ?? PEEK_OFFSET;
      if (gesture.vy < -0.5 || gesture.dy < -30 || current < PEEK_OFFSET * 0.8) {
        openTo(0); // expand
        setIsSheetExpanded(true);
        return;
      }
      if (gesture.vy > 1.0 || current > PEEK_OFFSET + 120) {
        // close
        openTo(height);
        setTimeout(() => { setSelectedStation(null); sSelectedStation.set(null as any); }, 180);
        setIsSheetExpanded(false);
        return;
      }
      openTo(PEEK_OFFSET); // snap to peek
      setIsSheetExpanded(false);
    },
  }), [sheetY, PEEK_OFFSET, openTo]);


  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <View style={styles.appContainer}>

        <MapComponent
          ref={mapRef}
          style={styles.mapContainer}
          onStationSelect={(station) => {
            setSelectedStation(station);
          }}
        />

        <FloatingActionButtons
          onNavigatePress={() => mapRef.current?.centerOnUser()}
          onListPress={handleListPress}
        />

        {!selectedStation && !showListView && <SearchAndFilterBar />}

        {selectedStation && (
          <>
            {isSheetExpanded && (
              <Pressable style={styles.scrim} onPress={() => { openTo(height); setTimeout(() => { setSelectedStation(null); sSelectedStation.set(null as any); }, 180); }} />
            )}
            <Animated.View style={[styles.sheetContainer, { transform: [{ translateY: sheetY }] }]}>
              <View style={styles.dragHandle} {...panResponder.panHandlers}>
                <View style={styles.dragGrip} />
              </View>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>EV Battery Swap Station</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={{ borderRadius: 20, padding: 4 }}
                    onPress={() => {
                      if (selectedStation?.id) toggleFavorite(selectedStation.id);
                    }}
                    disabled={!selectedStation?.id}
                  >
                    <Ionicons
                      name={selectedStation?.id && favoriteIds.includes(selectedStation.id) ? 'star' : 'star-outline'}
                      size={20}
                      color={selectedStation?.id && favoriteIds.includes(selectedStation.id) ? '#FFD700' : '#bfa8ff'}
                    />
                  </TouchableOpacity>
                  <View style={{ backgroundColor: '#6d4aff', borderRadius: 20, padding: 4 }}>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#bfa8ff" />
                  </View>
                </View>
              </View>

              <View style={styles.statRow}>
                <View style={styles.statBox}>
                  <Ionicons name="battery-full-outline" size={16} color="#bfa8ff" />
                  <Text style={styles.statValue}>{selectedStation.availableBatteries}</Text>
                  <Text style={styles.statLabel}>Available </Text>
                </View>
                <View style={styles.statBox}>
                  <Ionicons name="albums-outline" size={16} color="#bfa8ff" />
                  <Text style={styles.statValue}>{selectedStation.sohAvg}</Text>
                  <Text style={styles.statLabel}>SOH Average</Text>
                </View>
                <View style={styles.statBox}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          selectedStation.availableBatteries > 5
                            ? '#22c55e'
                            : selectedStation.availableBatteries > 0
                              ? '#facc15'
                              : '#ef4444',
                      },
                    ]}
                  />
                  <Text style={styles.statValue}>
                    {selectedStation.availableBatteries > 5
                      ? 'Available'
                      : selectedStation.availableBatteries > 0
                        ? 'Low'
                        : 'Out of Stock'}
                  </Text>
                  <Text style={styles.statLabel}>Status</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  try {
                    const stationParam = encodeURIComponent(JSON.stringify({
                      title: selectedStation.title,
                      description: selectedStation.description,
                      availableBatteries: selectedStation.availableBatteries,
                      totalBatteries: selectedStation.totalBatteries,
                      status: selectedStation.status,
                    }));
                    router.push(`/(tabs)/booking?station=${stationParam}`);
                  } catch {
                    router.push('/(tabs)/booking');
                  }
                }}
              >
                <Text style={styles.primaryButtonText}>Swap Battery</Text>
              </TouchableOpacity>

              <View style={styles.addressBot}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={styles.addressText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Station: <Text style={styles.addressRow}>{selectedStation.title}</Text>
                  </Text>
                </View>
                <TouchableOpacity style={styles.roundIconButton} onPress={handleNavigatePress}>
                  <Ionicons name="return-up-forward-sharp" size={18} color="#d6c7ff" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </>
        )}

        <StationListView
          stations={mockStations as any[]}
          onClose={closeListView}
          listY={listY}
          showListView={showListView}
        />
      </View>
    </SafeAreaView >
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  appContainer: {
    flex: 1,
    backgroundColor: 'white',
    position: 'relative',
    overflow: 'hidden',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    zIndex: 40,
  },
  statusBarText: {
    color: '#4B5563', // gray-700
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  searchBarContainer: {
    position: 'absolute',
    top: 56,
    width: width,
    paddingHorizontal: 16,
    zIndex: 20,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#190d35', // dark purple
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 8,

    elevation: 8,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#F9FAFB', // gray-50
    fontSize: 16,
    height: '100%',
    padding: 0,
    margin: 0,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#1a0f3e',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  listIcon: {
    color: 'white',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a0f3e',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryLabel: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 128,
    zIndex: 10,
    gap: 12,
  },
  fabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: '#000',
    backgroundColor: '#0e012f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 10,
    transform: [{ scale: 1 }],
  },
  discountIcon: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 20,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#190d35', // dark purple
    height: 80,
    paddingTop: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#0e012f', // pink glow
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 20,
    zIndex: 30,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 45,
  },
  navItemButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  navIconWrapper: {
    padding: 2,
    borderRadius: 8,
  },
  navItemLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  navItemLabelActive: {
    fontWeight: 'bold',
    color: '#FF74E2',
  },
  navItemLabelInactive: {
    color: '#A063FE',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#120935',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 12,
    zIndex: 50,
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragGrip: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#3b2c66',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0b0624',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: 'white',
    fontWeight: '700',
  },
  statLabel: {
    color: '#bfa8ff',
    fontSize: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
  },
  primaryButton: {
    backgroundColor: '#6d4aff',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  addressBot: {
    marginTop: 4,
    backgroundColor: '#0b0624',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    fontWeight: '700',
    justifyContent: 'space-between',
    gap: 8,
  },
  addressRow: {
    marginTop: 4,
    backgroundColor: '#0b0624',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    fontWeight: '700',
    justifyContent: 'space-between',
    gap: 8,
  },
  addressText: {
    color: 'white',
    fontWeight: '400',
  },
  roundIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6d4aff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LocationSation;
