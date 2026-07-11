import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type DailyMetaState,
  hasCompletedToday,
  initialDailyMeta,
  recordDailyCompletion,
  streakStandingOn,
} from '@/game/dailyMeta';

const KEY = 'athenaeum:daily:v1';

interface DailyStore extends DailyMetaState {
  hydrated: boolean;
  recordCompletion: (todayKey: string, questionId: string, ink: number) => void;
  completedToday: (todayKey: string) => boolean;
  standingStreak: (todayKey: string) => number;
  markHydrated: () => void;
}

export const useDaily = create<DailyStore>()(
  persist(
    (set, get) => ({
      ...initialDailyMeta(),
      hydrated: false,
      recordCompletion: (todayKey, questionId, ink) => {
        const next = recordDailyCompletion(get(), todayKey, questionId, ink);
        set(next);
      },
      completedToday: (todayKey) => hasCompletedToday(get(), todayKey),
      standingStreak: (todayKey) => streakStandingOn(get(), todayKey),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        lastCompletedKey: s.lastCompletedKey,
        streak: s.streak,
        bestStreak: s.bestStreak,
        lastQuestionId: s.lastQuestionId,
        lastReward: s.lastReward,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);
