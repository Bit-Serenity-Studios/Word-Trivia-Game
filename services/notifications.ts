import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { TimeIntervalTriggerInput } from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'unknown';

let permissionCache: PermissionStatus = 'unknown';

export async function checkPermission(): Promise<PermissionStatus> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) {
    permissionCache = 'granted';
    return 'granted';
  }
  if (!existing.canAskAgain) {
    permissionCache = 'blocked';
    return 'blocked';
  }
  permissionCache = 'denied';
  return 'denied';
}

export async function askPermission(): Promise<PermissionStatus> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) {
    permissionCache = 'granted';
    return 'granted';
  }
  if (!existing.canAskAgain) {
    permissionCache = 'blocked';
    return 'blocked';
  }
  const requested = await Notifications.requestPermissionsAsync();
  if (requested.granted) {
    permissionCache = 'granted';
    return 'granted';
  }
  permissionCache = 'denied';
  return 'denied';
}

export function cachedPermission(): PermissionStatus {
  return permissionCache;
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
  const status = await checkPermission();
  if (status !== 'granted') return null;
  await ensureChannel();
  const seconds = Math.max(1, Math.round(delaySeconds));
  const trigger: TimeIntervalTriggerInput = {
    seconds,
    repeats: false,
    ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
  };
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your familiar has returned.',
      body: 'The spectral owl waits by the desk with a hoard from the stacks.',
    },
    trigger,
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
