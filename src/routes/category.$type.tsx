import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/common/EmptyState";
import { FileRow } from "@/components/common/FileRow";
import { CATEGORIES } from "@/utils/categories";
import { isNative, ROOTS, walk } from "@/services/filesystem";
import { useApp } from "@/context/AppContext";
import { useQuery } from "@tanstack/react-query";
import type { FileEntry } from "@/types/files";
import { Smartphone } from "lucide-react";
import { extOf } from "@/utils/files";

const IDS = Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>;

export const Route = createFileRoute("/category/$type")({
  beforeLoad: ({ params }) => {
    if (!IDS.includes(params.type as keyof typeof CATEGORIES)) throw notFound();
  },
  head: ({ params }) => {
    const meta = CATEGORIES[params.type as keyof typeof CATEGORIES];
    return {
      meta: [
        { title: `${meta?.label ?? "Category"} — Smart Files` },
        { name: "description", content: meta?.description ?? "" },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { type } = Route.useParams();
  const meta = CATEGORIES[type as keyof typeof CATEGORIES];
  const { isFavorite, toggleFavorite, pushRecent } = useApp();

  const { data, isFetching } = useQuery({
    queryKey: ["category", type],
    queryFn: async () => {
      if (!isNative()) return [] as FileEntry[];
      const found: FileEntry[] = [];
      const exts = new Set(meta.extensions);
      const roots = type === "downloads" ? [ROOTS.find((r) => r.id === "documents")!] : ROOTS;
      for (const r of roots) {
        await walk(`${r.id}:`, (e) => {
          if (e.isDirectory) return;
          if (type === "downloads") {
            if (e.path.toLowerCase().includes("download")) found.push(e);
          } else if (exts.has(extOf(e.name))) {
            found.push(e);
          }
        });
      }
      return found.sort((a, b) => b.mtime - a.mtime).slice(0, 500);
    },
    initialData: [] as FileEntry[],
  });

  return (
    <PageShell title={meta.label} subtitle={meta.description}>
      {!isNative() ? (
        <EmptyState
          icon={Smartphone}
          title="Preview mode"
          description="Category indexing runs on device. Sync to Android to see real files here."
        />
      ) : isFetching ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-surface-container" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState icon={meta.icon} title={`No ${meta.label.toLowerCase()} yet`} />
      ) : (
        <div className="space-y-1">
          {data.map((e) => (
            <FileRow
              key={e.path}
              entry={e}
              onOpen={(x) => pushRecent(x.path)}
              favorite={isFavorite(e.path)}
              onLongPress={() => toggleFavorite(e.path)}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
