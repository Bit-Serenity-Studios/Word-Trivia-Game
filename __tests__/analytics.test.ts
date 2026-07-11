import {
  EVENT_NAMES,
  NullTelemetry,
  createConsoleTelemetry,
  createRecordingTelemetry,
  type TelemetryEventName,
} from '../services/analytics';

describe('EVENT_NAMES', () => {
  it('is non-empty and contains no duplicates', () => {
    expect(EVENT_NAMES.length).toBeGreaterThan(0);
    const seen = new Set(EVENT_NAMES);
    expect(seen.size).toBe(EVENT_NAMES.length);
  });

  it('covers the pillars M5 declared: session/onboarding/store/iap/ad/notification', () => {
    const required: TelemetryEventName[] = [
      'session_start',
      'onboarding_completed',
      'entry_solved',
      'rank_up',
      'sealed_solved',
      'nightly_completed',
      'familiar_reward_claimed',
      'cabinet_unlocked',
      'store_viewed',
      'iap_intent',
      'iap_confirmed',
      'ad_offered',
      'ad_reward_claimed',
      'notification_permission_asked',
    ];
    for (const name of required) {
      expect(EVENT_NAMES).toContain(name);
    }
  });
});

describe('NullTelemetry', () => {
  it('never throws when every declared event is emitted', () => {
    for (const name of EVENT_NAMES) {
      expect(() => NullTelemetry.track(name, { x: 1, y: 'z', flag: true, gone: null })).not.toThrow();
    }
  });

  it('resolves flush()', async () => {
    await expect(NullTelemetry.flush()).resolves.toBeUndefined();
  });
});

describe('createRecordingTelemetry', () => {
  it('records events in order with the provided timestamp', () => {
    let now = 100;
    const rec = createRecordingTelemetry(() => now);
    rec.track('session_start');
    now = 250;
    rec.track('entry_solved', { volume: 'firmament', tier: 'novice' });
    expect(rec.events).toHaveLength(2);
    expect(rec.events[0]!.name).toBe('session_start');
    expect(rec.events[0]!.at).toBe(100);
    expect(rec.events[1]!.name).toBe('entry_solved');
    expect(rec.events[1]!.at).toBe(250);
    expect(rec.events[1]!.props).toEqual({ volume: 'firmament', tier: 'novice' });
  });

  it('clears its buffer on demand', () => {
    const rec = createRecordingTelemetry(() => 0);
    rec.track('session_start');
    expect(rec.events).toHaveLength(1);
    rec.clear();
    expect(rec.events).toHaveLength(0);
  });
});

describe('createConsoleTelemetry', () => {
  it('writes an ISO-timestamped line to the provided log sink', () => {
    const lines: string[] = [];
    const t = createConsoleTelemetry({
      prefix: 'test',
      log: (l) => lines.push(l),
      now: () => 1_700_000_000_000,
    });
    t.track('entry_solved', { tier: 'sage' });
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('[test]');
    expect(lines[0]).toContain('entry_solved');
    expect(lines[0]).toContain('"tier":"sage"');
  });

  it('omits the props segment when no props are provided', () => {
    const lines: string[] = [];
    const t = createConsoleTelemetry({ log: (l) => lines.push(l), now: () => 0 });
    t.track('session_start');
    expect(lines[0]).not.toContain('{');
  });
});
