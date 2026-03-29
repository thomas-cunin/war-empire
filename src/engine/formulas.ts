import { UnitCost, UnitDefinition, GameState, OwnedUnit } from '@/types';
import { UNIT_MAP, UNITS } from '@/constants/units';
import { UPGRADE_MAP, SYNERGIES } from '@/constants/upgrades';
import { PRESTIGE_UPGRADE_MAP } from '@/constants/prestige';
import { TERRITORY_MAP, CONTINENTS } from '@/constants/territories';

// ============================================================
// Cost Calculations
// ============================================================

/**
 * Cost of the Nth unit (0-indexed): baseCost * multiplier^n
 */
export function unitCostAtLevel(def: UnitDefinition, level: number): UnitCost {
  const factor = Math.pow(def.costMultiplier, level);
  return {
    gold: Math.ceil(def.baseCost.gold * factor),
    steel: def.baseCost.steel ? Math.ceil(def.baseCost.steel * factor) : undefined,
    oil: def.baseCost.oil ? Math.ceil(def.baseCost.oil * factor) : undefined,
  };
}

/**
 * Total cost to buy `count` units starting from current `owned` count.
 * Sum of geometric series: baseCost * (r^owned) * (r^count - 1) / (r - 1)
 */
export function bulkPurchaseCost(
  def: UnitDefinition,
  owned: number,
  count: number
): UnitCost {
  const r = def.costMultiplier;
  const rOwned = Math.pow(r, owned);
  const factor = (Math.pow(r, count) - 1) / (r - 1);

  return {
    gold: Math.ceil(def.baseCost.gold * rOwned * factor),
    steel: def.baseCost.steel
      ? Math.ceil(def.baseCost.steel * rOwned * factor)
      : undefined,
    oil: def.baseCost.oil
      ? Math.ceil(def.baseCost.oil * rOwned * factor)
      : undefined,
  };
}

/**
 * Maximum units affordable given current resources.
 * Solves: baseCost * r^owned * (r^n - 1) / (r-1) <= budget
 * => n = floor(log(budget * (r-1) / (baseCost * r^owned) + 1) / log(r))
 */
export function maxAffordable(
  def: UnitDefinition,
  owned: number,
  gold: number,
  steel: number,
  oil: number
): number {
  const r = def.costMultiplier;
  const rOwned = Math.pow(r, owned);

  function maxForResource(base: number, available: number): number {
    if (base === 0) return Infinity;
    const inner = (available * (r - 1)) / (base * rOwned) + 1;
    if (inner <= 1) return 0;
    return Math.floor(Math.log(inner) / Math.log(r));
  }

  let max = maxForResource(def.baseCost.gold, gold);
  if (def.baseCost.steel) {
    max = Math.min(max, maxForResource(def.baseCost.steel, steel));
  }
  if (def.baseCost.oil) {
    max = Math.min(max, maxForResource(def.baseCost.oil, oil));
  }

  return Math.max(0, max);
}

/**
 * Apply prestige cost reduction to a cost.
 */
export function applyCostReduction(cost: UnitCost, state: GameState): UnitCost {
  const prestigeReduction = getPrestigeEffect(state, 'cost_reduction');
  const territoryReduction = getTerritorialCostReduction(state);
  const totalReduction = Math.min(0.9, prestigeReduction + territoryReduction); // cap at 90%
  const factor = 1 - totalReduction;

  return {
    gold: Math.ceil(cost.gold * factor),
    steel: cost.steel ? Math.ceil(cost.steel * factor) : undefined,
    oil: cost.oil ? Math.ceil(cost.oil * factor) : undefined,
  };
}

// ============================================================
// Production Calculations
// ============================================================

/**
 * Get base production for a unit (count × baseProduction).
 */
function getBaseUnitProduction(def: UnitDefinition, count: number): number {
  return count * def.baseProduction;
}

/**
 * Get the total multiplier for a specific unit from upgrades.
 */
function getUnitUpgradeMultiplier(unitId: string, purchasedUpgrades: string[]): number {
  let mult = 1;
  for (const upgradeId of purchasedUpgrades) {
    const upgrade = UPGRADE_MAP.get(upgradeId);
    if (!upgrade) continue;
    if (upgrade.effect.type === 'unit_multiplier' && upgrade.effect.targetUnitId === unitId) {
      mult *= upgrade.effect.value;
    }
  }
  return mult;
}

/**
 * Get tier-wide multiplier from upgrades.
 */
function getTierUpgradeMultiplier(
  tier: string,
  purchasedUpgrades: string[]
): number {
  let mult = 1;
  for (const upgradeId of purchasedUpgrades) {
    const upgrade = UPGRADE_MAP.get(upgradeId);
    if (!upgrade) continue;
    if (
      upgrade.effect.type === 'global_multiplier' &&
      upgrade.effect.targetTier === tier
    ) {
      mult *= upgrade.effect.value;
    }
  }
  return mult;
}

/**
 * Get synergy multiplier for a specific unit.
 */
function getSynergyMultiplier(
  unitId: string,
  units: OwnedUnit[]
): number {
  const unitMap = new Map(units.map((u) => [u.id, u.count]));
  let mult = 1;

  for (const synergy of SYNERGIES) {
    if (!synergy.effect.targetUnitIds.includes(unitId)) continue;
    const allMet = synergy.requirements.every(
      (req) => (unitMap.get(req.unitId) ?? 0) >= req.count
    );
    if (allMet) {
      mult *= synergy.effect.value;
    }
  }

  return mult;
}

/**
 * Get the medic-style special effect boost for a tier.
 */
function getSpecialEffectBoost(tier: string, units: OwnedUnit[]): number {
  let boost = 0;
  for (const owned of units) {
    if (owned.count === 0) continue;
    const def = UNIT_MAP.get(owned.id);
    if (!def || !def.specialEffect) continue;
    if (def.specialEffect.type === 'boost_tier' && def.specialEffect.targetTier === tier) {
      boost += (def.specialEffect.boostPercent / 100) * owned.count;
    }
  }
  return 1 + boost;
}

/**
 * Get prestige effect value for a specific type.
 */
function getPrestigeEffect(
  state: GameState,
  effectType: string
): number {
  let value = 0;
  for (const pu of state.prestigeUpgrades) {
    const def = PRESTIGE_UPGRADE_MAP.get(pu.id);
    if (!def || def.effect.type !== effectType) continue;
    value += def.effect.valuePerLevel * pu.level;
  }
  return value;
}

/**
 * Get territorial production multiplier.
 */
function getTerritorialProductionMultiplier(state: GameState): number {
  let mult = 1;
  let goldPerSec = 0;

  // Individual territory bonuses
  for (const [territoryId, status] of Object.entries(state.territories)) {
    if (status !== 'conquered') continue;
    const def = TERRITORY_MAP.get(territoryId);
    if (!def) continue;
    if (def.bonus.type === 'production_multiplier') {
      mult += def.bonus.value;
    }
    if (def.bonus.type === 'gold_per_sec') {
      goldPerSec += def.bonus.value;
    }
  }

  // Continent bonuses
  for (const continent of CONTINENTS) {
    const allConquered = continent.territories.every(
      (tid) => state.territories[tid] === 'conquered'
    );
    if (!allConquered) continue;
    if (continent.bonus.type === 'production_multiplier') {
      mult += continent.bonus.value;
    }
    if (continent.bonus.type === 'gold_per_sec') {
      goldPerSec += continent.bonus.value;
    }
  }

  return mult; // goldPerSec is added separately
}

function getTerritorialCostReduction(state: GameState): number {
  let reduction = 0;

  for (const [territoryId, status] of Object.entries(state.territories)) {
    if (status !== 'conquered') continue;
    const def = TERRITORY_MAP.get(territoryId);
    if (!def || def.bonus.type !== 'cost_reduction') continue;
    reduction += def.bonus.value;
  }

  for (const continent of CONTINENTS) {
    const allConquered = continent.territories.every(
      (tid) => state.territories[tid] === 'conquered'
    );
    if (!allConquered) continue;
    if (continent.bonus.type === 'cost_reduction') {
      reduction += continent.bonus.value;
    }
  }

  return reduction;
}

function getTerritorialBonusGoldPerSec(state: GameState): number {
  let goldPerSec = 0;

  for (const [territoryId, status] of Object.entries(state.territories)) {
    if (status !== 'conquered') continue;
    const def = TERRITORY_MAP.get(territoryId);
    if (!def || def.bonus.type !== 'gold_per_sec') continue;
    goldPerSec += def.bonus.value;
  }

  for (const continent of CONTINENTS) {
    const allConquered = continent.territories.every(
      (tid) => state.territories[tid] === 'conquered'
    );
    if (!allConquered) continue;
    if (continent.bonus.type === 'gold_per_sec') {
      goldPerSec += continent.bonus.value;
    }
  }

  return goldPerSec;
}

/**
 * Calculate total gold production per second with full breakdown.
 */
export function calculateProduction(state: GameState): {
  goldPerSecond: number;
  byUnit: Record<string, number>;
} {
  const byUnit: Record<string, number> = {};
  let totalGoldPerSec = 0;

  const prestigeBoost = 1 + getPrestigeEffect(state, 'production_boost');
  const territorialMult = getTerritorialProductionMultiplier(state);

  for (const owned of state.units) {
    if (owned.count === 0) continue;
    const def = UNIT_MAP.get(owned.id);
    if (!def) continue;

    const base = getBaseUnitProduction(def, owned.count);
    const unitUpgrade = getUnitUpgradeMultiplier(owned.id, state.upgrades);
    const tierUpgrade = getTierUpgradeMultiplier(def.tier, state.upgrades);
    const synergy = getSynergyMultiplier(owned.id, state.units);
    const special = getSpecialEffectBoost(def.tier, state.units);

    const unitTotal =
      base * unitUpgrade * tierUpgrade * synergy * special * prestigeBoost * territorialMult;

    byUnit[owned.id] = unitTotal;
    totalGoldPerSec += unitTotal;
  }

  // Add flat territorial gold bonus
  totalGoldPerSec += getTerritorialBonusGoldPerSec(state);

  return { goldPerSecond: totalGoldPerSec, byUnit };
}

/**
 * Calculate military power (used for territory conquest).
 * Simple formula: sum of (unitCount * baseProduction) for all units.
 */
export function calculateMilitaryPower(state: GameState): number {
  let power = 0;
  for (const owned of state.units) {
    if (owned.count === 0) continue;
    const def = UNIT_MAP.get(owned.id);
    if (!def) continue;
    power += owned.count * def.baseProduction;
  }
  return power;
}

/**
 * Calculate tap value.
 */
export function calculateTapValue(state: GameState): number {
  const { tap } = state;
  let value = tap.baseValue;

  // Prestige boost applies to taps too
  value *= 1 + getPrestigeEffect(state, 'production_boost');

  // Territorial tap multiplier
  let tapMult = 1;
  for (const [territoryId, status] of Object.entries(state.territories)) {
    if (status !== 'conquered') continue;
    const def = TERRITORY_MAP.get(territoryId);
    if (!def || def.bonus.type !== 'tap_multiplier') continue;
    tapMult += def.bonus.value;
  }
  for (const continent of CONTINENTS) {
    const allConquered = continent.territories.every(
      (tid) => state.territories[tid] === 'conquered'
    );
    if (!allConquered) continue;
    if (continent.bonus.type === 'tap_multiplier') {
      tapMult += continent.bonus.value;
    }
  }
  value *= tapMult;

  // Combo multiplier
  value *= tap.comboMultiplier;

  // Production-based scaling: tap = baseValue + 1% of gold/sec
  const { goldPerSecond } = calculateProduction(state);
  value += goldPerSecond * 0.01;

  return value;
}

// ============================================================
// Offline Calculation
// ============================================================

export function calculateOfflineRewards(
  state: GameState,
  offlineDurationSec: number
): { gold: number; steel: number; oil: number } {
  const { goldPerSecond } = calculateProduction(state);
  const baseEfficiency = 0.5;
  const prestigeOfflineBonus = getPrestigeEffect(state, 'offline_bonus');
  const efficiency = Math.min(1, baseEfficiency + prestigeOfflineBonus);

  const gold = goldPerSecond * offlineDurationSec * efficiency;

  // Steel and oil are generated at ~10% of gold rate as a rough heuristic
  // (proper secondary resource gen can be added later)
  const steel = gold * 0.05;
  const oil = gold * 0.03;

  return { gold, steel, oil };
}

// ============================================================
// Number Formatting
// ============================================================

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

export function formatNumber(n: number): string {
  if (n < 0) return '-' + formatNumber(-n);
  if (n < 1000) return n < 10 ? n.toFixed(1) : Math.floor(n).toString();

  const tier = Math.min(
    Math.floor(Math.log10(Math.abs(n)) / 3),
    SUFFIXES.length - 1
  );
  const scaled = n / Math.pow(10, tier * 3);
  const formatted = scaled >= 100 ? Math.floor(scaled).toString() : scaled.toFixed(1);

  return formatted + SUFFIXES[tier];
}
