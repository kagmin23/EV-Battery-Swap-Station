import { AuthProvider } from '@/features/auth/context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React from 'react';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <Toast />
      </AuthProvider>
    </QueryClientProvider>
  );
}
