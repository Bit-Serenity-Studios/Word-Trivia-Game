import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface Counts {
  solved: number;
  size: number;
}

interface Props {
  novice: Counts;
  scholar: Counts;
  sage: Counts;
  faint?: boolean;
}

export function TierRibbon({ novice, scholar, sage, faint }: Props) {
  const t = useTheme();
  const opacity = faint ? 0.55 : 1;
  return (
    <View style={[styles.row, { opacity }]}>
      <Cell label="Novice" counts={novice} color={t.palette.parchment} tint={t.palette.sepia} />
      <View style={[styles.sep, { backgroundColor: t.palette.sepia }]} />
      <Cell label="Scholar" counts={scholar} color={t.palette.parchment} tint={t.palette.sepia} />
      <View style={[styles.sep, { backgroundColor: t.palette.sepia }]} />
      <Cell label="Sage" counts={sage} color={t.palette.gold} tint={t.palette.sepia} />
    </View>
  );
}

function Cell({
  label,
  counts,
  color,
  tint,
}: {
  label: string;
  counts: Counts;
  color: string;
  tint: string;
}) {
  const t = useTheme();
  const complete = counts.size > 0 && counts.solved >= counts.size;
  return (
    <View style={styles.cell}>
      <Text
        style={{
          color: tint,
          fontFamily: t.fonts.bodyItalic,
          fontSize: 9,
          letterSpacing: 1.6,
        }}
      >
        {label.toUpperCase()}
      </Text>
      <Text
        style={{
          color: complete ? t.palette.gold : color,
          fontFamily: t.fonts.display,
          fontSize: 12,
          marginTop: 1,
        }}
      >
        {counts.solved} / {counts.size}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  cell: {
    alignItems: 'center',
    flex: 1,
  },
  sep: {
    width: 1,
    height: 18,
    opacity: 0.4,
    marginHorizontal: 4,
  },
});
