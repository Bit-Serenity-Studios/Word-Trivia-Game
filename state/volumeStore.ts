import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VolumeId } from '@/game/volumes';
import { currentRank, type ProgressFacts, type Rank, RANKS, rankUpReward } from '@/game/ranks';

type VolumeDateMap = Partial<Record<VolumeId, string>>;

interface VolumeStoreState {
  activeVolume: VolumeId | null;
  highestRankOrder: number;
  rankInitialized: boolean;
  celebrateRankId: string | null;
  firstOpenedAt: VolumeDateMap;
  completedAt: VolumeDateMap;
  celebrateCompletionId: VolumeId | null;
  hydrated: boolean;
  setActive: (id: VolumeId | null) => void;
  applyRankProgress: (
    facts: ProgressFacts,
    opts: { patron: boolean; awardInk: (n: number) => void },
  ) => Rank | null;
  initializeRankFloor: (facts: ProgressFacts) => void;
  clearRankCelebration: () => void;
  markOpened: (volumeId: VolumeId, isoDate: string) => boolean;
  hasBeenOpened: (volumeId: VolumeId) => boolean;
  markCompleted: (volumeId: VolumeId, isoDate: string) => boolean;
  hasBeenCompleted: (volumeId: VolumeId) => boolean;
  showCompletionCeremony: (volumeId: VolumeId) => void;
  clearCompletionCeremony: () => void;
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
      firstOpenedAt: {},
      completedAt: {},
      celebrateCompletionId: null,
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
      markOpened: (volumeId, isoDate) => {
        const existing = get().firstOpenedAt[volumeId];
        if (existing) return false;
        set((s) => ({ firstOpenedAt: { ...s.firstOpenedAt, [volumeId]: isoDate } }));
        return true;
      },
      hasBeenOpened: (volumeId) => Boolean(get().firstOpenedAt[volumeId]),
      markCompleted: (volumeId, isoDate) => {
        const existing = get().completedAt[volumeId];
        if (existing) return false;
        set((s) => ({ completedAt: { ...s.completedAt, [volumeId]: isoDate } }));
        return true;
      },
      hasBeenCompleted: (volumeId) => Boolean(get().completedAt[volumeId]),
      showCompletionCeremony: (volumeId) => set({ celebrateCompletionId: volumeId }),
      clearCompletionCeremony: () => set({ celebrateCompletionId: null }),
      markHydrated: () => set({ hydrated: true }),
      reset: () =>
        set({
          activeVolume: null,
          highestRankOrder: 0,
          rankInitialized: false,
          celebrateRankId: null,
          firstOpenedAt: {},
          completedAt: {},
          celebrateCompletionId: null,
        }),
    }),
    {
      name: KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        activeVolume: s.activeVolume,
        highestRankOrder: s.highestRankOrder,
        rankInitialized: s.rankInitialized,
        firstOpenedAt: s.firstOpenedAt,
        completedAt: s.completedAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);
