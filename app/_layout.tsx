import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useGameStore } from '@/stores';
import '../global.css';

export default function RootLayout() {
  const load = useGameStore((s) => s.load);

  useEffect(() => {
    load();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0a0e17' },
          animation: 'fade',
        }}
      />
    </GestureHandlerRootView>
  );
}
