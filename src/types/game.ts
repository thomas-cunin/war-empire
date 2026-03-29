// ============================================================
// War Empire - Game Types
// ============================================================

// --- Resources ---

export interface Resources {
  gold: number;
  steel: number;
  oil: number;
  commandPoints: number;
}

export type ResourceType = keyof Resources;

// --- Units ---

export type UnitTier = 'infantry' | 'vehicles' | 'aviation' | 'naval';

export interface UnitCost {
  gold: number;
  steel?: number;
  oil?: number;
}

export interface UnitDefinition {
  id: string;
  name: string;
  nameEn: string;
  tier: UnitTier;
  icon: string;
  baseCost: UnitCost;
  baseProduction: number; // gold per second
  costMultiplier: number; // exponential cost factor (1.15)
  specialEffect?: {
    type: 'boost_tier';
    targetTier: UnitTier;
    boostPercent: number;
  };
  unlockRequirement?: {
    resource: ResourceType;
    totalEarned: number;
  };
}

export interface OwnedUnit {
  id: string;
  count: number;
}

// --- Territories ---

export type ContinentId =
  | 'europe'
  | 'asia'
  | 'africa'
  | 'northAmerica'
  | 'southAmerica'
  | 'oceania';

export type TerritoryStatus = 'locked' | 'available' | 'conquered';

export interface TerritoryBonus {
  type: 'production_multiplier' | 'gold_per_sec' | 'cost_reduction' | 'tap_multiplier';
  targetTier?: UnitTier;
  value: number;
}

export interface TerritoryDefinition {
  id: string;
  name: string;
  continent: ContinentId;
  requiredPower: number;
  bonus: TerritoryBonus;
  position: { x: number; y: number }; // relative coordinates 0-1
}

export interface ContinentBonus {
  id: ContinentId;
  name: string;
  bonus: TerritoryBonus;
  territories: string[];
}

// --- Prestige ---

export interface PrestigeUpgradeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseCost: number; // in command points
  maxLevel: number;
  effect: {
    type: 'production_boost' | 'cost_reduction' | 'starting_gold' | 'offline_bonus';
    valuePerLevel: number;
  };
}

export interface OwnedPrestigeUpgrade {
  id: string;
  level: number;
}

// --- Upgrades ---

export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: UnitCost;
  effect: {
    type: 'unit_multiplier' | 'global_multiplier' | 'synergy';
    targetUnitId?: string;
    targetTier?: UnitTier;
    value: number;
  };
  requirement?: {
    unitId?: string;
    unitCount?: number;
    upgradeId?: string;
  };
}

// --- Synergies ---

export interface SynergyDefinition {
  id: string;
  name: string;
  description: string;
  requirements: Array<{ unitId: string; count: number }>;
  effect: {
    type: 'multiplier';
    targetUnitIds: string[];
    value: number;
  };
}

// --- Tap ---

export interface TapState {
  baseValue: number;
  comboCount: number;
  comboMultiplier: number;
  lastTapTime: number;
  criticalChance: number;
  criticalMultiplier: number;
}

// --- Game State ---

export interface GameState {
  resources: Resources;
  totalGoldEarned: number;
  units: OwnedUnit[];
  territories: Record<string, TerritoryStatus>;
  upgrades: string[]; // purchased upgrade IDs
  prestigeUpgrades: OwnedPrestigeUpgrade[];
  prestigeCount: number;
  totalCommandPointsEarned: number;
  tap: TapState;
  lastSaveTime: number;
  lastOnlineTime: number;
  createdAt: number;
  stats: GameStats;
}

export interface GameStats {
  totalTaps: number;
  totalCriticalTaps: number;
  maxCombo: number;
  totalPrestigeResets: number;
  totalTimePlayedMs: number;
  totalOfflineGoldEarned: number;
}

// --- Production Cache (calculated values) ---

export interface ProductionBreakdown {
  goldPerSecond: number;
  steelPerSecond: number;
  oilPerSecond: number;
  byUnit: Record<string, number>;
  multipliers: {
    base: number;
    territorial: number;
    prestige: number;
    upgrades: number;
    synergies: number;
    total: number;
  };
}
