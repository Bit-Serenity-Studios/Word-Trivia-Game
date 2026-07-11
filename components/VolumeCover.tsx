import React from 'react';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';
import type { Volume } from '@/game/volumes';

interface Props {
  cover: Volume['cover'];
  size?: number;
  color: string;
  faint?: boolean;
}

export function VolumeCover({ cover, size = 56, color, faint }: Props) {
  const opacity = faint ? 0.32 : 1;
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <G
        stroke={color}
        strokeWidth={1.4}
        fill="none"
        opacity={opacity}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {renderCover(cover, color)}
      </G>
    </Svg>
  );
}

function renderCover(cover: Volume['cover'], color: string): React.ReactNode {
  switch (cover) {
    case 'astrolabe':
      return (
        <>
          <Circle cx="32" cy="32" r="20" />
          <Circle cx="32" cy="32" r="12" />
          <Line x1="12" y1="32" x2="52" y2="32" />
          <Line x1="32" y1="12" x2="32" y2="52" />
          <Circle cx="32" cy="32" r="1.6" fill={color} />
        </>
      );
    case 'column':
      return (
        <>
          <Path d="M18 14 L 46 14 L 46 18 L 18 18 Z" />
          <Rect x="22" y="18" width="20" height="34" />
          <Line x1="26" y1="20" x2="26" y2="50" />
          <Line x1="32" y1="20" x2="32" y2="50" />
          <Line x1="38" y1="20" x2="38" y2="50" />
          <Path d="M16 52 L 48 52 L 48 56 L 16 56 Z" />
        </>
      );
    case 'quill':
      return (
        <>
          <Path d="M14 52 C 20 46 30 30 44 16 C 46 14 50 12 52 14 C 54 16 52 20 50 22 C 36 36 20 46 14 52 Z" />
          <Line x1="18" y1="48" x2="34" y2="32" />
          <Line x1="22" y1="52" x2="46" y2="28" />
          <Circle cx="14" cy="52" r="2" fill={color} />
        </>
      );
    case 'compass':
      return (
        <>
          <Circle cx="32" cy="32" r="20" />
          <Path d="M32 12 L 36 32 L 32 52 L 28 32 Z" />
          <Path d="M12 32 L 32 28 L 52 32 L 32 36 Z" />
          <Circle cx="32" cy="32" r="2" fill={color} />
        </>
      );
    case 'fern-spray':
      return (
        <>
          <Path d="M32 54 C 34 44 33 30 34 18 C 34 14 32 10 30 8" />
          <Path d="M31 44 C 24 42 22 40 20 36" />
          <Path d="M31 44 C 38 42 40 40 42 36" />
          <Path d="M31 34 C 26 32 24 30 22 26" />
          <Path d="M31 34 C 38 32 40 30 42 26" />
          <Path d="M32 24 C 28 22 26 20 24 17" />
          <Path d="M32 24 C 36 22 38 20 40 17" />
        </>
      );
    case 'winged-lion':
      return (
        <>
          <Path d="M16 44 C 14 34 22 24 32 24 C 42 24 50 34 48 44" />
          <Circle cx="26" cy="34" r="1.6" fill={color} />
          <Circle cx="38" cy="34" r="1.6" fill={color} />
          <Path d="M28 40 C 30 42 34 42 36 40" />
          <Path d="M20 30 C 14 24 10 14 8 8 C 14 12 22 18 26 26" />
          <Path d="M44 30 C 50 24 54 14 56 8 C 50 12 42 18 38 26" />
          <Path d="M16 44 L 12 52" />
          <Path d="M48 44 L 52 52" />
        </>
      );
    case 'brushstroke':
      return (
        <>
          <Rect x="20" y="8" width="8" height="22" />
          <Path d="M20 30 C 16 34 12 38 12 44 C 12 52 20 56 24 56 C 28 56 36 52 36 44 C 36 38 32 34 28 30 Z" />
          <Line x1="24" y1="14" x2="24" y2="28" />
          <Path d="M40 20 C 44 22 50 26 52 32 C 54 38 52 44 48 46" />
        </>
      );
  }
}
