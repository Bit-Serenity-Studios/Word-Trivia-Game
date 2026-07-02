import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArtifactSVG } from './ArtifactSVG';
import { CountdownText } from './CountdownText';
import { useTheme } from '@/theme/ThemeProvider';
import { useFamiliar } from '@/state/familiarStore';
import { useLedger } from '@/state/ledgerStore';
import { FORAGE_DURATION_MS, hoardFlavor, type HoardReward } from '@/game/familiar';
import { useHaptics } from '@/hooks/useHaptics';

export function FamiliarPanel({ owlUnlocked }: { owlUnlocked: boolean }) {
  const t = useTheme();
  const haptics = useHaptics();
  const familiar = useFamiliar();
  const awardInk = useLedger((s) => s.awardInk);
  const [lastReward, setLastReward] = useState<HoardReward | null>(null);
  const [tick, setTick] = useState(0);

  const startedAt = familiar.taskStartedAt;
  const foraging = startedAt !== null;
  const deadline = startedAt !== null ? startedAt + FORAGE_DURATION_MS : 0;
  const ready = foraging && Date.now() >= deadline;

  const onStart = useCallback(async () => {
    haptics.soft();
    setLastReward(null);
    await familiar.startForaging();
    setTick((n) => n + 1);
  }, [familiar, haptics]);

  const onCollect = useCallback(() => {
    const reward = familiar.collectHoard(Date.now());
    if (reward) {
      awardInk(reward.ink);
      haptics.success();
      setLastReward(reward);
    }
    setTick((n) => n + 1);
  }, [familiar, awardInk, haptics]);

  const onCancel = useCallback(async () => {
    await familiar.cancelForaging();
    setTick((n) => n + 1);
  }, [familiar]);

  if (!owlUnlocked) {
    return (
      <View style={[styles.wrap, { borderColor: t.palette.sepia, opacity: 0.55 }]}>
        <View style={styles.row}>
          <ArtifactSVG kind="spectral-owl" color={t.palette.parchment} size={52} faint />
          <View style={{ marginLeft: t.space.md, flex: 1 }}>
            <Text style={[styles.title, { color: t.palette.sepia, fontFamily: t.fonts.display }]}>
              The owl is not yet here.
            </Text>
            <Text style={{ color: t.palette.sepia, fontFamily: t.fonts.bodyItalic, fontSize: 12 }}>
              Catalogue fifteen entries to summon the spectral familiar.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { borderColor: t.palette.gold }]}>
      <View style={styles.row}>
        <ArtifactSVG kind="spectral-owl" color={t.palette.gold} size={56} />
        <View style={{ marginLeft: t.space.md, flex: 1 }}>
          <Text style={[styles.title, { color: t.palette.parchment, fontFamily: t.fonts.display }]}>
            Spectral Owl
          </Text>
          {!foraging ? (
            <Text style={{ color: t.palette.sepia, fontFamily: t.fonts.bodyItalic, fontSize: 12 }}>
              Idle. Send the owl out to forage the stacks (two hours).
            </Text>
          ) : ready ? (
            <Text style={{ color: t.palette.gold, fontFamily: t.fonts.bodyItalic, fontSize: 12 }}>
              Returned with a hoard.
            </Text>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: t.palette.sepia, fontFamily: t.fonts.bodyItalic, fontSize: 12 }}>
                Foraging. Returns in{' '}
              </Text>
              <CountdownText
                deadline={deadline}
                onReady={() => setTick((n) => n + 1)}
                style={{ color: t.palette.parchment, fontFamily: t.fonts.display, fontSize: 14 }}
              />
              <Text style={{ color: t.palette.sepia, fontFamily: t.fonts.bodyItalic, fontSize: 12 }}>.</Text>
            </View>
          )}
        </View>
      </View>

      {lastReward !== null ? (
        <View style={[styles.reward, { borderTopColor: t.palette.sepia }]}>
          <Text style={{ color: t.palette.gold, fontFamily: t.fonts.display, fontSize: 15 }}>
            +{lastReward.ink} ink · {lastReward.tier} hoard
          </Text>
          <Text
            style={{
              color: t.palette.sepia,
              fontFamily: t.fonts.bodyItalic,
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {hoardFlavor(lastReward.tier)}
          </Text>
        </View>
      ) : null}

      <View style={styles.actions} key={tick}>
        {!foraging ? (
          <PanelButton label="SEND FORAGING" primary onPress={onStart} />
        ) : ready ? (
          <PanelButton label="COLLECT HOARD" primary onPress={onCollect} />
        ) : (
          <PanelButton label="CALL BACK" onPress={onCancel} />
        )}
      </View>
    </View>
  );
}

function PanelButton({
  label,
  onPress,
  primary,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: t.radii.pill,
        borderWidth: 1,
        borderColor: primary ? t.palette.gold : t.palette.sepia,
        backgroundColor: primary ? 'rgba(201, 162, 39, 0.10)' : 'transparent',
      }}
    >
      <Text
        style={{
          color: primary ? t.palette.gold : t.palette.sepia,
          fontFamily: t.fonts.displayItalic,
          fontSize: 14,
          letterSpacing: 1.1,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 14,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 2,
  },
  reward: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'flex-end',
  },
});
