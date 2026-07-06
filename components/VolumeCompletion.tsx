import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VolumeCover } from './VolumeCover';
import type { CuratorLetter } from '@/game/curators';
import type { Volume } from '@/game/volumes';
import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  visible: boolean;
  volume: Volume;
  letter: CuratorLetter;
  inkReward: number;
  onDismiss: () => void;
}

export function VolumeCompletion({ visible, volume, letter, inkReward, onDismiss }: Props) {
  const t = useTheme();
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onDismiss}>
      <View style={[styles.backdrop, { backgroundColor: 'rgba(23, 19, 16, 0.92)' }]}>
        <SafeAreaView style={styles.safe}>
          <View
            style={[
              styles.card,
              { backgroundColor: t.palette.mahoganyDeep, borderColor: t.palette.gold },
            ]}
          >
            <Text
              style={{
                color: t.palette.gold,
                fontFamily: t.fonts.displayItalic,
                fontSize: 12,
                letterSpacing: 2.6,
                textAlign: 'center',
              }}
            >
              VOLUME COMPLETE
            </Text>

            <View style={styles.coverWell}>
              <VolumeCover cover={volume.cover} size={72} color={t.palette.gold} />
            </View>

            <Text
              style={{
                color: t.palette.parchment,
                fontFamily: t.fonts.display,
                fontSize: 24,
                textAlign: 'center',
                marginTop: 6,
              }}
            >
              {volume.title}
            </Text>
            <Text
              style={{
                color: t.palette.parchmentDim,
                fontFamily: t.fonts.bodyItalic,
                fontSize: 14,
                textAlign: 'center',
                marginTop: 12,
                paddingHorizontal: 12,
                lineHeight: 21,
              }}
            >
              {letter.completionEpigram}
            </Text>
            <Text
              style={{
                color: t.palette.sepia,
                fontFamily: t.fonts.bodyItalic,
                fontSize: 12,
                textAlign: 'center',
                marginTop: 10,
              }}
            >
              — {letter.signature}, {letter.curatorTitle}
            </Text>

            <Text
              style={{
                color: t.palette.gold,
                fontFamily: t.fonts.display,
                fontSize: 20,
                textAlign: 'center',
                marginTop: 20,
              }}
            >
              +{inkReward} ink
            </Text>

            <Pressable
              onPress={onDismiss}
              style={[
                styles.button,
                { borderColor: t.palette.gold, backgroundColor: 'rgba(201, 162, 39, 0.10)' },
              ]}
            >
              <Text
                style={{
                  color: t.palette.gold,
                  fontFamily: t.fonts.displayItalic,
                  fontSize: 13,
                  letterSpacing: 1.2,
                }}
              >
                RETURN TO THE SHELF
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  safe: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    minWidth: 300,
    maxWidth: 380,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 12,
  },
  coverWell: {
    marginTop: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.35)',
    borderRadius: 3,
  },
  button: {
    marginTop: 22,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
    borderWidth: 1,
  },
});
