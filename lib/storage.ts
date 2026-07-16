import fs from "fs";
import path from "path";
import { config, formatBytes } from "./config";

export function snapshotPath(projectId: string, saveId: string) {
  const dir = path.join(config.storagePath, projectId);
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${saveId}.zip`);
}

export function writeSnapshot(
  projectId: string,
  saveId: string,
  buffer: Buffer,
  maxBytes: number = config.maxSnapshotBytesFree
) {
  if (buffer.byteLength > maxBytes) {
    throw new Error(
      `Snapshot too large (${formatBytes(buffer.byteLength)}). Limit for your plan: ${formatBytes(maxBytes)}. Upgrade to Pro ($5/mo) for unlimited size.`
    );
  }
  const p = snapshotPath(projectId, saveId);
  fs.writeFileSync(p, buffer);
  return {
    path: p,
    size: buffer.byteLength,
    storageKey: `${projectId}/${saveId}.zip`,
  };
}

export function readSnapshot(projectId: string, saveId: string): Buffer {
  const p = snapshotPath(projectId, saveId);
  if (!fs.existsSync(p)) throw new Error("Snapshot not found");
  return fs.readFileSync(p);
}

export function deleteSnapshot(projectId: string, saveId: string) {
  const p = snapshotPath(projectId, saveId);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}
