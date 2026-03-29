import { PrestigeUpgradeDefinition } from '@/types';

export const PRESTIGE_UPGRADES: PrestigeUpgradeDefinition[] = [
  {
    id: 'production_boost',
    name: 'Boost de Production',
    description: '+5% production globale par niveau',
    icon: '📈',
    baseCost: 1,
    maxLevel: 100,
    effect: { type: 'production_boost', valuePerLevel: 0.05 },
  },
  {
    id: 'cost_reduction',
    name: 'Réduction des Coûts',
    description: '-3% sur tous les coûts par niveau',
    icon: '💰',
    baseCost: 2,
    maxLevel: 50,
    effect: { type: 'cost_reduction', valuePerLevel: 0.03 },
  },
  {
    id: 'starting_gold',
    name: 'Démarrage Rapide',
    description: 'Commence avec 1000 or × niveau',
    icon: '🚀',
    baseCost: 5,
    maxLevel: 20,
    effect: { type: 'starting_gold', valuePerLevel: 1_000 },
  },
  {
    id: 'offline_bonus',
    name: 'Bonus Offline',
    description: '+10% efficacité offline par niveau',
    icon: '🌙',
    baseCost: 3,
    maxLevel: 30,
    effect: { type: 'offline_bonus', valuePerLevel: 0.10 },
  },
];

export const PRESTIGE_UPGRADE_MAP = new Map(
  PRESTIGE_UPGRADES.map((u) => [u.id, u])
);

/** Command points earned from a prestige reset */
export function calculateCommandPoints(totalGoldEarned: number): number {
  return Math.floor(Math.pow(totalGoldEarned / 1e9, 0.5));
}

/** Base offline efficiency (before prestige upgrades) */
export const BASE_OFFLINE_EFFICIENCY = 0.5;
