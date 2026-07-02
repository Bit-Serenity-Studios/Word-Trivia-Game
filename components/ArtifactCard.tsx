import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArtifactSVG } from './ArtifactSVG';
import type { Artifact } from '@/game/cabinet';
import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  artifact: Artifact;
  unlocked: boolean;
}

export function ArtifactCard({ artifact, unlocked }: Props) {
  const t = useTheme();
  const color = unlocked ? t.palette.gold : t.palette.parchment;
  return (
    <View
      style={[
        styles.wrap,
        {
          padding: t.space.md,
          backgroundColor: unlocked ? 'rgba(201, 162, 39, 0.05)' : 'rgba(231, 219, 192, 0.02)',
          borderColor: unlocked ? t.palette.gold : t.palette.sepia,
          borderRadius: t.radii.card,
          opacity: unlocked ? 1 : 0.55,
        },
      ]}
    >
      <View style={styles.icon}>
        <ArtifactSVG kind={artifact.kind} color={color} size={56} faint={!unlocked} />
      </View>
      <Text
        style={{
          color: unlocked ? t.palette.parchment : t.palette.sepia,
          fontFamily: t.fonts.display,
          fontSize: 16,
          marginTop: 6,
          textAlign: 'center',
        }}
      >
        {unlocked ? artifact.name : '— sealed —'}
      </Text>
      <Text
        style={{
          color: t.palette.sepia,
          fontFamily: t.fonts.bodyItalic,
          fontSize: 11,
          textAlign: 'center',
          marginTop: 2,
        }}
      >
        {unlocked ? artifact.flavor : `Unlocked after ${artifact.entriesRequired} entries.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 12,
    minHeight: 150,
  },
  icon: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
