import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/common/EmptyState";
import { isNative, ROOTS, walk } from "@/services/filesystem";
import type { FileEntry, FileKind } from "@/types/files";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Smartphone } from "lucide-react";
import { useMemo } from "react";
import { formatBytes } from "@/utils/files";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Smart Files" },
      { name: "description", content: "Storage usage, largest files and file-type distribution." },
    ],
  }),
  component: AnalyticsPage,
});

const KIND_COLORS: Record<FileKind, string> = {
  folder: "bg-outline",
  image: "bg-cat-image",
  video: "bg-cat-video",
  audio: "bg-cat-audio",
  document: "bg-cat-document",
  apk: "bg-cat-apk",
  archive: "bg-cat-archive",
  text: "bg-cat-document",
  other: "bg-outline-variant",
};

function AnalyticsPage() {
  const { data, isFetching } = useQuery({
    queryKey: ["index-analytics"],
    queryFn: async () => {
      if (!isNative()) return [] as FileEntry[];
      const out: FileEntry[] = [];
      for (const r of ROOTS) {
        await walk(`${r.id}:`, (e) => {
          if (!e.isDirectory) out.push(e);
        });
      }
      return out;
    },
    initialData: [] as FileEntry[],
    staleTime: 60_000,
  });

  const stats = useMemo(() => {
    const total = data.reduce((n, e) => n + e.size, 0);
    const byKind = new Map<FileKind, { count: number; size: number }>();
    for (const e of data) {
      const cur = byKind.get(e.kind) ?? { count: 0, size: 0 };
      cur.count++;
      cur.size += e.size;
      byKind.set(e.kind, cur);
    }
    const largest = [...data].sort((a, b) => b.size - a.size).slice(0, 10);
    const parts = [...byKind.entries()]
      .map(([kind, v]) => ({ kind, ...v, pct: total ? (v.size / total) * 100 : 0 }))
      .sort((a, b) => b.size - a.size);
    return { total, count: data.length, parts, largest };
  }, [data]);

  return (
    <PageShell title="Analytics" subtitle="Storage usage insights">
      {!isNative() ? (
        <EmptyState
          icon={Smartphone}
          title="Preview mode"
          description="Analytics scan your real device storage. Build to Android to enable."
        />
      ) : isFetching && stats.count === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-3xl bg-surface-container" />
          ))}
        </div>
      ) : stats.count === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Nothing to analyze"
          description="No files were indexed in accessible storage roots."
        />
      ) : (
        <>
          <div className="rounded-3xl bg-surface-container p-4">
            <p className="text-xs text-muted-foreground">Indexed</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {formatBytes(stats.total)}
            </p>
            <p className="text-xs text-muted-foreground">{stats.count.toLocaleString()} files</p>

            <div className="mt-4 flex h-2 overflow-hidden rounded-full">
              {stats.parts.map((p) => (
                <div
                  key={p.kind}
                  className={KIND_COLORS[p.kind]}
                  style={{ width: `${p.pct}%` }}
                  title={`${p.kind}: ${p.pct.toFixed(1)}%`}
                />
              ))}
            </div>
          </div>

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-foreground">By file type</h2>
            <ul className="divide-y divide-border/60 overflow-hidden rounded-3xl bg-surface-container">
              {stats.parts.map((p) => (
                <li key={p.kind} className="flex items-center gap-3 px-4 py-3">
                  <span className={`h-3 w-3 rounded-full ${KIND_COLORS[p.kind]}`} />
                  <span className="flex-1 text-sm capitalize text-foreground">{p.kind}</span>
                  <span className="text-xs text-muted-foreground">{p.count}</span>
                  <span className="w-20 text-right text-xs text-foreground">
                    {formatBytes(p.size)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Largest files</h2>
            <ul className="divide-y divide-border/60 overflow-hidden rounded-3xl bg-surface-container">
              {stats.largest.map((f) => (
                <li key={f.path} className="flex items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {f.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatBytes(f.size)}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </PageShell>
  );
}
