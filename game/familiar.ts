import type { RNG } from './types';
import { economy } from './economy';

export const FORAGE_DURATION_MS = economy.familiar.forageMs;

export type HoardTier = 'common' | 'rich' | 'rare';

export interface HoardReward {
  tier: HoardTier;
  ink: number;
}

export interface FamiliarState {
  taskStartedAt: number | null;
  scheduledNotificationId: string | null;
  totalHoards: number;
}

export function initialFamiliarState(): FamiliarState {
  return { taskStartedAt: null, scheduledNotificationId: null, totalHoards: 0 };
}

export function isForaging(state: FamiliarState): boolean {
  return state.taskStartedAt !== null;
}

export function elapsedMs(state: FamiliarState, now: number): number {
  if (state.taskStartedAt === null) return 0;
  return Math.max(0, now - state.taskStartedAt);
}

export function remainingMs(state: FamiliarState, now: number): number {
  if (state.taskStartedAt === null) return 0;
  return Math.max(0, FORAGE_DURATION_MS - elapsedMs(state, now));
}

export function isReady(state: FamiliarState, now: number): boolean {
  return isForaging(state) && remainingMs(state, now) === 0;
}

export function rollReward(rng: RNG): HoardReward {
  const roll = rng();
  const { rare, rich, common } = economy.familiar.reward;
  if (roll < rare.weight) return { tier: 'rare', ink: rare.ink };
  if (roll < rare.weight + rich.weight) return { tier: 'rich', ink: rich.ink };
  return { tier: 'common', ink: common.ink };
}

export function hoardFlavor(tier: HoardTier): string {
  switch (tier) {
    case 'rare':
      return 'A hoard of rare fragments. The owl looks quietly pleased.';
    case 'rich':
      return 'A generous hoard, gathered from the deeper stacks.';
    case 'common':
      return 'A modest hoard: a few pressed leaves and coins of ink.';
  }
}

export function formatRemaining(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
