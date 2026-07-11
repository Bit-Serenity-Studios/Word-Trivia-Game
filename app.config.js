// Dynamic Expo config. Everything that used to live in app.json is here so
// we can conditionally omit native-only config plugins during the web
// export. react-native-google-mobile-ads ships a config plugin whose entry
// point transitively `require()`s a raw .ts file (see M12 deploy failure
// on fe30616); Node can't parse that, so `expo export --platform web`
// blows up before it ever reaches the bundler.
//
// The build:web npm script sets EXPO_TARGET=web; we drop the AdMob plugin
// in that case. iOS / Android / dev-client builds see the full plugin list.

const isWebExport = process.env.EXPO_TARGET === 'web';

const basePlugins = [
  'expo-router',
  'expo-font',
  'expo-dev-client',
  [
    'expo-notifications',
    {
      color: '#C9A227',
    },
  ],
];

const admobPlugin = [
  'react-native-google-mobile-ads',
  {
    androidAppId: 'ca-app-pub-3940256099942544~3347511713',
    iosAppId: 'ca-app-pub-3940256099942544~1458002511',
    userTrackingUsageDescription:
      'This identifier will be used to deliver personalised ads to you.',
  },
];

const plugins = isWebExport ? basePlugins : [...basePlugins, admobPlugin];

module.exports = {
  expo: {
    name: 'The Athenaeum',
    slug: 'the-athenaeum',
    version: '0.1.0',
    orientation: 'portrait',
    scheme: 'athenaeum',
    userInterfaceStyle: 'dark',
    backgroundColor: '#171310',
    primaryColor: '#C9A227',
    description: 'A candle-lit trivia game for Dark Academia readers.',
    githubUrl: 'https://github.com/bit-serenity-studios/word-trivia-game',
    splash: {
      backgroundColor: '#171310',
      resizeMode: 'contain',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.athenaeum.app',
      buildNumber: '1',
      requireFullScreen: true,
      userInterfaceStyle: 'dark',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UIViewControllerBasedStatusBarAppearance: true,
        SKAdNetworkItems: [],
      },
    },
    android: {
      package: 'com.athenaeum.app',
      versionCode: 1,
      userInterfaceStyle: 'dark',
      backgroundColor: '#171310',
      adaptiveIcon: {
        backgroundColor: '#171310',
      },
      permissions: ['SCHEDULE_EXACT_ALARM', 'POST_NOTIFICATIONS', 'VIBRATE'],
      blockedPermissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'READ_CONTACTS',
        'RECORD_AUDIO',
      ],
    },
    web: {
      bundler: 'metro',
      backgroundColor: '#171310',
    },
    plugins,
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: 'REPLACE_WITH_EAS_PROJECT_ID',
      },
    },
  },
};
