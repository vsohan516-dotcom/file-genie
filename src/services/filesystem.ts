import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import type { FileEntry } from "@/types/files";
import { classify, extOf, joinPath } from "@/utils/files";

export const isNative = () => Capacitor.isNativePlatform();

export interface Root {
  id: string;
  label: string;
  directory: Directory;
  basePath: string;
}

export const ROOTS: Root[] = [
  { id: "documents", label: "Documents", directory: Directory.Documents, basePath: "" },
  { id: "data", label: "App Data", directory: Directory.Data, basePath: "" },
  { id: "external", label: "External", directory: Directory.External, basePath: "" },
  { id: "cache", label: "Cache", directory: Directory.Cache, basePath: "" },
];

/** Parses "documents:/path/to" style URIs into { directory, path }. */
export function parseUri(uri: string): { root: Root; sub: string } {
  const [rootId, ...rest] = uri.split(":");
  const root = ROOTS.find((r) => r.id === rootId) ?? ROOTS[0];
  return { root, sub: rest.join(":") };
}

export function makeUri(rootId: string, sub: string): string {
  const clean = sub.replace(/^\/+/, "");
  return clean ? `${rootId}:${clean}` : `${rootId}:`;
}

/** Read a directory. Returns [] when not available (e.g. web preview without perms). */
export async function readDir(uri: string): Promise<FileEntry[]> {
  if (!isNative()) return [];
  const { root, sub } = parseUri(uri);
  try {
    const res = await Filesystem.readdir({ path: sub, directory: root.directory });
    return res.files
      .map((f) => {
        const isDir = f.type === "directory";
        const full = joinPath(sub, f.name);
        return {
          name: f.name,
          path: makeUri(root.id, full),
          isDirectory: isDir,
          size: f.size ?? 0,
          mtime: f.mtime ?? 0,
          kind: classify(f.name, isDir),
          ext: extOf(f.name),
        } satisfies FileEntry;
      })
      .sort((a, b) =>
        a.isDirectory === b.isDirectory
          ? a.name.localeCompare(b.name, undefined, { numeric: true })
          : a.isDirectory
            ? -1
            : 1,
      );
  } catch (err) {
    console.warn("readDir failed", uri, err);
    return [];
  }
}

export async function makeDir(uri: string, name: string): Promise<void> {
  if (!isNative()) throw new Error("Not available on web");
  const { root, sub } = parseUri(uri);
  await Filesystem.mkdir({
    path: joinPath(sub, name),
    directory: root.directory,
    recursive: true,
  });
}

export async function deleteEntry(entry: FileEntry): Promise<void> {
  if (!isNative()) throw new Error("Not available on web");
  const { root, sub } = parseUri(entry.path);
  if (entry.isDirectory) {
    await Filesystem.rmdir({ path: sub, directory: root.directory, recursive: true });
  } else {
    await Filesystem.deleteFile({ path: sub, directory: root.directory });
  }
}

export async function renameEntry(entry: FileEntry, newName: string): Promise<void> {
  if (!isNative()) throw new Error("Not available on web");
  const { root, sub } = parseUri(entry.path);
  const parent = sub.replace(/\/?[^/]+$/, "");
  const to = joinPath(parent, newName);
  await Filesystem.rename({ from: sub, to, directory: root.directory });
}

export async function copyEntry(entry: FileEntry, destUri: string): Promise<void> {
  if (!isNative()) throw new Error("Not available on web");
  const { root, sub } = parseUri(entry.path);
  const { root: destRoot, sub: destSub } = parseUri(destUri);
  await Filesystem.copy({
    from: sub,
    to: joinPath(destSub, entry.name),
    directory: root.directory,
    toDirectory: destRoot.directory,
  });
}

/** Recursive walk for search / categories. Depth-limited for safety. */
export async function walk(
  uri: string,
  onEntry: (e: FileEntry) => void,
  opts?: { maxDepth?: number; signal?: AbortSignal },
): Promise<void> {
  if (!isNative()) return;
  const maxDepth = opts?.maxDepth ?? 6;
  const stack: Array<{ uri: string; depth: number }> = [{ uri, depth: 0 }];
  while (stack.length) {
    if (opts?.signal?.aborted) return;
    const { uri: cur, depth } = stack.pop()!;
    const entries = await readDir(cur);
    for (const e of entries) {
      onEntry(e);
      if (e.isDirectory && depth < maxDepth) {
        stack.push({ uri: e.path, depth: depth + 1 });
      }
    }
  }
}
