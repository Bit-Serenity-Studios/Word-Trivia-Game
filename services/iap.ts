export type PurchaseOutcome = 'purchased' | 'cancelled' | 'error';

export interface PurchaseAttempt {
  sku: string;
  outcome: PurchaseOutcome;
}

export interface IapProvider {
  purchase(sku: string): Promise<PurchaseAttempt>;
  restore(): Promise<string[]>;
  isPurchased(sku: string): boolean;
}
