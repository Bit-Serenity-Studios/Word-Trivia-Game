import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface EntitlementsState {
  patron: boolean;
  hintCredits: number;
  lastGiftKey: string | null;
  hydrated: boolean;
  grantPatron: () => void;
  addHintCredits: (n: number) => void;
  consumeHintCredit: () => boolean;
  markGiftClaimed: (dateKey: string) => void;
  hasGiftFor: (dateKey: string) => boolean;
  markHydrated: () => void;
  reset: () => void;
}

const KEY = 'athenaeum:entitlements:v1';

export const useEntitlements = create<EntitlementsState>()(
  persist(
    (set, get) => ({
      patron: false,
      hintCredits: 0,
      lastGiftKey: null,
      hydrated: false,
      grantPatron: () => set({ patron: true }),
      addHintCredits: (n) => set((s) => ({ hintCredits: s.hintCredits + Math.max(0, n) })),
      consumeHintCredit: () => {
        if (get().hintCredits <= 0) return false;
        set((s) => ({ hintCredits: s.hintCredits - 1 }));
        return true;
      },
      markGiftClaimed: (dateKey) => set({ lastGiftKey: dateKey }),
      hasGiftFor: (dateKey) => get().lastGiftKey === dateKey,
      markHydrated: () => set({ hydrated: true }),
      reset: () => set({ patron: false, hintCredits: 0, lastGiftKey: null }),
    }),
    {
      name: KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        patron: s.patron,
        hintCredits: s.hintCredits,
        lastGiftKey: s.lastGiftKey,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);
