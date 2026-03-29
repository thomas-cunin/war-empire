import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { ResourceBar } from '@/components/ResourceBar';
import { PRESTIGE_UPGRADES } from '@/constants/prestige';
import { calculateCommandPoints } from '@/constants/prestige';
import { useGameStore } from '@/stores';
import { formatNumber } from '@/engine';

export default function PrestigeScreen() {
  const totalGoldEarned = useGameStore((s) => s.totalGoldEarned);
  const commandPoints = useGameStore((s) => s.resources.commandPoints);
  const prestigeCount = useGameStore((s) => s.prestigeCount);
  const prestigeUpgrades = useGameStore((s) => s.prestigeUpgrades);
  const prestigeReset = useGameStore((s) => s.prestigeReset);
  const buyPrestigeUpgrade = useGameStore((s) => s.buyPrestigeUpgrade);

  const potentialCP = calculateCommandPoints(totalGoldEarned);
  const [resetting, setResetting] = useState(false);

  const handleReset = () => {
    if (potentialCP <= 0) return;

    Alert.alert(
      '⚠️ Reset Stratégique',
      `Vous allez repartir de zéro et gagner ${potentialCP} Points de Commandement.\n\nVos améliorations de prestige seront conservées.\n\nContinuer ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Reset !',
          style: 'destructive',
          onPress: () => {
            setResetting(true);
            setTimeout(() => {
              const result = prestigeReset();
              setResetting(false);
            }, 1500);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ResourceBar />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Prestige Info Card */}
        <View className="bg-bg-card rounded-2xl p-5 border border-accent-gold/30 mb-4">
          <Text className="text-accent-gold text-center text-xl font-bold mb-1">
            ⭐ Reset Stratégique
          </Text>
          <Text className="text-text-secondary text-center text-xs mb-4">
            Resets effectués : {prestigeCount}
          </Text>

          <View className="flex-row justify-around mb-4">
            <View className="items-center">
              <Text className="text-text-muted text-xs">PC ACTUELS</Text>
              <Text className="text-accent-gold text-2xl font-bold">{commandPoints}</Text>
            </View>
            <View className="items-center">
              <Text className="text-text-muted text-xs">PC AU RESET</Text>
              <Text className="text-accent-green text-2xl font-bold">+{potentialCP}</Text>
            </View>
          </View>

          <Text className="text-text-muted text-center text-xs mb-3">
            Or total gagné : {formatNumber(totalGoldEarned)}
          </Text>

          <Pressable
            onPress={handleReset}
            disabled={potentialCP <= 0 || resetting}
            className={`py-3 rounded-xl items-center ${
              potentialCP > 0 && !resetting
                ? 'bg-accent-red'
                : 'bg-bg-elevated'
            }`}
          >
            <Text
              className={`text-lg font-bold ${
                potentialCP > 0 && !resetting ? 'text-white' : 'text-text-muted'
              }`}
            >
              {resetting ? '💥 Reset en cours...' : `☢️ RESET (+${potentialCP} PC)`}
            </Text>
          </Pressable>
        </View>

        {/* Prestige Upgrades */}
        <Text className="text-text-primary text-lg font-bold mb-3">
          Améliorations Permanentes
        </Text>

        {PRESTIGE_UPGRADES.map((upgrade) => {
          const owned = prestigeUpgrades.find((u) => u.id === upgrade.id);
          const level = owned?.level ?? 0;
          const maxed = level >= upgrade.maxLevel;
          const canBuy = commandPoints >= upgrade.baseCost && !maxed;

          return (
            <View
              key={upgrade.id}
              className="bg-bg-card mb-3 p-4 rounded-xl border border-bg-elevated"
            >
              <View className="flex-row items-center mb-2">
                <Text className="text-2xl mr-3">{upgrade.icon}</Text>
                <View className="flex-1">
                  <Text className="text-text-primary font-semibold">{upgrade.name}</Text>
                  <Text className="text-text-secondary text-xs">{upgrade.description}</Text>
                  <Text className="text-accent-gold text-xs mt-0.5">
                    Niveau {level}/{upgrade.maxLevel}
                  </Text>
                </View>
              </View>

              {!maxed && (
                <Pressable
                  onPress={() => buyPrestigeUpgrade(upgrade.id)}
                  disabled={!canBuy}
                  className={`py-2 rounded-lg items-center ${
                    canBuy ? 'bg-accent-gold' : 'bg-bg-elevated'
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      canBuy ? 'text-bg-primary' : 'text-text-muted'
                    }`}
                  >
                    ⭐ {upgrade.baseCost} PC
                  </Text>
                </Pressable>
              )}
              {maxed && (
                <View className="py-2 items-center">
                  <Text className="text-accent-green text-sm font-bold">✅ MAX</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
