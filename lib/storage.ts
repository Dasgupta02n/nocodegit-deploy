import fs from "fs";
import path from "path";
import { config, formatBytes } from "./config";

/**
 * Snapshot storage: local disk by default.
 * Optional S3-compatible (R2/S3) when S3_BUCKET + credentials are set.
 */

function s3Enabled() {
  return Boolean(
    process.env.S3_BUCKET &&
      (process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID) &&
      (process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY)
  );
}

function s3Config() {
  return {
    bucket: process.env.S3_BUCKET!,
    region: process.env.S3_REGION || process.env.AWS_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT || process.env.AWS_ENDPOINT_URL,
    accessKeyId:
      process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey:
      process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "",
  };
}

export function snapshotPath(projectId: string, saveId: string) {
  const dir = path.join(config.storagePath, projectId);
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${saveId}.zip`);
}

export function storageKey(projectId: string, saveId: string) {
  const prefix = process.env.S3_PREFIX || "snapshots";
  return `${prefix}/${projectId}/${saveId}.zip`;
}

async function s3Put(key: string, buffer: Buffer) {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const c = s3Config();
  const client = new S3Client({
    region: c.region,
    endpoint: c.endpoint,
    credentials: {
      accessKeyId: c.accessKeyId,
      secretAccessKey: c.secretAccessKey,
    },
    forcePathStyle: Boolean(c.endpoint),
  });
  await client.send(
    new PutObjectCommand({
      Bucket: c.bucket,
      Key: key,
      Body: buffer,
      ContentType: "application/zip",
    })
  );
}

async function s3Get(key: string): Promise<Buffer> {
  const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
  const c = s3Config();
  const client = new S3Client({
    region: c.region,
    endpoint: c.endpoint,
    credentials: {
      accessKeyId: c.accessKeyId,
      secretAccessKey: c.secretAccessKey,
    },
    forcePathStyle: Boolean(c.endpoint),
  });
  const out = await client.send(
    new GetObjectCommand({ Bucket: c.bucket, Key: key })
  );
  const bytes = await out.Body?.transformToByteArray();
  if (!bytes) throw new Error("Empty S3 object");
  return Buffer.from(bytes);
}

async function s3Del(key: string) {
  const { S3Client, DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  const c = s3Config();
  const client = new S3Client({
    region: c.region,
    endpoint: c.endpoint,
    credentials: {
      accessKeyId: c.accessKeyId,
      secretAccessKey: c.secretAccessKey,
    },
    forcePathStyle: Boolean(c.endpoint),
  });
  await client.send(
    new DeleteObjectCommand({ Bucket: c.bucket, Key: key })
  );
}

export function writeSnapshot(
  projectId: string,
  saveId: string,
  buffer: Buffer,
  maxBytes: number = config.maxSnapshotBytesFree
) {
  if (buffer.byteLength > maxBytes) {
    throw new Error(
      `Snapshot too large (${formatBytes(buffer.byteLength)}). Limit for your plan: ${formatBytes(maxBytes)}. Upgrade to Pro for unlimited size.`
    );
  }
  const key = storageKey(projectId, saveId);
  // Always write local cache for fast deploys
  const p = snapshotPath(projectId, saveId);
  fs.writeFileSync(p, buffer);

  if (s3Enabled()) {
    // Fire-and-forget async upload; also block briefly so caller can await via writeSnapshotAsync
    void s3Put(key, buffer).catch((e) =>
      console.error("S3 put failed", e)
    );
  }

  return {
    path: p,
    size: buffer.byteLength,
    storageKey: key,
    backend: s3Enabled() ? "s3+local" : "local",
  };
}

export async function writeSnapshotAsync(
  projectId: string,
  saveId: string,
  buffer: Buffer,
  maxBytes?: number
) {
  const r = writeSnapshot(projectId, saveId, buffer, maxBytes);
  if (s3Enabled()) {
    await s3Put(r.storageKey, buffer);
  }
  return r;
}

export function readSnapshot(projectId: string, saveId: string): Buffer {
  const p = snapshotPath(projectId, saveId);
  if (fs.existsSync(p)) return fs.readFileSync(p);
  throw new Error("Snapshot not found locally");
}

export async function readSnapshotAsync(
  projectId: string,
  saveId: string
): Promise<Buffer> {
  const p = snapshotPath(projectId, saveId);
  if (fs.existsSync(p)) return fs.readFileSync(p);
  if (s3Enabled()) {
    const buf = await s3Get(storageKey(projectId, saveId));
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, buf);
    return buf;
  }
  throw new Error("Snapshot not found");
}

export function deleteSnapshot(projectId: string, saveId: string) {
  const p = snapshotPath(projectId, saveId);
  if (fs.existsSync(p)) fs.unlinkSync(p);
  if (s3Enabled()) {
    void s3Del(storageKey(projectId, saveId)).catch(() => undefined);
  }
}

/** List text-ish paths inside a zip (for preview). Uses system unzip listing. */
export function listSnapshotEntries(
  projectId: string,
  saveId: string,
  max = 80
): string[] {
  const p = snapshotPath(projectId, saveId);
  if (!fs.existsSync(p)) return [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { execSync } = require("child_process") as typeof import("child_process");
    if (process.platform === "win32") {
      const ps = `Add-Type -AssemblyName System.IO.Compression.FileSystem; [IO.Compression.ZipFile]::OpenRead('${p.replace(/'/g, "''")}').Entries | Select-Object -First ${max} -ExpandProperty FullName`;
      const out = execSync(`powershell -NoProfile -Command "${ps}"`, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      return out
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    const out = execSync(`unzip -l "${p}"`, { encoding: "utf8" });
    return out
      .split(/\r?\n/)
      .map((line) => {
        const m = line.match(/\d{2}-\d{2}-\d{2,4}\s+\d{2}:\d{2}\s+\d+\s+(.+)$/);
        return m?.[1]?.trim() || "";
      })
      .filter((n) => n && !n.endsWith("/"))
      .slice(0, max);
  } catch {
    return ["(could not list archive — download to inspect)"];
  }
}
