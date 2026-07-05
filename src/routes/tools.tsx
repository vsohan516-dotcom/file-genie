import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import {
  BarChart3,
  Cloud,
  Copy,
  DatabaseBackup,
  DownloadCloud,
  Lock,
  Send,
  Sparkles,
  SplitSquareHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Tools — Smart Files" },
      { name: "description", content: "Downloads, tabs, cloud, transfer, vault, analytics and backup." },
    ],
  }),
  component: ToolsPage,
});

interface Tool {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
}

const TOOLS: Tool[] = [
  {
    to: "/downloads",
    label: "Downloads",
    description: "Queue, pause, resume, retry",
    icon: DownloadCloud,
    colorClass: "bg-cat-image",
  },
  {
    to: "/tabs",
    label: "Tabs & split",
    description: "Multi-window browsing",
    icon: SplitSquareHorizontal,
    colorClass: "bg-cat-video",
  },
  {
    to: "/cloud",
    label: "Cloud",
    description: "Drive, Dropbox, OneDrive, WebDAV",
    icon: Cloud,
    colorClass: "bg-cat-audio",
  },
  {
    to: "/transfer",
    label: "Transfer",
    description: "WiFi, FTP, QR sharing",
    icon: Send,
    colorClass: "bg-cat-document",
  },
  {
    to: "/vault",
    label: "Vault",
    description: "PIN-protected files",
    icon: Lock,
    colorClass: "bg-cat-apk",
  },
  {
    to: "/analytics",
    label: "Analytics",
    description: "Usage & largest files",
    icon: BarChart3,
    colorClass: "bg-cat-archive",
  },
  {
    to: "/duplicates",
    label: "Duplicates",
    description: "Find & reclaim space",
    icon: Copy,
    colorClass: "bg-cat-download",
  },
  {
    to: "/backup",
    label: "Backup",
    description: "Export & restore settings",
    icon: DatabaseBackup,
    colorClass: "bg-cat-image",
  },
];

function ToolsPage() {
  return (
    <PageShell title="Tools" subtitle="Power features">
      <div className="mb-4 flex items-start gap-3 rounded-3xl bg-tertiary-container p-4 text-on-tertiary-container">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h2 className="text-sm font-semibold">Smart suggestions</h2>
          <p className="mt-1 text-xs opacity-90">
            Smart Files scans your storage locally and suggests folder organization, duplicate
            cleanup, and large-file removals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {TOOLS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="ripple flex flex-col gap-2 rounded-3xl bg-surface-container p-4"
          >
            <span
              className={`grid h-11 w-11 place-items-center rounded-2xl text-white ${t.colorClass}`}
            >
              <t.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{t.label}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{t.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
