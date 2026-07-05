import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { downloadBundle, exportSettings, importSettings } from "@/services/backup";
import { CheckCircle2, DatabaseBackup, Download, Upload } from "lucide-react";
import { useRef, useState } from "react";

export const Route = createFileRoute("/backup")({
  head: () => ({
    meta: [
      { title: "Backup — Smart Files" },
      { name: "description", content: "Export and restore Smart Files settings and preferences." },
    ],
  }),
  component: BackupPage,
});

function BackupPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const doExport = async () => {
    setError(null);
    setMessage(null);
    try {
      const bundle = await exportSettings();
      downloadBundle(bundle);
      setMessage(`Exported ${Object.keys(bundle.prefs).length} settings`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const doImport = async (file: File) => {
    setError(null);
    setMessage(null);
    try {
      const text = await file.text();
      const bundle = JSON.parse(text);
      await importSettings(bundle);
      setMessage("Settings restored. Reload the app to apply.");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <PageShell title="Backup" subtitle="Export or restore configuration">
      <div className="mb-4 flex items-start gap-3 rounded-3xl bg-primary-container p-4 text-on-primary-container">
        <DatabaseBackup className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h2 className="text-sm font-semibold">Full settings snapshot</h2>
          <p className="mt-1 text-xs opacity-90">
            Backups include themes, favorites, recent items, tabs, and download history. File
            contents are never included.
          </p>
        </div>
      </div>

      <div className="divide-y divide-border/60 overflow-hidden rounded-3xl bg-surface-container">
        <button
          onClick={doExport}
          className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-surface-container-high"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Download className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Export configuration</p>
            <p className="text-xs text-muted-foreground">Save a JSON file to your device</p>
          </div>
        </button>

        <button
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-surface-container-high"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-tertiary-container text-on-tertiary-container">
            <Upload className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Import configuration</p>
            <p className="text-xs text-muted-foreground">Restore from a backup JSON file</p>
          </div>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void doImport(f);
          e.target.value = "";
        }}
      />

      {message && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-primary/10 px-3 py-2 text-xs text-primary">
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-2xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}
    </PageShell>
  );
}
