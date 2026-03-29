import { useEffect, useRef, useCallback } from 'react';
import { useFrameCallback } from 'react-native-reanimated';
import { useGameStore } from '@/stores';

const TICK_INTERVAL_MS = 100; // Update store at 10Hz (visuals at 60fps via shared values)
const SAVE_INTERVAL_MS = 30_000;

/**
 * Game loop hook.
 * - Uses reanimated's frame callback for 60fps shared value updates
 * - Throttles zustand store updates to 10Hz to avoid re-render storms
 * - Auto-saves every 30s
 */
export function useGameLoop() {
  const tick = useGameStore((s) => s.tick);
  const save = useGameStore((s) => s.save);
  const lastTickRef = useRef(Date.now());
  const lastSaveRef = useRef(Date.now());
  const accumulatorRef = useRef(0);

  // Store tick at 10Hz
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      tick(delta);

      // Auto-save
      if (now - lastSaveRef.current > SAVE_INTERVAL_MS) {
        lastSaveRef.current = now;
        save();
      }
    }, TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [tick, save]);
}
