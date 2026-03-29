import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResourceBar } from '@/components/ResourceBar';
import { UnitCard } from '@/components/UnitCard';
import { UNITS, TIERS_ORDER } from '@/constants/units';
import { useGameStore } from '@/stores';

export default function UnitsScreen() {
  const totalGoldEarned = useGameStore((s) => s.totalGoldEarned);
  const isTierUnlocked = useGameStore((s) => s.isTierUnlocked);

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ResourceBar />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 12 }}>
        {TIERS_ORDER.map((tierInfo) => {
          const unlocked = isTierUnlocked(tierInfo.tier);
          const tierUnits = UNITS.filter((u) => u.tier === tierInfo.tier);

          return (
            <View key={tierInfo.tier} className="mb-4">
              {/* Tier header */}
              <View className="flex-row items-center px-4 mb-2">
                <Text className="text-xl mr-2">{tierInfo.icon}</Text>
                <Text
                  className={`text-lg font-bold ${
                    unlocked ? 'text-text-primary' : 'text-text-muted'
                  }`}
                >
                  {tierInfo.label}
                </Text>
                {!unlocked && (
                  <Text className="text-text-muted text-xs ml-2">
                    🔒 Bientôt...
                  </Text>
                )}
              </View>

              {tierUnits.map((unit) => (
                <UnitCard key={unit.id} unit={unit} locked={!unlocked} />
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
