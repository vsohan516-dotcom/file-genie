import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getPref, setPref } from "@/services/preferences";
import { ROOTS } from "@/services/filesystem";

export interface BrowserTab {
  id: string;
  path: string;
  title: string;
  createdAt: number;
}

interface TabsContextValue {
  tabs: BrowserTab[];
  activeId: string;
  activeTab: BrowserTab | undefined;
  addTab: (path?: string) => string;
  closeTab: (id: string) => void;
  setActive: (id: string) => void;
  updatePath: (id: string, path: string) => void;
  splitMode: boolean;
  setSplitMode: (v: boolean) => void;
  secondaryId: string | null;
  setSecondaryId: (id: string | null) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);
const PREF_KEY = "smartfiles.tabs";

function titleFromPath(path: string): string {
  const [rootId, sub] = path.split(":");
  const root = ROOTS.find((r) => r.id === rootId)?.label ?? rootId;
  const last = (sub || "").split("/").filter(Boolean).pop();
  return last ? `${last}` : root;
}

function makeTab(path: string): BrowserTab {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    path,
    title: titleFromPath(path),
    createdAt: Date.now(),
  };
}

export function TabsProvider({ children }: { children: ReactNode }) {
  const initial = makeTab(`${ROOTS[0].id}:`);
  const [tabs, setTabs] = useState<BrowserTab[]>([initial]);
  const [activeId, setActiveId] = useState<string>(initial.id);
  const [splitMode, setSplitMode] = useState(false);
  const [secondaryId, setSecondaryId] = useState<string | null>(null);

  useEffect(() => {
    getPref<{ tabs: BrowserTab[]; activeId: string } | null>(PREF_KEY, null).then((saved) => {
      if (saved && saved.tabs.length) {
        setTabs(saved.tabs);
        setActiveId(saved.activeId);
      }
    });
  }, []);

  useEffect(() => {
    void setPref(PREF_KEY, { tabs, activeId });
  }, [tabs, activeId]);

  const addTab = useCallback((path?: string) => {
    const t = makeTab(path ?? `${ROOTS[0].id}:`);
    setTabs((prev) => [...prev, t]);
    setActiveId(t.id);
    return t.id;
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (filtered.length === 0) {
        const t = makeTab(`${ROOTS[0].id}:`);
        setActiveId(t.id);
        return [t];
      }
      setActiveId((cur) => (cur === id ? filtered[filtered.length - 1].id : cur));
      setSecondaryId((cur) => (cur === id ? null : cur));
      return filtered;
    });
  }, []);

  const updatePath = useCallback((id: string, path: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, path, title: titleFromPath(path) } : t)),
    );
  }, []);

  const activeTab = tabs.find((t) => t.id === activeId);

  const value = useMemo<TabsContextValue>(
    () => ({
      tabs,
      activeId,
      activeTab,
      addTab,
      closeTab,
      setActive: setActiveId,
      updatePath,
      splitMode,
      setSplitMode,
      secondaryId,
      setSecondaryId,
    }),
    [tabs, activeId, activeTab, addTab, closeTab, updatePath, splitMode, secondaryId],
  );

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

export function useTabs(): TabsContextValue {
  const v = useContext(TabsContext);
  if (!v) throw new Error("useTabs must be used inside TabsProvider");
  return v;
}
