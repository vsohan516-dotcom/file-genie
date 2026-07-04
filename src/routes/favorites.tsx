import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/common/EmptyState";
import { useApp } from "@/context/AppContext";
import { Star } from "lucide-react";
import { classify, extOf } from "@/utils/files";
import { FileRow } from "@/components/common/FileRow";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Favorites — Smart Files" },
      { name: "description", content: "Files and folders you've starred for quick access." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favorites, toggleFavorite } = useApp();

  if (favorites.length === 0) {
    return (
      <PageShell title="Favorites" subtitle="Starred for quick access">
        <EmptyState
          icon={Star}
          title="No favorites yet"
          description="Long-press any file to add it to favorites."
        />
      </PageShell>
    );
  }

  return (
    <PageShell title="Favorites" subtitle={`${favorites.length} starred`}>
      <div className="space-y-1">
        {favorites.map((uri) => {
          const name = uri.split("/").pop() ?? uri;
          return (
            <FileRow
              key={uri}
              entry={{
                name,
                path: uri,
                isDirectory: false,
                size: 0,
                mtime: 0,
                ext: extOf(name),
                kind: classify(name, false),
              }}
              favorite
              onLongPress={() => toggleFavorite(uri)}
            />
          );
        })}
      </div>
    </PageShell>
  );
}
