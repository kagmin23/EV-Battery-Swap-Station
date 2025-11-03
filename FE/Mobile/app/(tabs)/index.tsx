import type { Feedback } from '@/store/feedback';
import { getFeedbacksByStationApi } from '@/store/feedback';
import { getAllStationInMap, initFavorites, sSelectedStation, Station, StationInMapResponse, toggleFavorite, useFavorites, useSelectedStation, useStationInMap } from '@/store/station';
import { toCamelCase } from '@/utils/caseConverter';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Linking,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapComponent, { MapComponentHandle } from '../driver/component/MapComponent';
import StationListView from '../driver/component/StationListView';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const RECENT_SEARCHES_KEY = 'recentSearches';

// Search Overlay Component
const SearchOverlay: React.FC<{
  visible: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onStationSelect: (station: StationInMapResponse) => void;
  recentSearches: StationInMapResponse[];
  onClearRecent: () => void;
  allStations: StationInMapResponse[];
}> = ({ visible, onClose, searchQuery, onSearchChange, onStationSelect, recentSearches, onClearRecent, allStations }) => {
  if (!visible) return null;

  // Filter stations based on search query
  const filteredStations = searchQuery.trim()
    ? allStations.filter(station =>
      station.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.city?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  return (
    <View style={styles.searchOverlay}>
      {/* Header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity onPress={onClose} style={styles.searchBackButton}>
          <Ionicons name="search-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TextInput
          placeholder="Search location"
          placeholderTextColor="#8b7bb8"
          style={styles.searchOverlayInput}
          value={searchQuery}
          onChangeText={onSearchChange}
          autoFocus
        />
        <TouchableOpacity onPress={onClose} style={styles.searchCloseButton}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.searchContent} keyboardShouldPersistTaps="handled">
        {searchQuery.trim() === '' ? (
          // Show recent searches
          recentSearches.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>Recently searched</Text>
                <TouchableOpacity onPress={onClearRecent}>
                  <Text style={styles.clearAllText}>Clear all</Text>
                </TouchableOpacity>
              </View>
              {recentSearches.map((station, index) => (
                <TouchableOpacity
                  key={station.id + index}
                  style={styles.recentItem}
                  onPress={() => {
                    onStationSelect(station);
                    onClose();
                  }}
                >
                  <Ionicons name="time-outline" size={24} color="#8b7bb8" style={styles.recentIcon} />
                  <View style={styles.recentTextContainer}>
                    <Text style={styles.recentStationName}>{station.stationName}</Text>
                    <Text style={styles.recentStationAddress}>
                      {station.city}, {station.district}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color="#8b7bb8" />
                </TouchableOpacity>
              ))}
            </View>
          )
        ) : (
          // Show search results
          <View style={styles.resultsSection}>
            {filteredStations.length > 0 ? (
              filteredStations.map((station, index) => (
                <TouchableOpacity
                  key={station.id + index}
                  style={styles.resultItem}
                  onPress={() => {
                    onStationSelect(station);
                    onClose();
                  }}
                >
                  <Ionicons name="location" size={24} color="#6C63FF" style={styles.resultIcon} />
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultStationName}>{station.stationName}</Text>
                    <Text style={styles.resultStationAddress}>
                      {station.address}, {station.city}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={48} color="#8b7bb8" />
                <Text style={styles.noResultsText}>No stations found</Text>
                <Text style={styles.noResultsSubtext}>Try searching with a different keyword</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};


const SearchAndFilterBar: React.FC<{
  onSearchFocus: () => void;
}> = ({ onSearchFocus }) => {
  return (
    <View style={styles.searchBarContainer} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.searchInputWrapper}
        activeOpacity={0.7}
        onPress={onSearchFocus}
      >
        <Ionicons name="search-outline" size={20} color="#fff" style={styles.searchIcon} />
        <Text style={styles.searchPlaceholder}>Search location</Text>
      </TouchableOpacity>
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

// Component: StationFeedbackList
const StationFeedbackList: React.FC<{ stationId?: string }> = ({ stationId }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!stationId) {
        setFeedbacks([]);
        return;
      }
      setLoading(true);
      try {
        const res = await getFeedbacksByStationApi(stationId);
        if (mounted && res && Array.isArray(res.data)) {
          setFeedbacks(res.data as Feedback[]);
        } else if (mounted) {
          setFeedbacks([]);
        }
      } catch {
        if (mounted) setFeedbacks([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [stationId]);

  // Constrain the feedback list to a scrollable area so it doesn't cover the whole sheet
  const maxListHeight = Math.min(200, Math.floor(height * 0.45));

  return (
    <View>
      {loading ? (
        <Text style={styles.loadingText}>Loading feedback...</Text>
      ) : feedbacks.length === 0 ? (
        <Text style={styles.noDataText}>No feedback yet</Text>
      ) : (
        <ScrollView nestedScrollEnabled style={{ maxHeight: maxListHeight }} contentContainerStyle={{ paddingVertical: 6 }}>
          {feedbacks.map((fb, idx) => {
            const images = (fb.images ?? []).filter(Boolean);
            // ensure a stable unique key: prefer server _id, fallback to createdAt + index
            const key = fb._id ?? `${fb.createdAt ?? 'fb'}-${idx}`;
            return (
              <View key={key} style={styles.stationFeedbackCard}>
                <View style={styles.stationFeedbackHeader}>
                  <Text style={styles.stationFeedbackUser}>{fb.user?.fullName || fb.user?.email || 'User'}</Text>
                  <View style={styles.stationFeedbackStars}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Text key={i} style={{ color: i < fb.rating ? '#FFD700' : '#9EA0A5', fontSize: 14 }}>{'★'}</Text>
                    ))}
                  </View>
                </View>
                {fb.comment ? <Text style={styles.stationFeedbackComment}>{fb.comment}</Text> : null}
                {images.length > 0 && (
                  <View style={styles.stationFeedbackImages}>
                    {images.map((uri, idx) => (
                      <Image key={idx} source={{ uri }} style={styles.stationFeedbackImage} />
                    ))}
                  </View>
                )}
                <Text style={styles.stationFeedbackMeta}>{new Date(fb.createdAt).toLocaleString()}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};


const LocationSation: React.FC = () => {
  const mapRef = useRef<MapComponentHandle>(null);
  const [selectedStation, setSelectedStation] = useState<any | null>(null);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [showListView, setShowListView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [recentSearches, setRecentSearches] = useState<StationInMapResponse[]>([]);
  const sheetY = useRef(new Animated.Value(height)).current; // start off-screen
  const listY = useRef(new Animated.Value(height)).current; // list view animation
  const startOffsetRef = useRef(0);
  const navigation = useNavigation<any>();
  const router = useRouter();
  const selectedStationStore = useSelectedStation();
  const favoriteIds = useFavorites();
  const allStations = useStationInMap();

  // Load recent searches on mount
  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setRecentSearches(parsed);
        }
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    };
    loadRecentSearches();
  }, []);

  // Save station to recent searches
  const addToRecentSearches = async (station: StationInMapResponse) => {
    try {
      const updated = [
        station,
        ...recentSearches.filter(s => s.id !== station.id)
      ].slice(0, 5); // Keep only 5 most recent
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  // Clear recent searches
  const clearRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  // Handle station selection from search
  const handleStationSelectFromSearch = (station: StationInMapResponse) => {
    addToRecentSearches(station);
    setSelectedStation(station);
    sSelectedStation.set(station as any);

    // Focus map on selected station
    if (station.coordinates && mapRef.current) {
      const { lat, lng } = station.coordinates;
      if (lat && lng) {
        mapRef.current.animateToRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await initFavorites();
        await getAllStationInMap();
      })();
    }, [])
  );

  useEffect(() => {
    if (selectedStationStore) {
      setSelectedStation(selectedStationStore);

      // Focus map on selected station if it has coordinates
      if (selectedStationStore.coordinates && mapRef.current) {
        const { lat, lng } = selectedStationStore.coordinates;
        if (lat && lng) {
          mapRef.current.animateToRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        }
      }
    }
  }, [selectedStationStore]);

  const handleNavigatePress = (station: Station) => {
    const stationToCamelCase = toCamelCase(station)
    const mapUrl = stationToCamelCase?.mapUrl
    Linking.openURL(mapUrl).catch((err) =>
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
          searchQuery={searchQuery}
          onStationSelect={(station) => {
            setSelectedStation(station);
          }}
        />

        <FloatingActionButtons
          onNavigatePress={() => mapRef.current?.centerOnUser()}
          onListPress={handleListPress}
        />

        {!selectedStation && !showListView && !showSearchOverlay && (
          <SearchAndFilterBar
            onSearchFocus={() => setShowSearchOverlay(true)}
          />
        )}

        {/* Search Overlay */}
        <SearchOverlay
          visible={showSearchOverlay}
          onClose={() => {
            setShowSearchOverlay(false);
            setSearchQuery('');
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onStationSelect={handleStationSelectFromSearch}
          recentSearches={recentSearches}
          onClearRecent={clearRecentSearches}
          allStations={allStations}
        />

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
                <Text style={styles.sheetTitle}> {selectedStation.stationName}</Text>
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
              {selectedStation.availableBatteries > 0 && (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => {
                    sSelectedStation.set(selectedStation);
                    router.push('/(tabs)/booking');
                  }}
                >
                  <Text style={styles.primaryButtonText}>Swap Battery</Text>
                </TouchableOpacity>
              )}
              <View style={styles.addressBot}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={styles.addressText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Address: <Text style={styles.addressRow}>{selectedStation.address}</Text>
                  </Text>
                </View>
                <TouchableOpacity style={styles.roundIconButton} onPress={() => handleNavigatePress(selectedStation)}>
                  <Ionicons name="return-up-forward-sharp" size={18} color="white" />
                </TouchableOpacity>
              </View>

              {/* Station feedback list */}
              <View style={{ marginTop: 12 }}>
                <View style={[styles.card, { paddingVertical: 12 }]}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color="#6C63FF" />
                    <Text style={styles.cardTitle}>Feedback</Text>
                  </View>
                  <StationFeedbackList stationId={selectedStation?.id} />
                </View>
              </View>
            </Animated.View>
          </>
        )}

        <StationListView
          onClose={closeListView}
          listY={listY}
          showListView={showListView}
          searchQuery={searchQuery}
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
  searchPlaceholder: {
    flex: 1,
    color: '#8b7bb8',
    fontSize: 16,
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
    marginTop: "auto"
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
  /* Card & feedback styles */
  card: {
    backgroundColor: '#1E103E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  cardTitle: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  loadingText: { color: '#bfa8ff', fontSize: 14 },
  noDataText: { color: '#9EA0A5', fontSize: 13, fontStyle: 'italic' },
  stationFeedbackCard: { backgroundColor: '#251036', borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(108,99,255,0.08)' },
  stationFeedbackHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  stationFeedbackUser: { color: '#FFF', fontWeight: '700' },
  stationFeedbackStars: { flexDirection: 'row', alignItems: 'center' },
  stationFeedbackComment: { color: '#DDD', marginTop: 6 },
  stationFeedbackImages: { flexDirection: 'row', marginTop: 8, flexWrap: 'wrap' },
  stationFeedbackImage: { width: 72, height: 72, borderRadius: 8, marginRight: 8 },
  stationFeedbackMeta: { color: '#9EA0A5', marginTop: 8, fontSize: 12, alignSelf: 'flex-end', textAlign: 'right' },

  /* Search Overlay Styles */
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0C0121',
    zIndex: 100,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#0C0121',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  searchBackButton: {
    padding: 8,
    marginRight: 8,
  },
  searchOverlayInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    padding: 0,
  },
  searchCloseButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchContent: {
    flex: 1,
  },
  recentSection: {
    padding: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearAllText: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  recentIcon: {
    marginRight: 16,
  },
  recentTextContainer: {
    flex: 1,
  },
  recentStationName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recentStationAddress: {
    color: '#9EA0A5',
    fontSize: 14,
  },
  resultsSection: {
    padding: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  resultIcon: {
    marginRight: 16,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultStationName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultStationAddress: {
    color: '#9EA0A5',
    fontSize: 14,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  noResultsSubtext: {
    color: '#9EA0A5',
    fontSize: 14,
    marginTop: 8,
  },
});

export default LocationSation;
