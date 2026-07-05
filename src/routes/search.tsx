import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/common/EmptyState";
import { FileRow } from "@/components/common/FileRow";
import { isNative, ROOTS, walk } from "@/services/filesystem";
import type { FileEntry, FileKind } from "@/types/files";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search as SearchIcon, Smartphone } from "lucide-react";
import { extOf } from "@/utils/files";

type KindFilter = FileKind | "all";
type DateFilter = "any" | "today" | "week" | "month" | "year";

const KIND_OPTIONS: { id: KindFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "image", label: "Images" },
  { id: "video", label: "Videos" },
  { id: "audio", label: "Audio" },
  { id: "document", label: "Docs" },
  { id: "archive", label: "Archives" },
  { id: "apk", label: "APK" },
];

const DATE_OPTIONS: { id: DateFilter; label: string; days: number }[] = [
  { id: "any", label: "Any time", days: 0 },
  { id: "today", label: "Today", days: 1 },
  { id: "week", label: "This week", days: 7 },
  { id: "month", label: "This month", days: 30 },
  { id: "year", label: "This year", days: 365 },
];

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
  const [kind, setKind] = useState<KindFilter>("all");
  const [date, setDate] = useState<DateFilter>("any");

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
  const dateCutoff = useMemo(() => {
    const opt = DATE_OPTIONS.find((d) => d.id === date);
    if (!opt || !opt.days) return 0;
    return Date.now() - opt.days * 24 * 60 * 60 * 1000;
  }, [date]);

  const hasFilters = !!q || !!ext || !!minMb || kind !== "all" || date !== "any";

  const results = useMemo(() => {
    if (!hasFilters) return [];
    return data
      .filter((e) => (!q || e.name.toLowerCase().includes(q)))
      .filter((e) => (!ext || extOf(e.name) === ext.toLowerCase()))
      .filter((e) => (!minMb || e.size >= minMb * 1024 * 1024))
      .filter((e) => (kind === "all" ? true : e.kind === kind))
      .filter((e) => (!dateCutoff ? true : e.mtime >= dateCutoff))
      .slice(0, 200);
  }, [data, q, ext, minMb, kind, dateCutoff, hasFilters]);

  return (
    <PageShell title="Search" subtitle="Name · type · date · size" hideSearch>
      <div className="mb-3 flex items-center gap-2 rounded-full bg-surface-container px-4 py-2.5">
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

      <div className="mb-2 -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {KIND_OPTIONS.map((k) => (
          <button
            key={k.id}
            onClick={() => setKind(k.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              kind === k.id
                ? "bg-primary text-primary-foreground"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="mb-3 -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {DATE_OPTIONS.map((d) => (
          <button
            key={d.id}
            onClick={() => setDate(d.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              date === d.id
                ? "bg-primary text-primary-foreground"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {d.label}
          </button>
        ))}
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
