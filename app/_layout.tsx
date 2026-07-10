import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
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
import { TelemetryProvider } from '@/components/TelemetryProvider';
import { MusicHost } from '@/components/MusicHost';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

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
        <ThemeProvider>
          <TelemetryProvider>
            <MusicHost>
              <IapHost>
                <RewardedAdHost>
                  <StatusBar style="light" />
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: palette.ink },
                      animation: 'fade',
                    }}
                  />
                </RewardedAdHost>
              </IapHost>
            </MusicHost>
          </TelemetryProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
