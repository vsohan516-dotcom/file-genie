import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getPref, setPref } from "@/services/preferences";

export type DownloadStatus =
  | "queued"
  | "downloading"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export interface DownloadItem {
  id: string;
  url: string;
  filename: string;
  size: number;
  received: number;
  status: DownloadStatus;
  speed: number;
  etaMs: number;
  createdAt: number;
  updatedAt: number;
  error?: string;
  blobUrl?: string;
  retries: number;
  checksum?: string;
}

interface DownloadsContextValue {
  items: DownloadItem[];
  add: (url: string, filename?: string) => string;
  pause: (id: string) => void;
  resume: (id: string) => void;
  cancel: (id: string) => void;
  retry: (id: string) => void;
  remove: (id: string) => void;
  clearCompleted: () => void;
  activeCount: number;
}

const DownloadsContext = createContext<DownloadsContextValue | null>(null);
const PREF_KEY = "smartfiles.downloads";
const MAX_CONCURRENT = 3;

function inferName(url: string): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop();
    return last || u.hostname;
  } catch {
    return "download";
  }
}

async function sha256(buf: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function DownloadsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<DownloadItem[]>([]);
  const controllers = useRef<Map<string, AbortController>>(new Map());
  const chunksRef = useRef<Map<string, Uint8Array[]>>(new Map());
  const hydrated = useRef(false);

  useEffect(() => {
    getPref<DownloadItem[]>(PREF_KEY, []).then((saved) => {
      // Reset transient states
      const rehydrated = saved.map((d) =>
        d.status === "downloading" || d.status === "queued"
          ? { ...d, status: "paused" as DownloadStatus, speed: 0, etaMs: 0 }
          : d,
      );
      setItems(rehydrated);
      hydrated.current = true;
    });
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    // Don't persist blob URLs
    const serializable = items.map(({ blobUrl: _b, ...rest }) => rest);
    void setPref(PREF_KEY, serializable);
  }, [items]);

  const update = useCallback((id: string, patch: Partial<DownloadItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch, updatedAt: Date.now() } : it)),
    );
  }, []);

  const startTransfer = useCallback(
    async (item: DownloadItem) => {
      const controller = new AbortController();
      controllers.current.set(item.id, controller);
      const startBytes = item.received;
      const existingChunks = chunksRef.current.get(item.id) ?? [];
      chunksRef.current.set(item.id, existingChunks);

      try {
        const headers: HeadersInit = {};
        if (startBytes > 0) headers.Range = `bytes=${startBytes}-`;

        const res = await fetch(item.url, { headers, signal: controller.signal });
        if (!res.ok && res.status !== 206) throw new Error(`HTTP ${res.status}`);

        const totalHeader = res.headers.get("content-length");
        const contentRange = res.headers.get("content-range");
        let total = item.size;
        if (contentRange) {
          const m = contentRange.match(/\/(\d+)$/);
          if (m) total = Number(m[1]);
        } else if (totalHeader) {
          total = startBytes + Number(totalHeader);
        }
        update(item.id, { status: "downloading", size: total });

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        let received = startBytes;
        let lastTick = performance.now();
        let lastBytes = received;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          existingChunks.push(value);
          received += value.byteLength;

          const now = performance.now();
          if (now - lastTick > 500) {
            const speed = ((received - lastBytes) * 1000) / (now - lastTick);
            const remaining = Math.max(0, total - received);
            const etaMs = speed > 0 ? (remaining / speed) * 1000 : 0;
            update(item.id, { received, speed, etaMs });
            lastTick = now;
            lastBytes = received;
          }
        }

        const blob = new Blob(existingChunks);
        const buf = await blob.arrayBuffer();
        const checksum = await sha256(buf);
        const blobUrl = URL.createObjectURL(blob);
        chunksRef.current.delete(item.id);
        controllers.current.delete(item.id);
        update(item.id, {
          status: "completed",
          received,
          size: received,
          speed: 0,
          etaMs: 0,
          blobUrl,
          checksum,
        });
      } catch (err) {
        controllers.current.delete(item.id);
        const aborted = (err as Error).name === "AbortError";
        setItems((prev) =>
          prev.map((it) => {
            if (it.id !== item.id) return it;
            if (it.status === "paused" || it.status === "cancelled") return it;
            const shouldRetry = !aborted && it.retries < 3;
            return {
              ...it,
              status: shouldRetry ? "queued" : "failed",
              retries: it.retries + (shouldRetry ? 1 : 0),
              error: aborted ? undefined : (err as Error).message,
              speed: 0,
              etaMs: 0,
              updatedAt: Date.now(),
            };
          }),
        );
      }
    },
    [update],
  );

  // Queue scheduler
  useEffect(() => {
    const active = items.filter((i) => i.status === "downloading").length;
    if (active >= MAX_CONCURRENT) return;
    const next = items.find((i) => i.status === "queued");
    if (!next) return;
    void startTransfer(next);
  }, [items, startTransfer]);

  const add = useCallback((url: string, filename?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const item: DownloadItem = {
      id,
      url,
      filename: filename || inferName(url),
      size: 0,
      received: 0,
      status: "queued",
      speed: 0,
      etaMs: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      retries: 0,
    };
    setItems((prev) => [item, ...prev]);
    return id;
  }, []);

  const pause = useCallback(
    (id: string) => {
      controllers.current.get(id)?.abort();
      controllers.current.delete(id);
      update(id, { status: "paused", speed: 0, etaMs: 0 });
    },
    [update],
  );

  const resume = useCallback(
    (id: string) => {
      update(id, { status: "queued", error: undefined });
    },
    [update],
  );

  const cancel = useCallback(
    (id: string) => {
      controllers.current.get(id)?.abort();
      controllers.current.delete(id);
      chunksRef.current.delete(id);
      update(id, { status: "cancelled", speed: 0, etaMs: 0 });
    },
    [update],
  );

  const retry = useCallback(
    (id: string) => {
      chunksRef.current.delete(id);
      update(id, { status: "queued", received: 0, retries: 0, error: undefined });
    },
    [update],
  );

  const remove = useCallback((id: string) => {
    controllers.current.get(id)?.abort();
    controllers.current.delete(id);
    chunksRef.current.delete(id);
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (it?.blobUrl) URL.revokeObjectURL(it.blobUrl);
      return prev.filter((x) => x.id !== id);
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setItems((prev) => {
      prev.forEach((it) => {
        if (it.status === "completed" && it.blobUrl) URL.revokeObjectURL(it.blobUrl);
      });
      return prev.filter((it) => it.status !== "completed");
    });
  }, []);

  const activeCount = items.filter(
    (i) => i.status === "downloading" || i.status === "queued",
  ).length;

  const value = useMemo<DownloadsContextValue>(
    () => ({ items, add, pause, resume, cancel, retry, remove, clearCompleted, activeCount }),
    [items, add, pause, resume, cancel, retry, remove, clearCompleted, activeCount],
  );

  return <DownloadsContext.Provider value={value}>{children}</DownloadsContext.Provider>;
}

export function useDownloads(): DownloadsContextValue {
  const v = useContext(DownloadsContext);
  if (!v) throw new Error("useDownloads must be used inside DownloadsProvider");
  return v;
}
