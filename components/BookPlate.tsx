import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import type { Rank } from '@/game/ranks';
import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  rank: Rank;
  compact?: boolean;
}

export function BookPlate({ rank, compact }: Props) {
  const t = useTheme();
  const width = compact ? 200 : 260;
  const height = compact ? 68 : 84;
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
        <Svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={StyleSheet.absoluteFill}
        >
          <Path
            d={`M6 6 L ${width - 6} 6 L ${width - 6} ${height - 6} L 6 ${height - 6} Z`}
            fill={t.palette.mahoganyDeep}
            stroke={t.palette.sepia}
            strokeWidth={1}
          />
          <Path
            d={`M12 12 L ${width - 12} 12 L ${width - 12} ${height - 12} L 12 ${height - 12} Z`}
            fill="none"
            stroke={t.palette.sepia}
            strokeOpacity={0.55}
            strokeWidth={0.5}
          />
          <Line
            x1={width / 2 - 26}
            y1={height - 18}
            x2={width / 2 + 26}
            y2={height - 18}
            stroke={t.palette.gold}
            strokeOpacity={0.5}
            strokeWidth={0.75}
          />
        </Svg>
        <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
          <Text
            style={{
              color: t.palette.sepia,
              fontFamily: t.fonts.bodyItalic,
              fontSize: 10,
              letterSpacing: 2,
            }}
          >
            READER’S BOOKPLATE
          </Text>
          <Text
            style={{
              color: t.palette.parchment,
              fontFamily: t.fonts.display,
              fontSize: compact ? 15 : 17,
              marginTop: 2,
              textAlign: 'center',
            }}
          >
            {rank.title}
          </Text>
          {!compact ? (
            <Text
              style={{
                color: t.palette.sepia,
                fontFamily: t.fonts.bodyItalic,
                fontSize: 11,
                marginTop: 3,
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              {rank.epithet}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
