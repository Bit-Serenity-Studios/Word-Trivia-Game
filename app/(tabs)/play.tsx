import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PlaySurface } from '@/components/PlaySurface';
import { Ledger } from '@/components/Ledger';
import { useGame } from '@/state/gameStore';
import { useLedger } from '@/state/ledgerStore';
import { useEntitlements } from '@/state/entitlementsStore';
import { useRewardedAds } from '@/components/RewardedAdProvider';
import { HINT_COST } from '@/game/scoring';
import { economy } from '@/game/economy';
import { useTheme } from '@/theme/ThemeProvider';
import { useHaptics } from '@/hooks/useHaptics';

export default function PlayScreen() {
  const t = useTheme();
  const haptics = useHaptics();
  const ads = useRewardedAds();

  const round = useGame((s) => s.round);
  const phase = useGame((s) => s.phase);
  const lastReward = useGame((s) => s.lastReward);
  const wrongFlash = useGame((s) => s.wrongFlash);
  const startNext = useGame((s) => s.startNext);
  const place = useGame((s) => s.place);
  const returnFromSlot = useGame((s) => s.returnFromSlot);
  const revealHint = useGame((s) => s.revealHint);
  const revealHintFree = useGame((s) => s.revealHintFree);
  const awardBonusInk = useGame((s) => s.awardBonusInk);

  const ink = useLedger((s) => s.ink);
  const streak = useLedger((s) => s.streak);
  const entries = useLedger((s) => s.entries);
  const hydrated = useLedger((s) => s.hydrated);
  const breakStreak = useLedger((s) => s.breakStreak);

  const hintCredits = useEntitlements((s) => s.hintCredits);
  const consumeHintCredit = useEntitlements((s) => s.consumeHintCredit);
  const patron = useEntitlements((s) => s.patron);

  const roundId = round?.question.id ?? null;
  const [rescueDismissed, setRescueDismissed] = useState<string | null>(null);
  const [doubledRound, setDoubledRound] = useState<string | null>(null);
  const roundKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (roundId !== roundKeyRef.current) {
      roundKeyRef.current = roundId;
      setRescueDismissed(null);
    }
  }, [roundId]);

  useEffect(() => {
    if (hydrated && !round) startNext();
  }, [hydrated, round, startNext]);

  const wrongAttempts = round?.wrongAttempts ?? 0;
  const rescueEligible =
    phase === 'playing' &&
    wrongAttempts >= economy.hint.freeAfterFailures &&
    rescueDismissed !== roundId &&
    !patron;

  const onHintPress = useCallback(() => {
    if (hintCredits > 0) {
      if (consumeHintCredit()) {
        revealHintFree();
        haptics.soft();
      }
      return;
    }
    if (ink >= HINT_COST) {
      revealHint();
      haptics.soft();
    }
  }, [hintCredits, consumeHintCredit, revealHintFree, revealHint, ink, haptics]);

  const onRescueAccept = useCallback(async () => {
    const result = await ads.showAd('failure-rescue');
    if (result.rewarded) {
      revealHintFree();
      haptics.success();
    }
    setRescueDismissed(roundId);
  }, [ads, revealHintFree, haptics, roundId]);

  const onRescueDecline = useCallback(() => {
    setRescueDismissed(roundId);
  }, [roundId]);

  const onDoubleReward = useCallback(async () => {
    if (!roundId || lastReward === null || doubledRound === roundId) return;
    const result = await ads.showAd('post-solve-double');
    if (result.rewarded) {
      awardBonusInk(lastReward);
      setDoubledRound(roundId);
      haptics.success();
    }
  }, [ads, roundId, lastReward, doubledRound, awardBonusInk, haptics]);

  const canHint =
    phase === 'playing' && (hintCredits > 0 || ink >= HINT_COST);

  const hintLabel =
    hintCredits > 0
      ? `REVEAL LETTER  ·  ${hintCredits} in hand`
      : `REVEAL LETTER  ·  ${HINT_COST} ink`;

  return (
    <View style={{ flex: 1 }}>
      <PlaySurface
        round={round}
        phase={phase}
        wrongFlash={wrongFlash}
        lastReward={lastReward}
        header={
          <View style={{ alignItems: 'center' }}>
            <Ledger ink={ink} streak={streak} entries={entries} />
          </View>
        }
        primaryActionLabel={hintLabel}
        primaryActionEnabled={canHint}
        onPrimaryAction={onHintPress}
        secondaryActionLabel="SET ASIDE"
        secondaryActionEnabled={phase === 'playing'}
        onSecondaryAction={() => {
          breakStreak();
          startNext();
        }}
        onPlace={place}
        onReturn={returnFromSlot}
        resolveActionLabel="NEXT ENTRY →"
        onResolveAction={startNext}
        resolveExtra={
          lastReward !== null && roundId ? (
            doubledRound === roundId ? (
              <Text
                style={{
                  color: t.palette.gold,
                  fontFamily: t.fonts.bodyItalic,
                  fontSize: 12,
                  marginTop: 6,
                }}
              >
                Doubled by a patron’s broadcast.
              </Text>
            ) : (
              !patron ? (
                <Pressable
                  onPress={onDoubleReward}
                  style={{
                    marginTop: 8,
                    borderWidth: 1,
                    borderColor: t.palette.sepia,
                    borderRadius: 999,
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      color: t.palette.parchment,
                      fontFamily: t.fonts.displayItalic,
                      fontSize: 12,
                      letterSpacing: 1,
                    }}
                  >
                    DOUBLE (WATCH BROADCAST)
                  </Text>
                </Pressable>
              ) : null
            )
          ) : null
        }
      />

      {rescueEligible ? (
        <View style={styles.rescueBar} pointerEvents="box-none">
          <View
            style={[
              styles.rescue,
              {
                backgroundColor: t.palette.mahogany,
                borderColor: t.palette.gold,
              },
            ]}
          >
            <Text
              style={{
                color: t.palette.parchment,
                fontFamily: t.fonts.display,
                fontSize: 15,
                marginBottom: 4,
              }}
            >
              The archives will lend a letter.
            </Text>
            <Text
              style={{
                color: t.palette.sepia,
                fontFamily: t.fonts.bodyItalic,
                fontSize: 12,
                marginBottom: 10,
              }}
            >
              Watch one broadcast and a raven arrives with a revealed letter.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Pressable onPress={onRescueDecline} style={styles.rescueGhost}>
                <Text
                  style={{
                    color: t.palette.sepia,
                    fontFamily: t.fonts.displayItalic,
                    fontSize: 12,
                    letterSpacing: 1.1,
                  }}
                >
                  NO, THANK YOU
                </Text>
              </Pressable>
              <Pressable
                onPress={onRescueAccept}
                style={[
                  styles.rescueSolid,
                  { borderColor: t.palette.gold, backgroundColor: 'rgba(201, 162, 39, 0.10)' },
                ]}
              >
                <Text
                  style={{
                    color: t.palette.gold,
                    fontFamily: t.fonts.displayItalic,
                    fontSize: 12,
                    letterSpacing: 1.1,
                  }}
                >
                  WATCH BROADCAST
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  rescueBar: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    alignItems: 'stretch',
    zIndex: 55,
  },
  rescue: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  rescueGhost: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  rescueSolid: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    marginLeft: 8,
  },
});
