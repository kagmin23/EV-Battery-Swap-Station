import { useAuth } from '@/features/auth/context/AuthContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0520' }}>
        <ActivityIndicator size="large" color="#6d4aff" />
      </View>
    );
  }

  // If user is authenticated, go to tabs
  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  // Default: go to login
  return <Redirect href="/auth/login" />;
}
