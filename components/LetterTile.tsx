import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PressableTile } from './PressableTile';
import { useTheme } from '@/theme/ThemeProvider';
import { useHaptics } from '@/hooks/useHaptics';

interface Props {
  letter: string;
  onPress?: () => void;
  locked?: boolean;
  invisible?: boolean;
  size?: number;
}

export function LetterTile({ letter, onPress, locked, invisible, size }: Props) {
  const t = useTheme();
  const haptics = useHaptics();
  const tileSize = size ?? t.size.tile;

  if (invisible) {
    return <View style={{ width: tileSize, height: tileSize }} />;
  }

  const face = locked ? t.palette.goldDim : t.palette.gold;

  return (
    <PressableTile
      onPress={() => {
        haptics.tick();
        onPress?.();
      }}
      disabled={locked}
      accessibilityLabel={`Letter tile ${letter}`}
      style={{
        width: tileSize,
        height: tileSize,
        borderRadius: t.radii.tile,
        overflow: 'hidden',
      }}
    >
      <LinearGradient
        colors={[face, t.palette.goldDim]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={[styles.face, { borderRadius: t.radii.tile }]}
      >
        <View style={[styles.bevel, { borderRadius: t.radii.tile - 1 }]} />
        <Text
          style={[
            {
              color: t.palette.mahoganyDeep,
              fontFamily: t.fonts.display,
              fontSize: t.type.tileLetter.size,
              lineHeight: t.type.tileLetter.lineHeight,
              textShadowColor: 'rgba(255, 240, 200, 0.35)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 0,
            },
          ]}
        >
          {letter}
        </Text>
      </LinearGradient>
    </PressableTile>
  );
}

const styles = StyleSheet.create({
  face: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bevel: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(255, 245, 210, 0.35)',
    borderLeftColor: 'rgba(255, 245, 210, 0.2)',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: 'rgba(0, 0, 0, 0.25)',
    borderBottomColor: 'rgba(0, 0, 0, 0.35)',
  },
});
