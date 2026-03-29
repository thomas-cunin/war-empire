import { useCallback, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { UnitDefinition } from '@/types';
import { useGameStore } from '@/stores';
import { unitCostAtLevel, bulkPurchaseCost, applyCostReduction, formatNumber } from '@/engine';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type BuyAmount = 1 | 10 | 100 | 'max';

interface UnitCardProps {
  unit: UnitDefinition;
  locked: boolean;
}

export function UnitCard({ unit, locked }: UnitCardProps) {
  const count = useGameStore((s) => s.units.find((u) => u.id === unit.id)?.count ?? 0);
  const resources = useGameStore((s) => s.resources);
  const buyUnit = useGameStore((s) => s.buyUnit);
  const canAfford = useGameStore((s) => s.canAfford);
  const goldPerSecond = useGameStore((s) => s.goldPerSecond);

  const [buyAmount, setBuyAmount] = useState<BuyAmount>(1);
  const scale = useSharedValue(1);

  // Calculate cost for display
  const numericAmount = buyAmount === 'max' ? 1 : buyAmount; // simplified for display
  const state = useGameStore.getState();
  const rawCost = bulkPurchaseCost(unit, count, numericAmount);
  const cost = applyCostReduction(rawCost, state);
  const affordable = canAfford(cost);

  const handleBuy = useCallback(() => {
    const amount = buyAmount === 'max' ? 100 : buyAmount; // simplified max
    const success = buyUnit(unit.id, amount);
    if (success) {
      scale.value = withSequence(
        withTiming(1.05, { duration: 80 }),
        withSpring(1, { damping: 12, stiffness: 300 })
      );
    }
  }, [buyUnit, unit.id, buyAmount, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (locked) {
    return (
      <View className="bg-bg-card/50 mx-4 mb-3 rounded-xl p-4 border border-bg-elevated opacity-50">
        <View className="flex-row items-center">
          <Text className="text-3xl mr-3 opacity-30">🔒</Text>
          <View className="flex-1">
            <Text className="text-text-muted text-base font-semibold">{unit.name}</Text>
            <Text className="text-text-muted text-xs">
              Déblocage: {formatNumber(unit.unlockRequirement?.totalEarned ?? 0)} or total
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <View className="bg-bg-card mx-4 mb-3 rounded-xl p-4 border border-bg-elevated">
        <View className="flex-row items-center mb-3">
          <Text className="text-3xl mr-3">{unit.icon}</Text>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-text-primary text-base font-semibold">{unit.name}</Text>
              <Text className="text-accent-gold text-lg font-bold">{count}</Text>
            </View>
            <Text className="text-accent-green text-xs">
              +{formatNumber(unit.baseProduction * count)}/sec
            </Text>
            {unit.specialEffect && (
              <Text className="text-accent-blue text-xs mt-0.5">
                +{unit.specialEffect.boostPercent}% {unit.specialEffect.targetTier} par unité
              </Text>
            )}
          </View>
        </View>

        {/* Buy amount selector */}
        <View className="flex-row mb-2 gap-1">
          {([1, 10, 100, 'max'] as BuyAmount[]).map((amount) => (
            <Pressable
              key={String(amount)}
              onPress={() => setBuyAmount(amount)}
              className={`flex-1 py-1 rounded-md items-center ${
                buyAmount === amount ? 'bg-accent-gold/20 border border-accent-gold' : 'bg-bg-elevated'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  buyAmount === amount ? 'text-accent-gold' : 'text-text-muted'
                }`}
              >
                {amount === 'max' ? 'MAX' : `x${amount}`}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Buy button */}
        <AnimatedPressable
          onPress={handleBuy}
          disabled={!affordable}
          className={`py-2.5 rounded-lg items-center ${
            affordable ? 'bg-accent-gold' : 'bg-bg-elevated'
          }`}
        >
          <View className="flex-row items-center gap-2">
            <Text className={`font-bold ${affordable ? 'text-bg-primary' : 'text-text-muted'}`}>
              Acheter
            </Text>
            <Text className={`text-sm ${affordable ? 'text-bg-primary' : 'text-accent-red'}`}>
              🪙 {formatNumber(cost.gold)}
              {cost.steel ? ` 🔩 ${formatNumber(cost.steel)}` : ''}
              {cost.oil ? ` 🛢️ ${formatNumber(cost.oil)}` : ''}
            </Text>
          </View>
        </AnimatedPressable>
      </View>
    </Animated.View>
  );
}
