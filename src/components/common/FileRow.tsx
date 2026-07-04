import type { FileEntry } from "@/types/files";
import { formatBytes, formatDate } from "@/utils/files";
import { ChevronRight, Star } from "lucide-react";
import { colorForKind, iconForKind } from "./fileIcons";

interface FileRowProps {
  entry: FileEntry;
  onOpen?: (entry: FileEntry) => void;
  onLongPress?: (entry: FileEntry) => void;
  selected?: boolean;
  favorite?: boolean;
}

export function FileRow({ entry, onOpen, selected, favorite }: FileRowProps) {
  const Icon = iconForKind(entry.kind);
  const tint = colorForKind(entry.kind);
  return (
    <button
      type="button"
      onClick={() => onOpen?.(entry)}
      className={`ripple flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${
        selected ? "bg-primary-container" : "hover:bg-surface-container-high active:bg-surface-container-high"
      }`}
    >
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tint}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium text-foreground">{entry.name}</span>
          {favorite && <Star className="h-3.5 w-3.5 shrink-0 fill-cat-favorite text-cat-favorite" />}
        </span>
        <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          {entry.isDirectory ? (
            <span>Folder</span>
          ) : (
            <>
              <span>{entry.ext ? entry.ext.toUpperCase() : "FILE"}</span>
              <span aria-hidden>•</span>
              <span>{formatBytes(entry.size)}</span>
            </>
          )}
          {entry.mtime > 0 && (
            <>
              <span aria-hidden>•</span>
              <span>{formatDate(entry.mtime)}</span>
            </>
          )}
        </span>
      </span>
      {entry.isDirectory && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
}
