import { View, Text } from 'react-native';
import { useGameStore } from '@/stores';
import { formatNumber } from '@/engine';

export function ResourceBar() {
  const gold = useGameStore((s) => s.resources.gold);
  const steel = useGameStore((s) => s.resources.steel);
  const oil = useGameStore((s) => s.resources.oil);
  const goldPerSecond = useGameStore((s) => s.goldPerSecond);
  const commandPoints = useGameStore((s) => s.resources.commandPoints);

  return (
    <View className="bg-bg-secondary px-4 py-3 border-b border-bg-card">
      {/* Gold - Main resource, prominent */}
      <View className="flex-row items-center justify-center mb-1">
        <Text className="text-2xl mr-2">🪙</Text>
        <Text className="text-accent-gold text-3xl font-bold">
          {formatNumber(gold)}
        </Text>
      </View>
      <Text className="text-text-secondary text-center text-sm mb-2">
        +{formatNumber(goldPerSecond)}/sec
      </Text>

      {/* Secondary resources */}
      <View className="flex-row justify-around">
        <View className="flex-row items-center">
          <Text className="text-sm mr-1">🔩</Text>
          <Text className="text-text-primary text-sm">{formatNumber(steel)}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-sm mr-1">🛢️</Text>
          <Text className="text-text-primary text-sm">{formatNumber(oil)}</Text>
        </View>
        {commandPoints > 0 && (
          <View className="flex-row items-center">
            <Text className="text-sm mr-1">⭐</Text>
            <Text className="text-accent-gold text-sm">{formatNumber(commandPoints)}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
