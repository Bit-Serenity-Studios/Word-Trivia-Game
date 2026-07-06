import type { Telemetry, TelemetryEventName, TelemetryProps } from './analytics';

export interface PostHogClient {
  capture(event: string, properties?: Record<string, unknown>): void;
  identify(distinctId: string, properties?: Record<string, unknown>): void;
  flush(): Promise<void>;
}

export interface PostHogTelemetryOptions {
  client: PostHogClient;
  distinctId?: string | null;
  identifyProperties?: Record<string, unknown>;
}

export function createPostHogTelemetry(options: PostHogTelemetryOptions): Telemetry {
  const { client, distinctId, identifyProperties } = options;
  let identified = false;
  const identifyIfNeeded = (): void => {
    if (identified || !distinctId) return;
    client.identify(distinctId, identifyProperties);
    identified = true;
  };
  identifyIfNeeded();
  return {
    track(name: TelemetryEventName, props?: TelemetryProps) {
      identifyIfNeeded();
      client.capture(name, normalizeProps(props));
    },
    flush() {
      return client.flush();
    },
  };
}

function normalizeProps(props: TelemetryProps | undefined): Record<string, unknown> | undefined {
  if (!props) return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === null) continue;
    out[key] = value;
  }
  return out;
}
