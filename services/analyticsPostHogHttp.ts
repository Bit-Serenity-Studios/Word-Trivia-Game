import type { Telemetry, TelemetryEventName, TelemetryProps } from './analytics';

export interface HttpPostHogOptions {
  apiKey: string;
  host?: string;
  distinctId?: string | null;
  identifyProperties?: Record<string, unknown>;
  flushBatchSize?: number;
  flushIntervalMs?: number;
  fetchImpl?: typeof fetch;
}

interface QueuedEvent {
  event: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

const DEFAULT_BATCH = 20;
const DEFAULT_INTERVAL = 15_000;

export function createHttpPostHogTelemetry(options: HttpPostHogOptions): Telemetry {
  const {
    apiKey,
    host = 'https://us.i.posthog.com',
    distinctId,
    identifyProperties,
    flushBatchSize = DEFAULT_BATCH,
    flushIntervalMs = DEFAULT_INTERVAL,
    fetchImpl = fetch,
  } = options;

  const queue: QueuedEvent[] = [];
  let flushTimer: ReturnType<typeof setTimeout> | null = null;

  const scheduleFlush = (): void => {
    if (flushTimer) return;
    flushTimer = setTimeout(() => {
      flushTimer = null;
      void flush();
    }, flushIntervalMs);
  };

  const flush = async (): Promise<void> => {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    if (queue.length === 0) return;
    const batch = queue.splice(0, queue.length);
    try {
      await fetchImpl(`${host.replace(/\/$/, '')}/batch/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          batch: batch.map((e) => ({
            event: e.event,
            distinct_id: distinctId ?? '(unknown)',
            timestamp: e.timestamp,
            properties: e.properties,
          })),
        }),
      });
    } catch {
      // Network failure — drop the batch rather than accumulate memory pressure.
      // A production impl would persist to AsyncStorage with backoff; for a
      // v1 the client-visible loss is acceptable and simpler.
    }
  };

  if (distinctId) {
    queue.push({
      event: '$identify',
      properties: {
        distinct_id: distinctId,
        $set: identifyProperties ?? {},
      },
      timestamp: new Date().toISOString(),
    });
    scheduleFlush();
  }

  return {
    track(name: TelemetryEventName, props?: TelemetryProps) {
      queue.push({
        event: name,
        properties: normalizeProps(props),
        timestamp: new Date().toISOString(),
      });
      if (queue.length >= flushBatchSize) {
        void flush();
      } else {
        scheduleFlush();
      }
    },
    flush,
  };
}

function normalizeProps(props: TelemetryProps | undefined): Record<string, unknown> {
  if (!props) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === null) continue;
    out[key] = value;
  }
  return out;
}
