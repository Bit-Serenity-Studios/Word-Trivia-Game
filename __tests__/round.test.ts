import { buildRound, placeTile, returnTile, checkAnswer, clearWrongTiles, currentGuess } from '@/game/round';
import { mulberry32 } from '@/game/rng';
import type { Question } from '@/game/types';

const q: Question = {
  id: 'test-saturn',
  prompt: 'The ringed world with the greatest count of known moons',
  answer: 'SATURN',
  category: 'Natural Philosophy',
  tier: 'scholar',
};

function findTileByLetter(state: ReturnType<typeof buildRound>, letter: string, source: 'answer' | 'decoy' = 'answer') {
  return state.tray.find((t) => t.letter === letter && t.source === source)!;
}

describe('buildRound', () => {
  it('creates one slot per answer letter and answer tiles for each letter', () => {
    const state = buildRound(q, mulberry32(1));
    expect(state.slots).toHaveLength(6);
    const answerTiles = state.tray.filter((t) => t.source === 'answer');
    expect(answerTiles.map((t) => t.letter).sort()).toEqual('SATURN'.split('').sort());
  });

  it('adds decoy tiles matching the tier count', () => {
    const state = buildRound(q, mulberry32(2));
    const decoys = state.tray.filter((t) => t.source === 'decoy');
    expect(decoys).toHaveLength(5);
  });

  it('never uses answer letters as decoys', () => {
    const state = buildRound(q, mulberry32(3));
    const answerSet = new Set('SATURN'.split(''));
    for (const t of state.tray.filter((t) => t.source === 'decoy')) {
      expect(answerSet.has(t.letter)).toBe(false);
    }
  });
});

describe('placeTile / returnTile', () => {
  it('fills slots left-to-right', () => {
    let s = buildRound(q, mulberry32(4));
    const s0 = findTileByLetter(s, 'S');
    s = placeTile(s, s0.id);
    expect(s.slots[0]!.tileId).toBe(s0.id);
    expect(s.tray.find((t) => t.id === s0.id)).toBeUndefined();
  });

  it('returns a tile from a slot to the tray', () => {
    let s = buildRound(q, mulberry32(5));
    const t = findTileByLetter(s, 'S');
    s = placeTile(s, t.id);
    s = returnTile(s, 0);
    expect(s.slots[0]!.tileId).toBeNull();
    expect(s.tray.find((x) => x.id === t.id)).toBeDefined();
  });

  it('is a no-op when placing a tile that is not in the tray', () => {
    const s = buildRound(q, mulberry32(6));
    const s2 = placeTile(s, 'not-a-real-id');
    expect(s2).toBe(s);
  });

  it('is a no-op when the tray is empty of open slots', () => {
    let s = buildRound(q, mulberry32(7));
    for (let i = 0; i < 6; i++) {
      const t = s.tray[0]!;
      s = placeTile(s, t.id);
    }
    const extra = s.tray[0];
    if (extra) {
      const before = s;
      const after = placeTile(s, extra.id);
      expect(after).toBe(before);
    }
  });
});

describe('checkAnswer', () => {
  it('is incomplete until all slots are filled', () => {
    const s = buildRound(q, mulberry32(8));
    expect(checkAnswer(s)).toBe('incomplete');
  });

  it('is correct when SATURN is spelled', () => {
    let s = buildRound(q, mulberry32(9));
    for (const letter of 'SATURN') {
      const tile = s.tray.find((t) => t.letter === letter && t.source === 'answer')!;
      s = placeTile(s, tile.id);
    }
    expect(currentGuess(s)).toBe('SATURN');
    expect(checkAnswer(s)).toBe('correct');
  });

  it('is wrong when the wrong letters are placed in every slot', () => {
    let s = buildRound(q, mulberry32(10));
    const wrong = [...s.tray].sort((a, b) => a.letter.localeCompare(b.letter)).slice(0, 6);
    for (const t of wrong) s = placeTile(s, t.id);
    if (checkAnswer(s) === 'correct') return;
    expect(checkAnswer(s)).toBe('wrong');
  });
});

describe('clearWrongTiles', () => {
  it('returns only misplaced non-locked tiles to the tray', () => {
    let s = buildRound(q, mulberry32(11));
    const correctS = s.tray.find((t) => t.letter === 'S' && t.source === 'answer')!;
    s = placeTile(s, correctS.id);
    const wrongForA = s.tray.find((t) => t.letter !== 'A')!;
    s = placeTile(s, wrongForA.id);
    const cleared = clearWrongTiles(s);
    expect(cleared.slots[0]!.tileId).toBe(correctS.id);
    expect(cleared.slots[1]!.tileId).toBeNull();
    expect(cleared.tray.some((t) => t.id === wrongForA.id)).toBe(true);
  });
});
