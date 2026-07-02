import React from 'react';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { palette, fonts } from '@/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: palette.ink,
          borderTopColor: palette.mahogany,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 6,
        },
        tabBarActiveTintColor: palette.gold,
        tabBarInactiveTintColor: palette.sepia,
        tabBarLabelStyle: {
          fontFamily: fonts.displayItalic,
          fontSize: 12,
          letterSpacing: 1.4,
        },
        tabBarIcon: () => <View />,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen name="play" options={{ title: 'PLAY' }} />
      <Tabs.Screen name="daily" options={{ title: 'NIGHTLY' }} />
      <Tabs.Screen name="cabinet" options={{ title: 'CABINET' }} />
      <Tabs.Screen name="settings" options={{ title: 'SETTINGS' }} />
    </Tabs>
  );
}
