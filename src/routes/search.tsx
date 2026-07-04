import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/common/EmptyState";
import { FileRow } from "@/components/common/FileRow";
import { isNative, ROOTS, walk } from "@/services/filesystem";
import type { FileEntry } from "@/types/files";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search as SearchIcon, Smartphone } from "lucide-react";
import { extOf } from "@/utils/files";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search files — Smart Files" },
      { name: "description", content: "Instantly search files across your device." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [query, setQuery] = useState("");
  const [ext, setExt] = useState("");
  const [minMb, setMinMb] = useState<number>(0);

  const { data, isFetching } = useQuery({
    queryKey: ["index"],
    queryFn: async () => {
      if (!isNative()) return [] as FileEntry[];
      const collected: FileEntry[] = [];
      for (const r of ROOTS) {
        await walk(`${r.id}:`, (e) => {
          if (!e.isDirectory) collected.push(e);
        });
      }
      return collected;
    },
    initialData: [] as FileEntry[],
    staleTime: 60_000,
  });

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q && !ext && !minMb) return [];
    return data
      .filter((e) => (!q || e.name.toLowerCase().includes(q)))
      .filter((e) => (!ext || extOf(e.name) === ext.toLowerCase()))
      .filter((e) => (!minMb || e.size >= minMb * 1024 * 1024))
      .slice(0, 200);
  }, [data, q, ext, minMb]);

  return (
    <PageShell title="Search" subtitle="By name, extension or size" hideSearch>
      <div className="mb-4 flex items-center gap-2 rounded-full bg-surface-container px-4 py-2.5">
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to search…"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <label className="rounded-2xl bg-surface-container px-3 py-2">
          <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Extension
          </span>
          <input
            value={ext}
            onChange={(e) => setExt(e.target.value.replace(/^\./, ""))}
            placeholder="e.g. pdf"
            className="mt-0.5 w-full bg-transparent text-sm text-foreground focus:outline-none"
          />
        </label>
        <label className="rounded-2xl bg-surface-container px-3 py-2">
          <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Min size (MB)
          </span>
          <input
            type="number"
            min={0}
            value={minMb || ""}
            onChange={(e) => setMinMb(Number(e.target.value) || 0)}
            placeholder="0"
            className="mt-0.5 w-full bg-transparent text-sm text-foreground focus:outline-none"
          />
        </label>
      </div>

      {!isNative() ? (
        <EmptyState
          icon={Smartphone}
          title="Preview mode"
          description="Search indexes real device storage. Build to Android to use it."
        />
      ) : isFetching ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-surface-container" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title={q || ext || minMb ? "No matches" : "Start typing to search"}
          description={
            q || ext || minMb
              ? "Try a different name, extension or size."
              : "Filter by name, file extension or minimum size."
          }
        />
      ) : (
        <div className="space-y-1">
          {results.map((e) => (
            <FileRow key={e.path} entry={e} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
