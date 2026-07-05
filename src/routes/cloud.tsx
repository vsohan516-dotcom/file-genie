import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { Cloud, HardDrive, Server, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/cloud")({
  head: () => ({
    meta: [
      { title: "Cloud storage — Smart Files" },
      { name: "description", content: "Connect Google Drive, Dropbox, OneDrive and WebDAV." },
    ],
  }),
  component: CloudPage,
});

interface Provider {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
  status: "beta" | "setup";
}

const PROVIDERS: Provider[] = [
  {
    id: "gdrive",
    name: "Google Drive",
    description: "OAuth via Google. Requires client credentials in Google Cloud Console.",
    icon: Cloud,
    colorClass: "bg-cat-image",
    status: "setup",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "OAuth via Dropbox App Console with offline refresh tokens.",
    icon: Cloud,
    colorClass: "bg-cat-video",
    status: "setup",
  },
  {
    id: "onedrive",
    name: "Microsoft OneDrive",
    description: "OAuth via Microsoft Entra ID (Azure AD app registration).",
    icon: Cloud,
    colorClass: "bg-cat-audio",
    status: "setup",
  },
  {
    id: "webdav",
    name: "WebDAV",
    description: "Connect Nextcloud, ownCloud or any WebDAV endpoint with basic auth.",
    icon: Server,
    colorClass: "bg-cat-document",
    status: "beta",
  },
];

function CloudPage() {
  return (
    <PageShell title="Cloud storage" subtitle="Bring your own accounts">
      <div className="mb-4 flex items-start gap-3 rounded-3xl bg-primary-container p-4 text-on-primary-container">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h2 className="text-sm font-semibold">Private by design</h2>
          <p className="mt-1 text-xs opacity-90">
            Smart Files never proxies your cloud traffic. Tokens stay on device via encrypted
            Preferences. Configure OAuth credentials in Settings to enable syncing.
          </p>
        </div>
      </div>

      <ul className="space-y-3">
        {PROVIDERS.map((p) => (
          <li
            key={p.id}
            className="flex items-start gap-3 rounded-3xl bg-surface-container p-4"
          >
            <span
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white ${p.colorClass}`}
            >
              <p.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{p.name}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    p.status === "beta"
                      ? "bg-tertiary-container text-on-tertiary-container"
                      : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {p.status === "beta" ? "Beta" : "Setup needed"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
              <button
                disabled
                className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1.5 text-xs font-medium text-on-surface-variant opacity-60"
              >
                <HardDrive className="h-3.5 w-3.5" />
                Connect
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-6 rounded-2xl bg-surface-container p-3 text-[11px] leading-relaxed text-muted-foreground">
        Add your OAuth client IDs in Settings → Developer options once credentials are ready.
        Sync, upload, download, share and folder operations are enabled per provider after
        authorization completes.
      </p>
    </PageShell>
  );
}
