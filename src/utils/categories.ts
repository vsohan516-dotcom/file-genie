import type { CategoryId } from "@/types/files";
import type { LucideIcon } from "lucide-react";
import {
  Archive,
  Download,
  FileText,
  Film,
  Image as ImageIcon,
  Music,
  Package,
} from "lucide-react";

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
  colorClass: string;
  extensions: string[];
  description: string;
}

export const CATEGORIES: Record<
  "images" | "videos" | "audio" | "documents" | "apk" | "archives" | "downloads",
  CategoryMeta
> = {
  images: {
    id: "images",
    label: "Images",
    icon: ImageIcon,
    colorClass: "bg-cat-image",
    extensions: ["jpg", "jpeg", "png", "gif", "webp", "bmp", "heic", "svg", "avif"],
    description: "Photos and pictures on your device",
  },
  videos: {
    id: "videos",
    label: "Videos",
    icon: Film,
    colorClass: "bg-cat-video",
    extensions: ["mp4", "mkv", "mov", "avi", "webm", "m4v", "3gp"],
    description: "Recorded and downloaded videos",
  },
  audio: {
    id: "audio",
    label: "Audio",
    icon: Music,
    colorClass: "bg-cat-audio",
    extensions: ["mp3", "wav", "flac", "ogg", "m4a", "aac", "opus"],
    description: "Music, podcasts and recordings",
  },
  documents: {
    id: "documents",
    label: "Documents",
    icon: FileText,
    colorClass: "bg-cat-document",
    extensions: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "md", "epub", "rtf"],
    description: "PDFs, Office and text documents",
  },
  apk: {
    id: "apk",
    label: "APK",
    icon: Package,
    colorClass: "bg-cat-apk",
    extensions: ["apk", "aab", "xapk"],
    description: "Android app packages",
  },
  archives: {
    id: "archives",
    label: "Archives",
    icon: Archive,
    colorClass: "bg-cat-archive",
    extensions: ["zip", "rar", "7z", "tar", "gz", "bz2"],
    description: "Compressed and archive files",
  },
  downloads: {
    id: "downloads",
    label: "Downloads",
    icon: Download,
    colorClass: "bg-cat-download",
    extensions: [],
    description: "Files saved from the browser and apps",
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
