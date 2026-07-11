import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  heading: string;
  body: string;
  glyph?: 'candle' | 'quill' | 'raven' | 'seal' | null;
}

export function EmptyState({ heading, body, glyph = 'seal' }: Props) {
  const t = useTheme();
  return (
    <View style={styles.root}>
      {glyph ? <Glyph kind={glyph} color={t.palette.sepia} /> : null}
      <Text
        style={{
          color: t.palette.parchment,
          fontFamily: t.fonts.display,
          fontSize: 20,
          textAlign: 'center',
          marginTop: 20,
        }}
      >
        {heading}
      </Text>
      <Text
        style={{
          color: t.palette.sepia,
          fontFamily: t.fonts.bodyItalic,
          fontSize: 13,
          textAlign: 'center',
          lineHeight: 20,
          marginTop: 10,
          paddingHorizontal: 24,
        }}
      >
        {body}
      </Text>
    </View>
  );
}

function Glyph({ kind, color }: { kind: NonNullable<Props['glyph']>; color: string }) {
  return (
    <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
      {renderGlyph(kind, color)}
    </Svg>
  );
}

function renderGlyph(kind: NonNullable<Props['glyph']>, color: string): React.ReactNode {
  const stroke = { stroke: color, strokeWidth: 1.5, strokeLinecap: 'round' as const };
  switch (kind) {
    case 'candle':
      return (
        <>
          <Line x1={32} y1={10} x2={32} y2={20} {...stroke} />
          <Circle cx={32} cy={13} r={2.5} fill={color} />
          <Line x1={26} y1={22} x2={38} y2={22} {...stroke} />
          <Line x1={26} y1={22} x2={26} y2={52} {...stroke} />
          <Line x1={38} y1={22} x2={38} y2={52} {...stroke} />
          <Line x1={24} y1={52} x2={40} y2={52} {...stroke} />
        </>
      );
    case 'quill':
      return (
        <>
          <Line x1={16} y1={50} x2={48} y2={18} {...stroke} />
          <Line x1={18} y1={48} x2={30} y2={36} {...stroke} />
          <Line x1={22} y1={44} x2={34} y2={32} {...stroke} />
          <Line x1={26} y1={40} x2={38} y2={28} {...stroke} />
          <Circle cx={14} cy={52} r={2} fill={color} />
        </>
      );
    case 'raven':
      return (
        <>
          <Circle cx={40} cy={26} r={9} {...stroke} />
          <Line x1={49} y1={26} x2={54} y2={22} {...stroke} />
          <Line x1={34} y1={32} x2={16} y2={36} {...stroke} />
          <Line x1={34} y1={32} x2={18} y2={44} {...stroke} />
          <Line x1={40} y1={35} x2={44} y2={54} {...stroke} />
          <Line x1={44} y1={54} x2={40} y2={54} {...stroke} />
          <Circle cx={41} cy={24} r={1} fill={color} />
        </>
      );
    case 'seal':
    default:
      return (
        <>
          <Circle cx={32} cy={32} r={16} {...stroke} />
          <Circle cx={32} cy={32} r={10} {...stroke} />
          <Line x1={32} y1={16} x2={32} y2={48} {...stroke} />
          <Line x1={16} y1={32} x2={48} y2={32} {...stroke} />
        </>
      );
  }
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    paddingVertical: 30,
  },
});
