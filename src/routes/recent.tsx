import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/common/EmptyState";
import { useApp } from "@/context/AppContext";
import { Clock } from "lucide-react";
import { classify, extOf } from "@/utils/files";
import { FileRow } from "@/components/common/FileRow";

export const Route = createFileRoute("/recent")({
  head: () => ({
    meta: [
      { title: "Recent — Smart Files" },
      { name: "description", content: "Files and folders you've opened recently." },
    ],
  }),
  component: RecentPage,
});

function RecentPage() {
  const { recent } = useApp();

  if (recent.length === 0) {
    return (
      <PageShell title="Recent" subtitle="Recently opened">
        <EmptyState
          icon={Clock}
          title="Nothing here yet"
          description="Files you open will appear here for quick access."
        />
      </PageShell>
    );
  }

  return (
    <PageShell title="Recent" subtitle={`${recent.length} items`}>
      <div className="space-y-1">
        {recent.map((uri) => {
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
            />
          );
        })}
      </div>
    </PageShell>
  );
}
