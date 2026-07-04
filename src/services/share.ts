import { Share } from "@capacitor/share";
import type { FileEntry } from "@/types/files";

export async function shareFile(entry: FileEntry): Promise<void> {
  try {
    await Share.share({
      title: entry.name,
      text: entry.name,
      url: entry.path,
      dialogTitle: "Share file",
    });
  } catch (err) {
    console.warn("share failed", err);
  }
}
