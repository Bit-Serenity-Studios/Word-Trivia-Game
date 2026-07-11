export type RewardedPlacement =
  | 'post-solve-double'
  | 'failure-rescue'
  | 'archivist-gift';

export interface RewardedAdResult {
  shown: boolean;
  rewarded: boolean;
}

export interface RewardedAdProvider {
  isReady(): boolean;
  showAd(placement: RewardedPlacement): Promise<RewardedAdResult>;
}

export const BROADCAST_DURATION_MS = 3000;

export function placementCopy(placement: RewardedPlacement): { title: string; body: string } {
  switch (placement) {
    case 'post-solve-double':
      return {
        title: 'Double this hoard of ink?',
        body: 'A patron in the outer archives will match this entry’s reward if you attend their broadcast.',
      };
    case 'failure-rescue':
      return {
        title: 'A letter, on loan?',
        body: 'The archives will send a raven bearing one revealed letter — attend a broadcast in exchange.',
      };
    case 'archivist-gift':
      return {
        title: 'The Archivist’s Gift',
        body: 'Attend a single broadcast; the archivist will leave a small hoard of ink at your desk.',
      };
  }
}
