import {
  ONBOARDING_SLIDES,
  advanceSlide,
  initialOnboardingProgress,
  isOnboardingComplete,
  isSlidesComplete,
  markCoachedCompleted,
} from '../game/onboarding';
import { economy } from '../game/economy';
import { bundledSource } from '../content/source';

describe('onboarding progression', () => {
  it('starts on slide 0 with no coached completion', () => {
    const p = initialOnboardingProgress();
    expect(p.slideIndex).toBe(0);
    expect(p.coachedCompleted).toBe(false);
    expect(isSlidesComplete(p)).toBe(false);
    expect(isOnboardingComplete(p)).toBe(false);
  });

  it('advances through each declared slide and lands on the coached puzzle', () => {
    let p = initialOnboardingProgress();
    for (let i = 0; i < ONBOARDING_SLIDES.length; i++) {
      expect(isSlidesComplete(p)).toBe(false);
      p = advanceSlide(p);
    }
    expect(isSlidesComplete(p)).toBe(true);
    expect(isOnboardingComplete(p)).toBe(false);
  });

  it('is fully complete once the coached puzzle is stamped', () => {
    let p = initialOnboardingProgress();
    for (let i = 0; i < ONBOARDING_SLIDES.length; i++) p = advanceSlide(p);
    p = markCoachedCompleted(p);
    expect(isOnboardingComplete(p)).toBe(true);
  });

  it('clamps at the last slide even if advanced again', () => {
    let p = initialOnboardingProgress();
    for (let i = 0; i < ONBOARDING_SLIDES.length + 5; i++) p = advanceSlide(p);
    expect(p.slideIndex).toBe(ONBOARDING_SLIDES.length);
  });
});

describe('onboarding coached question', () => {
  it('resolves the configured question id to a real, novice-tier entry', () => {
    const q = bundledSource.getById(economy.onboarding.coachedQuestionId);
    expect(q).not.toBeNull();
    if (!q) return;
    expect(q.tier).toBe('novice');
    expect(q.answer.length).toBeGreaterThan(2);
    expect(q.answer.length).toBeLessThanOrEqual(6);
  });
});
