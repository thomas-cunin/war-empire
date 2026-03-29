import { useEffect } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { formatNumber } from '@/engine';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WelcomeBackProps {
  gold: number;
  steel: number;
  oil: number;
  durationSec: number;
  onCollect: () => void;
}

function formatDuration(sec: number): string {
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} minutes`;
}

function AnimatedCounter({ value, delay }: { value: number; delay: number }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 8, stiffness: 300 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={style}>
      <Text className="text-accent-gold text-4xl font-bold">{formatNumber(value)}</Text>
    </Animated.View>
  );
}

export function WelcomeBack({ gold, steel, oil, durationSec, onCollect }: WelcomeBackProps) {
  const buttonScale = useSharedValue(0);
  const bgOpacity = useSharedValue(0);

  useEffect(() => {
    bgOpacity.value = withTiming(1, { duration: 500 });
    buttonScale.value = withDelay(1200, withSpring(1, { damping: 10, stiffness: 200 }));
  }, []);

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10, 14, 23, 0.95)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 200,
          padding: 24,
        },
        bgStyle,
      ]}
    >
      {/* Icon */}
      <Animated.View entering={FadeIn.delay(200).duration(500)}>
        <Text style={{ fontSize: 64, textAlign: 'center' }}>⚔️</Text>
      </Animated.View>

      {/* Title */}
      <Animated.View entering={FadeIn.delay(400).duration(500)} className="mt-4">
        <Text className="text-text-primary text-2xl font-bold text-center">
          Bon retour, Commandant !
        </Text>
        <Text className="text-text-secondary text-center text-sm mt-1">
          Vos troupes ont travaillé pendant {formatDuration(durationSec)}
        </Text>
      </Animated.View>

      {/* Rewards */}
      <View className="mt-8 w-full">
        <View className="bg-bg-card rounded-2xl p-5 border border-accent-gold/20">
          <Text className="text-text-muted text-center text-xs tracking-wider mb-4">
            RESSOURCES ACCUMULÉES
          </Text>

          <View className="items-center mb-3">
            <Text className="text-2xl mb-1">🪙</Text>
            <AnimatedCounter value={gold} delay={600} />
            <Text className="text-text-muted text-xs">Or</Text>
          </View>

          <View className="flex-row justify-around">
            {steel > 0 && (
              <View className="items-center">
                <Text className="text-lg mb-1">🔩</Text>
                <AnimatedCounter value={steel} delay={800} />
                <Text className="text-text-muted text-xs">Acier</Text>
              </View>
            )}
            {oil > 0 && (
              <View className="items-center">
                <Text className="text-lg mb-1">🛢️</Text>
                <AnimatedCounter value={oil} delay={1000} />
                <Text className="text-text-muted text-xs">Pétrole</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Collect button */}
      <Animated.View style={[buttonStyle, { width: '100%', marginTop: 24 }]}>
        <Pressable
          onPress={onCollect}
          className="bg-accent-gold py-4 rounded-xl items-center"
          style={{
            shadowColor: '#f59e0b',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Text className="text-bg-primary text-xl font-bold">💰 COLLECTER</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}
