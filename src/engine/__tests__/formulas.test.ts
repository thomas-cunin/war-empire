import {
  unitCostAtLevel,
  bulkPurchaseCost,
  maxAffordable,
  calculateProduction,
  calculateMilitaryPower,
  calculateTapValue,
  calculateOfflineRewards,
  formatNumber,
} from '../formulas';
import { UNITS, UNIT_MAP } from '../../constants/units';
import { GameState } from '../../types';

// Helper: create a minimal game state
function createTestState(overrides: Partial<GameState> = {}): GameState {
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
      baseValue: 1,
      comboCount: 0,
      comboMultiplier: 1,
      lastTapTime: 0,
      criticalChance: 0.05,
      criticalMultiplier: 10,
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
    ...overrides,
  };
}

describe('unitCostAtLevel', () => {
  const soldier = UNIT_MAP.get('soldier')!;

  test('level 0 cost equals base cost', () => {
    const cost = unitCostAtLevel(soldier, 0);
    expect(cost.gold).toBe(10);
  });

  test('cost increases exponentially', () => {
    const cost1 = unitCostAtLevel(soldier, 1);
    expect(cost1.gold).toBe(Math.ceil(10 * 1.15));

    const cost10 = unitCostAtLevel(soldier, 10);
    expect(cost10.gold).toBe(Math.ceil(10 * Math.pow(1.15, 10)));
  });

  test('tank cost includes steel', () => {
    const tank = UNIT_MAP.get('tank')!;
    const cost = unitCostAtLevel(tank, 0);
    expect(cost.gold).toBe(5000);
    expect(cost.steel).toBe(200);
  });
});

describe('bulkPurchaseCost', () => {
  const soldier = UNIT_MAP.get('soldier')!;

  test('buying 1 from 0 equals base cost', () => {
    const cost = bulkPurchaseCost(soldier, 0, 1);
    expect(cost.gold).toBe(10);
  });

  test('buying 10 from 0 costs more than 10x base', () => {
    const cost = bulkPurchaseCost(soldier, 0, 10);
    expect(cost.gold).toBeGreaterThan(100);
  });

  test('buying from higher level costs more', () => {
    const costFrom0 = bulkPurchaseCost(soldier, 0, 5);
    const costFrom10 = bulkPurchaseCost(soldier, 10, 5);
    expect(costFrom10.gold).toBeGreaterThan(costFrom0.gold);
  });
});

describe('maxAffordable', () => {
  const soldier = UNIT_MAP.get('soldier')!;

  test('can afford 0 with no gold', () => {
    expect(maxAffordable(soldier, 0, 0, 0, 0)).toBe(0);
  });

  test('can afford at least 1 with base cost gold', () => {
    expect(maxAffordable(soldier, 0, 10, 0, 0)).toBeGreaterThanOrEqual(1);
  });

  test('can afford many with lots of gold', () => {
    expect(maxAffordable(soldier, 0, 1_000_000, 0, 0)).toBeGreaterThan(50);
  });
});

describe('calculateProduction', () => {
  test('zero units = zero production', () => {
    const state = createTestState();
    const result = calculateProduction(state);
    expect(result.goldPerSecond).toBe(0);
  });

  test('10 soldiers = 1 gold/sec', () => {
    const state = createTestState({
      units: UNITS.map((u) => ({
        id: u.id,
        count: u.id === 'soldier' ? 10 : 0,
      })),
    });
    const result = calculateProduction(state);
    expect(result.goldPerSecond).toBeCloseTo(1, 1);
  });

  test('mixed units produce more', () => {
    const state = createTestState({
      units: UNITS.map((u) => ({
        id: u.id,
        count: u.id === 'soldier' ? 10 : u.id === 'sniper' ? 5 : 0,
      })),
    });
    const result = calculateProduction(state);
    expect(result.goldPerSecond).toBeGreaterThan(5);
  });
});

describe('calculateMilitaryPower', () => {
  test('zero units = zero power', () => {
    const state = createTestState();
    expect(calculateMilitaryPower(state)).toBe(0);
  });

  test('power scales with units', () => {
    const state = createTestState({
      units: UNITS.map((u) => ({
        id: u.id,
        count: u.id === 'tank' ? 5 : 0,
      })),
    });
    expect(calculateMilitaryPower(state)).toBe(500); // 5 * 100
  });
});

describe('formatNumber', () => {
  test('small numbers', () => {
    expect(formatNumber(5)).toBe('5.0');
    expect(formatNumber(42)).toBe('42');
    expect(formatNumber(999)).toBe('999');
  });

  test('thousands', () => {
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(10000)).toBe('10.0K');
  });

  test('millions', () => {
    expect(formatNumber(1_500_000)).toBe('1.5M');
    expect(formatNumber(100_000_000)).toBe('100M');
  });

  test('billions', () => {
    expect(formatNumber(1_000_000_000)).toBe('1.0B');
  });
});

describe('calculateOfflineRewards', () => {
  test('no production = no offline rewards', () => {
    const state = createTestState();
    const rewards = calculateOfflineRewards(state, 3600);
    expect(rewards.gold).toBe(0);
  });

  test('offline rewards are 50% efficient by default', () => {
    const state = createTestState({
      units: UNITS.map((u) => ({
        id: u.id,
        count: u.id === 'soldier' ? 100 : 0,
      })),
    });
    const { goldPerSecond } = calculateProduction(state);
    const rewards = calculateOfflineRewards(state, 3600);
    // 50% efficiency
    expect(rewards.gold).toBeCloseTo(goldPerSecond * 3600 * 0.5, 0);
  });
});
