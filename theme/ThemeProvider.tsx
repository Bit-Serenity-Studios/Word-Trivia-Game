import React, { createContext, useContext, useMemo } from 'react';
import { PixelRatio } from 'react-native';
import { tokens as baseTokens, Tokens } from './tokens';
import {
  FONT_SCALE_CEILING,
  TEXT_BOOST_MULTIPLIER,
  applyHighContrast,
  scaledTypeToken,
} from './derivedPalette';
import { useSettings } from '@/state/settingsStore';

const ThemeContext = createContext<Tokens>(baseTokens);

function applyTextBoost(type: Tokens['type'], boost: boolean): Tokens['type'] {
  if (!boost) return type;
  const factor = TEXT_BOOST_MULTIPLIER;
  const out = {} as Tokens['type'];
  for (const key of Object.keys(type) as Array<keyof Tokens['type']>) {
    out[key] = scaledTypeToken(type[key], factor);
  }
  return out;
}

export function clampFontScale(): number {
  return Math.min(PixelRatio.getFontScale(), FONT_SCALE_CEILING);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const highContrast = useSettings((s) => s.highContrast);
  const textBoost = useSettings((s) => s.textBoost);

  const value = useMemo<Tokens>(() => {
    const palette = highContrast ? applyHighContrast(baseTokens.palette) : baseTokens.palette;
    const type = applyTextBoost(baseTokens.type, textBoost);
    return { ...baseTokens, palette, type };
  }, [highContrast, textBoost]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Tokens {
  return useContext(ThemeContext);
}
