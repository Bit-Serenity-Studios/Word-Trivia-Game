import { createHttpPostHogTelemetry } from '../services/analyticsPostHogHttp';

interface CapturedRequest {
  url: string;
  init?: RequestInit;
  body: unknown;
}

function makeFetch(): { fetch: typeof fetch; captured: CapturedRequest[] } {
  const captured: CapturedRequest[] = [];
  const fakeFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    let body: unknown = init?.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // leave as string
      }
    }
    captured.push({ url, init, body });
    return new Response('', { status: 200 });
  }) as typeof fetch;
  return { fetch: fakeFetch, captured };
}

describe('createHttpPostHogTelemetry', () => {
  it('flushes to the configured host + /batch/ endpoint with the api key', async () => {
    const { fetch, captured } = makeFetch();
    const t = createHttpPostHogTelemetry({
      apiKey: 'phc_test',
      host: 'https://us.i.posthog.com',
      distinctId: 'ath_abc',
      flushBatchSize: 999,
      flushIntervalMs: 100000,
      fetchImpl: fetch,
    });
    t.track('session_start');
    t.track('entry_solved', { volume: 'firmament', ink: 12 });
    await t.flush();
    expect(captured).toHaveLength(1);
    expect(captured[0]!.url).toBe('https://us.i.posthog.com/batch/');
    const body = captured[0]!.body as { api_key: string; batch: Array<{ event: string }> };
    expect(body.api_key).toBe('phc_test');
    expect(body.batch.map((e) => e.event)).toContain('session_start');
    expect(body.batch.map((e) => e.event)).toContain('entry_solved');
  });

  it('sends an $identify event first when a distinctId is provided', async () => {
    const { fetch, captured } = makeFetch();
    const t = createHttpPostHogTelemetry({
      apiKey: 'phc_test',
      distinctId: 'ath_abc',
      identifyProperties: { platform: 'ios' },
      flushBatchSize: 999,
      flushIntervalMs: 100000,
      fetchImpl: fetch,
    });
    t.track('session_start');
    await t.flush();
    const body = captured[0]!.body as { batch: Array<{ event: string; properties: Record<string, unknown> }> };
    expect(body.batch[0]!.event).toBe('$identify');
    expect(body.batch[0]!.properties.distinct_id).toBe('ath_abc');
  });

  it('normalizes null props out before sending', async () => {
    const { fetch, captured } = makeFetch();
    const t = createHttpPostHogTelemetry({
      apiKey: 'phc_test',
      distinctId: 'ath_abc',
      flushBatchSize: 999,
      flushIntervalMs: 100000,
      fetchImpl: fetch,
    });
    t.track('entry_solved', { volume: 'firmament', tier: null });
    await t.flush();
    const body = captured[0]!.body as { batch: Array<{ event: string; properties: Record<string, unknown> }> };
    const entryEvent = body.batch.find((e) => e.event === 'entry_solved');
    expect(entryEvent?.properties).toEqual({ volume: 'firmament' });
  });

  it('does not throw if fetch itself rejects', async () => {
    const t = createHttpPostHogTelemetry({
      apiKey: 'phc_test',
      distinctId: 'ath_abc',
      flushBatchSize: 999,
      flushIntervalMs: 100000,
      fetchImpl: (async () => {
        throw new Error('network down');
      }) as typeof fetch,
    });
    t.track('entry_solved');
    await expect(t.flush()).resolves.toBeUndefined();
  });

  it('flushes manually via flush()', async () => {
    const { fetch, captured } = makeFetch();
    const t = createHttpPostHogTelemetry({
      apiKey: 'phc_test',
      distinctId: 'ath_abc',
      flushBatchSize: 999,
      flushIntervalMs: 100000,
      fetchImpl: fetch,
    });
    t.track('session_start');
    expect(captured).toHaveLength(0);
    await t.flush();
    expect(captured).toHaveLength(1);
  });
});
