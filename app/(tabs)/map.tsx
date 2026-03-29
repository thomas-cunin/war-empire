import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResourceBar } from '@/components/ResourceBar';
import { TERRITORIES, CONTINENTS } from '@/constants/territories';
import { useGameStore } from '@/stores';
import { formatNumber } from '@/engine';
import { TerritoryDefinition, TerritoryBonus, ContinentId } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_HEIGHT = 300;

function bonusText(bonus: TerritoryBonus): string {
  switch (bonus.type) {
    case 'production_multiplier':
      return `+${(bonus.value * 100).toFixed(0)}% production${bonus.targetTier ? ` (${bonus.targetTier})` : ''}`;
    case 'gold_per_sec':
      return `+${formatNumber(bonus.value)} or/sec`;
    case 'cost_reduction':
      return `-${(bonus.value * 100).toFixed(0)}% coûts`;
    case 'tap_multiplier':
      return `+${(bonus.value * 100).toFixed(0)}% tap`;
  }
}

function statusColor(status: string): string {
  switch (status) {
    case 'conquered':
      return 'bg-accent-green';
    case 'available':
      return 'bg-accent-blue';
    default:
      return 'bg-military-steel';
  }
}

function statusEmoji(status: string): string {
  switch (status) {
    case 'conquered':
      return '✅';
    case 'available':
      return '🔵';
    default:
      return '🔒';
  }
}

export default function MapScreen() {
  const territories = useGameStore((s) => s.territories);
  const militaryPower = useGameStore((s) => s.militaryPower);
  const conquerTerritory = useGameStore((s) => s.conquerTerritory);
  const [selectedTerritory, setSelectedTerritory] = useState<TerritoryDefinition | null>(null);
  const [selectedContinent, setSelectedContinent] = useState<ContinentId | null>(null);

  const getStatus = (id: string) => {
    if (territories[id] === 'conquered') return 'conquered';
    const def = TERRITORIES.find((t) => t.id === id);
    if (!def) return 'locked';
    return militaryPower >= def.requiredPower * 0.5 ? 'available' : 'locked';
  };

  const filteredTerritories = selectedContinent
    ? TERRITORIES.filter((t) => t.continent === selectedContinent)
    : TERRITORIES;

  const handleConquer = (territoryId: string) => {
    conquerTerritory(territoryId);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ResourceBar />

      {/* Military Power */}
      <View className="px-4 py-2 bg-bg-secondary border-b border-bg-card">
        <Text className="text-text-secondary text-center text-xs">PUISSANCE MILITAIRE</Text>
        <Text className="text-accent-green text-center text-xl font-bold">
          ⚡ {formatNumber(militaryPower)}
        </Text>
      </View>

      {/* Continent Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-b border-bg-card"
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}
      >
        <Pressable
          onPress={() => setSelectedContinent(null)}
          className={`px-3 py-1.5 rounded-full ${
            !selectedContinent ? 'bg-accent-gold' : 'bg-bg-card'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              !selectedContinent ? 'text-bg-primary' : 'text-text-secondary'
            }`}
          >
            Tous ({TERRITORIES.length})
          </Text>
        </Pressable>
        {CONTINENTS.map((c) => {
          const conqueredCount = c.territories.filter(
            (tid) => territories[tid] === 'conquered'
          ).length;
          const isComplete = conqueredCount === c.territories.length;
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
                  selectedContinent === c.id
                    ? 'text-bg-primary'
                    : isComplete
                    ? 'text-accent-green'
                    : 'text-text-secondary'
                }`}
              >
                {c.name} ({conqueredCount}/{c.territories.length})
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
          const canConquer = militaryPower >= territory.requiredPower && !isConquered;

          return (
            <Pressable
              key={territory.id}
              onPress={() => setSelectedTerritory(territory)}
              className={`mb-2 p-3 rounded-xl border ${
                isConquered
                  ? 'bg-accent-green/10 border-accent-green/30'
                  : isAvailable
                  ? 'bg-bg-card border-accent-blue/30'
                  : 'bg-bg-card/50 border-bg-elevated'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Text className="text-lg mr-2">{statusEmoji(status)}</Text>
                  <View className="flex-1">
                    <Text
                      className={`font-semibold ${
                        isConquered ? 'text-accent-green' : 'text-text-primary'
                      }`}
                    >
                      {territory.name}
                    </Text>
                    <Text className="text-text-muted text-xs">
                      ⚡ {formatNumber(territory.requiredPower)} requis • {bonusText(territory.bonus)}
                    </Text>
                  </View>
                </View>

                {canConquer && (
                  <Pressable
                    onPress={() => handleConquer(territory.id)}
                    className="bg-accent-gold px-3 py-1.5 rounded-lg ml-2"
                  >
                    <Text className="text-bg-primary text-xs font-bold">Conquérir</Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
