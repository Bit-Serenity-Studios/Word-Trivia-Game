import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';
import type { CuratorLetter as CuratorLetterData } from '@/game/curators';
import type { Volume } from '@/game/volumes';
import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  visible: boolean;
  volume: Volume;
  letter: CuratorLetterData;
  onDismiss: (choice: 'begin' | 'later') => void;
}

export function CuratorLetter({ visible, volume, letter, onDismiss }: Props) {
  const t = useTheme();
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => onDismiss('later')}
    >
      <View style={[styles.backdrop, { backgroundColor: 'rgba(23, 19, 16, 0.9)' }]}>
        <SafeAreaView style={styles.safe}>
          <View
            style={[
              styles.parchment,
              { backgroundColor: t.palette.parchment, borderColor: t.palette.sepia },
            ]}
          >
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
              <Text
                style={{
                  color: t.palette.sepia,
                  fontFamily: t.fonts.bodyItalic,
                  fontSize: 10,
                  letterSpacing: 2.4,
                  textAlign: 'center',
                  marginBottom: 4,
                }}
              >
                A LETTER TO THE READER
              </Text>
              <Text
                style={{
                  color: t.palette.ink,
                  fontFamily: t.fonts.display,
                  fontSize: 22,
                  textAlign: 'center',
                }}
              >
                {volume.title}
              </Text>

              <Divider color={t.palette.sepia} />

              <Text
                style={{
                  color: t.palette.ink,
                  fontFamily: t.fonts.display,
                  fontSize: 15,
                  marginBottom: 12,
                }}
              >
                {letter.greeting}
              </Text>

              {letter.paragraphs.map((para, idx) => (
                <Text
                  key={idx}
                  style={{
                    color: t.palette.mahoganyDeep,
                    fontFamily: t.fonts.body,
                    fontSize: 15,
                    lineHeight: 24,
                    marginBottom: 14,
                  }}
                >
                  {para}
                </Text>
              ))}

              <Text
                style={{
                  color: t.palette.mahoganyDeep,
                  fontFamily: t.fonts.bodyItalic,
                  fontSize: 14,
                  marginTop: 4,
                }}
              >
                {letter.farewell}
              </Text>
              <Text
                style={{
                  color: t.palette.ink,
                  fontFamily: t.fonts.displayItalic,
                  fontSize: 16,
                  marginTop: 2,
                }}
              >
                — {letter.signature}
              </Text>
              <Text
                style={{
                  color: t.palette.sepia,
                  fontFamily: t.fonts.bodyItalic,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {letter.curatorTitle}
              </Text>
            </ScrollView>

            <View style={styles.actions}>
              <Pressable onPress={() => onDismiss('later')} style={styles.ghost}>
                <Text
                  style={{
                    color: t.palette.sepia,
                    fontFamily: t.fonts.displayItalic,
                    fontSize: 13,
                    letterSpacing: 1.2,
                  }}
                >
                  READ LATER
                </Text>
              </Pressable>
              <View style={{ width: 12 }} />
              <Pressable
                onPress={() => onDismiss('begin')}
                style={[
                  styles.solid,
                  {
                    borderColor: t.palette.burgundy,
                    backgroundColor: 'rgba(110, 43, 43, 0.10)',
                  },
                ]}
              >
                <Text
                  style={{
                    color: t.palette.burgundy,
                    fontFamily: t.fonts.displayItalic,
                    fontSize: 13,
                    letterSpacing: 1.2,
                  }}
                >
                  BEGIN THE VOLUME
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function Divider({ color }: { color: string }) {
  return (
    <View style={{ marginVertical: 18, alignItems: 'center' }}>
      <Svg width={180} height={4} viewBox="0 0 180 4">
        <Line x1={0} y1={2} x2={180} y2={2} stroke={color} strokeWidth={0.8} strokeOpacity={0.6} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  safe: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  parchment: {
    flex: 0,
    borderWidth: 1,
    borderRadius: 4,
    padding: 22,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 12,
  },
  scroll: {
    paddingBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
  },
  ghost: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  solid: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
  },
});
