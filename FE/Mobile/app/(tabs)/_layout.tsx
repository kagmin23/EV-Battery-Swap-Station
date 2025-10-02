import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF74E2', // Pink color for active tab
        tabBarInactiveTintColor: '#A063FE', // Purple color for inactive tab
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          backgroundColor: '#190d35', // Dark purple background
          height: 80,
          paddingTop: 8,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: '#FF74E2', // Pink glow shadow
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 1,
          shadowRadius: 15,
          elevation: 20,
          borderTopWidth: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={focused ? 28 : 24}
              name={focused ? "map" : "map-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={focused ? 28 : 24}
              name={focused ? "rocket" : "rocket-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={focused ? 28 : 24}
              name={focused ? "person" : "person-outline"}
              color={color}
            />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="login"
        options={{
          title: 'Login',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={focused ? 28 : 24}
              name={focused ? "person" : "person-outline"}
              color={color}
            />
          ),
        }}
      /> */}
    </Tabs>

  );
}
