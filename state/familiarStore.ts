import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FORAGE_DURATION_MS,
  type FamiliarState,
  type HoardReward,
  initialFamiliarState,
  isReady,
  remainingMs,
  rollReward,
} from '@/game/familiar';
import { mulberry32, seedFromString } from '@/game/rng';
import { cancelScheduled, scheduleForagingReturn } from '@/services/notifications';

const KEY = 'athenaeum:familiar:v1';

interface FamiliarStore extends FamiliarState {
  hydrated: boolean;
  startForaging: () => Promise<void>;
  cancelForaging: () => Promise<void>;
  collectHoard: (now: number) => HoardReward | null;
  ready: (now: number) => boolean;
  remaining: (now: number) => number;
  markHydrated: () => void;
}

export const useFamiliar = create<FamiliarStore>()(
  persist(
    (set, get) => ({
      ...initialFamiliarState(),
      hydrated: false,
      startForaging: async () => {
        if (get().taskStartedAt !== null) return;
        const startedAt = Date.now();
        const id = await scheduleForagingReturn(FORAGE_DURATION_MS / 1000);
        set({ taskStartedAt: startedAt, scheduledNotificationId: id });
      },
      cancelForaging: async () => {
        const id = get().scheduledNotificationId;
        await cancelScheduled(id);
        set({ taskStartedAt: null, scheduledNotificationId: null });
      },
      collectHoard: (now) => {
        const state = get();
        if (!isReady(state, now)) return null;
        void cancelScheduled(state.scheduledNotificationId);
        const seed = seedFromString(`hoard:${state.taskStartedAt ?? 0}:${state.totalHoards}`);
        const reward = rollReward(mulberry32(seed));
        set({
          taskStartedAt: null,
          scheduledNotificationId: null,
          totalHoards: state.totalHoards + 1,
        });
        return reward;
      },
      ready: (now) => isReady(get(), now),
      remaining: (now) => remainingMs(get(), now),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        taskStartedAt: s.taskStartedAt,
        scheduledNotificationId: s.scheduledNotificationId,
        totalHoards: s.totalHoards,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);
