import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GameState,
  Resources,
  OwnedUnit,
  OwnedPrestigeUpgrade,
  TerritoryStatus,
  UnitCost,
} from '@/types';
import { UNITS, UNIT_MAP } from '@/constants/units';
import { UPGRADE_MAP } from '@/constants/upgrades';
import { PRESTIGE_UPGRADE_MAP, calculateCommandPoints, BASE_OFFLINE_EFFICIENCY } from '@/constants/prestige';
import { TERRITORY_MAP } from '@/constants/territories';
import {
  unitCostAtLevel,
  bulkPurchaseCost,
  maxAffordable,
  applyCostReduction,
  calculateProduction,
  calculateMilitaryPower,
  calculateTapValue,
  calculateOfflineRewards,
} from '@/engine/formulas';
import {
  TAP_BASE_VALUE,
  TAP_CRITICAL_CHANCE,
  TAP_CRITICAL_MULTIPLIER,
  COMBO_WINDOW_MS,
  COMBO_TIERS,
} from '@/constants/tap';

const SAVE_KEY = 'war-empire-save';
const SAVE_INTERVAL_MS = 30_000; // auto-save every 30s

// ============================================================
// Initial State
// ============================================================

function createInitialState(): GameState {
  return {
    resources: { gold: 0, steel: 0, oil: 0, commandPoints: 0 },
    totalGoldEarned: 0,
    units: UNITS.map((u) => ({ id: u.id, count: 0 })),
    territories: {},
    upgrades: [],
    prestigeUpgrades: [],
    prestigeCount: 0,
    totalCommandPointsEarned: 0,
    tap: {
      baseValue: TAP_BASE_VALUE,
      comboCount: 0,
      comboMultiplier: 1,
      lastTapTime: 0,
      criticalChance: TAP_CRITICAL_CHANCE,
      criticalMultiplier: TAP_CRITICAL_MULTIPLIER,
    },
    lastSaveTime: Date.now(),
    lastOnlineTime: Date.now(),
    createdAt: Date.now(),
    stats: {
      totalTaps: 0,
      totalCriticalTaps: 0,
      maxCombo: 0,
      totalPrestigeResets: 0,
      totalTimePlayedMs: 0,
      totalOfflineGoldEarned: 0,
    },
  };
}

// ============================================================
// Store Interface
// ============================================================

interface GameStore extends GameState {
  // Derived (cached)
  goldPerSecond: number;
  militaryPower: number;

  // Actions
  tick: (deltaMs: number) => void;
  buyUnit: (unitId: string, count: number) => boolean;
  buyUpgrade: (upgradeId: string) => boolean;
  buyPrestigeUpgrade: (upgradeId: string) => boolean;
  conquerTerritory: (territoryId: string) => boolean;
  performTap: () => { value: number; isCritical: boolean };
  prestigeReset: () => { commandPointsGained: number };
  collectOfflineRewards: () => { gold: number; steel: number; oil: number; durationSec: number };

  // Persistence
  save: () => Promise<void>;
  load: () => Promise<void>;
  reset: () => void;

  // Helpers
  canAfford: (cost: UnitCost) => boolean;
  getUnitCount: (unitId: string) => number;
  isTierUnlocked: (tier: string) => boolean;
  recalculate: () => void;
}

// ============================================================
// Store
// ============================================================

export const useGameStore = create<GameStore>()((set, get) => ({
  ...createInitialState(),
  goldPerSecond: 0,
  militaryPower: 0,

  // ----------------------------------------------------------
  // Game Tick (called from game loop)
  // ----------------------------------------------------------
  tick: (deltaMs: number) => {
    const state = get();
    const deltaSec = deltaMs / 1000;
    const { goldPerSecond } = calculateProduction(state);

    // Simple secondary resource generation (proportional to gold)
    const steelPerSec = goldPerSecond * 0.05;
    const oilPerSec = goldPerSecond * 0.03;

    const goldGain = goldPerSecond * deltaSec;
    const steelGain = steelPerSec * deltaSec;
    const oilGain = oilPerSec * deltaSec;

    set({
      resources: {
        ...state.resources,
        gold: state.resources.gold + goldGain,
        steel: state.resources.steel + steelGain,
        oil: state.resources.oil + oilGain,
      },
      totalGoldEarned: state.totalGoldEarned + goldGain,
      goldPerSecond,
      militaryPower: calculateMilitaryPower(state),
      lastOnlineTime: Date.now(),
    });
  },

  // ----------------------------------------------------------
  // Buy Units
  // ----------------------------------------------------------
  buyUnit: (unitId: string, count: number) => {
    const state = get();
    const def = UNIT_MAP.get(unitId);
    if (!def) return false;

    const owned = state.units.find((u) => u.id === unitId)?.count ?? 0;
    const rawCost = bulkPurchaseCost(def, owned, count);
    const cost = applyCostReduction(rawCost, state);

    if (!get().canAfford(cost)) return false;

    const newUnits = state.units.map((u) =>
      u.id === unitId ? { ...u, count: u.count + count } : u
    );

    set({
      resources: {
        ...state.resources,
        gold: state.resources.gold - cost.gold,
        steel: state.resources.steel - (cost.steel ?? 0),
        oil: state.resources.oil - (cost.oil ?? 0),
      },
      units: newUnits,
    });

    get().recalculate();
    return true;
  },

  // ----------------------------------------------------------
  // Buy Upgrade
  // ----------------------------------------------------------
  buyUpgrade: (upgradeId: string) => {
    const state = get();
    if (state.upgrades.includes(upgradeId)) return false;

    const def = UPGRADE_MAP.get(upgradeId);
    if (!def) return false;

    const cost = applyCostReduction(def.cost, state);
    if (!get().canAfford(cost)) return false;

    // Check requirements
    if (def.requirement) {
      if (def.requirement.unitId) {
        const count = state.units.find((u) => u.id === def.requirement!.unitId)?.count ?? 0;
        if (count < (def.requirement.unitCount ?? 0)) return false;
      }
      if (def.requirement.upgradeId && !state.upgrades.includes(def.requirement.upgradeId)) {
        return false;
      }
    }

    set({
      resources: {
        ...state.resources,
        gold: state.resources.gold - cost.gold,
        steel: state.resources.steel - (cost.steel ?? 0),
        oil: state.resources.oil - (cost.oil ?? 0),
      },
      upgrades: [...state.upgrades, upgradeId],
    });

    get().recalculate();
    return true;
  },

  // ----------------------------------------------------------
  // Buy Prestige Upgrade
  // ----------------------------------------------------------
  buyPrestigeUpgrade: (upgradeId: string) => {
    const state = get();
    const def = PRESTIGE_UPGRADE_MAP.get(upgradeId);
    if (!def) return false;

    const existing = state.prestigeUpgrades.find((u) => u.id === upgradeId);
    const currentLevel = existing?.level ?? 0;
    if (currentLevel >= def.maxLevel) return false;

    const cost = def.baseCost; // CP cost doesn't scale (simple for now)
    if (state.resources.commandPoints < cost) return false;

    const newPrestigeUpgrades = existing
      ? state.prestigeUpgrades.map((u) =>
          u.id === upgradeId ? { ...u, level: u.level + 1 } : u
        )
      : [...state.prestigeUpgrades, { id: upgradeId, level: 1 }];

    set({
      resources: {
        ...state.resources,
        commandPoints: state.resources.commandPoints - cost,
      },
      prestigeUpgrades: newPrestigeUpgrades,
    });

    get().recalculate();
    return true;
  },

  // ----------------------------------------------------------
  // Conquer Territory
  // ----------------------------------------------------------
  conquerTerritory: (territoryId: string) => {
    const state = get();
    const def = TERRITORY_MAP.get(territoryId);
    if (!def) return false;

    if (state.territories[territoryId] === 'conquered') return false;

    const power = calculateMilitaryPower(state);
    if (power < def.requiredPower) return false;

    set({
      territories: {
        ...state.territories,
        [territoryId]: 'conquered' as TerritoryStatus,
      },
    });

    get().recalculate();
    return true;
  },

  // ----------------------------------------------------------
  // Tap
  // ----------------------------------------------------------
  performTap: () => {
    const state = get();
    const now = Date.now();

    // Combo logic
    let comboCount = state.tap.comboCount;
    let comboMultiplier = 1;

    if (now - state.tap.lastTapTime < COMBO_WINDOW_MS) {
      comboCount++;
    } else {
      comboCount = 1;
    }

    // Find matching combo tier
    for (const tier of COMBO_TIERS) {
      if (comboCount >= tier.threshold) {
        comboMultiplier = tier.multiplier;
      }
    }

    // Critical hit
    const isCritical = Math.random() < state.tap.criticalChance;
    const critMult = isCritical ? state.tap.criticalMultiplier : 1;

    // Calculate tap value
    const tapState: GameState = {
      ...state,
      tap: { ...state.tap, comboMultiplier },
    };
    const baseValue = calculateTapValue(tapState);
    const value = baseValue * critMult;

    set({
      resources: {
        ...state.resources,
        gold: state.resources.gold + value,
      },
      totalGoldEarned: state.totalGoldEarned + value,
      tap: {
        ...state.tap,
        comboCount,
        comboMultiplier,
        lastTapTime: now,
      },
      stats: {
        ...state.stats,
        totalTaps: state.stats.totalTaps + 1,
        totalCriticalTaps: state.stats.totalCriticalTaps + (isCritical ? 1 : 0),
        maxCombo: Math.max(state.stats.maxCombo, comboCount),
      },
    });

    return { value, isCritical };
  },

  // ----------------------------------------------------------
  // Prestige Reset
  // ----------------------------------------------------------
  prestigeReset: () => {
    const state = get();
    const cp = calculateCommandPoints(state.totalGoldEarned);
    if (cp <= 0) return { commandPointsGained: 0 };

    // Determine starting gold from prestige upgrade
    let startingGold = 0;
    const startUpgrade = state.prestigeUpgrades.find((u) => u.id === 'starting_gold');
    if (startUpgrade) {
      const def = PRESTIGE_UPGRADE_MAP.get('starting_gold');
      if (def) startingGold = def.effect.valuePerLevel * startUpgrade.level;
    }

    const freshState = createInitialState();
    set({
      ...freshState,
      resources: {
        ...freshState.resources,
        gold: startingGold,
        commandPoints: state.resources.commandPoints + cp,
      },
      prestigeUpgrades: state.prestigeUpgrades,
      prestigeCount: state.prestigeCount + 1,
      totalCommandPointsEarned: state.totalCommandPointsEarned + cp,
      stats: {
        ...state.stats,
        totalPrestigeResets: state.stats.totalPrestigeResets + 1,
      },
    });

    get().recalculate();
    return { commandPointsGained: cp };
  },

  // ----------------------------------------------------------
  // Offline Rewards
  // ----------------------------------------------------------
  collectOfflineRewards: () => {
    const state = get();
    const now = Date.now();
    const offlineSec = (now - state.lastOnlineTime) / 1000;

    if (offlineSec < 60) return { gold: 0, steel: 0, oil: 0, durationSec: 0 }; // min 1 min

    const rewards = calculateOfflineRewards(state, offlineSec);

    set({
      resources: {
        ...state.resources,
        gold: state.resources.gold + rewards.gold,
        steel: state.resources.steel + rewards.steel,
        oil: state.resources.oil + rewards.oil,
      },
      totalGoldEarned: state.totalGoldEarned + rewards.gold,
      lastOnlineTime: now,
      stats: {
        ...state.stats,
        totalOfflineGoldEarned: state.stats.totalOfflineGoldEarned + rewards.gold,
      },
    });

    return { ...rewards, durationSec: offlineSec };
  },

  // ----------------------------------------------------------
  // Persistence
  // ----------------------------------------------------------
  save: async () => {
    const state = get();
    const saveData: GameState = {
      resources: state.resources,
      totalGoldEarned: state.totalGoldEarned,
      units: state.units,
      territories: state.territories,
      upgrades: state.upgrades,
      prestigeUpgrades: state.prestigeUpgrades,
      prestigeCount: state.prestigeCount,
      totalCommandPointsEarned: state.totalCommandPointsEarned,
      tap: state.tap,
      lastSaveTime: Date.now(),
      lastOnlineTime: Date.now(),
      createdAt: state.createdAt,
      stats: state.stats,
    };
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  },

  load: async () => {
    try {
      const data = await AsyncStorage.getItem(SAVE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as Partial<GameState>;
        const initial = createInitialState();
        set({
          ...initial,
          ...parsed,
          // Merge units array safely (new units added in updates)
          units: initial.units.map((u) => {
            const saved = parsed.units?.find((su) => su.id === u.id);
            return saved ?? u;
          }),
        });
        get().recalculate();
      }
    } catch (e) {
      console.error('Failed to load save:', e);
    }
  },

  reset: () => {
    set(createInitialState());
    AsyncStorage.removeItem(SAVE_KEY);
  },

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  canAfford: (cost: UnitCost) => {
    const { resources } = get();
    if (resources.gold < cost.gold) return false;
    if (cost.steel && resources.steel < cost.steel) return false;
    if (cost.oil && resources.oil < cost.oil) return false;
    return true;
  },

  getUnitCount: (unitId: string) => {
    return get().units.find((u) => u.id === unitId)?.count ?? 0;
  },

  isTierUnlocked: (tier: string) => {
    const state = get();
    const firstUnit = UNITS.find((u) => u.tier === tier);
    if (!firstUnit || !firstUnit.unlockRequirement) return true;
    return state.totalGoldEarned >= firstUnit.unlockRequirement.totalEarned;
  },

  recalculate: () => {
    const state = get();
    const { goldPerSecond } = calculateProduction(state);
    const power = calculateMilitaryPower(state);
    set({ goldPerSecond, militaryPower: power });
  },
}));
