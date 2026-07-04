import type { FileKind } from "@/types/files";
import {
  Archive,
  FileText,
  Film,
  Folder,
  Image as ImageIcon,
  Music,
  Package,
  Type,
  type LucideIcon,
} from "lucide-react";

export function iconForKind(kind: FileKind): LucideIcon {
  switch (kind) {
    case "folder":
      return Folder;
    case "image":
      return ImageIcon;
    case "video":
      return Film;
    case "audio":
      return Music;
    case "document":
      return FileText;
    case "text":
      return Type;
    case "archive":
      return Archive;
    case "apk":
      return Package;
    default:
      return FileText;
  }
}

export function colorForKind(kind: FileKind): string {
  switch (kind) {
    case "folder":
      return "text-primary bg-primary-container";
    case "image":
      return "text-white bg-cat-image";
    case "video":
      return "text-white bg-cat-video";
    case "audio":
      return "text-white bg-cat-audio";
    case "document":
    case "text":
      return "text-white bg-cat-document";
    case "archive":
      return "text-white bg-cat-archive";
    case "apk":
      return "text-white bg-cat-apk";
    default:
      return "text-on-surface-variant bg-surface-container-high";
  }
}
