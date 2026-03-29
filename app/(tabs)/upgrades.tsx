import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResourceBar } from '@/components/ResourceBar';
import { UPGRADES, SYNERGIES } from '@/constants/upgrades';
import { useGameStore } from '@/stores';
import { formatNumber, applyCostReduction } from '@/engine';
import { UpgradeDefinition, SynergyDefinition } from '@/types';

type Tab = 'units' | 'global' | 'synergies';

export default function UpgradesScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('units');
  const purchasedUpgrades = useGameStore((s) => s.upgrades);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const canAfford = useGameStore((s) => s.canAfford);
  const units = useGameStore((s) => s.units);

  const unitUpgrades = UPGRADES.filter((u) => u.effect.type === 'unit_multiplier');
  const globalUpgrades = UPGRADES.filter((u) => u.effect.type === 'global_multiplier');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'units', label: 'Unités' },
    { key: 'global', label: 'Global' },
    { key: 'synergies', label: 'Synergies' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ResourceBar />

      {/* Tabs */}
      <View className="flex-row border-b border-bg-card">
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 items-center ${
              activeTab === tab.key ? 'border-b-2 border-accent-gold' : ''
            }`}
          >
            <Text
              className={`text-sm font-bold ${
                activeTab === tab.key ? 'text-accent-gold' : 'text-text-muted'
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 12 }}>
        {activeTab === 'units' &&
          unitUpgrades.map((upgrade) => (
            <UpgradeCard key={upgrade.id} upgrade={upgrade} />
          ))}
        {activeTab === 'global' &&
          globalUpgrades.map((upgrade) => (
            <UpgradeCard key={upgrade.id} upgrade={upgrade} />
          ))}
        {activeTab === 'synergies' &&
          SYNERGIES.map((synergy) => (
            <SynergyCard key={synergy.id} synergy={synergy} />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function UpgradeCard({ upgrade }: { upgrade: UpgradeDefinition }) {
  const purchased = useGameStore((s) => s.upgrades.includes(upgrade.id));
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const canAfford = useGameStore((s) => s.canAfford);
  const units = useGameStore((s) => s.units);

  const state = useGameStore.getState();
  const cost = applyCostReduction(upgrade.cost, state);
  const affordable = canAfford(cost);

  // Check requirement
  let requirementMet = true;
  let requirementText = '';
  if (upgrade.requirement?.unitId) {
    const count = units.find((u) => u.id === upgrade.requirement!.unitId)?.count ?? 0;
    const needed = upgrade.requirement.unitCount ?? 0;
    requirementMet = count >= needed;
    requirementText = `Nécessite ${needed} ${upgrade.requirement.unitId}`;
  }

  return (
    <View
      className={`mb-3 p-4 rounded-xl border ${
        purchased
          ? 'bg-accent-green/10 border-accent-green/30'
          : 'bg-bg-card border-bg-elevated'
      }`}
    >
      <View className="flex-row items-center mb-2">
        <Text className="text-2xl mr-3">{upgrade.icon}</Text>
        <View className="flex-1">
          <Text className="text-text-primary font-semibold">{upgrade.name}</Text>
          <Text className="text-text-secondary text-xs">{upgrade.description}</Text>
        </View>
        {purchased && <Text className="text-accent-green text-lg">✅</Text>}
      </View>

      {!purchased && (
        <>
          {!requirementMet && (
            <Text className="text-accent-red text-xs mb-2">🔒 {requirementText}</Text>
          )}
          <Pressable
            onPress={() => buyUpgrade(upgrade.id)}
            disabled={!affordable || !requirementMet}
            className={`py-2 rounded-lg items-center ${
              affordable && requirementMet ? 'bg-accent-gold' : 'bg-bg-elevated'
            }`}
          >
            <Text
              className={`text-sm font-bold ${
                affordable && requirementMet ? 'text-bg-primary' : 'text-text-muted'
              }`}
            >
              🪙 {formatNumber(cost.gold)}
              {cost.steel ? ` 🔩 ${formatNumber(cost.steel)}` : ''}
              {cost.oil ? ` 🛢️ ${formatNumber(cost.oil)}` : ''}
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

function SynergyCard({ synergy }: { synergy: SynergyDefinition }) {
  const units = useGameStore((s) => s.units);

  const allMet = synergy.requirements.every((req) => {
    const count = units.find((u) => u.id === req.unitId)?.count ?? 0;
    return count >= req.count;
  });

  return (
    <View
      className={`mb-3 p-4 rounded-xl border ${
        allMet
          ? 'bg-accent-gold/10 border-accent-gold/30'
          : 'bg-bg-card border-bg-elevated'
      }`}
    >
      <View className="flex-row items-center mb-2">
        <Text className="text-2xl mr-3">{allMet ? '⚡' : '🔗'}</Text>
        <View className="flex-1">
          <Text className={`font-semibold ${allMet ? 'text-accent-gold' : 'text-text-primary'}`}>
            {synergy.name}
          </Text>
          <Text className="text-text-secondary text-xs">{synergy.description}</Text>
        </View>
        {allMet && <Text className="text-accent-gold text-lg">✨</Text>}
      </View>

      {/* Requirements */}
      <View className="mt-1">
        {synergy.requirements.map((req) => {
          const count = units.find((u) => u.id === req.unitId)?.count ?? 0;
          const met = count >= req.count;
          return (
            <Text
              key={req.unitId}
              className={`text-xs ${met ? 'text-accent-green' : 'text-text-muted'}`}
            >
              {met ? '✅' : '⬜'} {req.unitId}: {count}/{req.count}
            </Text>
          );
        })}
      </View>
    </View>
  );
}
