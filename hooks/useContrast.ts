export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    throw new Error(`hexToRgb: expected 6-char hex, got "${hex}"`);
  }
  const value = parseInt(normalized, 16);
  return {
    r: (value >> 16) & 0xff,
    g: (value >> 8) & 0xff,
    b: value & 0xff,
  };
}

function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(rgb: Rgb): number {
  return 0.2126 * linearize(rgb.r) + 0.7152 * linearize(rgb.g) + 0.0722 * linearize(rgb.b);
}

export function contrastRatio(foregroundHex: string, backgroundHex: string): number {
  const fg = relativeLuminance(hexToRgb(foregroundHex));
  const bg = relativeLuminance(hexToRgb(backgroundHex));
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

export const WCAG_AA_TEXT = 4.5;
export const WCAG_AAA_TEXT = 7;
export const WCAG_AA_LARGE = 3;
