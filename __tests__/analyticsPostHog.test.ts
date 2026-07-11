import { createPostHogTelemetry, type PostHogClient } from '../services/analyticsPostHog';
import { EVENT_NAMES } from '../services/analytics';

interface Capture {
  event: string;
  properties?: Record<string, unknown>;
}

function fakeClient() {
  const captures: Capture[] = [];
  const identifies: Array<{ id: string; props?: Record<string, unknown> }> = [];
  let flushed = 0;
  const client: PostHogClient = {
    capture(event, properties) {
      captures.push({ event, properties });
    },
    identify(distinctId, properties) {
      identifies.push({ id: distinctId, props: properties });
    },
    async flush() {
      flushed += 1;
    },
  };
  return {
    client,
    captures,
    identifies,
    flushCount: () => flushed,
  };
}

describe('createPostHogTelemetry', () => {
  it('captures events through the injected client with props preserved', () => {
    const { client, captures } = fakeClient();
    const telemetry = createPostHogTelemetry({ client });
    telemetry.track('entry_solved', { volume: 'firmament', tier: 'novice', rare: false, ink: 12 });
    expect(captures).toHaveLength(1);
    expect(captures[0]!.event).toBe('entry_solved');
    expect(captures[0]!.properties).toEqual({
      volume: 'firmament',
      tier: 'novice',
      rare: false,
      ink: 12,
    });
  });

  it('strips null-valued props before sending', () => {
    const { client, captures } = fakeClient();
    const telemetry = createPostHogTelemetry({ client });
    telemetry.track('entry_solved', { volume: 'firmament', tier: null });
    expect(captures[0]!.properties).toEqual({ volume: 'firmament' });
  });

  it('sends no properties field when called without props', () => {
    const { client, captures } = fakeClient();
    const telemetry = createPostHogTelemetry({ client });
    telemetry.track('session_start');
    expect(captures[0]!.properties).toBeUndefined();
  });

  it('identifies once when a distinctId is provided, not on every track', () => {
    const { client, identifies, captures } = fakeClient();
    const telemetry = createPostHogTelemetry({ client, distinctId: 'ath_abc' });
    expect(identifies).toHaveLength(1);
    expect(identifies[0]).toEqual({ id: 'ath_abc', props: undefined });
    telemetry.track('session_start');
    telemetry.track('store_viewed', { patron: false });
    expect(identifies).toHaveLength(1);
    expect(captures).toHaveLength(2);
  });

  it('passes identify properties through when present', () => {
    const { client, identifies } = fakeClient();
    createPostHogTelemetry({
      client,
      distinctId: 'ath_abc',
      identifyProperties: { platform: 'ios', appVersion: '0.1.0' },
    });
    expect(identifies[0]!.props).toEqual({ platform: 'ios', appVersion: '0.1.0' });
  });

  it('does not identify when distinctId is null or missing', () => {
    const { client, identifies } = fakeClient();
    createPostHogTelemetry({ client });
    createPostHogTelemetry({ client, distinctId: null });
    expect(identifies).toHaveLength(0);
  });

  it('delegates flush to the client', async () => {
    const { client, flushCount } = fakeClient();
    const telemetry = createPostHogTelemetry({ client });
    await telemetry.flush();
    expect(flushCount()).toBe(1);
  });

  it('accepts every declared event name without throwing', () => {
    const { client, captures } = fakeClient();
    const telemetry = createPostHogTelemetry({ client });
    for (const name of EVENT_NAMES) {
      telemetry.track(name, { probe: true });
    }
    expect(captures).toHaveLength(EVENT_NAMES.length);
  });
});
