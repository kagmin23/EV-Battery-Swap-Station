
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import MapComponent from '../driver/component/MapComponent';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SearchAndFilterBar: React.FC = () => {


  return (
    <View style={styles.searchBarContainer}>
      <View style={styles.searchInputWrapper}>
        <Ionicons name="search-outline" size={28} color="#fff" style={styles.searchIcon} />
        <TextInput
          placeholder="Search location"
          placeholderTextColor="#463c5d"
          style={styles.searchInput}
        />
      </View>

    </View>
  );
};
const FloatingActionButtons: React.FC = () => {
  const buttons = [

    { name: 'list-sharp', bgColor: '#0e012f' },
    { name: 'navigate-outline', bgColor: '#0e012f' },
  ];

  return (
    <View style={styles.fabContainer}>
      {buttons.map((btn, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.fabButton, { backgroundColor: btn.bgColor }]}
          accessibilityLabel={btn.name}
        >
          <Ionicons name={btn.name as keyof typeof Ionicons.glyphMap} color="white" size={24} />
        </TouchableOpacity>
      ))}
    </View>
  );
};


const LocationSation: React.FC = () => {


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appContainer}>
        <View style={styles.statusBar}>
          <Text style={styles.statusBarText}>11:42</Text>
          <Text style={styles.statusBarText}>5G 🔋</Text>
        </View>

        <MapComponent
          style={styles.mapContainer}
          onStationSelect={(station) => {
            console.log('Selected station:', station);
          }}
        />

        <FloatingActionButtons />

        <SearchAndFilterBar />
      </View>
    </SafeAreaView>
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
    paddingBottom: 4,
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#0e012f',
    borderRadius: 8,
    padding: 8,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  listIcon: {
    transform: [{ rotate: '90deg' }],
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    marginRight: 8,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 4,
    lineHeight: 20,
  },
  categoryLabel: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
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
    paddingTop: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#0e012f', // pink glow
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 20,
    zIndex: 30,
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
});

export default LocationSation;
