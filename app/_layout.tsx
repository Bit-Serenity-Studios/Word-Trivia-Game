import '@expo/metro-runtime';
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativeModules, Platform, View } from 'react-native';
import {
  useFonts as useCormorant,
  CormorantGaramond_500Medium_Italic,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  useFonts as useGaramond,
  EBGaramond_400Regular,
  EBGaramond_400Regular_Italic,
  EBGaramond_600SemiBold,
} from '@expo-google-fonts/eb-garamond';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { palette } from '@/theme/tokens';
import { RewardedAdHost } from '@/components/RewardedAdProvider';
import { IapHost } from '@/components/IapHost';
import { InterstitialHost } from '@/components/InterstitialHost';
import { TelemetryProvider } from '@/components/TelemetryProvider';
import { MusicHost } from '@/components/MusicHost';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useLocale } from '@/state/localeStore';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function readDeviceLocale(): string | null {
  try {
    if (Platform.OS === 'ios') {
      const settings = NativeModules.SettingsManager?.settings;
      const first = settings?.AppleLanguages?.[0] ?? settings?.AppleLocale;
      return typeof first === 'string' ? first : null;
    }
    if (Platform.OS === 'android') {
      const raw = NativeModules.I18nManager?.localeIdentifier;
      return typeof raw === 'string' ? raw : null;
    }
    return null;
  } catch {
    return null;
  }
}

export default function RootLayout() {
  const [cormorantLoaded] = useCormorant({
    CormorantGaramond_600SemiBold,
    CormorantGaramond_500Medium_Italic,
  });
  const [garamondLoaded] = useGaramond({
    EBGaramond_400Regular,
    EBGaramond_400Regular_Italic,
    EBGaramond_600SemiBold,
  });

  const ready = cormorantLoaded && garamondLoaded;

  const localeHydrated = useLocale((s) => s.hydrated);
  const localePersisted = useLocale((s) => s.locale);
  const setFromDevice = useLocale((s) => s.setFromDevicePreference);
  const deviceLocaleAppliedRef = React.useRef(false);
  useEffect(() => {
    if (!localeHydrated || deviceLocaleAppliedRef.current) return;
    deviceLocaleAppliedRef.current = true;
    if (localePersisted !== 'en') return;
    const device = readDeviceLocale();
    if (device) setFromDevice(device);
  }, [localeHydrated, localePersisted, setFromDevice]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(palette.ink).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: palette.ink }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.ink }}>
      <SafeAreaProvider>
        <ErrorBoundary>
        <ThemeProvider>
          <TelemetryProvider>
            <MusicHost>
              <IapHost>
                <RewardedAdHost>
                  <InterstitialHost>
                    <StatusBar style="light" />
                    <Stack
                      screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: palette.ink },
                        animation: 'fade',
                      }}
                    />
                  </InterstitialHost>
                </RewardedAdHost>
              </IapHost>
            </MusicHost>
          </TelemetryProvider>
        </ThemeProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
