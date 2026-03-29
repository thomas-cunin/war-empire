import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  withRepeat,
  FadeIn,
  FadeOut,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { ResourceBar } from '@/components/ResourceBar';
import { PRESTIGE_UPGRADES, calculateCommandPoints } from '@/constants/prestige';
import { useGameStore } from '@/stores';
import { formatNumber } from '@/engine';

// ============================================================
// Nuclear Reset Animation Overlay
// ============================================================

function NukeOverlay({ visible, onComplete }: { visible: boolean; onComplete: () => void }) {
  const flashOpacity = useSharedValue(0);
  const circleScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  const startAnimation = useCallback(() => {
    // Flash
    flashOpacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0.8, { duration: 100 }),
      withTiming(1, { duration: 100 }),
      withDelay(800, withTiming(0, { duration: 500 }))
    );
    // Expanding circle
    circleScale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(3, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
    // Text
    textOpacity.value = withSequence(
      withDelay(300, withTiming(1, { duration: 200 })),
      withDelay(800, withTiming(0, { duration: 300 }, () => {
        runOnJS(onComplete)();
      }))
    );
  }, [flashOpacity, circleScale, textOpacity, onComplete]);

  if (visible) {
    startAnimation();
  }

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: flashOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  if (!visible) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 100,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: '#f59e0b',
          },
          flashStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
          },
          circleStyle,
        ]}
      />
      <Animated.View style={textStyle}>
        <Text style={{ fontSize: 40, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
          ☢️
        </Text>
        <Text style={{ fontSize: 24, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
          RESET STRATÉGIQUE
        </Text>
      </Animated.View>
    </View>
  );
}

// ============================================================
// Prestige Upgrade Card
// ============================================================

function PrestigeUpgradeCard({ upgradeId }: { upgradeId: string }) {
  const upgrade = PRESTIGE_UPGRADES.find((u) => u.id === upgradeId)!;
  const commandPoints = useGameStore((s) => s.resources.commandPoints);
  const prestigeUpgrades = useGameStore((s) => s.prestigeUpgrades);
  const buyPrestigeUpgrade = useGameStore((s) => s.buyPrestigeUpgrade);

  const owned = prestigeUpgrades.find((u) => u.id === upgradeId);
  const level = owned?.level ?? 0;
  const maxed = level >= upgrade.maxLevel;
  const canBuy = commandPoints >= upgrade.baseCost && !maxed;

  const scale = useSharedValue(1);

  const handleBuy = useCallback(() => {
    const success = buyPrestigeUpgrade(upgradeId);
    if (success) {
      scale.value = withSequence(
        withTiming(1.05, { duration: 80 }),
        withTiming(1, { duration: 200 })
      );
    }
  }, [buyPrestigeUpgrade, upgradeId, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Progress bar
  const progressPercent = (level / upgrade.maxLevel) * 100;

  return (
    <Animated.View style={animatedStyle} entering={FadeIn.duration(300).delay(100)}>
      <View className="bg-bg-card mb-3 p-4 rounded-xl border border-bg-elevated">
        <View className="flex-row items-center mb-2">
          <View className="w-10 h-10 rounded-lg bg-bg-elevated items-center justify-center mr-3">
            <Text className="text-xl">{upgrade.icon}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-text-primary font-bold">{upgrade.name}</Text>
            <Text className="text-text-secondary text-xs">{upgrade.description}</Text>
          </View>
          <View className="items-end">
            <Text className="text-accent-gold text-sm font-bold">Nv.{level}</Text>
            <Text className="text-text-muted text-[10px]">/{upgrade.maxLevel}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View className="h-1.5 bg-bg-elevated rounded-full overflow-hidden mb-2.5">
          <View
            className={`h-full rounded-full ${maxed ? 'bg-accent-green' : 'bg-accent-gold'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </View>

        {!maxed ? (
          <Pressable
            onPress={handleBuy}
            disabled={!canBuy}
            className={`py-2.5 rounded-lg items-center ${
              canBuy ? 'bg-accent-gold' : 'bg-bg-elevated'
            }`}
          >
            <Text className={`text-sm font-bold ${canBuy ? 'text-bg-primary' : 'text-text-muted'}`}>
              ⭐ {upgrade.baseCost} PC → Nv.{level + 1}
            </Text>
          </Pressable>
        ) : (
          <View className="py-2.5 items-center bg-accent-green/10 rounded-lg">
            <Text className="text-accent-green text-sm font-bold">✅ NIVEAU MAX</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

// ============================================================
// Prestige Screen
// ============================================================

export default function PrestigeScreen() {
  const totalGoldEarned = useGameStore((s) => s.totalGoldEarned);
  const commandPoints = useGameStore((s) => s.resources.commandPoints);
  const prestigeCount = useGameStore((s) => s.prestigeCount);
  const prestigeReset = useGameStore((s) => s.prestigeReset);

  const potentialCP = calculateCommandPoints(totalGoldEarned);
  const [nukeVisible, setNukeVisible] = useState(false);

  const handleReset = () => {
    if (potentialCP <= 0) return;

    Alert.alert(
      '☢️ Reset Stratégique',
      `Vous repartez de zéro et gagnez ${potentialCP} Points de Commandement.\n\nVos améliorations de prestige sont conservées.\n\nContinuer ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: '💥 RESET',
          style: 'destructive',
          onPress: () => {
            setNukeVisible(true);
          },
        },
      ]
    );
  };

  const handleNukeComplete = useCallback(() => {
    prestigeReset();
    setNukeVisible(false);
  }, [prestigeReset]);

  // Next CP threshold
  const nextCPThreshold = Math.pow(potentialCP + 1, 2) * 1e9;
  const progressToNext = totalGoldEarned / nextCPThreshold;

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <NukeOverlay visible={nukeVisible} onComplete={handleNukeComplete} />

      <ResourceBar />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Prestige Header Card */}
        <View className="bg-bg-card rounded-2xl p-5 border border-accent-gold/20 mb-4"
          style={{
            shadowColor: '#f59e0b',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <Text className="text-center text-3xl mb-1">☢️</Text>
          <Text className="text-accent-gold text-center text-xl font-bold mb-0.5">
            Reset Stratégique
          </Text>
          <Text className="text-text-muted text-center text-xs mb-4">
            Resets effectués : {prestigeCount}
          </Text>

          <View className="flex-row justify-around mb-4">
            <View className="items-center flex-1">
              <Text className="text-text-muted text-[10px] tracking-wider">PC ACTUELS</Text>
              <Text className="text-accent-gold text-3xl font-bold">{commandPoints}</Text>
            </View>
            <View className="w-px bg-bg-elevated" />
            <View className="items-center flex-1">
              <Text className="text-text-muted text-[10px] tracking-wider">PC AU RESET</Text>
              <Text className="text-accent-green text-3xl font-bold">+{potentialCP}</Text>
            </View>
          </View>

          {/* Progress to next CP */}
          <View className="mb-4">
            <Text className="text-text-muted text-[10px] text-center mb-1">
              Progrès vers le prochain PC
            </Text>
            <View className="h-2 bg-bg-elevated rounded-full overflow-hidden">
              <View
                className="h-full bg-accent-gold rounded-full"
                style={{ width: `${Math.min(100, progressToNext * 100)}%` }}
              />
            </View>
            <Text className="text-text-muted text-[10px] text-center mt-1">
              {formatNumber(totalGoldEarned)} / {formatNumber(nextCPThreshold)}
            </Text>
          </View>

          <Pressable
            onPress={handleReset}
            disabled={potentialCP <= 0}
            className={`py-4 rounded-xl items-center ${
              potentialCP > 0 ? 'bg-accent-red' : 'bg-bg-elevated'
            }`}
            style={potentialCP > 0 ? {
              shadowColor: '#ef4444',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 6,
            } : undefined}
          >
            <Text className={`text-lg font-bold ${potentialCP > 0 ? 'text-white' : 'text-text-muted'}`}>
              {potentialCP > 0 ? `☢️ RESET STRATÉGIQUE (+${potentialCP} PC)` : '☢️ Pas assez d\'or total'}
            </Text>
          </Pressable>
        </View>

        {/* Prestige Upgrades */}
        <Text className="text-text-primary text-lg font-bold mb-3 ml-1">
          ⭐ Améliorations Permanentes
        </Text>

        {PRESTIGE_UPGRADES.map((upgrade) => (
          <PrestigeUpgradeCard key={upgrade.id} upgradeId={upgrade.id} />
        ))}

        {/* Bottom spacer */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
