export type FileKind =
  | "folder"
  | "image"
  | "video"
  | "audio"
  | "document"
  | "apk"
  | "archive"
  | "text"
  | "other";

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  mtime: number;
  kind: FileKind;
  ext: string;
}

export interface StorageInfo {
  totalBytes: number;
  freeBytes: number;
  usedBytes: number;
}

export type CategoryId =
  | "images"
  | "videos"
  | "audio"
  | "documents"
  | "apk"
  | "archives"
  | "downloads"
  | "large"
  | "recent"
  | "favorites";

export type ViewMode = "list" | "grid" | "compact";
export type SortKey = "name" | "date" | "size" | "type";
export type SortDir = "asc" | "desc";
export type AccentName = "green" | "blue" | "violet" | "orange" | "rose";
export type ThemeMode = "system" | "light" | "dark";
