import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TelemetryIdState {
  distinctId: string | null;
  hydrated: boolean;
  ensureId: () => string;
  reset: () => void;
  markHydrated: () => void;
}

const KEY = 'athenaeum:telemetry-id:v1';

export function generateDistinctId(rng: () => number = Math.random, at: number = Date.now()): string {
  const rand = () => Math.floor(rng() * 0x1_00000000).toString(36).padStart(7, '0');
  const timePart = at.toString(36).padStart(9, '0');
  return `ath_${timePart}_${rand()}${rand()}`;
}

export const useTelemetryId = create<TelemetryIdState>()(
  persist(
    (set, get) => ({
      distinctId: null,
      hydrated: false,
      ensureId: () => {
        const current = get().distinctId;
        if (current) return current;
        const fresh = generateDistinctId();
        set({ distinctId: fresh });
        return fresh;
      },
      reset: () => set({ distinctId: null }),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ distinctId: s.distinctId }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);
