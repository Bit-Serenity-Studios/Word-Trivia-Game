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
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  BROADCAST_DURATION_MS,
  placementCopy,
  type RewardedAdProvider,
  type RewardedAdResult,
  type RewardedPlacement,
} from '@/services/ads';
import { useTheme } from '@/theme/ThemeProvider';
import { useEntitlements } from '@/state/entitlementsStore';

interface Pending {
  placement: RewardedPlacement;
  resolve: (r: RewardedAdResult) => void;
  startedAt: number;
}

const Ctx = createContext<RewardedAdProvider | null>(null);

export function useRewardedAds(): RewardedAdProvider {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useRewardedAds must be used within RewardedAdHost');
  return ctx;
}

export function RewardedAdHost({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [done, setDone] = useState(false);
  const isPatron = useEntitlements((s) => s.patron);
  const pendingRef = useRef<Pending | null>(null);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  const showAd = useCallback(
    (placement: RewardedPlacement): Promise<RewardedAdResult> => {
      if (isPatron) return Promise.resolve({ shown: false, rewarded: true });
      return new Promise((resolve) => {
        setDone(false);
        setPending({ placement, resolve, startedAt: Date.now() });
      });
    },
    [isPatron],
  );

  useEffect(() => {
    if (!pending) return;
    const id = setTimeout(() => {
      setDone(true);
    }, BROADCAST_DURATION_MS);
    return () => clearTimeout(id);
  }, [pending]);

  const finish = useCallback((rewarded: boolean) => {
    const cur = pendingRef.current;
    if (!cur) return;
    cur.resolve({ shown: true, rewarded });
    pendingRef.current = null;
    setPending(null);
    setDone(false);
  }, []);

  const provider = useMemo<RewardedAdProvider>(
    () => ({
      isReady: () => true,
      showAd,
    }),
    [showAd],
  );

  return (
    <Ctx.Provider value={provider}>
      {children}
      {pending ? (
        <BroadcastModal
          placement={pending.placement}
          done={done}
          onDismiss={(rewarded) => finish(rewarded)}
        />
      ) : null}
    </Ctx.Provider>
  );
}

function BroadcastModal({
  placement,
  done,
  onDismiss,
}: {
  placement: RewardedPlacement;
  done: boolean;
  onDismiss: (rewarded: boolean) => void;
}) {
  const t = useTheme();
  const copy = placementCopy(placement);
  const spin = useSharedValue(0);
  const [remaining, setRemaining] = useState(BROADCAST_DURATION_MS);

  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.linear }), -1);
  }, [spin]);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      setRemaining(Math.max(0, BROADCAST_DURATION_MS - (Date.now() - start)));
    }, 100);
    return () => clearInterval(id);
  }, []);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  return (
    <Modal
      transparent
      animationType="fade"
      visible
      onRequestClose={() => onDismiss(false)}
    >
      <View style={[styles.backdrop, { backgroundColor: 'rgba(23, 19, 16, 0.85)' }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: t.palette.mahogany,
              borderColor: t.palette.gold,
            },
          ]}
        >
          <Text
            style={{
              color: t.palette.sepia,
              fontFamily: t.fonts.bodyItalic,
              fontSize: 11,
              letterSpacing: 2,
            }}
          >
            BROADCAST FROM THE ARCHIVES
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
            {done ? 'Broadcast received.' : copy.title}
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
            {done ? 'The archivist has noted your patience.' : copy.body}
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
              <Pressable onPress={() => onDismiss(false)} style={styles.cancel}>
                <Text
                  style={{
                    color: t.palette.sepia,
                    fontFamily: t.fonts.bodyItalic,
                    fontSize: 12,
                    letterSpacing: 1.4,
                  }}
                >
                  DECLINE
                </Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={() => onDismiss(true)}
              style={[
                styles.confirm,
                {
                  borderColor: t.palette.gold,
                  backgroundColor: 'rgba(201, 162, 39, 0.10)',
                },
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
                CLAIM REWARD
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
  cancel: {
    marginTop: 22,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  confirm: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 1,
  },
});
