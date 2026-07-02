import type { CheckResult, Question, RNG, RoundState, Slot, Tile } from './types';
import { decoyCount, generateDecoys } from './difficulty';
import { shuffled } from './rng';

export function buildRound(question: Question, rng: RNG): RoundState {
  const answer = question.answer.toUpperCase();
  const answerTiles: Tile[] = answer.split('').map((letter, i) => ({
    id: `a-${i}-${letter}`,
    letter,
    source: 'answer',
  }));
  const decoys = generateDecoys(answer, decoyCount(question.tier), rng);
  const decoyTiles: Tile[] = decoys.map((letter, i) => ({
    id: `d-${i}-${letter}`,
    letter,
    source: 'decoy',
  }));
  const tray = shuffled([...answerTiles, ...decoyTiles], rng);
  const tilesById: Record<string, Tile> = {};
  for (const t of tray) tilesById[t.id] = t;
  const slots: Slot[] = answer.split('').map((_, i) => ({ index: i, tileId: null, locked: false }));
  return {
    question,
    tray,
    slots,
    tilesById,
    hintsUsed: 0,
    wrongAttempts: 0,
  };
}

function nextOpenSlotIndex(state: RoundState): number {
  for (const s of state.slots) {
    if (!s.locked && s.tileId === null) return s.index;
  }
  return -1;
}

export function placeTile(state: RoundState, tileId: string): RoundState {
  const inTray = state.tray.some((t) => t.id === tileId);
  if (!inTray) return state;
  const targetIndex = nextOpenSlotIndex(state);
  if (targetIndex < 0) return state;
  const newTray = state.tray.filter((t) => t.id !== tileId);
  const newSlots = state.slots.map((s) =>
    s.index === targetIndex ? { ...s, tileId } : s,
  );
  return { ...state, tray: newTray, slots: newSlots };
}

export function returnTile(state: RoundState, slotIndex: number): RoundState {
  const slot = state.slots[slotIndex];
  if (!slot || slot.locked || slot.tileId === null) return state;
  const tile = state.tilesById[slot.tileId];
  if (!tile) return state;
  const newSlots = state.slots.map((s) => (s.index === slotIndex ? { ...s, tileId: null } : s));
  const newTray = [...state.tray, tile];
  return { ...state, tray: newTray, slots: newSlots };
}

export function checkAnswer(state: RoundState): CheckResult {
  const answer = state.question.answer.toUpperCase();
  const filled: string[] = [];
  for (const s of state.slots) {
    if (s.tileId === null) return 'incomplete';
    const tile = state.tilesById[s.tileId];
    if (!tile) return 'incomplete';
    filled.push(tile.letter);
  }
  return filled.join('') === answer ? 'correct' : 'wrong';
}

export function currentGuess(state: RoundState): string {
  return state.slots
    .map((s) => {
      if (s.tileId === null) return '_';
      const tile = state.tilesById[s.tileId];
      return tile ? tile.letter : '_';
    })
    .join('');
}

export function clearWrongTiles(state: RoundState): RoundState {
  const answer = state.question.answer.toUpperCase();
  const returned: Tile[] = [];
  const newSlots = state.slots.map((s) => {
    if (s.locked || s.tileId === null) return s;
    const tile = state.tilesById[s.tileId];
    if (!tile) return s;
    if (tile.letter === answer[s.index]) return s;
    returned.push(tile);
    return { ...s, tileId: null };
  });
  return { ...state, slots: newSlots, tray: [...state.tray, ...returned] };
}

export function isSlotCorrect(state: RoundState, slotIndex: number): boolean {
  const slot = state.slots[slotIndex];
  if (!slot || slot.tileId === null) return false;
  const tile = state.tilesById[slot.tileId];
  if (!tile) return false;
  return tile.letter === state.question.answer.toUpperCase()[slotIndex];
}

export function incrementWrong(state: RoundState): RoundState {
  return { ...state, wrongAttempts: state.wrongAttempts + 1 };
}
