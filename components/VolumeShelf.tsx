import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { VolumeCover } from './VolumeCover';
import type { VolumeProgress } from '@/game/volumes';
import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  progress: readonly VolumeProgress[];
  onOpen: (volumeId: VolumeProgress['volume']['id']) => void;
}

export function VolumeShelf({ progress, onOpen }: Props) {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      {progress.map((p) => (
        <VolumeCard key={p.volume.id} progress={p} onOpen={onOpen} />
      ))}
    </View>
  );
}

function VolumeCard({
  progress,
  onOpen,
}: {
  progress: VolumeProgress;
  onOpen: Props['onOpen'];
}) {
  const t = useTheme();
  const { volume, solved, size, unlocked, completed, unlockThreshold } = progress;
  const bar = size === 0 ? 0 : solved / size;

  return (
    <Pressable
      onPress={() => (unlocked ? onOpen(volume.id) : undefined)}
      disabled={!unlocked}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: t.palette.mahogany,
          borderColor: unlocked ? t.palette.sepia : t.palette.mahoganyDeep,
          opacity: unlocked ? 1 : 0.55,
          transform: [{ scale: pressed && unlocked ? 0.99 : 1 }],
        },
      ]}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.coverWell,
            {
              backgroundColor: t.palette.mahoganyDeep,
              borderColor: t.palette.sepia,
            },
          ]}
        >
          <VolumeCover
            cover={volume.cover}
            size={54}
            color={completed ? t.palette.gold : t.palette.parchment}
            faint={!unlocked}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text
            style={{
              color: t.palette.sepia,
              fontFamily: t.fonts.bodyItalic,
              fontSize: 10,
              letterSpacing: 1.8,
            }}
          >
            VOLUME {String(volume.order + 1).padStart(2, '0')}
          </Text>
          <Text
            style={{
              color: unlocked ? t.palette.parchment : t.palette.parchmentDim,
              fontFamily: t.fonts.display,
              fontSize: 18,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {volume.title}
          </Text>
          <Text
            style={{
              color: t.palette.parchmentDim,
              fontFamily: t.fonts.bodyItalic,
              fontSize: 12,
              marginTop: 3,
            }}
            numberOfLines={2}
          >
            {unlocked ? volume.description : `Complete ${unlockThreshold} entries in the previous volume to unseal.`}
          </Text>
          <View style={{ marginTop: 8 }}>
            <View
              style={[
                styles.barBg,
                { backgroundColor: t.palette.mahoganyDeep, borderColor: t.palette.sepia },
              ]}
            >
              <View
                style={{
                  height: '100%',
                  width: `${Math.round(bar * 100)}%`,
                  backgroundColor: completed ? t.palette.gold : t.palette.parchment,
                  opacity: unlocked ? 0.85 : 0.35,
                }}
              />
            </View>
            <Text
              style={{
                color: t.palette.sepia,
                fontFamily: t.fonts.bodyItalic,
                fontSize: 11,
                marginTop: 4,
              }}
            >
              {solved} / {size} entries {completed ? '· catalogued' : ''}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  coverWell: {
    width: 72,
    height: 92,
    borderRadius: 3,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barBg: {
    height: 6,
    borderWidth: 0.5,
    borderRadius: 2,
    overflow: 'hidden',
  },
});
