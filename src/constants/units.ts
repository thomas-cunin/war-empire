import { UnitDefinition } from '@/types';

export const COST_MULTIPLIER = 1.15;

export const UNITS: UnitDefinition[] = [
  // ===== TIER 1 - INFANTRY =====
  {
    id: 'soldier',
    name: 'Soldat',
    nameEn: 'Soldier',
    tier: 'infantry',
    icon: '🪖',
    baseCost: { gold: 10 },
    baseProduction: 0.1,
    costMultiplier: COST_MULTIPLIER,
  },
  {
    id: 'sniper',
    name: 'Sniper',
    nameEn: 'Sniper',
    tier: 'infantry',
    icon: '🎯',
    baseCost: { gold: 100 },
    baseProduction: 1,
    costMultiplier: COST_MULTIPLIER,
  },
  {
    id: 'medic',
    name: 'Médecin',
    nameEn: 'Medic',
    tier: 'infantry',
    icon: '⚕️',
    baseCost: { gold: 500 },
    baseProduction: 5,
    costMultiplier: COST_MULTIPLIER,
    specialEffect: {
      type: 'boost_tier',
      targetTier: 'infantry',
      boostPercent: 10,
    },
  },

  // ===== TIER 2 - VEHICLES (unlock: 1,000 gold) =====
  {
    id: 'jeep',
    name: 'Jeep',
    nameEn: 'Jeep',
    tier: 'vehicles',
    icon: '🚙',
    baseCost: { gold: 1_000, steel: 50 },
    baseProduction: 20,
    costMultiplier: COST_MULTIPLIER,
    unlockRequirement: { resource: 'gold', totalEarned: 1_000 },
  },
  {
    id: 'tank',
    name: 'Tank',
    nameEn: 'Tank',
    tier: 'vehicles',
    icon: '🛡️',
    baseCost: { gold: 5_000, steel: 200 },
    baseProduction: 100,
    costMultiplier: COST_MULTIPLIER,
    unlockRequirement: { resource: 'gold', totalEarned: 1_000 },
  },
  {
    id: 'rocketLauncher',
    name: 'Lance-roquettes',
    nameEn: 'Rocket Launcher',
    tier: 'vehicles',
    icon: '🚀',
    baseCost: { gold: 25_000, steel: 500 },
    baseProduction: 500,
    costMultiplier: COST_MULTIPLIER,
    unlockRequirement: { resource: 'gold', totalEarned: 1_000 },
  },

  // ===== TIER 3 - AVIATION (unlock: 100K gold) =====
  {
    id: 'drone',
    name: 'Drone',
    nameEn: 'Drone',
    tier: 'aviation',
    icon: '🛸',
    baseCost: { gold: 50_000, oil: 1_000 },
    baseProduction: 2_000,
    costMultiplier: COST_MULTIPLIER,
    unlockRequirement: { resource: 'gold', totalEarned: 100_000 },
  },
  {
    id: 'fighter',
    name: 'Avion de chasse',
    nameEn: 'Fighter Jet',
    tier: 'aviation',
    icon: '✈️',
    baseCost: { gold: 250_000, oil: 5_000 },
    baseProduction: 10_000,
    costMultiplier: COST_MULTIPLIER,
    unlockRequirement: { resource: 'gold', totalEarned: 100_000 },
  },
  {
    id: 'bomber',
    name: 'Bombardier',
    nameEn: 'Bomber',
    tier: 'aviation',
    icon: '💣',
    baseCost: { gold: 1_000_000, oil: 20_000 },
    baseProduction: 50_000,
    costMultiplier: COST_MULTIPLIER,
    unlockRequirement: { resource: 'gold', totalEarned: 100_000 },
  },

  // ===== TIER 4 - NAVAL (unlock: 10M gold) =====
  {
    id: 'submarine',
    name: 'Sous-marin',
    nameEn: 'Submarine',
    tier: 'naval',
    icon: '🔱',
    baseCost: { gold: 5_000_000, steel: 50_000, oil: 50_000 },
    baseProduction: 200_000,
    costMultiplier: COST_MULTIPLIER,
    unlockRequirement: { resource: 'gold', totalEarned: 10_000_000 },
  },
  {
    id: 'cruiser',
    name: 'Croiseur',
    nameEn: 'Cruiser',
    tier: 'naval',
    icon: '🚢',
    baseCost: { gold: 25_000_000, steel: 200_000, oil: 200_000 },
    baseProduction: 1_000_000,
    costMultiplier: COST_MULTIPLIER,
    unlockRequirement: { resource: 'gold', totalEarned: 10_000_000 },
  },
  {
    id: 'carrier',
    name: 'Porte-avions',
    nameEn: 'Aircraft Carrier',
    tier: 'naval',
    icon: '⚓',
    baseCost: { gold: 100_000_000, steel: 1_000_000, oil: 1_000_000 },
    baseProduction: 5_000_000,
    costMultiplier: COST_MULTIPLIER,
    unlockRequirement: { resource: 'gold', totalEarned: 10_000_000 },
  },
];

export const UNIT_MAP = new Map(UNITS.map((u) => [u.id, u]));

export const TIERS_ORDER: Array<{ tier: import('@/types').UnitTier; label: string; icon: string }> = [
  { tier: 'infantry', label: 'Infanterie', icon: '🪖' },
  { tier: 'vehicles', label: 'Véhicules', icon: '🛡️' },
  { tier: 'aviation', label: 'Aviation', icon: '✈️' },
  { tier: 'naval', label: 'Naval', icon: '⚓' },
];
