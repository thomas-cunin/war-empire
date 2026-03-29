import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useGameStore } from '@/stores';
import { useOfflineRewards } from '@/hooks';
import { WelcomeBack } from '@/components/WelcomeBack';
import '../global.css';

function OfflineRewardsWrapper({ children }: { children: React.ReactNode }) {
  const { rewards, collected, collect } = useOfflineRewards();

  return (
    <View style={{ flex: 1 }}>
      {children}
      {rewards && !collected && (
        <WelcomeBack
          gold={rewards.gold}
          steel={rewards.steel}
          oil={rewards.oil}
          durationSec={rewards.durationSec}
          onCollect={collect}
        />
      )}
    </View>
  );
}

export default function RootLayout() {
  const load = useGameStore((s) => s.load);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    load().then(() => setLoaded(true));
  }, []);

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: '#0a0e17' }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <OfflineRewardsWrapper>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0a0e17' },
            animation: 'fade',
          }}
        />
      </OfflineRewardsWrapper>
    </GestureHandlerRootView>
  );
}
