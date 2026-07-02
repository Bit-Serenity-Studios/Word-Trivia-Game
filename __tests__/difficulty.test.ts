import { tierForEntries, tierForLength, decoyCount, generateDecoys } from '@/game/difficulty';
import { mulberry32 } from '@/game/rng';

describe('tierForLength', () => {
  it('novice for short words, sage for long', () => {
    expect(tierForLength(3)).toBe('novice');
    expect(tierForLength(5)).toBe('novice');
    expect(tierForLength(6)).toBe('scholar');
    expect(tierForLength(8)).toBe('scholar');
    expect(tierForLength(9)).toBe('sage');
  });
});

describe('tierForEntries', () => {
  it('promotes as entries solved grows', () => {
    expect(tierForEntries(0)).toBe('novice');
    expect(tierForEntries(4)).toBe('novice');
    expect(tierForEntries(5)).toBe('scholar');
    expect(tierForEntries(14)).toBe('scholar');
    expect(tierForEntries(15)).toBe('sage');
  });
});

describe('decoyCount', () => {
  it('grows with tier', () => {
    expect(decoyCount('novice')).toBe(4);
    expect(decoyCount('scholar')).toBe(5);
    expect(decoyCount('sage')).toBe(6);
  });
});

describe('generateDecoys', () => {
  it('never repeats an answer letter', () => {
    const decoys = generateDecoys('SATURN', 5, mulberry32(42));
    const answer = new Set('SATURN'.split(''));
    for (const d of decoys) expect(answer.has(d)).toBe(false);
  });

  it('returns exactly the requested count', () => {
    expect(generateDecoys('CAT', 4, mulberry32(1))).toHaveLength(4);
    expect(generateDecoys('LIBRARY', 6, mulberry32(2))).toHaveLength(6);
  });
});
