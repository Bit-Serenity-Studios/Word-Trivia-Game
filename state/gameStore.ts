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
import type { VolumeId } from '@/game/volumes';
import { applyRareMultiplier } from '@/game/rareVolume';
import { economy } from '@/game/economy';
import { useLedger } from './ledgerStore';

export type Phase = 'playing' | 'resolving-correct' | 'resolving-wrong' | 'idle';
export type Mode = 'general' | 'volume';
export type HintFailure = 'no-target' | 'insufficient-ink';

interface StartOpts {
  volumeId?: VolumeId;
}

interface GameStore {
  round: RoundState | null;
  phase: Phase;
  mode: Mode;
  activeVolume: VolumeId | null;
  isRare: boolean;
  lastReward: number | null;
  wrongFlash: number;

  startNext: (opts?: StartOpts) => void;
  place: (tileId: string) => void;
  returnFromSlot: (slotIndex: number) => void;
  submit: () => 'correct' | 'wrong' | 'incomplete';
  revealHint: () => { ok: boolean; reason?: HintFailure };
  revealHintFree: () => { ok: boolean; reason?: HintFailure };
  awardBonusInk: (amount: number) => void;
  advance: () => void;
  clearRound: () => void;
}

interface BuiltRound {
  round: RoundState;
  isRare: boolean;
}

function newRoundState(opts?: StartOpts): BuiltRound {
  const ledger = useLedger.getState();
  const seedSource = `${ledger.entries}:${ledger.seenIds.length}:${ledger.ink}`;
  const rng = mulberry32(seedFromString(seedSource) ^ ((Date.now() & 0xffffffff) >>> 0));

  if (opts?.volumeId) {
    const wantsRare =
      mulberry32(seedFromString(`rare-roll:${opts.volumeId}:${ledger.entries}`))() <
      economy.rareVolume.spawnRate;
    if (wantsRare) {
      const rare = bundledSource.pickRareInVolume({
        volumeId: opts.volumeId,
        seenIds: ledger.seenIds,
        rng,
      });
      if (rare) return { round: buildRound(rare, rng), isRare: true };
    }
    const question = bundledSource.nextInVolume({
      volumeId: opts.volumeId,
      seenIds: ledger.seenIds,
      rng,
    });
    return { round: buildRound(question, rng), isRare: false };
  }

  const question = bundledSource.nextQuestion({
    entriesSolved: ledger.entries,
    seenIds: ledger.seenIds,
    rng,
  });
  return { round: buildRound(question, rng), isRare: false };
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
  const paid = applyRareMultiplier(reward.total, get().isRare);
  ledger.awardInk(paid);
  ledger.recordEntry(after.question.id);
  set({ phase: 'resolving-correct', lastReward: paid });
}

export const useGame = create<GameStore>((set, get) => ({
  round: null,
  phase: 'idle',
  mode: 'general',
  activeVolume: null,
  isRare: false,
  lastReward: null,
  wrongFlash: 0,

  startNext: (opts) => {
    const { round, isRare } = newRoundState(opts);
    set({
      round,
      phase: 'playing',
      lastReward: null,
      isRare,
      mode: opts?.volumeId ? 'volume' : 'general',
      activeVolume: opts?.volumeId ?? null,
    });
  },

  clearRound: () => {
    set({ round: null, phase: 'idle', lastReward: null, isRare: false });
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
      const paid = applyRareMultiplier(reward.total, get().isRare);
      ledger.awardInk(paid);
      ledger.recordEntry(after.question.id);
      set({ phase: 'resolving-correct', lastReward: paid });
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
    const activeVolume = get().activeVolume;
    if (activeVolume) {
      get().startNext({ volumeId: activeVolume });
      return;
    }
    get().startNext();
  },
}));
