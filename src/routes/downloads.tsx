import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/common/EmptyState";
import { useDownloads, type DownloadItem } from "@/context/DownloadsContext";
import { formatBytes } from "@/utils/files";
import {
  CheckCircle2,
  Download,
  DownloadCloud,
  Pause,
  Play,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/downloads")({
  head: () => ({
    meta: [
      { title: "Downloads — Smart Files" },
      { name: "description", content: "Download manager with queue, pause, resume and retry." },
    ],
  }),
  component: DownloadsPage,
});

function DownloadsPage() {
  const { items, add, pause, resume, cancel, retry, remove, clearCompleted, activeCount } =
    useDownloads();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    add(url.trim(), name.trim() || undefined);
    setUrl("");
    setName("");
  };

  return (
    <PageShell
      title="Downloads"
      subtitle={activeCount ? `${activeCount} active` : "Idle"}
      trailing={
        <button
          onClick={clearCompleted}
          className="rounded-full px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10"
        >
          Clear done
        </button>
      }
    >
      <form
        onSubmit={submit}
        className="mb-4 space-y-2 rounded-3xl bg-surface-container p-3"
      >
        <label className="block rounded-2xl bg-surface-container-high px-3 py-2">
          <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            URL
          </span>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/file.zip"
            className="mt-0.5 w-full bg-transparent text-sm text-foreground focus:outline-none"
          />
        </label>
        <div className="flex gap-2">
          <label className="flex-1 rounded-2xl bg-surface-container-high px-3 py-2">
            <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              File name (optional)
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Auto-detected"
              className="mt-0.5 w-full bg-transparent text-sm text-foreground focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <DownloadCloud className="h-4 w-4" />
            Add
          </button>
        </div>
      </form>

      {items.length === 0 ? (
        <EmptyState
          icon={Download}
          title="No downloads yet"
          description="Paste a direct HTTP or HTTPS link to queue a file. Downloads resume automatically after being paused."
        />
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <DownloadRow
              key={item.id}
              item={item}
              onPause={() => pause(item.id)}
              onResume={() => resume(item.id)}
              onCancel={() => cancel(item.id)}
              onRetry={() => retry(item.id)}
              onRemove={() => remove(item.id)}
            />
          ))}
        </ul>
      )}
    </PageShell>
  );
}

function formatSpeed(bps: number): string {
  if (!bps) return "";
  return `${formatBytes(bps)}/s`;
}

function formatEta(ms: number): string {
  if (!ms || !Number.isFinite(ms)) return "";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s left`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return `${m}m ${rs}s left`;
}

function DownloadRow({
  item,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onRemove,
}: {
  item: DownloadItem;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onRetry: () => void;
  onRemove: () => void;
}) {
  const pct = item.size > 0 ? Math.min(100, (item.received / item.size) * 100) : 0;
  const statusColor =
    item.status === "completed"
      ? "text-primary"
      : item.status === "failed"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <li className="rounded-3xl bg-surface-container p-3">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-container text-on-primary-container">
          {item.status === "completed" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Download className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-foreground">{item.filename}</p>
            <span className={`text-[11px] font-medium capitalize ${statusColor}`}>
              {item.status}
            </span>
          </div>
          <p className="truncate text-[11px] text-muted-foreground">{item.url}</p>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container-high">
            <div
              className={`h-full transition-all ${
                item.status === "failed" ? "bg-destructive" : "bg-primary"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            <span>
              {formatBytes(item.received)}
              {item.size > 0 ? ` / ${formatBytes(item.size)}` : ""}
            </span>
            {item.status === "downloading" && (
              <>
                <span>{formatSpeed(item.speed)}</span>
                <span>{formatEta(item.etaMs)}</span>
              </>
            )}
            {item.status === "completed" && item.checksum && (
              <span className="truncate font-mono">SHA {item.checksum.slice(0, 12)}…</span>
            )}
            {item.error && <span className="text-destructive">{item.error}</span>}
            {item.retries > 0 && <span>retries: {item.retries}</span>}
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap justify-end gap-1">
        {item.status === "downloading" && (
          <ActionButton icon={Pause} label="Pause" onClick={onPause} />
        )}
        {(item.status === "paused" || item.status === "queued") && item.status !== "queued" && (
          <ActionButton icon={Play} label="Resume" onClick={onResume} />
        )}
        {item.status === "paused" && (
          <ActionButton icon={Play} label="Resume" onClick={onResume} />
        )}
        {item.status === "failed" && (
          <ActionButton icon={RefreshCw} label="Retry" onClick={onRetry} />
        )}
        {(item.status === "downloading" || item.status === "queued") && (
          <ActionButton icon={X} label="Cancel" onClick={onCancel} />
        )}
        {item.status === "completed" && item.blobUrl && (
          <a
            href={item.blobUrl}
            download={item.filename}
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Save
          </a>
        )}
        <ActionButton icon={Trash2} label="Remove" onClick={onRemove} />
      </div>
    </li>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Play;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 rounded-full bg-surface-container-high px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-primary/10 hover:text-primary"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
