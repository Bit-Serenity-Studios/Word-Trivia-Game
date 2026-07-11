import type { IapProvider, PurchaseAttempt, PurchaseOutcome } from './iap';

export interface RevenueCatCustomerInfo {
  entitlements: {
    active: Record<string, { productIdentifier: string; identifier: string }>;
  };
  nonSubscriptionTransactions?: Array<{ productIdentifier: string }>;
}

export interface RevenueCatOffering {
  identifier: string;
  availablePackages: Array<{
    identifier: string;
    product: { identifier: string };
  }>;
}

export interface RevenueCatSDK {
  configure(config: { apiKey: string; appUserID?: string | null }): Promise<void> | void;
  getCustomerInfo(): Promise<RevenueCatCustomerInfo>;
  purchaseProduct(productIdentifier: string): Promise<{ customerInfo: RevenueCatCustomerInfo }>;
  restorePurchases(): Promise<RevenueCatCustomerInfo>;
}

export interface RevenueCatConfig {
  entitlementKeyFor(sku: string): string | null;
}

export function createRevenueCatProvider(
  sdk: RevenueCatSDK,
  config: RevenueCatConfig,
): IapProvider {
  const purchasedSkus = new Set<string>();

  const ingestCustomer = (info: RevenueCatCustomerInfo): void => {
    for (const entitlement of Object.values(info.entitlements.active)) {
      purchasedSkus.add(entitlement.productIdentifier);
    }
    for (const tx of info.nonSubscriptionTransactions ?? []) {
      purchasedSkus.add(tx.productIdentifier);
    }
  };

  return {
    async purchase(sku: string): Promise<PurchaseAttempt> {
      try {
        const result = await sdk.purchaseProduct(sku);
        ingestCustomer(result.customerInfo);
        const key = config.entitlementKeyFor(sku);
        const active = key !== null && Boolean(result.customerInfo.entitlements.active[key]);
        const outcome: PurchaseOutcome = active || purchasedSkus.has(sku) ? 'purchased' : 'error';
        return { sku, outcome };
      } catch (err) {
        const cancelled = (err as { userCancelled?: boolean } | null)?.userCancelled === true;
        return { sku, outcome: cancelled ? 'cancelled' : 'error' };
      }
    },
    async restore(): Promise<string[]> {
      try {
        const info = await sdk.restorePurchases();
        ingestCustomer(info);
        return Array.from(purchasedSkus);
      } catch {
        return Array.from(purchasedSkus);
      }
    },
    isPurchased(sku: string): boolean {
      return purchasedSkus.has(sku);
    },
  };
}
