import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResourceBar, TapZone } from '@/components';
import { useGameLoop } from '@/hooks';

export default function HomeScreen() {
  // Start the game loop
  useGameLoop();

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ResourceBar />
      <TapZone />
    </SafeAreaView>
  );
}
