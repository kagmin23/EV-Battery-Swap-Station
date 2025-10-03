import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function HomeScreen() {
  const { user, logout, loading } = useAuth();

  const cards = [
    { label: 'Battery Swaps', value: 12, icon: 'battery-charging', color: '#6d4aff' },
    { label: 'Distance Today', value: '56 km', icon: 'speedometer', color: '#00d4aa' },
    { label: 'Active Stations', value: 4, icon: 'location', color: '#ff69b4' },
    { label: 'CO₂ Saved', value: '3.2 kg', icon: 'leaf', color: '#ffd700' },
  ];

  const quickActions = [
    { label: 'Find Station', icon: 'map', color: '#6d4aff' },
    { label: 'Swap History', icon: 'time', color: '#ff69b4' },
    { label: 'Support', icon: 'help-buoy', color: '#00d4aa' },
    { label: 'Profile', icon: 'person', color: '#ffd700' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.name}>{user?.name || user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} disabled={loading}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tổng quan hôm nay</Text>
        <View style={styles.grid}>
          {cards.map(c => (
            <View key={c.label} style={[styles.card, { backgroundColor: '#1a1233' }]}>
              <View style={[styles.iconWrap, { backgroundColor: c.color + '22' }]}> 
                <Ionicons name={c.icon as any} size={22} color={c.color} />
              </View>
              <Text style={styles.cardValue}>{c.value}</Text>
              <Text style={styles.cardLabel}>{c.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tác vụ nhanh</Text>
        <View style={styles.actionsRow}>
          {quickActions.map(a => (
            <TouchableOpacity key={a.label} style={styles.actionBtn}>
              <View style={[styles.actionIcon, { backgroundColor: a.color + '22' }]}> 
                <Ionicons name={a.icon as any} size={22} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trạng thái hệ thống</Text>
        <View style={styles.systemBox}>
          <Ionicons name="pulse" size={26} color="#6d4aff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.systemTitle}>All systems operational</Text>
            <Text style={styles.systemSubtitle}>No incidents reported</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0520', paddingHorizontal: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  greeting: { color: '#aaa', fontSize: 14 },
  name: { color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 2 },
  logoutBtn: { backgroundColor: '#231a40', padding: 10, borderRadius: 14 },
  section: { marginBottom: 28 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', borderRadius: 20, padding: 16, marginBottom: 14 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  cardValue: { color: '#fff', fontSize: 20, fontWeight: '700' },
  cardLabel: { color: '#aaa', fontSize: 12, marginTop: 4 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionBtn: { width: '48%', backgroundColor: '#1a1233', borderRadius: 20, padding: 16, marginBottom: 14 },
  actionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
  systemBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1233', padding: 16, borderRadius: 20, gap: 14 },
  systemTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  systemSubtitle: { color: '#aaa', fontSize: 12, marginTop: 2 },
});
