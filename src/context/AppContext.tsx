import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getPref, setPref } from "@/services/preferences";

interface AppSettings {
  animations: boolean;
  showHidden: boolean;
  confirmDelete: boolean;
  privacyLock: boolean;
}

interface AppContextValue {
  favorites: string[];
  recent: string[];
  settings: AppSettings;
  toggleFavorite: (uri: string) => void;
  isFavorite: (uri: string) => boolean;
  pushRecent: (uri: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const PREF_FAV = "smartfiles.favorites";
const PREF_RECENT = "smartfiles.recent";
const PREF_SETTINGS = "smartfiles.settings";

const DEFAULT_SETTINGS: AppSettings = {
  animations: true,
  showHidden: false,
  confirmDelete: true,
  privacyLock: false,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    getPref<string[]>(PREF_FAV, []).then(setFavorites);
    getPref<string[]>(PREF_RECENT, []).then(setRecent);
    getPref<AppSettings>(PREF_SETTINGS, DEFAULT_SETTINGS).then((s) =>
      setSettings({ ...DEFAULT_SETTINGS, ...s }),
    );
  }, []);

  const toggleFavorite = useCallback((uri: string) => {
    setFavorites((prev) => {
      const next = prev.includes(uri) ? prev.filter((p) => p !== uri) : [uri, ...prev];
      void setPref(PREF_FAV, next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((uri: string) => favorites.includes(uri), [favorites]);

  const pushRecent = useCallback((uri: string) => {
    setRecent((prev) => {
      const next = [uri, ...prev.filter((p) => p !== uri)].slice(0, 40);
      void setPref(PREF_RECENT, next);
      return next;
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      void setPref(PREF_SETTINGS, next);
      return next;
    });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({ favorites, recent, settings, toggleFavorite, isFavorite, pushRecent, updateSettings }),
    [favorites, recent, settings, toggleFavorite, isFavorite, pushRecent, updateSettings],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const v = useContext(AppContext);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}
