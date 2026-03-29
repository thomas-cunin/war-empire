/** Tap mechanic constants */

export const TAP_BASE_VALUE = 1;
export const TAP_CRITICAL_CHANCE = 0.05;
export const TAP_CRITICAL_MULTIPLIER = 10;

/** Combo thresholds: taps within COMBO_WINDOW_MS count toward combo */
export const COMBO_WINDOW_MS = 500;

/** Combo multiplier tiers */
export const COMBO_TIERS = [
  { threshold: 5, multiplier: 2 },
  { threshold: 15, multiplier: 5 },
  { threshold: 30, multiplier: 10 },
] as const;

/** Max combo multiplier */
export const MAX_COMBO_MULTIPLIER = 10;
