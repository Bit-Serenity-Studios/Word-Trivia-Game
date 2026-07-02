import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LetterTile } from './LetterTile';
import { useTheme } from '@/theme/ThemeProvider';
import type { RoundState } from '@/game/types';

interface Props {
  round: RoundState;
  onTilePress: (tileId: string) => void;
}

export function TileTray({ round, onTilePress }: Props) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.wrap,
        {
          padding: t.space.md,
          borderRadius: t.radii.drawer,
          backgroundColor: t.palette.mahoganyDeep,
        },
      ]}
    >
      <LinearGradient
        colors={[t.palette.mahogany, t.palette.mahoganyDeep, t.palette.mahogany]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: t.radii.drawer },
        ]}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: t.radii.drawer },
          t.shadow.drawerInsetOverlay,
        ]}
        pointerEvents="none"
      />
      <View style={styles.row}>
        {round.tray.map((tile) => (
          <View key={tile.id} style={{ margin: t.size.tileGap / 2 }}>
            <LetterTile letter={tile.letter} onPress={() => onTilePress(tile.id)} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
