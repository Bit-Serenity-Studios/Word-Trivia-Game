import React from 'react';
import { Image } from 'react-native';
import { Tabs } from 'expo-router';
import { palette, fonts } from '@/theme/tokens';
import { KenneyIcon, type KenneyIconKind } from '@/components/icons/KenneyIcons';

const GEAR_ICON = require('@/assets/icons/kenney/gear.png');
const BASKET_ICON = require('@/assets/icons/kenney/shopping-basket.png');

function svgTabIcon(kind: KenneyIconKind) {
  const IconRender = ({ color }: { color: string }) => (
    <KenneyIcon kind={kind} color={color} size={22} />
  );
  IconRender.displayName = `TabIcon(${kind})`;
  return IconRender;
}

function pngTabIcon(source: number) {
  const IconRender = ({ color }: { color: string }) => (
    <Image
      source={source}
      style={{ width: 22, height: 22, tintColor: color }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
  IconRender.displayName = `TabIcon(png:${String(source)})`;
  return IconRender;
}

const PlayIcon = svgTabIcon('cardPlace');
const NightlyIcon = svgTabIcon('hourglass');
const CabinetIcon = svgTabIcon('bookOpen');
const StoreIcon = pngTabIcon(BASKET_ICON);
const SettingsIcon = pngTabIcon(GEAR_ICON);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: palette.ink,
          borderTopColor: palette.mahogany,
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 6,
        },
        tabBarActiveTintColor: palette.gold,
        tabBarInactiveTintColor: palette.sepia,
        tabBarLabelStyle: {
          fontFamily: fonts.displayItalic,
          fontSize: 11,
          letterSpacing: 1.4,
        },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen name="play" options={{ title: 'PLAY', tabBarIcon: PlayIcon }} />
      <Tabs.Screen name="daily" options={{ title: 'NIGHTLY', tabBarIcon: NightlyIcon }} />
      <Tabs.Screen name="cabinet" options={{ title: 'CABINET', tabBarIcon: CabinetIcon }} />
      <Tabs.Screen name="store" options={{ title: 'STORE', tabBarIcon: StoreIcon }} />
      <Tabs.Screen name="settings" options={{ title: 'SETTINGS', tabBarIcon: SettingsIcon }} />
    </Tabs>
  );
}
