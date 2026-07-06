import {
  FONT_SCALE_CEILING,
  TEXT_BOOST_MULTIPLIER,
  applyHighContrast,
  scaledTypeToken,
} from '../theme/derivedPalette';
import { palette, type } from '../theme/tokens';
import { contrastRatio, WCAG_AA_TEXT } from '../hooks/useContrast';

describe('applyHighContrast', () => {
  it('leaves the primary text and background colors untouched', () => {
    const derived = applyHighContrast(palette);
    expect(derived.parchment).toBe(palette.parchment);
    expect(derived.ink).toBe(palette.ink);
    expect(derived.gold).toBe(palette.gold);
  });

  it('replaces the low-contrast tokens with brighter counterparts', () => {
    const derived = applyHighContrast(palette);
    expect(derived.sepia).not.toBe(palette.sepia);
    expect(derived.parchmentDim).not.toBe(palette.parchmentDim);
    expect(derived.goldDim).not.toBe(palette.goldDim);
  });

  it('makes the replaced sepia meet AA against ink', () => {
    const derived = applyHighContrast(palette);
    expect(contrastRatio(derived.sepia, palette.ink)).toBeGreaterThanOrEqual(WCAG_AA_TEXT);
  });

  it('is a pure function that does not mutate the input palette', () => {
    const snapshot = { ...palette };
    applyHighContrast(palette);
    expect(palette).toEqual(snapshot);
  });
});

describe('scaledTypeToken', () => {
  it('scales size and lineHeight by the factor and rounds to integers', () => {
    const scaled = scaledTypeToken(type.cardPrompt, 1.5);
    expect(scaled.size).toBe(Math.round(type.cardPrompt.size * 1.5));
    expect(scaled.lineHeight).toBe(Math.round(type.cardPrompt.lineHeight * 1.5));
  });

  it('preserves the family field', () => {
    const scaled = scaledTypeToken(type.cardPrompt, 1.15);
    expect(scaled.family).toBe(type.cardPrompt.family);
  });

  it('is a no-op when the factor is 1', () => {
    const scaled = scaledTypeToken(type.body, 1);
    expect(scaled.size).toBe(type.body.size);
    expect(scaled.lineHeight).toBe(type.body.lineHeight);
  });
});

describe('scale constants', () => {
  it('exposes a text boost that is meaningful but modest', () => {
    expect(TEXT_BOOST_MULTIPLIER).toBeGreaterThan(1);
    expect(TEXT_BOOST_MULTIPLIER).toBeLessThan(1.5);
  });

  it('caps OS font scale at 1.5', () => {
    expect(FONT_SCALE_CEILING).toBe(1.5);
  });
});
