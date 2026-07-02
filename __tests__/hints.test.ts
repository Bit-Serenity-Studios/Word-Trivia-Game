import { buildRound, placeTile } from '@/game/round';
import { revealLetter } from '@/game/hints';
import { mulberry32 } from '@/game/rng';
import type { Question } from '@/game/types';

const saturn: Question = {
  id: 'saturn',
  prompt: '',
  answer: 'SATURN',
  category: 'Natural Philosophy',
  tier: 'scholar',
};

const reeds: Question = {
  id: 'reeds',
  prompt: '',
  answer: 'REEDS',
  category: 'Botany & Beasts',
  tier: 'novice',
};

describe('revealLetter', () => {
  it('locks the first empty slot with the correct letter drawn from the tray', () => {
    const s = buildRound(saturn, mulberry32(1));
    const result = revealLetter(s);
    expect(result.revealedIndex).toBe(0);
    expect(result.letter).toBe('S');
    const slot = result.state.slots[0]!;
    expect(slot.locked).toBe(true);
    const tile = result.state.tilesById[slot.tileId!]!;
    expect(tile.letter).toBe('S');
    expect(result.state.tray.some((t) => t.id === tile.id)).toBe(false);
    expect(result.state.hintsUsed).toBe(1);
  });

  it('reveals the first wrong slot when earlier slots are correct', () => {
    let s = buildRound(saturn, mulberry32(2));
    const sTile = s.tray.find((t) => t.letter === 'S' && t.source === 'answer')!;
    s = placeTile(s, sTile.id);
    const wrongForA = s.tray.find((t) => t.letter !== 'A' && t.source !== 'answer')
      ?? s.tray.find((t) => t.letter !== 'A')!;
    s = placeTile(s, wrongForA.id);
    const result = revealLetter(s);
    expect(result.revealedIndex).toBe(1);
    expect(result.letter).toBe('A');
    expect(result.state.slots[0]!.tileId).toBe(sTile.id);
  });

  it('steals a correct-letter tile from a wrong slot rather than needing one in the tray', () => {
    let s = buildRound(saturn, mulberry32(3));
    const uTile = s.tray.find((t) => t.letter === 'U' && t.source === 'answer')!;
    s = placeTile(s, uTile.id);
    expect(s.slots[0]!.tileId).toBe(uTile.id);
    const trayHasU = s.tray.some((t) => t.letter === 'U');
    expect(trayHasU).toBe(false);
    const result = revealLetter(s);
    expect(result.revealedIndex).toBe(0);
    expect(result.letter).toBe('S');
    expect(result.state.slots.find((slot) => slot.tileId === uTile.id)).toBeUndefined();
    expect(result.state.tray.some((t) => t.id === uTile.id)).toBe(true);
  });

  it('handles duplicate letters — REEDS has two Es and both can be revealed', () => {
    let s = buildRound(reeds, mulberry32(4));
    const first = revealLetter(s);
    expect(first.revealedIndex).toBe(0);
    expect(first.letter).toBe('R');
    s = first.state;
    const second = revealLetter(s);
    expect(second.revealedIndex).toBe(1);
    expect(second.letter).toBe('E');
    s = second.state;
    const third = revealLetter(s);
    expect(third.revealedIndex).toBe(2);
    expect(third.letter).toBe('E');
    expect(s.slots[1]!.locked).toBe(true);
    expect(third.state.slots[2]!.locked).toBe(true);
  });

  it('does nothing when the answer is already fully correct', () => {
    let s = buildRound(saturn, mulberry32(5));
    for (const letter of 'SATURN') {
      const tile = s.tray.find((t) => t.letter === letter && t.source === 'answer')!;
      s = placeTile(s, tile.id);
    }
    const result = revealLetter(s);
    expect(result.revealedIndex).toBeNull();
    expect(result.state.hintsUsed).toBe(0);
  });
});
