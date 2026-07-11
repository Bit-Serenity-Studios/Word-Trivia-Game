export interface OnboardingSlide {
  heading: string;
  body: string;
}

export const ONBOARDING_SLIDES: readonly OnboardingSlide[] = [
  {
    heading: 'The Athenaeum',
    body: 'A candle-lit hall where scholars catalogue the world one word at a time. Every entry inked here is a small victory against the dark.',
  },
  {
    heading: 'The Craft',
    body: 'A prompt on parchment. A tray of brass letters. Place them in order. Each solved entry earns ink; keep an unbroken streak and the ink flows a little richer.',
  },
  {
    heading: 'The Long Reading',
    body: 'Seven Volumes await, opened in sequence. A Bookplate names your rank. A Nightly Entry arrives at each turn of the day. The Cabinet fills as you write.',
  },
] as const;

export interface OnboardingProgress {
  slideIndex: number;
  coachedCompleted: boolean;
}

export function initialOnboardingProgress(): OnboardingProgress {
  return { slideIndex: 0, coachedCompleted: false };
}

export function advanceSlide(progress: OnboardingProgress): OnboardingProgress {
  return { ...progress, slideIndex: Math.min(progress.slideIndex + 1, ONBOARDING_SLIDES.length) };
}

export function markCoachedCompleted(progress: OnboardingProgress): OnboardingProgress {
  return { ...progress, coachedCompleted: true };
}

export function isSlidesComplete(progress: OnboardingProgress): boolean {
  return progress.slideIndex >= ONBOARDING_SLIDES.length;
}

export function isOnboardingComplete(progress: OnboardingProgress): boolean {
  return isSlidesComplete(progress) && progress.coachedCompleted;
}
