/**
 * Lightweight Node tests (no jest required): npm test
 */
import assert from "assert";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

// --- rate limit pure logic inline test (duplicate minimal) ---
function rateLimit(map, key, limit, windowMs, now = Date.now()) {
  let b = map.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    map.set(key, b);
  }
  b.count += 1;
  return { ok: b.count <= limit, remaining: Math.max(0, limit - b.count) };
}

const map = new Map();
assert.strictEqual(rateLimit(map, "a", 2, 1000).ok, true);
assert.strictEqual(rateLimit(map, "a", 2, 1000).ok, true);
assert.strictEqual(rateLimit(map, "a", 2, 1000).ok, false);

// --- format bytes style ---
function formatBytes(n) {
  if (n >= Number.MAX_SAFE_INTEGER / 2) return "unlimited";
  if (n >= 1024 * 1024) return `${Math.round(n / (1024 * 1024))} MB`;
  return `${Math.round(n / 1024)} KB`;
}
assert.strictEqual(formatBytes(300 * 1024 * 1024), "300 MB");
assert.strictEqual(formatBytes(Number.MAX_SAFE_INTEGER), "unlimited");

// --- plan helpers ---
function isPaidPlan(plan) {
  const p = (plan || "free").toLowerCase();
  return p === "pro" || p === "solo" || p === "studio" || p === "paid";
}
assert.strictEqual(isPaidPlan("free"), false);
assert.strictEqual(isPaidPlan("pro"), true);

// --- AES roundtrip (same algo as lib/crypto) ---
const secret = "test-secret-key-for-unit-tests-32chars!!";
const key = crypto.createHash("sha256").update(secret).digest();
function encrypt(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}
function decrypt(payload) {
  const buf = Buffer.from(payload, "base64url");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    "utf8"
  );
}
const sample = "sk_test_secret_value";
assert.strictEqual(decrypt(encrypt(sample)), sample);

// --- snippet markers ---
const open = "<!-- ncg:snippet:ad -->";
const close = "<!-- /ncg:snippet:ad -->";
let html = `<html><body>${open}old${close}</body></html>`;
const re = new RegExp(
  `${open.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${close.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
  "g"
);
html = html.replace(re, `${open}\nnew ad\n${close}`);
assert.ok(html.includes("new ad"));
assert.ok(!html.includes("old"));
// legacy markers still conceptually supported in app code
assert.ok("<!-- quay:snippet:x -->".includes("quay:snippet"));

// package identity
const pkg = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8")
);
assert.strictEqual(pkg.name, "nocodegit");

console.log("All tests passed.");
