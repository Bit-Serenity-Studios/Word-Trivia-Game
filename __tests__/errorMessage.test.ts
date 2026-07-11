import { en } from '../i18n/en';

describe('error boundary vocabulary', () => {
  it('has non-empty heading + body + detail label + reload button in English', () => {
    expect(en.error.heading.length).toBeGreaterThan(0);
    expect(en.error.body.length).toBeGreaterThan(20);
    expect(en.error.detailLabel.length).toBeGreaterThan(0);
    expect(en.error.reload.length).toBeGreaterThan(0);
  });

  it('reassures the reader that progress is safe on device', () => {
    expect(en.error.body.toLowerCase()).toContain('safe');
  });

  it('keeps the Dark Academia voice — mentions candle / archives', () => {
    const combined = `${en.error.heading} ${en.error.body} ${en.error.reload}`.toLowerCase();
    expect(combined).toContain('candle');
  });
});
