import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { FileRow } from "@/components/common/FileRow";
import { EmptyState } from "@/components/common/EmptyState";
import { readDir, ROOTS, isNative } from "@/services/filesystem";
import type { FileEntry, SortDir, SortKey, ViewMode } from "@/types/files";
import { useApp } from "@/context/AppContext";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, FolderPlus, Grid2x2, List, Rows3, Smartphone } from "lucide-react";
import { parentPath } from "@/utils/files";

export const Route = createFileRoute("/browse")({
  validateSearch: (s: Record<string, unknown>) => ({
    path: typeof s.path === "string" ? s.path : `${ROOTS[0].id}:`,
  }),
  head: () => ({
    meta: [
      { title: "Browse storage — Smart Files" },
      { name: "description", content: "Browse folders and files across internal storage." },
    ],
  }),
  component: BrowsePage,
});

function BrowsePage() {
  const { path } = Route.useSearch();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite, pushRecent, settings } = useApp();
  const [view, setView] = useState<ViewMode>("list");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const { data, isFetching } = useQuery({
    queryKey: ["dir", path],
    queryFn: () => readDir(path),
    initialData: [] as FileEntry[],
  });

  const sorted = useMemo(() => {
    const list = [...data];
    list.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      let cmp = 0;
      switch (sortKey) {
        case "size":
          cmp = a.size - b.size;
          break;
        case "date":
          cmp = a.mtime - b.mtime;
          break;
        case "type":
          cmp = a.ext.localeCompare(b.ext);
          break;
        default:
          cmp = a.name.localeCompare(b.name, undefined, { numeric: true });
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return settings.showHidden ? list : list.filter((e) => !e.name.startsWith("."));
  }, [data, sortKey, sortDir, settings.showHidden]);

  const open = (entry: FileEntry) => {
    pushRecent(entry.path);
    if (entry.isDirectory) {
      void navigate({ to: "/browse", search: { path: entry.path } });
    }
  };

  const parent = parentPath(path);
  const label = path.split(":")[1] || path.split(":")[0];
  const rootLabel = ROOTS.find((r) => r.id === path.split(":")[0])?.label ?? "Storage";

  return (
    <PageShell
      title={rootLabel}
      subtitle={label ? `/${label}` : "Root"}
      trailing={
        <button
          aria-label="View mode"
          onClick={() =>
            setView((v) => (v === "list" ? "grid" : v === "grid" ? "compact" : "list"))
          }
          className="grid h-11 w-11 place-items-center rounded-full text-on-surface hover:bg-surface-container-high"
        >
          {view === "list" ? <List className="h-5 w-5" /> : view === "grid" ? <Grid2x2 className="h-5 w-5" /> : <Rows3 className="h-5 w-5" />}
        </button>
      }
    >
      {parent && (
        <button
          onClick={() => navigate({ to: "/browse", search: { path: parent } })}
          className="mb-3 text-xs font-medium text-primary hover:underline"
        >
          ← Up one level
        </button>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-full bg-surface-container p-1">
          {(["name", "date", "size", "type"] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSortKey(k)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                sortKey === k
                  ? "bg-primary text-primary-foreground"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="grid h-8 w-8 place-items-center rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          aria-label="Toggle sort direction"
        >
          {sortDir === "asc" ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
        </button>
      </div>

      {!isNative() ? (
        <EmptyState
          icon={Smartphone}
          title="Preview mode"
          description="File browsing uses Android storage APIs. Build and open on a device with `npx cap sync android` to see your files."
        />
      ) : isFetching && sorted.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-surface-container" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={FolderPlus}
          title="Empty folder"
          description="This folder doesn't contain any visible files."
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {sorted.map((e) => (
            <button
              key={e.path}
              onClick={() => open(e)}
              className="ripple flex flex-col items-center gap-2 rounded-2xl bg-surface-container p-3 text-center"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-container text-on-primary-container">
                {/* icon */}
                <span className="text-xs font-bold">{e.ext.toUpperCase() || (e.isDirectory ? "DIR" : "")}</span>
              </span>
              <span className="line-clamp-2 text-[11px] text-foreground">{e.name}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {sorted.map((e) => (
            <FileRow
              key={e.path}
              entry={e}
              onOpen={open}
              favorite={isFavorite(e.path)}
              onLongPress={() => toggleFavorite(e.path)}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
