import { create } from 'zustand';
import type { RoundState } from '@/game/types';
import {
  buildRound,
  checkAnswer,
  clearWrongTiles,
  incrementWrong,
  placeTile,
  returnTile,
} from '@/game/round';
import { revealLetter } from '@/game/hints';
import { mulberry32, seedFromString } from '@/game/rng';
import { bundledSource } from '@/content/source';
import { computeReward, HINT_COST } from '@/game/scoring';
import { useLedger } from './ledgerStore';

export type Phase = 'playing' | 'resolving-correct' | 'resolving-wrong' | 'idle';

export type HintFailure = 'no-target' | 'insufficient-ink';

interface GameStore {
  round: RoundState | null;
  phase: Phase;
  lastReward: number | null;
  wrongFlash: number;

  startNext: () => void;
  place: (tileId: string) => void;
  returnFromSlot: (slotIndex: number) => void;
  submit: () => 'correct' | 'wrong' | 'incomplete';
  revealHint: () => { ok: boolean; reason?: HintFailure };
  revealHintFree: () => { ok: boolean; reason?: HintFailure };
  awardBonusInk: (amount: number) => void;
  advance: () => void;
}

function newRoundState(): RoundState {
  const ledger = useLedger.getState();
  const seedSource = `${ledger.entries}:${ledger.seenIds.length}:${ledger.ink}`;
  const rng = mulberry32(seedFromString(seedSource) ^ ((Date.now() & 0xffffffff) >>> 0));
  const question = bundledSource.nextQuestion({
    entriesSolved: ledger.entries,
    seenIds: ledger.seenIds,
    rng,
  });
  return buildRound(question, rng);
}

function resolveIfComplete(
  set: (partial: Partial<GameStore>) => void,
  get: () => GameStore,
): void {
  const after = get().round;
  if (!after) return;
  const check = checkAnswer(after);
  if (check !== 'correct') return;
  const ledger = useLedger.getState();
  const reward = computeReward({
    answerLength: after.question.answer.length,
    streakBefore: ledger.streak,
    hintsUsed: after.hintsUsed,
  });
  ledger.awardInk(reward.total);
  ledger.recordEntry(after.question.id);
  set({ phase: 'resolving-correct', lastReward: reward.total });
}

export const useGame = create<GameStore>((set, get) => ({
  round: null,
  phase: 'idle',
  lastReward: null,
  wrongFlash: 0,

  startNext: () => {
    set({ round: newRoundState(), phase: 'playing', lastReward: null });
  },

  place: (tileId) => {
    const round = get().round;
    if (!round || get().phase !== 'playing') return;
    set({ round: placeTile(round, tileId) });
    const after = get().round;
    if (!after) return;
    const result = checkAnswer(after);
    if (result === 'incomplete') return;
    if (result === 'correct') {
      const ledger = useLedger.getState();
      const reward = computeReward({
        answerLength: after.question.answer.length,
        streakBefore: ledger.streak,
        hintsUsed: after.hintsUsed,
      });
      ledger.awardInk(reward.total);
      ledger.recordEntry(after.question.id);
      set({ phase: 'resolving-correct', lastReward: reward.total });
    } else {
      useLedger.getState().breakStreak();
      set({
        round: incrementWrong(after),
        phase: 'resolving-wrong',
        wrongFlash: get().wrongFlash + 1,
      });
      setTimeout(() => {
        const cur = get().round;
        if (!cur) return;
        set({ round: clearWrongTiles(cur), phase: 'playing' });
      }, 500);
    }
  },

  returnFromSlot: (slotIndex) => {
    const round = get().round;
    if (!round || get().phase !== 'playing') return;
    set({ round: returnTile(round, slotIndex) });
  },

  submit: () => {
    const round = get().round;
    if (!round) return 'incomplete';
    return checkAnswer(round);
  },

  revealHint: () => {
    const round = get().round;
    if (!round || get().phase !== 'playing') return { ok: false, reason: 'no-target' };
    const ledger = useLedger.getState();
    if (ledger.ink < HINT_COST) return { ok: false, reason: 'insufficient-ink' };
    const result = revealLetter(round);
    if (result.revealedIndex === null) return { ok: false, reason: 'no-target' };
    ledger.spendInk(HINT_COST);
    set({ round: result.state });
    resolveIfComplete(set, get);
    return { ok: true };
  },

  revealHintFree: () => {
    const round = get().round;
    if (!round || get().phase !== 'playing') return { ok: false, reason: 'no-target' };
    const result = revealLetter(round);
    if (result.revealedIndex === null) return { ok: false, reason: 'no-target' };
    set({ round: result.state });
    resolveIfComplete(set, get);
    return { ok: true };
  },

  awardBonusInk: (amount) => {
    if (amount <= 0) return;
    useLedger.getState().awardInk(amount);
  },

  advance: () => {
    get().startNext();
  },
}));
