import type { FileKind } from "@/types/files";

const IMAGE = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "heic", "svg", "avif", "tiff"];
const VIDEO = ["mp4", "mkv", "mov", "avi", "webm", "m4v", "3gp", "flv", "wmv"];
const AUDIO = ["mp3", "wav", "flac", "ogg", "m4a", "aac", "opus", "wma"];
const DOCUMENT = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "odp", "rtf", "epub"];
const TEXT = ["txt", "md", "json", "xml", "html", "htm", "css", "js", "ts", "tsx", "jsx", "yml", "yaml", "log", "csv"];
const ARCHIVE = ["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "iso"];
const APK = ["apk", "aab", "xapk"];

export function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i < 0 ? "" : name.slice(i + 1).toLowerCase();
}

export function classify(name: string, isDir: boolean): FileKind {
  if (isDir) return "folder";
  const ext = extOf(name);
  if (IMAGE.includes(ext)) return "image";
  if (VIDEO.includes(ext)) return "video";
  if (AUDIO.includes(ext)) return "audio";
  if (DOCUMENT.includes(ext)) return "document";
  if (TEXT.includes(ext)) return "text";
  if (ARCHIVE.includes(ext)) return "archive";
  if (APK.includes(ext)) return "apk";
  return "other";
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n < 10 && i > 0 ? n.toFixed(1) : Math.round(n)} ${units[i]}`;
}

export function formatDate(ms: number): string {
  if (!ms) return "";
  const d = new Date(ms);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { year: "numeric", month: "short", day: "2-digit" });
}

export function joinPath(base: string, name: string): string {
  if (!base) return name;
  if (base.endsWith("/")) return base + name;
  return `${base}/${name}`;
}

export function parentPath(path: string): string {
  if (!path || path === "/") return "";
  const trimmed = path.replace(/\/+$/, "");
  const i = trimmed.lastIndexOf("/");
  return i <= 0 ? "" : trimmed.slice(0, i);
}
