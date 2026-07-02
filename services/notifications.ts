import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

let permissionCache: 'unknown' | 'granted' | 'denied' = 'unknown';

export async function ensurePermission(): Promise<boolean> {
  if (permissionCache === 'granted') return true;
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) {
    permissionCache = 'granted';
    return true;
  }
  if (!existing.canAskAgain) {
    permissionCache = 'denied';
    return false;
  }
  const requested = await Notifications.requestPermissionsAsync();
  permissionCache = requested.granted ? 'granted' : 'denied';
  return requested.granted;
}

const CHANNEL_ID = 'athenaeum-familiar';

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'The Athenaeum — Familiar',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 120, 80, 120],
    lightColor: '#C9A227',
  });
}

export async function scheduleForagingReturn(delaySeconds: number): Promise<string | null> {
  const permitted = await ensurePermission();
  if (!permitted) return null;
  await ensureChannel();
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your familiar has returned.',
      body: 'The spectral owl waits by the desk with a hoard from the stacks.',
    },
    trigger: {
      seconds: Math.max(1, Math.round(delaySeconds)),
      channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
    },
  });
}

export async function cancelScheduled(id: string | null): Promise<void> {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Notification may have already fired or been dismissed; nothing to do.
  }
}
