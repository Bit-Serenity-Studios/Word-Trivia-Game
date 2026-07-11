import type { RoundState, Tile } from './types';

function findTargetSlotIndex(state: RoundState): number {
  const answer = state.question.answer.toUpperCase();
  for (const s of state.slots) {
    if (s.locked) continue;
    if (s.tileId === null) return s.index;
    const tile = state.tilesById[s.tileId];
    if (!tile || tile.letter !== answer[s.index]) return s.index;
  }
  return -1;
}

function findDonorTile(state: RoundState, letter: string, targetIndex: number): Tile | null {
  const answer = state.question.answer.toUpperCase();
  const trayMatch = state.tray.find((t) => t.letter === letter);
  if (trayMatch) return trayMatch;
  for (const s of state.slots) {
    if (s.locked) continue;
    if (s.index === targetIndex) continue;
    if (s.tileId === null) continue;
    const tile = state.tilesById[s.tileId];
    if (!tile || tile.letter !== letter) continue;
    if (tile.letter === answer[s.index]) continue;
    return tile;
  }
  return null;
}

export interface HintResult {
  state: RoundState;
  revealedIndex: number | null;
  letter: string | null;
}

export function revealLetter(state: RoundState): HintResult {
  const targetIndex = findTargetSlotIndex(state);
  if (targetIndex < 0) return { state, revealedIndex: null, letter: null };
  const answer = state.question.answer.toUpperCase();
  const letter = answer[targetIndex]!;
  const donor = findDonorTile(state, letter, targetIndex);
  if (!donor) return { state, revealedIndex: null, letter: null };

  let newTray = state.tray.filter((t) => t.id !== donor.id);
  let newSlots = state.slots.map((s) => {
    if (s.tileId === donor.id) return { ...s, tileId: null };
    return s;
  });

  const currentTargetTileId = newSlots[targetIndex]!.tileId;
  if (currentTargetTileId !== null) {
    const displaced = state.tilesById[currentTargetTileId];
    if (displaced) newTray = [...newTray, displaced];
  }

  newSlots = newSlots.map((s) =>
    s.index === targetIndex ? { ...s, tileId: donor.id, locked: true } : s,
  );

  return {
    state: { ...state, tray: newTray, slots: newSlots, hintsUsed: state.hintsUsed + 1 },
    revealedIndex: targetIndex,
    letter,
  };
}
