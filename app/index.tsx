import React from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { useOnboarding } from '@/state/onboardingStore';
import { palette } from '@/theme/tokens';

export default function Index() {
  const hydrated = useOnboarding((s) => s.hydrated);
  const completedAt = useOnboarding((s) => s.completedAt);

  if (!hydrated) {
    return <View style={{ flex: 1, backgroundColor: palette.ink }} />;
  }
  if (!completedAt) {
    return <Redirect href="/onboarding" />;
  }
  return <Redirect href="/play" />;
}
