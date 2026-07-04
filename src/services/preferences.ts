import { Preferences } from "@capacitor/preferences";

export async function getPref<T>(key: string, fallback: T): Promise<T> {
  try {
    const { value } = await Preferences.get({ key });
    if (value == null) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function setPref<T>(key: string, value: T): Promise<void> {
  try {
    await Preferences.set({ key, value: JSON.stringify(value) });
  } catch {
    /* ignore */
  }
}
