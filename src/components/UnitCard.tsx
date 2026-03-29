import { useCallback, useState, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { UnitDefinition } from '@/types';
import { useGameStore } from '@/stores';
import {
  bulkPurchaseCost,
  maxAffordable,
  applyCostReduction,
  formatNumber,
} from '@/engine';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type BuyAmount = 1 | 10 | 100 | 'max';

interface UnitCardProps {
  unit: UnitDefinition;
  locked: boolean;
}

export function UnitCard({ unit, locked }: UnitCardProps) {
  const count = useGameStore((s) => s.units.find((u) => u.id === unit.id)?.count ?? 0);
  const gold = useGameStore((s) => s.resources.gold);
  const steel = useGameStore((s) => s.resources.steel);
  const oil = useGameStore((s) => s.resources.oil);
  const buyUnit = useGameStore((s) => s.buyUnit);
  const goldPerSecond = useGameStore((s) => s.goldPerSecond);

  const [buyAmount, setBuyAmount] = useState<BuyAmount>(1);
  const scale = useSharedValue(1);
  const buyFlash = useSharedValue(0);

  // Calculate effective amount and cost
  const effectiveAmount = useMemo(() => {
    if (buyAmount === 'max') {
      const state = useGameStore.getState();
      return maxAffordable(unit, count, gold, steel, oil);
    }
    return buyAmount;
  }, [buyAmount, count, gold, steel, oil, unit]);

  const cost = useMemo(() => {
    if (effectiveAmount <= 0) return { gold: 0, steel: undefined, oil: undefined };
    const rawCost = bulkPurchaseCost(unit, count, effectiveAmount);
    return applyCostReduction(rawCost, useGameStore.getState());
  }, [unit, count, effectiveAmount]);

  const affordable = effectiveAmount > 0 && gold >= cost.gold &&
    (!cost.steel || steel >= cost.steel) &&
    (!cost.oil || oil >= cost.oil);

  // Per-unit production (considering current count)
  const unitProduction = unit.baseProduction * count;

  const handleBuy = useCallback(() => {
    if (effectiveAmount <= 0) return;
    const success = buyUnit(unit.id, effectiveAmount);
    if (success) {
      scale.value = withSequence(
        withTiming(1.03, { duration: 60 }),
        withSpring(1, { damping: 12, stiffness: 400 })
      );
      buyFlash.value = withSequence(
        withTiming(1, { duration: 80 }),
        withTiming(0, { duration: 300 })
      );
    }
  }, [buyUnit, unit.id, effectiveAmount, scale, buyFlash]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: buyFlash.value * 0.15,
  }));

  if (locked) {
    return (
      <Animated.View entering={FadeIn.duration(400)}>
        <View className="mx-4 mb-3 rounded-xl p-4 border border-bg-elevated overflow-hidden"
          style={{ backgroundColor: 'rgba(26, 35, 50, 0.4)' }}
        >
          <View className="flex-row items-center">
            <Text className="text-3xl mr-3 opacity-30">🔒</Text>
            <View className="flex-1">
              <Text className="text-text-muted text-base font-semibold">{unit.name}</Text>
              <Text className="text-text-muted text-xs mt-0.5">
                Déblocage : {formatNumber(unit.unlockRequirement?.totalEarned ?? 0)} or total gagné
              </Text>
              <Text className="text-text-muted text-xs opacity-60">
                Production : +{formatNumber(unit.baseProduction)}/sec par unité
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={containerStyle} entering={FadeIn.duration(300)}>
      <View className="bg-bg-card mx-4 mb-3 rounded-xl p-4 border border-bg-elevated overflow-hidden">
        {/* Buy flash overlay */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: '#22c55e',
              borderRadius: 12,
            },
            flashStyle,
          ]}
          pointerEvents="none"
        />

        {/* Unit info header */}
        <View className="flex-row items-center mb-3">
          <View className="w-12 h-12 rounded-lg bg-bg-elevated items-center justify-center mr-3">
            <Text className="text-2xl">{unit.icon}</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-text-primary text-base font-bold">{unit.name}</Text>
              <View className="bg-bg-elevated px-2.5 py-0.5 rounded-full">
                <Text className="text-accent-gold text-base font-bold">{count}</Text>
              </View>
            </View>
            <View className="flex-row items-center mt-0.5">
              <Text className="text-accent-green text-xs font-semibold">
                +{formatNumber(unitProduction)}/sec
              </Text>
              <Text className="text-text-muted text-xs ml-2">
                ({formatNumber(unit.baseProduction)}/unité)
              </Text>
            </View>
            {unit.specialEffect && (
              <Text className="text-accent-blue text-xs mt-0.5">
                ✨ +{unit.specialEffect.boostPercent}% {unit.specialEffect.targetTier}/unité
              </Text>
            )}
          </View>
        </View>

        {/* Buy amount selector */}
        <View className="flex-row mb-2.5 gap-1.5">
          {([1, 10, 100, 'max'] as BuyAmount[]).map((amount) => {
            const isSelected = buyAmount === amount;
            return (
              <Pressable
                key={String(amount)}
                onPress={() => setBuyAmount(amount)}
                className={`flex-1 py-1.5 rounded-lg items-center ${
                  isSelected
                    ? 'bg-accent-gold/20 border border-accent-gold/60'
                    : 'bg-bg-elevated border border-transparent'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isSelected ? 'text-accent-gold' : 'text-text-muted'
                  }`}
                >
                  {amount === 'max' ? 'MAX' : `×${amount}`}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Buy button */}
        <Pressable
          onPress={handleBuy}
          disabled={!affordable}
          className={`py-3 rounded-xl items-center ${
            affordable ? 'bg-accent-gold' : 'bg-bg-elevated'
          }`}
          style={affordable ? {
            shadowColor: '#f59e0b',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          } : undefined}
        >
          <View className="flex-row items-center">
            <Text
              className={`font-bold mr-2 ${
                affordable ? 'text-bg-primary' : 'text-text-muted'
              }`}
            >
              {buyAmount === 'max' ? `Acheter ${effectiveAmount}` : `Acheter ×${effectiveAmount}`}
            </Text>
          </View>
          <View className="flex-row items-center mt-0.5">
            <Text
              className={`text-xs ${
                affordable
                  ? 'text-bg-primary/80'
                  : gold < cost.gold
                  ? 'text-accent-red'
                  : 'text-text-muted'
              }`}
            >
              🪙 {formatNumber(cost.gold)}
            </Text>
            {cost.steel !== undefined && cost.steel > 0 && (
              <Text
                className={`text-xs ml-2 ${
                  affordable
                    ? 'text-bg-primary/80'
                    : steel < (cost.steel ?? 0)
                    ? 'text-accent-red'
                    : 'text-text-muted'
                }`}
              >
                🔩 {formatNumber(cost.steel)}
              </Text>
            )}
            {cost.oil !== undefined && cost.oil > 0 && (
              <Text
                className={`text-xs ml-2 ${
                  affordable
                    ? 'text-bg-primary/80'
                    : oil < (cost.oil ?? 0)
                    ? 'text-accent-red'
                    : 'text-text-muted'
                }`}
              >
                🛢️ {formatNumber(cost.oil)}
              </Text>
            )}
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
}
