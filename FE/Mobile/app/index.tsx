import { useAuth } from '@/features/auth/context/AuthContext';
import { Redirect } from 'expo-router';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Redirect href="/auth/login" />;
  return <Redirect href="/(tabs)" />;
}
