import { palette as basePalette } from './tokens';
import type { Tokens } from './tokens';

export function applyHighContrast(palette: Tokens['palette']): Tokens['palette'] {
  return {
    ...palette,
    sepia: basePalette.parchmentDim,
    parchmentDim: basePalette.parchment,
    goldDim: basePalette.gold,
  };
}

export function scaledTypeToken<T extends { size: number; lineHeight: number }>(
  entry: T,
  factor: number,
): T {
  return {
    ...entry,
    size: Math.round(entry.size * factor),
    lineHeight: Math.round(entry.lineHeight * factor),
  } as T;
}

export const TEXT_BOOST_MULTIPLIER = 1.15;
export const FONT_SCALE_CEILING = 1.5;
