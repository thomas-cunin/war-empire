import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { ResourceBar } from '@/components/ResourceBar';
import { WorldMap } from '@/components/WorldMap';
import { TERRITORIES, CONTINENTS } from '@/constants/territories';
import { useGameStore } from '@/stores';
import { formatNumber } from '@/engine';
import { TerritoryDefinition, TerritoryBonus, ContinentId } from '@/types';

function bonusText(bonus: TerritoryBonus): string {
  switch (bonus.type) {
    case 'production_multiplier':
      return `+${(bonus.value * 100).toFixed(0)}% production${bonus.targetTier ? ` (${bonus.targetTier})` : ''}`;
    case 'gold_per_sec':
      return `+${formatNumber(bonus.value)} or/sec`;
    case 'cost_reduction':
      return `-${(bonus.value * 100).toFixed(0)}% coûts`;
    case 'tap_multiplier':
      return `+${(bonus.value * 100).toFixed(0)}% valeur tap`;
  }
}

// ============================================================
// Territory Detail Modal
// ============================================================

function TerritoryModal({
  territory,
  visible,
  onClose,
}: {
  territory: TerritoryDefinition | null;
  visible: boolean;
  onClose: () => void;
}) {
  const territories = useGameStore((s) => s.territories);
  const militaryPower = useGameStore((s) => s.militaryPower);
  const conquerTerritory = useGameStore((s) => s.conquerTerritory);

  if (!territory) return null;

  const isConquered = territories[territory.id] === 'conquered';
  const canConquer = militaryPower >= territory.requiredPower && !isConquered;
  const powerPercent = Math.min(100, (militaryPower / territory.requiredPower) * 100);

  const handleConquer = () => {
    conquerTerritory(territory.id);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      >
        <Pressable onPress={() => {}}>
          <Animated.View
            entering={SlideInDown.duration(300)}
            className="bg-bg-secondary rounded-t-3xl p-5 border-t border-bg-elevated"
          >
            {/* Header */}
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-xl bg-bg-card items-center justify-center mr-3">
                <Text className="text-2xl">
                  {isConquered ? '🏴' : canConquer ? '⚔️' : '🔒'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-text-primary text-xl font-bold">{territory.name}</Text>
                <Text className="text-text-secondary text-sm">
                  {CONTINENTS.find((c) => c.id === territory.continent)?.name}
                </Text>
              </View>
              {isConquered && (
                <View className="bg-accent-green/20 px-3 py-1 rounded-full">
                  <Text className="text-accent-green text-xs font-bold">CONQUIS</Text>
                </View>
              )}
            </View>

            {/* Power requirement */}
            <View className="bg-bg-card rounded-xl p-4 mb-3">
              <Text className="text-text-muted text-xs mb-1">PUISSANCE REQUISE</Text>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-text-primary text-lg font-bold">
                  ⚡ {formatNumber(territory.requiredPower)}
                </Text>
                <Text className={`text-sm font-bold ${canConquer || isConquered ? 'text-accent-green' : 'text-accent-red'}`}>
                  {formatNumber(militaryPower)} / {formatNumber(territory.requiredPower)}
                </Text>
              </View>
              {/* Progress bar */}
              <View className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                <View
                  className={`h-full rounded-full ${isConquered ? 'bg-accent-green' : canConquer ? 'bg-accent-blue' : 'bg-accent-red'}`}
                  style={{ width: `${Math.min(100, powerPercent)}%` }}
                />
              </View>
            </View>

            {/* Bonus */}
            <View className="bg-bg-card rounded-xl p-4 mb-4">
              <Text className="text-text-muted text-xs mb-1">BONUS</Text>
              <Text className="text-accent-gold text-base font-semibold">
                🎁 {bonusText(territory.bonus)}
              </Text>
            </View>

            {/* Action button */}
            {!isConquered && (
              <Pressable
                onPress={handleConquer}
                disabled={!canConquer}
                className={`py-4 rounded-xl items-center ${
                  canConquer ? 'bg-accent-gold' : 'bg-bg-elevated'
                }`}
              >
                <Text
                  className={`text-lg font-bold ${
                    canConquer ? 'text-bg-primary' : 'text-text-muted'
                  }`}
                >
                  {canConquer ? '⚔️ CONQUÉRIR' : `⚡ ${formatNumber(territory.requiredPower - militaryPower)} manquant`}
                </Text>
              </Pressable>
            )}
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ============================================================
// Map Screen
// ============================================================

export default function MapScreen() {
  const territories = useGameStore((s) => s.territories);
  const militaryPower = useGameStore((s) => s.militaryPower);
  const [selectedTerritory, setSelectedTerritory] = useState<TerritoryDefinition | null>(null);
  const [selectedContinent, setSelectedContinent] = useState<ContinentId | null>(null);

  const conqueredCount = Object.values(territories).filter((s) => s === 'conquered').length;

  const getStatus = (id: string) => {
    if (territories[id] === 'conquered') return 'conquered';
    const def = TERRITORIES.find((t) => t.id === id);
    if (!def) return 'locked';
    return militaryPower >= def.requiredPower * 0.5 ? 'available' : 'locked';
  };

  const filteredTerritories = selectedContinent
    ? TERRITORIES.filter((t) => t.continent === selectedContinent)
    : TERRITORIES;

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ResourceBar />

      {/* Stats bar */}
      <View className="flex-row items-center justify-between px-4 py-2 bg-bg-secondary border-b border-bg-card">
        <View className="items-center">
          <Text className="text-text-muted text-[10px]">PUISSANCE</Text>
          <Text className="text-accent-green text-base font-bold">⚡ {formatNumber(militaryPower)}</Text>
        </View>
        <View className="items-center">
          <Text className="text-text-muted text-[10px]">CONQUIS</Text>
          <Text className="text-accent-gold text-base font-bold">🏴 {conqueredCount}/{TERRITORIES.length}</Text>
        </View>
      </View>

      {/* World Map */}
      <WorldMap onSelectTerritory={setSelectedTerritory} />

      {/* Continent Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-b border-bg-card"
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 6 }}
      >
        <Pressable
          onPress={() => setSelectedContinent(null)}
          className={`px-3 py-1.5 rounded-full ${
            !selectedContinent ? 'bg-accent-gold' : 'bg-bg-card'
          }`}
        >
          <Text className={`text-xs font-bold ${!selectedContinent ? 'text-bg-primary' : 'text-text-secondary'}`}>
            Tous
          </Text>
        </Pressable>
        {CONTINENTS.map((c) => {
          const cConquered = c.territories.filter((tid) => territories[tid] === 'conquered').length;
          const isComplete = cConquered === c.territories.length;
          return (
            <Pressable
              key={c.id}
              onPress={() => setSelectedContinent(c.id)}
              className={`px-3 py-1.5 rounded-full ${
                selectedContinent === c.id
                  ? 'bg-accent-gold'
                  : isComplete
                  ? 'bg-accent-green/20 border border-accent-green'
                  : 'bg-bg-card'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  selectedContinent === c.id ? 'text-bg-primary' : isComplete ? 'text-accent-green' : 'text-text-secondary'
                }`}
              >
                {c.name} {cConquered}/{c.territories.length}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Territory List */}
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 12 }}>
        {filteredTerritories.map((territory) => {
          const status = getStatus(territory.id);
          const isConquered = status === 'conquered';
          const isAvailable = status === 'available';

          return (
            <Animated.View key={territory.id} entering={FadeIn.duration(200)}>
              <Pressable
                onPress={() => setSelectedTerritory(territory)}
                className={`mb-2 p-3.5 rounded-xl border ${
                  isConquered
                    ? 'bg-accent-green/10 border-accent-green/30'
                    : isAvailable
                    ? 'bg-bg-card border-accent-blue/30'
                    : 'bg-bg-card/50 border-bg-elevated'
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-lg mr-2.5">
                    {isConquered ? '🏴' : isAvailable ? '⚔️' : '🔒'}
                  </Text>
                  <View className="flex-1">
                    <Text className={`font-bold ${isConquered ? 'text-accent-green' : 'text-text-primary'}`}>
                      {territory.name}
                    </Text>
                    <Text className="text-text-muted text-xs mt-0.5">
                      ⚡ {formatNumber(territory.requiredPower)} • {bonusText(territory.bonus)}
                    </Text>
                  </View>
                  <Text className="text-text-muted text-xs">▸</Text>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Territory Detail Modal */}
      <TerritoryModal
        territory={selectedTerritory}
        visible={!!selectedTerritory}
        onClose={() => setSelectedTerritory(null)}
      />
    </SafeAreaView>
  );
}
