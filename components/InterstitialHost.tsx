import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {
  placementCopy,
  type InterstitialPlacement,
  type InterstitialProvider,
  type InterstitialResult,
} from '@/services/interstitialAds';
import { resolveInterstitialProvider } from '@/services/providerFactories';
import { interstitialCadencePermits, shouldShowInterstitial } from '@/services/adPolicy';
import { useTheme } from '@/theme/ThemeProvider';
import { useMessages } from '@/i18n/useMessages';
import { useEntitlements } from '@/state/entitlementsStore';
import { useAdCadence } from '@/state/adCadenceStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { economy } from '@/game/economy';

interface Pending {
  placement: InterstitialPlacement;
  resolve: (r: InterstitialResult) => void;
  startedAt: number;
}

interface InterstitialContext {
  offer(placement: InterstitialPlacement): Promise<InterstitialResult>;
}

const Ctx = createContext<InterstitialContext>({
  offer: () => Promise.resolve({ shown: false, closed: true }),
});

export function useInterstitial(): InterstitialContext {
  return useContext(Ctx);
}

export function InterstitialHost({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [done, setDone] = useState(false);
  const pendingRef = useRef<Pending | null>(null);
  const patron = useEntitlements((s) => s.patron);
  const cadence = useAdCadence();

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  const stubProvider = useMemo<InterstitialProvider>(
    () => ({
      isReady: () => true,
      showAd(placement: InterstitialPlacement): Promise<InterstitialResult> {
        return new Promise((resolve) => {
          setDone(false);
          setPending({ placement, resolve, startedAt: Date.now() });
        });
      },
    }),
    [],
  );

  const provider = useMemo<InterstitialProvider>(
    () => resolveInterstitialProvider(stubProvider),
    [stubProvider],
  );

  const usingStub = provider === stubProvider;

  useEffect(() => {
    if (!pending) return;
    const id = setTimeout(() => {
      setDone(true);
    }, economy.interstitial.stubDurationMs);
    return () => clearTimeout(id);
  }, [pending]);

  const finish = useCallback(
    (closed: boolean) => {
      const cur = pendingRef.current;
      if (!cur) return;
      cur.resolve({ shown: true, closed });
      pendingRef.current = null;
      setPending(null);
      setDone(false);
    },
    [],
  );

  const offer = useCallback(
    async (placement: InterstitialPlacement): Promise<InterstitialResult> => {
      if (!shouldShowInterstitial({ patron })) {
        return { shown: false, closed: true };
      }
      const state = useAdCadence.getState();
      const nowMs = Date.now();
      const permitted = interstitialCadencePermits({
        nowMs,
        solvesSinceLastShow: state.solvesSinceLastInterstitial,
        lastShownAtMs: state.lastInterstitialAtMs,
        lastRewardedAtMs: state.lastRewardedAtMs,
        minSolvesBetween: economy.interstitial.minSolvesBetween,
        minMsBetween: economy.interstitial.minMsBetween,
        minMsAfterRewarded: economy.interstitial.minMsAfterRewarded,
      });
      if (!permitted) {
        return { shown: false, closed: true };
      }
      const result = await provider.showAd(placement);
      if (result.shown) {
        cadence.recordInterstitialShown(Date.now());
      }
      return result;
    },
    [patron, provider, cadence],
  );

  const value = useMemo<InterstitialContext>(() => ({ offer }), [offer]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {usingStub && pending ? (
        <InterstitialStubModal
          placement={pending.placement}
          done={done}
          onClose={() => finish(true)}
        />
      ) : null}
    </Ctx.Provider>
  );
}

function InterstitialStubModal({
  placement,
  done,
  onClose,
}: {
  placement: InterstitialPlacement;
  done: boolean;
  onClose: () => void;
}) {
  const t = useTheme();
  const m = useMessages();
  const copy = placementCopy(placement);
  const reduced = useReducedMotion();
  const spin = useSharedValue(0);
  const [remaining, setRemaining] = useState<number>(economy.interstitial.stubDurationMs);

  useEffect(() => {
    if (reduced) return;
    spin.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.linear }), -1);
  }, [spin, reduced]);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      setRemaining(Math.max(0, economy.interstitial.stubDurationMs - (Date.now() - start)));
    }, 100);
    return () => clearInterval(id);
  }, []);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  return (
    <Modal transparent animationType="fade" visible onRequestClose={done ? onClose : undefined}>
      <View style={[styles.backdrop, { backgroundColor: 'rgba(23, 19, 16, 0.9)' }]}>
        <View
          style={[
            styles.card,
            { backgroundColor: t.palette.mahogany, borderColor: t.palette.gold },
          ]}
          accessible
          accessibilityLabel={
            done
              ? `${m.ads.advertisement}. ${m.ads.stubDone}`
              : `${m.ads.advertisement}. ${m.ads.stubTitle}`
          }
        >
          <Text
            style={{
              color: t.palette.sepia,
              fontFamily: t.fonts.bodyItalic,
              fontSize: 11,
              letterSpacing: 2,
            }}
          >
            {m.ads.advertisement}
          </Text>
          <Text
            style={{
              color: t.palette.parchment,
              fontFamily: t.fonts.display,
              fontSize: 22,
              marginTop: 12,
              textAlign: 'center',
            }}
          >
            {done ? m.ads.stubDone : copy.title}
          </Text>
          <Text
            style={{
              color: t.palette.sepia,
              fontFamily: t.fonts.bodyItalic,
              fontSize: 13,
              marginTop: 10,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            {done ? m.ads.stubDoneBody : copy.body}
          </Text>
          <View style={{ height: 24 }} />
          {!done ? (
            <>
              <Animated.View style={[styles.spinner, spinnerStyle, { borderColor: t.palette.gold }]} />
              <Text
                style={{
                  color: t.palette.parchmentDim,
                  fontFamily: t.fonts.display,
                  fontSize: 18,
                  marginTop: 14,
                }}
              >
                {Math.ceil(remaining / 1000)}
              </Text>
            </>
          ) : (
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={m.common.continue}
              style={[
                styles.close,
                { borderColor: t.palette.gold, backgroundColor: 'rgba(201, 162, 39, 0.10)' },
              ]}
            >
              <Text
                style={{
                  color: t.palette.gold,
                  fontFamily: t.fonts.displayItalic,
                  fontSize: 15,
                  letterSpacing: 1.2,
                }}
              >
                {m.common.continue}
              </Text>
            </Pressable>
          )}
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
    maxWidth: 340,
    padding: 24,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 12,
  },
  spinner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  close: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 1,
  },
});
