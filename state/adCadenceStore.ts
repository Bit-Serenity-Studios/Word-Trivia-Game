import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AdCadenceState {
  solvesSinceLastInterstitial: number;
  lastInterstitialAtMs: number | null;
  hydrated: boolean;
  recordSolve: () => void;
  recordInterstitialShown: (nowMs: number) => void;
  reset: () => void;
  markHydrated: () => void;
}

const KEY = 'athenaeum:ad-cadence:v1';

export const useAdCadence = create<AdCadenceState>()(
  persist(
    (set) => ({
      solvesSinceLastInterstitial: 0,
      lastInterstitialAtMs: null,
      hydrated: false,
      recordSolve: () =>
        set((s) => ({ solvesSinceLastInterstitial: s.solvesSinceLastInterstitial + 1 })),
      recordInterstitialShown: (nowMs) =>
        set({ solvesSinceLastInterstitial: 0, lastInterstitialAtMs: nowMs }),
      reset: () => set({ solvesSinceLastInterstitial: 0, lastInterstitialAtMs: null }),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        solvesSinceLastInterstitial: s.solvesSinceLastInterstitial,
        lastInterstitialAtMs: s.lastInterstitialAtMs,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);
