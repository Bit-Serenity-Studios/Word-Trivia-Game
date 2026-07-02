import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';

export default function DailyScreen() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.palette.ink }}>
      <SafeAreaView style={[styles.wrap, { padding: t.space.xl }]}>
        <Text style={{ color: t.palette.parchment, fontFamily: t.fonts.display, fontSize: 32 }}>
          Nightly Entry
        </Text>
        <Text
          style={{
            color: t.palette.sepia,
            fontFamily: t.fonts.bodyItalic,
            fontSize: 16,
            marginTop: 12,
          }}
        >
          A curated puzzle for each date. (Milestone 2.)
        </Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { flex: 1 } });
