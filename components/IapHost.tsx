import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { economy } from '@/game/economy';
import type { IapProvider, PurchaseAttempt } from '@/services/iap';
import { useEntitlements } from '@/state/entitlementsStore';
import { useLedger } from '@/state/ledgerStore';
import { useTelemetry } from './TelemetryProvider';

interface Pending {
  sku: string;
  title: string;
  flavor: string;
  priceLabel: string;
  resolve: (a: PurchaseAttempt) => void;
}

const Ctx = createContext<IapProvider | null>(null);

export function useIap(): IapProvider {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useIap must be used within IapHost');
  return ctx;
}

function productFor(sku: string) {
  const products = Object.values(economy.iap);
  return products.find((p) => p.sku === sku);
}

export function IapHost({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const pendingRef = useRef<Pending | null>(null);
  const entitlements = useEntitlements();
  const awardInk = useLedger((s) => s.awardInk);
  const telemetry = useTelemetry();

  pendingRef.current = pending;

  const applyPurchase = useCallback(
    (sku: string) => {
      const product = productFor(sku);
      if (!product) return;
      if (sku === economy.iap.patron.sku) {
        entitlements.grantPatron();
        awardInk(economy.iap.patron.ink);
        return;
      }
      if ('hints' in product) {
        entitlements.addHintCredits(product.hints);
        return;
      }
      if ('ink' in product) {
        awardInk(product.ink);
      }
    },
    [entitlements, awardInk],
  );

  const purchase = useCallback(
    (sku: string): Promise<PurchaseAttempt> => {
      const product = productFor(sku);
      telemetry.track('iap_intent', { sku, resolved: Boolean(product) });
      if (!product) {
        return Promise.resolve({ sku, outcome: 'error' });
      }
      if (sku === economy.iap.patron.sku && entitlements.patron) {
        return Promise.resolve({ sku, outcome: 'purchased' });
      }
      return new Promise((resolve) => {
        setPending({
          sku,
          title: product.title,
          flavor: product.flavor,
          priceLabel: product.priceLabel,
          resolve,
        });
      });
    },
    [entitlements.patron, telemetry],
  );

  const finish = useCallback(
    (outcome: 'purchased' | 'cancelled') => {
      const cur = pendingRef.current;
      if (!cur) return;
      telemetry.track(outcome === 'purchased' ? 'iap_confirmed' : 'iap_cancelled', {
        sku: cur.sku,
      });
      if (outcome === 'purchased') applyPurchase(cur.sku);
      cur.resolve({ sku: cur.sku, outcome });
      pendingRef.current = null;
      setPending(null);
    },
    [applyPurchase, telemetry],
  );

  const restore = useCallback(async (): Promise<string[]> => {
    return entitlements.patron ? [economy.iap.patron.sku] : [];
  }, [entitlements.patron]);

  const isPurchased = useCallback(
    (sku: string) => sku === economy.iap.patron.sku && entitlements.patron,
    [entitlements.patron],
  );

  const provider = useMemo<IapProvider>(
    () => ({ purchase, restore, isPurchased }),
    [purchase, restore, isPurchased],
  );

  return (
    <Ctx.Provider value={provider}>
      {children}
      {pending ? (
        <PurchaseModal
          title={pending.title}
          flavor={pending.flavor}
          priceLabel={pending.priceLabel}
          onConfirm={() => finish('purchased')}
          onCancel={() => finish('cancelled')}
        />
      ) : null}
    </Ctx.Provider>
  );
}

function PurchaseModal({
  title,
  flavor,
  priceLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  flavor: string;
  priceLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTheme();
  return (
    <Modal transparent animationType="fade" visible onRequestClose={onCancel}>
      <View style={[styles.backdrop, { backgroundColor: 'rgba(23, 19, 16, 0.85)' }]}>
        <View style={[styles.card, { backgroundColor: t.palette.mahogany, borderColor: t.palette.gold }]}>
          <Text
            style={{
              color: t.palette.sepia,
              fontFamily: t.fonts.bodyItalic,
              fontSize: 11,
              letterSpacing: 2,
            }}
          >
            SIMULATED PURCHASE
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
            {title}
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
            {flavor}
          </Text>
          <Text
            style={{
              color: t.palette.gold,
              fontFamily: t.fonts.display,
              fontSize: 26,
              marginTop: 18,
            }}
          >
            {priceLabel}
          </Text>
          <Text
            style={{
              color: t.palette.sepia,
              fontFamily: t.fonts.bodyItalic,
              fontSize: 10,
              marginTop: 8,
              textAlign: 'center',
              letterSpacing: 1,
            }}
          >
            No real money will change hands until the real IAP SDK is wired.
          </Text>

          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={[styles.ghost, { borderColor: t.palette.sepia }]}>
              <Text
                style={{
                  color: t.palette.sepia,
                  fontFamily: t.fonts.displayItalic,
                  fontSize: 14,
                  letterSpacing: 1.2,
                }}
              >
                CANCEL
              </Text>
            </Pressable>
            <View style={{ width: 12 }} />
            <Pressable
              onPress={onConfirm}
              style={[
                styles.solid,
                { borderColor: t.palette.gold, backgroundColor: 'rgba(201, 162, 39, 0.10)' },
              ]}
            >
              <Text
                style={{
                  color: t.palette.gold,
                  fontFamily: t.fonts.displayItalic,
                  fontSize: 14,
                  letterSpacing: 1.2,
                }}
              >
                CONFIRM
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
  actions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  ghost: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
  },
  solid: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
  },
});
