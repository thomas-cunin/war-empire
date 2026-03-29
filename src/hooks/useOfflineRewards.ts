import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores';

interface OfflineReward {
  gold: number;
  steel: number;
  oil: number;
  durationSec: number;
}

/**
 * On mount, checks for offline rewards and returns them.
 * The component should display a "Welcome Back" screen if rewards > 0.
 */
export function useOfflineRewards() {
  const [rewards, setRewards] = useState<OfflineReward | null>(null);
  const [collected, setCollected] = useState(false);
  const collectOfflineRewards = useGameStore((s) => s.collectOfflineRewards);

  useEffect(() => {
    const result = collectOfflineRewards();
    if (result.gold > 0) {
      setRewards(result);
    } else {
      setCollected(true);
    }
  }, []);

  const collect = () => {
    setCollected(true);
  };

  return { rewards, collected, collect };
}
