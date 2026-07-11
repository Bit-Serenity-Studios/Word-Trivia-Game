import React from 'react';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';
import type { ArtifactKind } from '@/game/cabinet';

interface Props {
  kind: ArtifactKind;
  size?: number;
  color: string;
  faint?: boolean;
}

export function ArtifactSVG({ kind, size = 64, color, faint }: Props) {
  const stroke = color;
  const opacity = faint ? 0.35 : 1;
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <G stroke={stroke} strokeWidth={1.5} fill="none" opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
        {renderPaths(kind, stroke)}
      </G>
    </Svg>
  );
}

function renderPaths(kind: ArtifactKind, color: string): React.ReactNode {
  switch (kind) {
    case 'pressed-fern':
      return (
        <>
          <Path d="M32 56 C 34 46 33 34 34 22 C 34 16 32 10 30 8" />
          <Path d="M31 46 C 24 44 22 42 20 38" />
          <Path d="M31 46 C 38 44 40 42 42 38" />
          <Path d="M31 38 C 24 36 22 34 20 30" />
          <Path d="M31 38 C 38 36 40 34 42 30" />
          <Path d="M32 30 C 26 28 24 26 22 22" />
          <Path d="M32 30 C 38 28 40 26 42 22" />
          <Path d="M32 22 C 28 20 27 18 26 15" />
          <Path d="M32 22 C 36 20 37 18 38 15" />
        </>
      );
    case 'beeswax-taper':
      return (
        <>
          <Path d="M32 14 C 30 11 30 9 32 6 C 34 9 34 11 32 14 Z" fill={color} />
          <Line x1="32" y1="14" x2="32" y2="18" />
          <Rect x="27" y="18" width="10" height="34" rx="1.5" />
          <Line x1="27" y1="52" x2="37" y2="52" />
          <Rect x="24" y="52" width="16" height="4" rx="1" />
        </>
      );
    case 'brass-astrolabe':
      return (
        <>
          <Circle cx="32" cy="32" r="22" />
          <Circle cx="32" cy="32" r="15" />
          <Circle cx="32" cy="32" r="7" />
          <Line x1="10" y1="32" x2="54" y2="32" />
          <Line x1="32" y1="10" x2="32" y2="54" />
          <Line x1="14" y1="14" x2="50" y2="50" />
        </>
      );
    case 'spectral-owl':
      return (
        <>
          <Path d="M20 22 C 20 12 44 12 44 22 L 44 40 C 44 52 20 52 20 40 Z" />
          <Circle cx="26" cy="28" r="4" />
          <Circle cx="38" cy="28" r="4" />
          <Circle cx="26" cy="28" r="1.2" fill={color} />
          <Circle cx="38" cy="28" r="1.2" fill={color} />
          <Path d="M32 33 L 30 37 L 34 37 Z" fill={color} />
          <Line x1="20" y1="22" x2="16" y2="16" />
          <Line x1="44" y1="22" x2="48" y2="16" />
          <Path d="M22 46 L 22 54" />
          <Path d="M42 46 L 42 54" />
        </>
      );
    case 'philosophers-tome':
      return (
        <>
          <Rect x="14" y="12" width="36" height="42" rx="2" />
          <Line x1="20" y1="12" x2="20" y2="54" />
          <Line x1="26" y1="20" x2="46" y2="20" />
          <Line x1="26" y1="26" x2="46" y2="26" />
          <Line x1="26" y1="32" x2="42" y2="32" />
          <Line x1="26" y1="38" x2="44" y2="38" />
        </>
      );
    case 'amber-amulet':
      return (
        <>
          <Path d="M32 8 L 34 12 L 32 12 L 30 12 Z" fill={color} />
          <Line x1="32" y1="12" x2="32" y2="18" />
          <Path d="M32 18 C 18 18 18 44 32 54 C 46 44 46 18 32 18 Z" />
          <Circle cx="32" cy="34" r="2.5" />
          <Line x1="32" y1="30" x2="32" y2="26" />
          <Line x1="34" y1="34" x2="38" y2="34" />
          <Line x1="30" y1="34" x2="26" y2="34" />
        </>
      );
    case 'moth-specimen':
      return (
        <>
          <Rect x="6" y="8" width="52" height="48" rx="2" />
          <Line x1="32" y1="20" x2="32" y2="44" />
          <Path d="M32 22 C 20 20 12 28 14 38 C 20 42 28 38 32 34 Z" />
          <Path d="M32 22 C 44 20 52 28 50 38 C 44 42 36 38 32 34 Z" />
          <Circle cx="32" cy="18" r="1.6" fill={color} />
          <Line x1="30" y1="16" x2="26" y2="10" />
          <Line x1="34" y1="16" x2="38" y2="10" />
        </>
      );
    case 'star-chart':
      return (
        <>
          <Rect x="8" y="10" width="48" height="44" rx="1.5" />
          <Line x1="14" y1="22" x2="24" y2="30" />
          <Line x1="24" y1="30" x2="38" y2="20" />
          <Line x1="38" y1="20" x2="46" y2="34" />
          <Line x1="24" y1="30" x2="30" y2="44" />
          <Circle cx="14" cy="22" r="1.4" fill={color} />
          <Circle cx="24" cy="30" r="1.4" fill={color} />
          <Circle cx="38" cy="20" r="1.4" fill={color} />
          <Circle cx="46" cy="34" r="1.4" fill={color} />
          <Circle cx="30" cy="44" r="1.4" fill={color} />
        </>
      );
    case 'reliquary':
      return (
        <>
          <Path d="M32 6 L 32 12" />
          <Path d="M28 9 L 36 9" />
          <Path d="M20 18 L 44 18 L 44 22 L 20 22 Z" />
          <Rect x="18" y="22" width="28" height="28" rx="1.5" />
          <Line x1="18" y1="30" x2="46" y2="30" />
          <Line x1="32" y1="22" x2="32" y2="50" />
          <Circle cx="32" cy="36" r="3" />
          <Line x1="14" y1="50" x2="50" y2="50" />
        </>
      );
    case 'mnemonic-wheel':
      return (
        <>
          <Circle cx="32" cy="32" r="22" />
          <Circle cx="32" cy="32" r="3" fill={color} />
          <Line x1="32" y1="10" x2="32" y2="54" />
          <Line x1="10" y1="32" x2="54" y2="32" />
          <Line x1="16.4" y1="16.4" x2="47.6" y2="47.6" />
          <Line x1="47.6" y1="16.4" x2="16.4" y2="47.6" />
          <Circle cx="32" cy="10" r="1.4" fill={color} />
          <Circle cx="54" cy="32" r="1.4" fill={color} />
          <Circle cx="32" cy="54" r="1.4" fill={color} />
          <Circle cx="10" cy="32" r="1.4" fill={color} />
          <Circle cx="47.6" cy="16.4" r="1.4" fill={color} />
          <Circle cx="47.6" cy="47.6" r="1.4" fill={color} />
          <Circle cx="16.4" cy="16.4" r="1.4" fill={color} />
          <Circle cx="16.4" cy="47.6" r="1.4" fill={color} />
        </>
      );
  }
}
