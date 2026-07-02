import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  ink: number;
  streak: number;
  entries: number;
}

export function Ledger({ ink, streak, entries }: Props) {
  const t = useTheme();
  return (
    <View style={styles.row}>
      <Cell label="INK" value={String(ink)} accent={t.palette.gold} />
      <Divider />
      <Cell label="STREAK" value={String(streak)} accent={t.palette.parchment} />
      <Divider />
      <Cell label="ENTRIES" value={String(entries)} accent={t.palette.parchmentDim} />
    </View>
  );
}

function Cell({ label, value, accent }: { label: string; value: string; accent: string }) {
  const t = useTheme();
  return (
    <View style={styles.cell}>
      <Text
        style={{
          color: accent,
          fontFamily: t.fonts.display,
          fontSize: t.type.hudNumber.size,
          lineHeight: t.type.hudNumber.lineHeight,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: t.palette.sepia,
          fontFamily: t.fonts.bodyItalic,
          fontSize: t.type.hudLabel.size,
          letterSpacing: t.type.hudLabel.letterSpacing,
          lineHeight: t.type.hudLabel.lineHeight,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function Divider() {
  const t = useTheme();
  return <View style={[styles.divider, { backgroundColor: t.palette.sepia }]} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell: {
    alignItems: 'center',
    minWidth: 68,
    paddingHorizontal: 8,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 26,
    opacity: 0.6,
  },
});
