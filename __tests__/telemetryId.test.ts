import { generateDistinctId } from '../state/telemetryIdStore';

describe('generateDistinctId', () => {
  it('produces IDs with the athenaeum prefix', () => {
    const id = generateDistinctId(() => 0.5, 1_700_000_000_000);
    expect(id).toMatch(/^ath_/);
  });

  it('is deterministic when both the rng and timestamp are fixed', () => {
    const a = generateDistinctId(() => 0.5, 1_700_000_000_000);
    const b = generateDistinctId(() => 0.5, 1_700_000_000_000);
    expect(a).toBe(b);
  });

  it('produces different IDs when the timestamp advances', () => {
    const a = generateDistinctId(() => 0.5, 1_700_000_000_000);
    const b = generateDistinctId(() => 0.5, 1_700_000_000_001);
    expect(a).not.toBe(b);
  });

  it('produces different IDs when the rng varies across calls', () => {
    let cursor = 0;
    const sequence = [0.1, 0.9, 0.2, 0.8];
    const rng = () => sequence[cursor++ % sequence.length]!;
    const a = generateDistinctId(rng, 1_700_000_000_000);
    const b = generateDistinctId(rng, 1_700_000_000_000);
    expect(a).not.toBe(b);
  });
});
