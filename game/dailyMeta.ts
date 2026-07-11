import { dateKey } from './daily';

export interface DailyMetaState {
  lastCompletedKey: string | null;
  streak: number;
  bestStreak: number;
  lastQuestionId: string | null;
  lastReward: number | null;
}

export function initialDailyMeta(): DailyMetaState {
  return { lastCompletedKey: null, streak: 0, bestStreak: 0, lastQuestionId: null, lastReward: null };
}

export function keyOffsetBy(key: string, days: number): string {
  const [y, m, d] = key.split('-').map((s) => Number(s));
  if (y === undefined || m === undefined || d === undefined) {
    throw new Error(`invalid date key: ${key}`);
  }
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dateKey(dt);
}

export function isConsecutive(previousKey: string, todayKey: string): boolean {
  return keyOffsetBy(previousKey, 1) === todayKey;
}

export function hasCompletedToday(state: DailyMetaState, todayKey: string): boolean {
  return state.lastCompletedKey === todayKey;
}

export function recordDailyCompletion(
  state: DailyMetaState,
  todayKey: string,
  questionId: string,
  ink: number,
): DailyMetaState {
  if (state.lastCompletedKey === todayKey) return state;
  const streak =
    state.lastCompletedKey && isConsecutive(state.lastCompletedKey, todayKey)
      ? state.streak + 1
      : 1;
  return {
    lastCompletedKey: todayKey,
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
    lastQuestionId: questionId,
    lastReward: ink,
  };
}

export function streakStandingOn(state: DailyMetaState, todayKey: string): number {
  if (state.lastCompletedKey === null) return 0;
  if (state.lastCompletedKey === todayKey) return state.streak;
  if (isConsecutive(state.lastCompletedKey, todayKey)) return state.streak;
  return 0;
}
