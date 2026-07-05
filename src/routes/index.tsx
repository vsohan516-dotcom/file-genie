import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { StorageCard } from "@/components/common/StorageCard";
import { CategoryTile } from "@/components/common/CategoryTile";
import { CATEGORY_LIST } from "@/utils/categories";
import { ROOTS } from "@/services/filesystem";
import { useDownloads } from "@/context/DownloadsContext";
import {
  BarChart3,
  Clock,
  DownloadCloud,
  FolderOpen,
  LayoutGrid,
  Lock,
  Send,
  Sparkles,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Files — Home" },
      {
        name: "description",
        content:
          "Storage overview, categories and quick access to your files with Material You design.",
      },
    ],
  }),
  component: HomePage,
});

const QUICK: { to: string; label: string; icon: LucideIcon; colorClass: string }[] = [
  { to: "/downloads", label: "Downloads", icon: DownloadCloud, colorClass: "bg-cat-image" },
  { to: "/transfer", label: "Transfer", icon: Send, colorClass: "bg-cat-video" },
  { to: "/vault", label: "Vault", icon: Lock, colorClass: "bg-cat-apk" },
  { to: "/analytics", label: "Analytics", icon: BarChart3, colorClass: "bg-cat-archive" },
];

function HomePage() {
  const { activeCount } = useDownloads();
  // In-app estimated storage. On device this is replaced by StorageManager
  // if the OS reports quotas; we display an informative placeholder otherwise.
  const total = 128 * 1024 * 1024 * 1024;
  const used = 42 * 1024 * 1024 * 1024;

  return (
    <PageShell title="Smart Files" subtitle="Fast · Private · Beautiful">
      <StorageCard label="Internal storage" usedBytes={used} totalBytes={total} />

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Quick actions</h2>
        <div className="grid grid-cols-4 gap-2">
          {QUICK.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="ripple flex flex-col items-center gap-1.5 rounded-2xl bg-surface-container p-3"
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-2xl text-white ${q.colorClass}`}
              >
                <q.icon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-medium text-foreground">{q.label}</span>
            </Link>
          ))}
        </div>
        {activeCount > 0 && (
          <Link
            to="/downloads"
            className="mt-2 flex items-center justify-between rounded-2xl bg-primary-container px-4 py-2 text-xs text-on-primary-container"
          >
            <span>{activeCount} download{activeCount === 1 ? "" : "s"} in progress</span>
            <span className="font-semibold">View</span>
          </Link>
        )}
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Shortcuts</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Link
            to="/recent"
            className="ripple flex flex-col items-center gap-1 rounded-2xl bg-surface-container p-3 text-center"
          >
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-[11px] font-medium text-foreground">Recent</span>
          </Link>
          <Link
            to="/favorites"
            className="ripple flex flex-col items-center gap-1 rounded-2xl bg-surface-container p-3 text-center"
          >
            <Star className="h-5 w-5 text-primary" />
            <span className="text-[11px] font-medium text-foreground">Favorites</span>
          </Link>
          <Link
            to="/tools"
            className="ripple flex flex-col items-center gap-1 rounded-2xl bg-surface-container p-3 text-center"
          >
            <LayoutGrid className="h-5 w-5 text-primary" />
            <span className="text-[11px] font-medium text-foreground">All tools</span>
          </Link>
        </div>
      </section>


      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Categories</h2>
          <Link
            to="/browse"
            className="text-xs font-medium text-primary hover:underline"
          >
            All storage
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CATEGORY_LIST.map((c) => (
            <CategoryTile
              key={c.id}
              categoryId={c.id}
              label={c.label}
              icon={c.icon}
              colorClass={c.colorClass}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Storage locations</h2>
        <ul className="divide-y divide-border/60 overflow-hidden rounded-3xl bg-surface-container">
          {ROOTS.map((r) => (
            <li key={r.id}>
              <Link
                to="/browse"
                search={{ path: `${r.id}:` }}
                className="ripple flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-container text-on-primary-container">
                  <FolderOpen className="h-5 w-5" />
                </span>
                <span className="flex-1 text-sm font-medium text-foreground">{r.label}</span>
                <span className="text-xs text-muted-foreground">Open</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <div className="flex items-start gap-3 rounded-3xl bg-surface-container p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-tertiary-container text-on-tertiary-container">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">Smart tips</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Long-press any file to select multiple. Use categories to jump straight to media,
              documents, or downloads.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
