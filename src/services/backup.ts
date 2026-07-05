import { Preferences } from "@capacitor/preferences";

const PREFIX = "smartfiles.";

export interface BackupBundle {
  app: "smartfiles";
  version: 1;
  exportedAt: number;
  prefs: Record<string, unknown>;
}

export async function exportSettings(): Promise<BackupBundle> {
  const bundle: BackupBundle = {
    app: "smartfiles",
    version: 1,
    exportedAt: Date.now(),
    prefs: {},
  };
  try {
    const { keys } = await Preferences.keys();
    for (const key of keys) {
      if (!key.startsWith(PREFIX)) continue;
      const { value } = await Preferences.get({ key });
      if (value != null) {
        try {
          bundle.prefs[key] = JSON.parse(value);
        } catch {
          bundle.prefs[key] = value;
        }
      }
    }
  } catch (err) {
    console.warn("exportSettings failed", err);
  }
  return bundle;
}

export async function importSettings(bundle: BackupBundle): Promise<void> {
  if (!bundle || bundle.app !== "smartfiles") throw new Error("Invalid backup file");
  for (const [key, value] of Object.entries(bundle.prefs)) {
    try {
      await Preferences.set({ key, value: JSON.stringify(value) });
    } catch {
      /* ignore */
    }
  }
}

export function downloadBundle(bundle: BackupBundle): void {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `smartfiles-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
