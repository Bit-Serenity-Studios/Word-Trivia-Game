export async function ensurePermission(): Promise<boolean> {
  return false;
}

export async function scheduleForagingReturn(_delaySeconds: number): Promise<string | null> {
  return null;
}

export async function cancelScheduled(_id: string | null): Promise<void> {
  return;
}
