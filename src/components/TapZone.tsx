import { useCallback, useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
  SlideInDown,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useGameStore } from '@/stores';
import { formatNumber } from '@/engine';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================
// Floating Number Component (appears on tap)
// ============================================================

interface FloatingNumberData {
  id: number;
  value: number;
  x: number;
  y: number;
  isCritical: boolean;
}

function FloatingNumber({ data, onDone }: { data: FloatingNumberData; onDone: (id: number) => void }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(data.isCritical ? 1.5 : 0.8);

  useEffect(() => {
    scale.value = withSpring(data.isCritical ? 1.8 : 1.1, { damping: 8, stiffness: 300 });
    translateY.value = withTiming(-120 - Math.random() * 40, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withDelay(
      600,
      withTiming(0, { duration: 600 }, () => {
        runOnJS(onDone)(data.id);
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: data.x - 40,
          top: data.y - 10,
          width: 80,
          alignItems: 'center',
        },
        animatedStyle,
      ]}
    >
      <Text
        style={{
          fontSize: data.isCritical ? 24 : 16,
          fontWeight: 'bold',
          color: data.isCritical ? '#ef4444' : '#f59e0b',
          textShadowColor: 'rgba(0,0,0,0.8)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 3,
        }}
      >
        {data.isCritical ? '💥 ' : '+'}
        {formatNumber(data.value)}
      </Text>
    </Animated.View>
  );
}

// ============================================================
// Coin Particle (flies out on tap)
// ============================================================

interface CoinData {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

function CoinParticle({ data, onDone }: { data: CoinData; onDone: (id: number) => void }) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 600 + Math.random() * 400,
      easing: Easing.out(Easing.quad),
    });
    opacity.value = withDelay(
      500,
      withTiming(0, { duration: 300 }, () => {
        runOnJS(onDone)(data.id);
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const x = interpolate(progress.value, [0, 1], [data.startX, data.targetX]);
    const y = interpolate(progress.value, [0, 0.4, 1], [data.startY, data.startY - 80, data.targetY]);

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale: interpolate(progress.value, [0, 0.5, 1], [1, 1.2, 0.3]) },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        { position: 'absolute', width: 20, height: 20 },
        animatedStyle,
      ]}
    >
      <Text style={{ fontSize: 16 }}>🪙</Text>
    </Animated.View>
  );
}

// ============================================================
// Combo Bar
// ============================================================

function ComboBar() {
  const comboCount = useGameStore((s) => s.tap.comboCount);
  const comboMultiplier = useGameStore((s) => s.tap.comboMultiplier);

  const scale = useSharedValue(1);

  useEffect(() => {
    if (comboCount > 3) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 80 }),
        withSpring(1, { damping: 8, stiffness: 400 })
      );
    }
  }, [comboCount]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (comboCount <= 3) return null;

  return (
    <Animated.View style={animatedStyle} className="absolute top-4 z-10 items-center">
      <View className="bg-bg-card/90 px-4 py-2 rounded-full border border-accent-gold/50">
        <Text className="text-accent-gold text-lg font-bold text-center">
          🔥 COMBO x{comboMultiplier}
        </Text>
        <View className="flex-row items-center justify-center mt-1">
          {/* Combo progress dots */}
          {Array.from({ length: Math.min(comboCount, 30) }).map((_, i) => (
            <View
              key={i}
              className={`w-1.5 h-1.5 rounded-full mx-0.5 ${
                i < 5 ? 'bg-text-muted' : i < 15 ? 'bg-accent-gold' : 'bg-accent-red'
              }`}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

// ============================================================
// Main Tap Zone
// ============================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TapZone() {
  const performTap = useGameStore((s) => s.performTap);
  const militaryPower = useGameStore((s) => s.militaryPower);

  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumberData[]>([]);
  const [coins, setCoins] = useState<CoinData[]>([]);
  const nextId = useRef(0);

  const removeFloating = useCallback((id: number) => {
    setFloatingNumbers((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const removeCoin = useCallback((id: number) => {
    setCoins((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleTap = useCallback(
    (tapX: number, tapY: number) => {
      const result = performTap();

      // Scale + rotation animation (screen shake feel)
      scale.value = withSequence(
        withTiming(0.92, { duration: 40 }),
        withSpring(1, { damping: 8, stiffness: 500 })
      );

      // Slight rotation shake
      rotation.value = withSequence(
        withTiming((Math.random() - 0.5) * 4, { duration: 30 }),
        withSpring(0, { damping: 10, stiffness: 300 })
      );

      // Glow on critical
      if (result.isCritical) {
        glowOpacity.value = withSequence(
          withTiming(0.8, { duration: 50 }),
          withTiming(0, { duration: 500 })
        );
      }

      // Add floating number
      const id = nextId.current++;
      setFloatingNumbers((prev) => [
        ...prev.slice(-12),
        {
          id,
          value: result.value,
          x: tapX + (Math.random() - 0.5) * 40,
          y: tapY,
          isCritical: result.isCritical,
        },
      ]);

      // Add coin particles (more on critical)
      const coinCount = result.isCritical ? 6 : 2;
      const newCoins: CoinData[] = Array.from({ length: coinCount }).map(() => {
        const coinId = nextId.current++;
        return {
          id: coinId,
          startX: tapX - 10,
          startY: tapY - 10,
          targetX: tapX + (Math.random() - 0.5) * 150,
          targetY: tapY - 100 - Math.random() * 80,
        };
      });
      setCoins((prev) => [...prev.slice(-20), ...newCoins]);
    },
    [performTap, scale, rotation, glowOpacity]
  );

  // Gesture handler for precise tap location
  const tapGesture = Gesture.Tap().onEnd((event) => {
    runOnJS(handleTap)(event.x, event.y);
  });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateZ: `${rotation.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View className="flex-1 items-center justify-center relative">
      <ComboBar />

      {/* Floating numbers layer */}
      {floatingNumbers.map((f) => (
        <FloatingNumber key={f.id} data={f} onDone={removeFloating} />
      ))}

      {/* Coin particles layer */}
      {coins.map((c) => (
        <CoinParticle key={c.id} data={c} onDone={removeCoin} />
      ))}

      {/* Critical glow */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: '#ef4444', borderRadius: 999 },
          glowStyle,
        ]}
        pointerEvents="none"
      />

      {/* Tap area */}
      <GestureDetector gesture={tapGesture}>
        <Animated.View style={containerStyle}>
          <View className="w-56 h-56 rounded-full items-center justify-center"
            style={{
              backgroundColor: '#1a2332',
              borderWidth: 3,
              borderColor: '#f59e0b',
              shadowColor: '#f59e0b',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            {/* Inner ring */}
            <View className="w-44 h-44 rounded-full items-center justify-center"
              style={{
                borderWidth: 1,
                borderColor: 'rgba(245, 158, 11, 0.3)',
              }}
            >
              <Text style={{ fontSize: 60 }}>⚔️</Text>
              <Text className="text-accent-gold text-xs font-bold mt-1 tracking-widest">
                TAP TO ATTACK
              </Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Military power indicator */}
      <View className="mt-8 items-center">
        <Text className="text-text-muted text-xs tracking-wider">PUISSANCE MILITAIRE</Text>
        <Text className="text-accent-green text-2xl font-bold">
          ⚡ {formatNumber(militaryPower)}
        </Text>
      </View>
    </View>
  );
}
