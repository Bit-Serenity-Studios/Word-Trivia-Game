import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import type { Question } from '@/game/types';

interface Props {
  question: Question;
}

export function QuestionCard({ question }: Props) {
  const t = useTheme();
  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={`${question.category}. ${question.prompt}`}
      style={[
        styles.wrap,
        t.shadow.card,
        {
          minHeight: t.size.cardMinHeight,
          padding: t.space.xl,
          borderRadius: t.radii.card,
          transform: [{ rotate: `${t.tilt.cardDeg}deg` }],
        },
      ]}
    >
      <LinearGradient
        colors={[t.palette.parchment, '#DCCFAF', t.palette.parchment]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: t.radii.card }]}
      />
      <View style={[StyleSheet.absoluteFill, styles.vignette]} />
      <Text
        style={{
          color: t.palette.sepia,
          fontFamily: t.fonts.displayItalic,
          fontSize: t.type.cardCategory.size,
          letterSpacing: t.type.cardCategory.letterSpacing,
          marginBottom: t.space.md,
        }}
        allowFontScaling={false}
      >
        {question.category.toUpperCase()}
      </Text>
      <Text
        style={{
          color: t.palette.mahoganyDeep,
          fontFamily: t.fonts.display,
          fontSize: t.type.cardPrompt.size,
          lineHeight: t.type.cardPrompt.lineHeight,
        }}
      >
        {question.prompt}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  vignette: {
    borderRadius: 3,
    borderWidth: 2,
    borderColor: 'rgba(76, 55, 30, 0.18)',
  },
});
