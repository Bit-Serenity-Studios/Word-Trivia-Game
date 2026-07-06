import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  completedAt: string | null;
  askedNotificationAt: string | null;
  hydrated: boolean;
  markCompleted: (isoDate: string) => void;
  markNotificationAsked: (isoDate: string) => void;
  markHydrated: () => void;
  reset: () => void;
}

const KEY = 'athenaeum:onboarding:v1';

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set) => ({
      completedAt: null,
      askedNotificationAt: null,
      hydrated: false,
      markCompleted: (isoDate) => set({ completedAt: isoDate }),
      markNotificationAsked: (isoDate) => set({ askedNotificationAt: isoDate }),
      markHydrated: () => set({ hydrated: true }),
      reset: () => set({ completedAt: null, askedNotificationAt: null }),
    }),
    {
      name: KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        completedAt: s.completedAt,
        askedNotificationAt: s.askedNotificationAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);
