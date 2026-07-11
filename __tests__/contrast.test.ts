import {
  WCAG_AA_TEXT,
  WCAG_AAA_TEXT,
  contrastRatio,
  hexToRgb,
  relativeLuminance,
} from '../hooks/useContrast';
import { palette } from '../theme/tokens';

describe('hex parsing', () => {
  it('parses solid black and white correctly', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('accepts prefix-less hex', () => {
    expect(hexToRgb('E7DBC0')).toEqual({ r: 231, g: 219, b: 192 });
  });

  it('rejects malformed hex', () => {
    expect(() => hexToRgb('#ABC')).toThrow();
  });
});

describe('relativeLuminance + contrastRatio', () => {
  it('yields the canonical 21:1 for black on white', () => {
    const ratio = contrastRatio('#FFFFFF', '#000000');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('yields ~1 for identical colors', () => {
    expect(contrastRatio('#E7DBC0', '#E7DBC0')).toBeCloseTo(1, 3);
  });

  it('reports white brighter than black', () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeGreaterThan(
      relativeLuminance({ r: 0, g: 0, b: 0 }),
    );
  });
});

describe('default palette contrast on ink', () => {
  const bg = palette.ink;

  it('parchment on ink passes AAA (≥ 7:1)', () => {
    expect(contrastRatio(palette.parchment, bg)).toBeGreaterThanOrEqual(WCAG_AAA_TEXT);
  });

  it('gold on ink passes AA (≥ 4.5:1)', () => {
    expect(contrastRatio(palette.gold, bg)).toBeGreaterThanOrEqual(WCAG_AA_TEXT);
  });

  it('parchmentDim on ink passes AA', () => {
    expect(contrastRatio(palette.parchmentDim, bg)).toBeGreaterThanOrEqual(WCAG_AA_TEXT);
  });
});

describe('high-contrast palette on ink', () => {
  const bg = palette.ink;

  // In high-contrast mode the ThemeProvider maps sepia -> parchmentDim and
  // parchmentDim -> parchment. That means every text color the app draws on
  // ink must be at least AA (this test) and, for the primary parchment
  // color, AAA.
  const highContrastReadingColors = [palette.parchment, palette.parchmentDim, palette.gold];

  it('every reading color meets AA on ink in high-contrast mode', () => {
    for (const color of highContrastReadingColors) {
      expect(contrastRatio(color, bg)).toBeGreaterThanOrEqual(WCAG_AA_TEXT);
    }
  });

  it('parchment (primary body text in high-contrast) meets AAA on ink', () => {
    expect(contrastRatio(palette.parchment, bg)).toBeGreaterThanOrEqual(WCAG_AAA_TEXT);
  });
});
