/**
 * Deterministic snippet + affiliate apply (no AI).
 * Works on extracted project files in a temp directory.
 */
import fs from "fs";
import path from "path";

export type SnippetInput = {
  slug: string;
  content: string;
  placement: "head" | "body_start" | "body_end" | "marker";
  enabled: boolean;
};

export type AffiliateInput = {
  slug: string;
  destination_url: string;
  last_applied_url: string | null;
  find_url_on_create: string | null;
  mode: "replace" | "redirect" | "both";
  enabled: boolean;
};

const TEXT_EXT = new Set([
  ".html",
  ".htm",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".md",
  ".json",
  ".css",
  ".vue",
  ".svelte",
]);

function walk(dir: string, files: string[] = []): string[] {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === ".next") continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (st.size < 2 * 1024 * 1024) files.push(p);
  }
  return files;
}

/** Canonical markers (NoCodeGit). Legacy quay:snippet still detected. */
function markerOpen(slug: string) {
  return `<!-- ncg:snippet:${slug} -->`;
}
function markerClose(slug: string) {
  return `<!-- /ncg:snippet:${slug} -->`;
}
function legacyOpen(slug: string) {
  return `<!-- quay:snippet:${slug} -->`;
}
function legacyClose(slug: string) {
  return `<!-- /quay:snippet:${slug} -->`;
}

function wrap(slug: string, content: string) {
  return `${markerOpen(slug)}\n${content}\n${markerClose(slug)}`;
}

function replaceMarkers(html: string, slug: string, content: string): string {
  const patterns = [
    [markerOpen(slug), markerClose(slug)],
    [legacyOpen(slug), legacyClose(slug)],
  ] as const;
  let out = html;
  let hit = false;
  for (const [open, close] of patterns) {
    const re = new RegExp(
      `${escapeRe(open)}[\\s\\S]*?${escapeRe(close)}`,
      "g"
    );
    if (re.test(out)) {
      out = out.replace(re, wrap(slug, content));
      hit = true;
    }
  }
  return hit ? out : html;
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findIndexHtml(root: string): string | null {
  const candidates = [
    "index.html",
    "public/index.html",
    "out/index.html",
    "dist/index.html",
  ];
  for (const c of candidates) {
    const p = path.join(root, c);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export function applySnippets(
  root: string,
  snippets: SnippetInput[],
  affiliates: AffiliateInput[]
): { log: string[]; appliedSnippets: Record<string, string>; appliedAffiliates: Record<string, string> } {
  const log: string[] = [];
  const appliedSnippets: Record<string, string> = {};
  const appliedAffiliates: Record<string, string> = {};

  for (const sn of snippets.filter((s) => s.enabled)) {
    const body = sn.enabled ? sn.content : "";
    let applied = false;

    // Marker replace across text files
    for (const file of walk(root)) {
      if (!TEXT_EXT.has(path.extname(file).toLowerCase())) continue;
      const text = fs.readFileSync(file, "utf8");
      const next = replaceMarkers(text, sn.slug, body);
      if (next !== text) {
        fs.writeFileSync(file, next, "utf8");
        applied = true;
        log.push(`Snippet ${sn.slug}: markers updated in ${path.relative(root, file)}`);
      }
    }

    if (!applied && sn.placement !== "marker") {
      const indexPath = findIndexHtml(root);
      if (indexPath) {
        let html = fs.readFileSync(indexPath, "utf8");
        const block = wrap(sn.slug, body);
        if (sn.placement === "head" && html.includes("</head>")) {
          html = html.replace("</head>", `${block}\n</head>`);
          applied = true;
        } else if (sn.placement === "body_start" && /<body[^>]*>/i.test(html)) {
          html = html.replace(/<body[^>]*>/i, (m) => `${m}\n${block}`);
          applied = true;
        } else if (sn.placement === "body_end" && html.includes("</body>")) {
          html = html.replace("</body>", `${block}\n</body>`);
          applied = true;
        }
        if (applied) {
          fs.writeFileSync(indexPath, html, "utf8");
          log.push(`Snippet ${sn.slug}: injected into ${path.relative(root, indexPath)} (${sn.placement})`);
        }
      }
    }

    if (!applied) {
      log.push(
        `Snippet ${sn.slug}: no markers/target found (add <!-- ncg:snippet:${sn.slug} --> markers)`
      );
    } else {
      appliedSnippets[sn.slug] = body;
    }
  }

  for (const link of affiliates.filter((a) => a.enabled)) {
    if (link.mode === "redirect") {
      log.push(`Affiliate ${link.slug}: redirect-only (configure /go/${link.slug} on your host if needed)`);
      appliedAffiliates[link.slug] = link.destination_url;
      continue;
    }
    const from =
      link.last_applied_url || link.find_url_on_create || null;
    if (!from) {
      log.push(`Affiliate ${link.slug}: no previous/find URL; set find URL on create or use redirect mode`);
      appliedAffiliates[link.slug] = link.destination_url;
      continue;
    }
    if (from === link.destination_url) {
      log.push(`Affiliate ${link.slug}: URL unchanged`);
      appliedAffiliates[link.slug] = link.destination_url;
      continue;
    }
    let count = 0;
    for (const file of walk(root)) {
      if (!TEXT_EXT.has(path.extname(file).toLowerCase())) continue;
      const text = fs.readFileSync(file, "utf8");
      if (!text.includes(from)) continue;
      const parts = text.split(from);
      const n = parts.length - 1;
      if (n > 0) {
        fs.writeFileSync(file, parts.join(link.destination_url), "utf8");
        count += n;
      }
    }
    log.push(`Affiliate ${link.slug}: replaced ${count} occurrence(s)`);
    appliedAffiliates[link.slug] = link.destination_url;
  }

  return { log, appliedSnippets, appliedAffiliates };
}
