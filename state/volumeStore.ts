import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VolumeId } from '@/game/volumes';
import { currentRank, type ProgressFacts, type Rank, RANKS, rankUpReward } from '@/game/ranks';

interface VolumeStoreState {
  activeVolume: VolumeId | null;
  highestRankOrder: number;
  rankInitialized: boolean;
  celebrateRankId: string | null;
  hydrated: boolean;
  setActive: (id: VolumeId | null) => void;
  applyRankProgress: (
    facts: ProgressFacts,
    opts: { patron: boolean; awardInk: (n: number) => void },
  ) => Rank | null;
  initializeRankFloor: (facts: ProgressFacts) => void;
  clearRankCelebration: () => void;
  markHydrated: () => void;
  reset: () => void;
}

const KEY = 'athenaeum:volumes:v1';

export const useVolumes = create<VolumeStoreState>()(
  persist(
    (set, get) => ({
      activeVolume: null,
      highestRankOrder: 0,
      rankInitialized: false,
      celebrateRankId: null,
      hydrated: false,
      setActive: (id) => set({ activeVolume: id }),
      applyRankProgress: (facts, { patron, awardInk }) => {
        const targetOrder = currentRank(facts).order;
        const currentOrder = get().highestRankOrder;
        if (targetOrder <= currentOrder) return null;
        let topRank: Rank | null = null;
        for (const rank of RANKS) {
          if (rank.order > currentOrder && rank.order <= targetOrder) {
            awardInk(rankUpReward(rank, patron));
            topRank = rank;
          }
        }
        set({
          highestRankOrder: targetOrder,
          celebrateRankId: topRank ? topRank.id : get().celebrateRankId,
        });
        return topRank;
      },
      initializeRankFloor: (facts) => {
        if (get().rankInitialized) return;
        const currentOrder = currentRank(facts).order;
        set({
          rankInitialized: true,
          highestRankOrder: Math.max(get().highestRankOrder, currentOrder),
        });
      },
      clearRankCelebration: () => set({ celebrateRankId: null }),
      markHydrated: () => set({ hydrated: true }),
      reset: () =>
        set({
          activeVolume: null,
          highestRankOrder: 0,
          rankInitialized: false,
          celebrateRankId: null,
        }),
    }),
    {
      name: KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        activeVolume: s.activeVolume,
        highestRankOrder: s.highestRankOrder,
        rankInitialized: s.rankInitialized,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);
