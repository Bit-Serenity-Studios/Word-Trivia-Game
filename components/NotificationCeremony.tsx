import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from './EmptyState';
import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function NotificationCeremony({ visible, onAccept, onDecline }: Props) {
  const t = useTheme();
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onDecline}>
      <View style={[styles.backdrop, { backgroundColor: 'rgba(23, 19, 16, 0.85)' }]}>
        <View style={[styles.card, { backgroundColor: t.palette.mahogany, borderColor: t.palette.gold }]}>
          <EmptyState
            heading="May the raven send word?"
            body="Only when your familiar returns from foraging, and never at inconvenient hours. You may revoke this in Settings."
            glyph="raven"
          />
          <View style={styles.actions}>
            <Pressable onPress={onDecline} style={[styles.ghost, { borderColor: t.palette.sepia }]}>
              <Text
                style={{
                  color: t.palette.sepia,
                  fontFamily: t.fonts.displayItalic,
                  fontSize: 13,
                  letterSpacing: 1.2,
                }}
              >
                NOT NOW
              </Text>
            </Pressable>
            <View style={{ width: 12 }} />
            <Pressable
              onPress={onAccept}
              style={[
                styles.solid,
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
                SEND WORD
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    padding: 20,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 12,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  ghost: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
  },
  solid: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
  },
});
