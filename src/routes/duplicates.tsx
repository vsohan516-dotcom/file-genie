import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/common/EmptyState";
import { isNative, ROOTS, walk } from "@/services/filesystem";
import type { FileEntry } from "@/types/files";
import { useQuery } from "@tanstack/react-query";
import { Copy, Smartphone } from "lucide-react";
import { useMemo } from "react";
import { formatBytes } from "@/utils/files";

export const Route = createFileRoute("/duplicates")({
  head: () => ({
    meta: [
      { title: "Duplicates — Smart Files" },
      { name: "description", content: "Find duplicate files by name and size to reclaim space." },
    ],
  }),
  component: DuplicatesPage,
});

function DuplicatesPage() {
  const { data, isFetching } = useQuery({
    queryKey: ["index-duplicates"],
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

  const groups = useMemo(() => {
    const map = new Map<string, FileEntry[]>();
    for (const e of data) {
      if (!e.size) continue;
      const key = `${e.name.toLowerCase()}::${e.size}`;
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    return [...map.values()]
      .filter((arr) => arr.length > 1)
      .sort((a, b) => b[0].size * b.length - a[0].size * a.length);
  }, [data]);

  const reclaimable = groups.reduce((n, g) => n + g[0].size * (g.length - 1), 0);

  return (
    <PageShell title="Duplicates" subtitle={groups.length ? `${groups.length} groups` : "Scan"}>
      {!isNative() ? (
        <EmptyState
          icon={Smartphone}
          title="Preview mode"
          description="Duplicate detection scans real device storage."
        />
      ) : isFetching && groups.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-3xl bg-surface-container" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Copy}
          title="No duplicates found"
          description="Nothing with the same name and size across your storage."
        />
      ) : (
        <>
          <div className="mb-4 rounded-3xl bg-primary-container p-4 text-on-primary-container">
            <p className="text-xs opacity-80">Reclaimable</p>
            <p className="text-2xl font-semibold">{formatBytes(reclaimable)}</p>
            <p className="text-xs opacity-80">
              Delete extra copies from each group to free space.
            </p>
          </div>

          <ul className="space-y-3">
            {groups.map((group) => (
              <li key={group[0].path} className="rounded-3xl bg-surface-container p-3">
                <div className="flex items-center justify-between px-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {group[0].name}
                  </p>
                  <span className="text-[11px] text-muted-foreground">
                    {group.length} copies · {formatBytes(group[0].size)}
                  </span>
                </div>
                <ul className="mt-2 space-y-0.5">
                  {group.map((f) => (
                    <li
                      key={f.path}
                      className="truncate rounded-xl bg-surface-container-high px-3 py-1.5 text-[11px] text-muted-foreground"
                    >
                      {f.path}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </>
      )}
    </PageShell>
  );
}
