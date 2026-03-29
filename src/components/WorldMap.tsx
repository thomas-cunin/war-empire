import { useCallback } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { TerritoryDefinition } from '@/types';
import { TERRITORIES } from '@/constants/territories';
import { useGameStore } from '@/stores';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_WIDTH = SCREEN_WIDTH - 32;
const MAP_HEIGHT = 220;

interface WorldMapProps {
  onSelectTerritory: (territory: TerritoryDefinition) => void;
}

function TerritoryDot({
  territory,
  status,
  onPress,
}: {
  territory: TerritoryDefinition;
  status: 'locked' | 'available' | 'conquered';
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withTiming(1.5, { duration: 100 }),
      withSpring(1, { damping: 8, stiffness: 300 })
    );
    onPress();
  }, [onPress, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dotColor =
    status === 'conquered'
      ? '#22c55e'
      : status === 'available'
      ? '#3b82f6'
      : '#4b5563';

  const dotSize = status === 'conquered' ? 10 : 8;

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: 'absolute',
          left: territory.position.x * MAP_WIDTH - dotSize / 2,
          top: territory.position.y * MAP_HEIGHT - dotSize / 2,
        },
      ]}
    >
      <Pressable onPress={handlePress}>
        <View
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: dotColor,
            borderWidth: 1,
            borderColor: status === 'conquered' ? '#86efac' : 'transparent',
            shadowColor: dotColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: status === 'locked' ? 0 : 0.6,
            shadowRadius: 4,
            elevation: status === 'locked' ? 0 : 3,
          }}
        />
      </Pressable>
    </Animated.View>
  );
}

export function WorldMap({ onSelectTerritory }: WorldMapProps) {
  const territories = useGameStore((s) => s.territories);
  const militaryPower = useGameStore((s) => s.militaryPower);

  const getStatus = (id: string): 'locked' | 'available' | 'conquered' => {
    if (territories[id] === 'conquered') return 'conquered';
    const def = TERRITORIES.find((t) => t.id === id);
    if (!def) return 'locked';
    return militaryPower >= def.requiredPower * 0.5 ? 'available' : 'locked';
  };

  return (
    <View
      className="mx-4 mt-3 rounded-2xl overflow-hidden border border-bg-elevated"
      style={{
        width: MAP_WIDTH,
        height: MAP_HEIGHT,
        backgroundColor: '#0d1521',
      }}
    >
      {/* Grid lines for map feel */}
      {Array.from({ length: 5 }).map((_, i) => (
        <View
          key={`h${i}`}
          style={{
            position: 'absolute',
            top: ((i + 1) / 6) * MAP_HEIGHT,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: 'rgba(75, 85, 99, 0.2)',
          }}
        />
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <View
          key={`v${i}`}
          style={{
            position: 'absolute',
            left: ((i + 1) / 8) * MAP_WIDTH,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: 'rgba(75, 85, 99, 0.2)',
          }}
        />
      ))}

      {/* Territory dots */}
      {TERRITORIES.map((territory) => (
        <TerritoryDot
          key={territory.id}
          territory={territory}
          status={getStatus(territory.id)}
          onPress={() => onSelectTerritory(territory)}
        />
      ))}

      {/* Legend */}
      <View className="absolute bottom-2 right-2 flex-row items-center gap-3">
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#4b5563' }} />
          <Text className="text-text-muted" style={{ fontSize: 8 }}>Verrouillé</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#3b82f6' }} />
          <Text className="text-text-muted" style={{ fontSize: 8 }}>Disponible</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#22c55e' }} />
          <Text className="text-text-muted" style={{ fontSize: 8 }}>Conquis</Text>
        </View>
      </View>
    </View>
  );
}
