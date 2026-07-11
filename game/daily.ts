import { seedFromString, mulberry32 } from './rng';

export function dateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dailyPickId(key: string, ids: readonly string[]): string {
  if (ids.length === 0) throw new Error('dailyPickId: empty pool');
  const seed = seedFromString(`athenaeum:${key}`);
  const rng = mulberry32(seed);
  const idx = Math.floor(rng() * ids.length);
  return ids[idx]!;
}

export function dailyShareText(params: {
  key: string;
  category: string;
  ink: number;
  streak: number;
  hintsUsed: number;
}): string {
  const shield = params.hintsUsed === 0 ? 'unaided' : `${params.hintsUsed} hint${params.hintsUsed === 1 ? '' : 's'}`;
  return [
    `The Athenaeum — Nightly Entry ${params.key}`,
    `Category: ${params.category}`,
    `Result: catalogued (${shield})`,
    `Ink +${params.ink}  |  Streak ${params.streak}`,
  ].join('\n');
}
