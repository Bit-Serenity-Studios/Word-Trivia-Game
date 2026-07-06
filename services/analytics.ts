export type TelemetryEventName =
  | 'session_start'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'entry_solved'
  | 'sealed_solved'
  | 'rank_up'
  | 'volume_unlocked'
  | 'volume_opened'
  | 'nightly_completed'
  | 'cabinet_unlocked'
  | 'familiar_forage_started'
  | 'familiar_reward_claimed'
  | 'store_viewed'
  | 'iap_intent'
  | 'iap_confirmed'
  | 'iap_cancelled'
  | 'iap_restored'
  | 'ad_offered'
  | 'ad_watched'
  | 'ad_declined'
  | 'ad_reward_claimed'
  | 'notification_permission_asked'
  | 'notification_permission_granted'
  | 'notification_permission_denied'
  | 'reset_progress';

export type TelemetryProps = Record<string, string | number | boolean | null>;

export interface TelemetryPayload {
  name: TelemetryEventName;
  props?: TelemetryProps;
  at: number;
}

export interface Telemetry {
  track(name: TelemetryEventName, props?: TelemetryProps): void;
  flush(): Promise<void>;
}

export const NullTelemetry: Telemetry = {
  track: () => undefined,
  flush: () => Promise.resolve(),
};

export interface RecordingTelemetry extends Telemetry {
  events: readonly TelemetryPayload[];
  clear(): void;
}

export function createRecordingTelemetry(now: () => number = () => Date.now()): RecordingTelemetry {
  const events: TelemetryPayload[] = [];
  return {
    get events(): readonly TelemetryPayload[] {
      return events;
    },
    track(name, props) {
      events.push({ name, props, at: now() });
    },
    flush() {
      return Promise.resolve();
    },
    clear() {
      events.length = 0;
    },
  };
}

interface ConsoleOptions {
  prefix?: string;
  log?: (line: string) => void;
  now?: () => number;
}

export function createConsoleTelemetry(options: ConsoleOptions = {}): Telemetry {
  const prefix = options.prefix ?? 'athenaeum';
  const write = options.log ?? ((line: string) => console.log(line));
  const now = options.now ?? (() => Date.now());
  return {
    track(name, props) {
      const ts = new Date(now()).toISOString();
      const rendered = props ? ` ${JSON.stringify(props)}` : '';
      write(`[${prefix}] ${ts} ${name}${rendered}`);
    },
    flush: () => Promise.resolve(),
  };
}

export const EVENT_NAMES: readonly TelemetryEventName[] = [
  'session_start',
  'onboarding_started',
  'onboarding_completed',
  'entry_solved',
  'sealed_solved',
  'rank_up',
  'volume_unlocked',
  'volume_opened',
  'nightly_completed',
  'cabinet_unlocked',
  'familiar_forage_started',
  'familiar_reward_claimed',
  'store_viewed',
  'iap_intent',
  'iap_confirmed',
  'iap_cancelled',
  'iap_restored',
  'ad_offered',
  'ad_watched',
  'ad_declined',
  'ad_reward_claimed',
  'notification_permission_asked',
  'notification_permission_granted',
  'notification_permission_denied',
  'reset_progress',
] as const;
