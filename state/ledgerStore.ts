import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from './storage';

export interface LedgerState {
  ink: number;
  streak: number;
  entries: number;
  seenIds: string[];
  hydrated: boolean;

  awardInk: (amount: number) => void;
  spendInk: (amount: number) => boolean;
  recordEntry: (questionId: string) => void;
  breakStreak: () => void;
  reset: () => void;
  markHydrated: () => void;
}

export const useLedger = create<LedgerState>()(
  persist(
    (set, get) => ({
      ink: 0,
      streak: 0,
      entries: 0,
      seenIds: [],
      hydrated: false,
      awardInk: (amount) => set((s) => ({ ink: s.ink + Math.max(0, amount) })),
      spendInk: (amount) => {
        const cost = Math.max(0, amount);
        if (get().ink < cost) return false;
        set((s) => ({ ink: s.ink - cost }));
        return true;
      },
      recordEntry: (questionId) =>
        set((s) => ({
          entries: s.entries + 1,
          streak: s.streak + 1,
          seenIds: s.seenIds.includes(questionId) ? s.seenIds : [...s.seenIds, questionId],
        })),
      breakStreak: () => set({ streak: 0 }),
      reset: () => set({ ink: 0, streak: 0, entries: 0, seenIds: [] }),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: StorageKeys.ledger,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ ink: s.ink, streak: s.streak, entries: s.entries, seenIds: s.seenIds }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);
