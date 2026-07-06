export const palette = {
  ink: '#171310',
  mahogany: '#2C2018',
  parchment: '#E7DBC0',
  sepia: '#8A7355',
  burgundy: '#6E2B2B',
  forest: '#33402F',
  gold: '#C9A227',

  parchmentDim: '#C9BEA6',
  mahoganyDeep: '#1E140E',
  goldDim: '#8F7419',
  candle: '#F4C77A',
} as const;

export type PaletteColor = keyof typeof palette;

export const fonts = {
  display: 'CormorantGaramond_600SemiBold',
  displayItalic: 'CormorantGaramond_500Medium_Italic',
  body: 'EBGaramond_400Regular',
  bodyBold: 'EBGaramond_600SemiBold',
  bodyItalic: 'EBGaramond_400Regular_Italic',
} as const;

export const fontFallback = {
  display: 'serif',
  body: 'serif',
} as const;

export const type = {
  cardPrompt:   { family: fonts.display,       size: 22, lineHeight: 30, letterSpacing: 0.2 },
  cardCategory: { family: fonts.displayItalic, size: 13, lineHeight: 18, letterSpacing: 1.6 },
  tileLetter:   { family: fonts.display,       size: 30, lineHeight: 30, letterSpacing: 0 },
  slotLetter:   { family: fonts.display,       size: 28, lineHeight: 28, letterSpacing: 0 },
  hudNumber:    { family: fonts.display,       size: 20, lineHeight: 24 },
  hudLabel:     { family: fonts.bodyItalic,    size: 11, lineHeight: 14, letterSpacing: 1.4 },
  body:         { family: fonts.body,          size: 16, lineHeight: 24 },
  buttonLabel:  { family: fonts.displayItalic, size: 15, lineHeight: 20, letterSpacing: 0.6 },
} as const;

export const space = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48,
} as const;

export const radii = {
  tile: 6,
  slot: 4,
  card: 3,
  drawer: 10,
  pill: 999,
} as const;

export const size = {
  tile: 52,
  tileGap: 8,
  slot: 44,
  slotGap: 6,
  cardMinHeight: 180,
} as const;

export const shadow = {
  tileRest: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.55,
    shadowRadius: 4,
    elevation: 4,
  },
  tilePressed: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 2,
    elevation: 1,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  drawerInsetOverlay: {
    borderTopColor: 'rgba(0,0,0,0.55)',
    borderTopWidth: 2,
    borderLeftColor: 'rgba(0,0,0,0.35)',
    borderLeftWidth: 1,
    borderRightColor: 'rgba(255,220,170,0.05)',
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255,220,170,0.06)',
    borderBottomWidth: 1,
  },
} as const;

export const motion = {
  instant: 0,
  tilePlace: 140,
  tileReturn: 180,
  wrongShake: 320,
  waxSealStamp: 520,
  candleFlickerMin: 2200,
  candleFlickerMax: 3800,
  dustDriftLoop: 14000,
} as const;

export const tilt = {
  cardDeg: -1.2,
  sealDeg: -8,
} as const;

export const opacity = {
  candleGlowLow: 0.28,
  candleGlowHigh: 0.42,
  dustMote: 0.18,
  lockedArtifact: 0.22,
} as const;

export const z = {
  background: 0,
  candle: 1,
  motes: 2,
  desk: 10,
  card: 20,
  tray: 30,
  tile: 31,
  hud: 40,
  overlay: 50,
  seal: 60,
} as const;

export type PaletteMap = Record<PaletteColor, string>;

export interface TypeToken {
  family: string;
  size: number;
  lineHeight: number;
  letterSpacing?: number;
}

export type TypeMap = Record<keyof typeof type, TypeToken>;

export type Tokens = {
  palette: PaletteMap;
  fonts: typeof fonts;
  fontFallback: typeof fontFallback;
  type: TypeMap;
  space: typeof space;
  radii: typeof radii;
  size: typeof size;
  shadow: typeof shadow;
  motion: typeof motion;
  tilt: typeof tilt;
  opacity: typeof opacity;
  z: typeof z;
};

export const tokens: Tokens = {
  palette, fonts, fontFallback, type, space, radii, size, shadow, motion, tilt, opacity, z,
};
