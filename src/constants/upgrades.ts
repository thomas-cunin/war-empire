import { UpgradeDefinition, SynergyDefinition } from '@/types';

export const UPGRADES: UpgradeDefinition[] = [
  // Unit-specific multipliers (x2 at milestone levels)
  {
    id: 'soldier_25',
    name: 'Entraînement Basique',
    description: 'x2 production Soldats',
    icon: '🪖',
    cost: { gold: 500 },
    effect: { type: 'unit_multiplier', targetUnitId: 'soldier', value: 2 },
    requirement: { unitId: 'soldier', unitCount: 25 },
  },
  {
    id: 'soldier_50',
    name: 'Entraînement Avancé',
    description: 'x2 production Soldats',
    icon: '🪖',
    cost: { gold: 5_000 },
    effect: { type: 'unit_multiplier', targetUnitId: 'soldier', value: 2 },
    requirement: { unitId: 'soldier', unitCount: 50 },
  },
  {
    id: 'sniper_25',
    name: 'Lunette Précision',
    description: 'x2 production Snipers',
    icon: '🎯',
    cost: { gold: 5_000 },
    effect: { type: 'unit_multiplier', targetUnitId: 'sniper', value: 2 },
    requirement: { unitId: 'sniper', unitCount: 25 },
  },
  {
    id: 'sniper_50',
    name: 'Camouflage Ghillie',
    description: 'x2 production Snipers',
    icon: '🎯',
    cost: { gold: 50_000 },
    effect: { type: 'unit_multiplier', targetUnitId: 'sniper', value: 2 },
    requirement: { unitId: 'sniper', unitCount: 50 },
  },
  {
    id: 'medic_25',
    name: 'Kit Médical Amélioré',
    description: 'x2 production Médecins',
    icon: '⚕️',
    cost: { gold: 25_000 },
    effect: { type: 'unit_multiplier', targetUnitId: 'medic', value: 2 },
    requirement: { unitId: 'medic', unitCount: 25 },
  },
  {
    id: 'tank_25',
    name: 'Blindage Renforcé',
    description: 'x2 production Tanks',
    icon: '🛡️',
    cost: { gold: 250_000, steel: 5_000 },
    effect: { type: 'unit_multiplier', targetUnitId: 'tank', value: 2 },
    requirement: { unitId: 'tank', unitCount: 25 },
  },
  {
    id: 'fighter_25',
    name: 'Réacteurs Améliorés',
    description: 'x2 production Avions de chasse',
    icon: '✈️',
    cost: { gold: 5_000_000, oil: 100_000 },
    effect: { type: 'unit_multiplier', targetUnitId: 'fighter', value: 2 },
    requirement: { unitId: 'fighter', unitCount: 25 },
  },

  // Global multipliers
  {
    id: 'global_infantry_boost',
    name: 'Doctrine Infanterie',
    description: 'x1.5 production toute l\'infanterie',
    icon: '📋',
    cost: { gold: 10_000 },
    effect: { type: 'global_multiplier', targetTier: 'infantry', value: 1.5 },
  },
  {
    id: 'global_vehicles_boost',
    name: 'Doctrine Blindée',
    description: 'x1.5 production tous les véhicules',
    icon: '📋',
    cost: { gold: 100_000, steel: 2_000 },
    effect: { type: 'global_multiplier', targetTier: 'vehicles', value: 1.5 },
  },
  {
    id: 'global_aviation_boost',
    name: 'Supériorité Aérienne',
    description: 'x1.5 production toute l\'aviation',
    icon: '📋',
    cost: { gold: 1_000_000, oil: 10_000 },
    effect: { type: 'global_multiplier', targetTier: 'aviation', value: 1.5 },
  },
  {
    id: 'global_naval_boost',
    name: 'Domination Navale',
    description: 'x1.5 production toute la flotte',
    icon: '📋',
    cost: { gold: 50_000_000, steel: 100_000, oil: 100_000 },
    effect: { type: 'global_multiplier', targetTier: 'naval', value: 1.5 },
  },
];

export const SYNERGIES: SynergyDefinition[] = [
  {
    id: 'tank_fighter_synergy',
    name: 'Blitzkrieg',
    description: '10 Tanks + 10 Avions de chasse = x1.5 sur les deux',
    requirements: [
      { unitId: 'tank', count: 10 },
      { unitId: 'fighter', count: 10 },
    ],
    effect: {
      type: 'multiplier',
      targetUnitIds: ['tank', 'fighter'],
      value: 1.5,
    },
  },
  {
    id: 'submarine_bomber_synergy',
    name: 'Opération Neptune',
    description: '10 Sous-marins + 10 Bombardiers = x1.5 sur les deux',
    requirements: [
      { unitId: 'submarine', count: 10 },
      { unitId: 'bomber', count: 10 },
    ],
    effect: {
      type: 'multiplier',
      targetUnitIds: ['submarine', 'bomber'],
      value: 1.5,
    },
  },
  {
    id: 'full_infantry_synergy',
    name: 'Armée Complète',
    description: '25 de chaque infanterie = x2 sur toute l\'infanterie',
    requirements: [
      { unitId: 'soldier', count: 25 },
      { unitId: 'sniper', count: 25 },
      { unitId: 'medic', count: 25 },
    ],
    effect: {
      type: 'multiplier',
      targetUnitIds: ['soldier', 'sniper', 'medic'],
      value: 2,
    },
  },
  {
    id: 'carrier_drone_synergy',
    name: 'Flotte Aéronavale',
    description: '5 Porte-avions + 20 Drones = x2 sur les deux',
    requirements: [
      { unitId: 'carrier', count: 5 },
      { unitId: 'drone', count: 20 },
    ],
    effect: {
      type: 'multiplier',
      targetUnitIds: ['carrier', 'drone'],
      value: 2,
    },
  },
];

export const UPGRADE_MAP = new Map(UPGRADES.map((u) => [u.id, u]));
export const SYNERGY_MAP = new Map(SYNERGIES.map((s) => [s.id, s]));
