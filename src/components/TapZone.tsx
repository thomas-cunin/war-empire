import { useCallback, useRef } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  runOnJS,
  FadeOut,
  FadeInUp,
} from 'react-native-reanimated';
import { useGameStore } from '@/stores';
import { formatNumber } from '@/engine';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FloatingNumber {
  id: number;
  value: number;
  x: number;
  y: number;
  isCritical: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TapZone() {
  const performTap = useGameStore((s) => s.performTap);
  const comboCount = useGameStore((s) => s.tap.comboCount);
  const comboMultiplier = useGameStore((s) => s.tap.comboMultiplier);

  const scale = useSharedValue(1);
  const floatingNumbers = useRef<FloatingNumber[]>([]);
  const nextId = useRef(0);
  const [, forceUpdate] = useCallback(() => {
    let tick = 0;
    return [tick, () => { tick++; }] as const;
  }, [])();

  // Force re-render helper
  const triggerUpdate = useCallback(() => {
    // Using a simple state toggle would cause too many re-renders
    // Instead we rely on the store subscription
  }, []);

  const handleTap = useCallback(() => {
    const result = performTap();

    // Trigger scale animation
    scale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );

    // Add floating number
    const id = nextId.current++;
    const newFloat: FloatingNumber = {
      id,
      value: result.value,
      x: Math.random() * (SCREEN_WIDTH - 100) + 50,
      y: Math.random() * 50,
      isCritical: result.isCritical,
    };

    floatingNumbers.current = [...floatingNumbers.current.slice(-8), newFloat];
  }, [performTap, scale]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="flex-1 items-center justify-center relative">
      {/* Combo indicator */}
      {comboCount > 3 && (
        <View className="absolute top-4 z-10">
          <Text className="text-accent-gold text-lg font-bold text-center">
            🔥 COMBO x{comboMultiplier}
          </Text>
          <Text className="text-text-secondary text-center text-xs">
            {comboCount} taps
          </Text>
        </View>
      )}

      {/* Tap area */}
      <AnimatedPressable onPress={handleTap} style={containerStyle}>
        <View className="w-52 h-52 rounded-full bg-bg-card border-4 border-accent-gold items-center justify-center shadow-lg">
          <Text className="text-6xl">⚔️</Text>
          <Text className="text-accent-gold text-sm font-bold mt-2">TAP!</Text>
        </View>
      </AnimatedPressable>

      {/* Military power indicator */}
      <View className="mt-6">
        <MilitaryPowerDisplay />
      </View>
    </View>
  );
}

function MilitaryPowerDisplay() {
  const militaryPower = useGameStore((s) => s.militaryPower);

  return (
    <View className="items-center">
      <Text className="text-text-muted text-xs">PUISSANCE MILITAIRE</Text>
      <Text className="text-accent-green text-xl font-bold">
        ⚡ {formatNumber(militaryPower)}
      </Text>
    </View>
  );
}
