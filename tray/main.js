/**
 * NoCodeGit Tray — Save / Deploy / Report + project picker
 */
const {
  app,
  Tray,
  Menu,
  nativeImage,
  dialog,
  clipboard,
  Notification,
  shell,
} = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { execSync } = require("child_process");
const https = require("https");
const http = require("http");

const CONFIG_PATH = path.join(app.getPath("userData"), "nocodegit-tray.json");

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch {
    return {
      apiUrl: "http://localhost:3000",
      token: "",
      projectId: "",
      folderPath: "",
      projects: [],
    };
  }
}

function saveConfig(cfg) {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

function notify(title, body) {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
}

function request(method, urlPath, { token, apiUrl, body, isForm } = {}) {
  return new Promise((resolve, reject) => {
    const base = (apiUrl || "http://localhost:3000").replace(/\/$/, "");
    const u = new URL(urlPath.startsWith("/") ? urlPath.slice(1) : urlPath, base + "/");
    const lib = u.protocol === "https:" ? https : http;
    const headers = {
      Authorization: `Bearer ${token}`,
      "User-Agent": "NoCodeGitTray/1.1",
    };
    let payload = null;
    if (isForm && body) {
      payload = body;
      headers["Content-Type"] = `multipart/form-data; boundary=${body.boundary}`;
      headers["Content-Length"] = body.buffer.length;
    } else if (body) {
      payload = Buffer.from(JSON.stringify(body));
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = payload.length;
    }
    const req = lib.request(
      {
        hostname: u.hostname,
        port: u.port || (u.protocol === "https:" ? 443 : 80),
        path: u.pathname + u.search,
        method,
        headers,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          let data;
          try {
            data = JSON.parse(text);
          } catch {
            data = { raw: text };
          }
          if (res.statusCode >= 400) {
            reject(new Error(data.error || text || `HTTP ${res.statusCode}`));
          } else resolve(data);
        });
      }
    );
    req.on("error", reject);
    if (payload) {
      if (isForm) req.write(payload.buffer);
      else req.write(payload);
    }
    req.end();
  });
}

function zipFolder(folderPath) {
  const out = path.join(os.tmpdir(), `ncg-tray-${Date.now()}.zip`);
  if (process.platform === "win32") {
    const ps = `Compress-Archive -Path '${folderPath.replace(/'/g, "''")}\\*' -DestinationPath '${out.replace(/'/g, "''")}' -Force`;
    execSync(`powershell -NoProfile -Command "${ps}"`, { stdio: "pipe" });
  } else {
    execSync(
      `cd "${folderPath}" && zip -r "${out}" . -x "node_modules/*" -x ".git/*" -x ".next/*"`,
      { stdio: "pipe" }
    );
  }
  return out;
}

function multipartFile(fieldName, filePath, filename) {
  const boundary = "----NcgTray" + Date.now();
  const fileBuf = fs.readFileSync(filePath);
  const head = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\nContent-Type: application/zip\r\n\r\n`
  );
  const mid = Buffer.from(
    `\r\n--${boundary}\r\nContent-Disposition: form-data; name="label"\r\n\r\nTray ${new Date().toISOString()}\r\n--${boundary}--\r\n`
  );
  return { boundary, buffer: Buffer.concat([head, fileBuf, mid]) };
}

async function refreshProjects(cfg) {
  if (!cfg.token) throw new Error("Set token in config first");
  const data = await request("GET", "/api/agent/projects", {
    token: cfg.token,
    apiUrl: cfg.apiUrl,
  });
  cfg.projects = (data.projects || []).map((p) => ({
    id: p.id,
    name: p.name,
  }));
  if (!cfg.projectId && cfg.projects[0]) cfg.projectId = cfg.projects[0].id;
  saveConfig(cfg);
  return cfg.projects;
}

async function doSave(cfg) {
  if (!cfg.token || !cfg.projectId || !cfg.folderPath) {
    throw new Error("Configure token, project, and folder first");
  }
  if (!fs.existsSync(cfg.folderPath)) throw new Error("Folder missing");
  notify("NoCodeGit", "Zipping project…");
  const zip = zipFolder(cfg.folderPath);
  try {
    const form = multipartFile("file", zip, "project.zip");
    const data = await request(
      "POST",
      `/api/agent/projects/${cfg.projectId}/save`,
      {
        token: cfg.token,
        apiUrl: cfg.apiUrl,
        body: form,
        isForm: true,
      }
    );
    notify("NoCodeGit", `Saved ${data.save?.id || "OK"}`);
    return data;
  } finally {
    try {
      fs.unlinkSync(zip);
    } catch {
      /* ignore */
    }
  }
}

async function doDeploy(cfg) {
  if (!cfg.token || !cfg.projectId) throw new Error("Configure token and project");
  notify("NoCodeGit", "Deploying to your host…");
  const data = await request(
    "POST",
    `/api/agent/projects/${cfg.projectId}/deploy`,
    {
      token: cfg.token,
      apiUrl: cfg.apiUrl,
      body: {},
    }
  );
  notify("NoCodeGit", `Deploy ${data.deploy?.status || "done"}`);
  return data;
}

function statusLine(cfg) {
  const p = (cfg.projects || []).find((x) => x.id === cfg.projectId);
  const name = p?.name || cfg.projectId || "no project";
  const folder = cfg.folderPath ? path.basename(cfg.folderPath) : "no folder";
  const host = cfg.hostingLabel || "host ?";
  const envN = cfg.envCount != null ? cfg.envCount : "?";
  const snN = cfg.snipCount != null ? cfg.snipCount : "?";
  return `${host} · Env ${envN} · Snips ${snN} · ${name} · ${folder}`;
}

async function refreshStatus(cfg) {
  if (!cfg.token) return cfg;
  try {
    const data = await request("GET", "/api/agent/projects", {
      token: cfg.token,
      apiUrl: cfg.apiUrl,
    });
    cfg.projects = (data.projects || []).map((p) => ({
      id: p.id,
      name: p.name,
    }));
    if (cfg.projectId) {
      try {
        const st = await request(
          "GET",
          `/api/agent/projects/${cfg.projectId}/status`,
          { token: cfg.token, apiUrl: cfg.apiUrl }
        );
        cfg.hostingLabel = st.statusLine?.split(" · ")[0] || st.hosting?.provider;
        cfg.envCount = st.envCount;
        cfg.snipCount = st.snipCount;
        cfg.statusLine = st.statusLine;
      } catch {
        /* ignore */
      }
    }
    saveConfig(cfg);
  } catch {
    /* ignore */
  }
  return cfg;
}

function rebuildMenu(tray) {
  const cfg = loadConfig();
  const projectItems = (cfg.projects || []).map((p) => ({
    label: (cfg.projectId === p.id ? "● " : "○ ") + p.name,
    click: () => {
      cfg.projectId = p.id;
      saveConfig(cfg);
      rebuildMenu(tray);
      notify("NoCodeGit", `Project: ${p.name}`);
    },
  }));

  const menu = Menu.buildFromTemplate([
    { label: "NoCodeGit Tray", enabled: false },
    {
      label: statusLine(cfg),
      enabled: false,
    },
    { type: "separator" },
    {
      label: "Save",
      click: async () => {
        try {
          await doSave(loadConfig());
          rebuildMenu(tray);
        } catch (e) {
          dialog.showErrorBox("Save failed", e.message);
        }
      },
    },
    {
      label: "Deploy",
      click: async () => {
        try {
          await doDeploy(loadConfig());
          rebuildMenu(tray);
        } catch (e) {
          dialog.showErrorBox("Deploy failed", e.message);
        }
      },
    },
    {
      label: "Report error (copy)",
      click: () => {
        const c = loadConfig();
        clipboard.writeText(
          `NoCodeGit tray report\nProject: ${c.projectId}\nTime: ${new Date().toISOString()}\n\nPaste latest deploy log from Deploy history into your vibe tool.\n\nPre-save checklist:\n- App listens on PORT if required by host\n- DATABASE_URL / env keys set in NoCodeGit Environment\n- Snippet markers <!-- ncg:snippet:... --> if using Pro ads`
        );
        notify("NoCodeGit", "Report template copied");
      },
    },
    {
      label: "Pre-save checklist (copy)",
      click: () => {
        clipboard.writeText(
          `NoCodeGit pre-save checklist\n1. Project runs locally\n2. Env vars named for production (OPENAI_API_KEY, DATABASE_URL, …)\n3. Add keys in NoCodeGit → Settings → Environment\n4. Hosting connected (Settings → Hosting)\n5. Optional: ncg:snippet markers for ads\n6. Save ZIP (exclude node_modules)\n7. Deploy`
        );
        notify("NoCodeGit", "Pre-save checklist copied");
      },
    },
    { type: "separator" },
    {
      label: "Refresh projects",
      click: async () => {
        try {
          const c = await refreshStatus(loadConfig());
          await refreshProjects(c);
          rebuildMenu(tray);
          notify("NoCodeGit", "Projects refreshed");
        } catch (e) {
          dialog.showErrorBox("Refresh failed", e.message);
        }
      },
    },
    {
      label: "Select project",
      submenu:
        projectItems.length > 0
          ? projectItems
          : [{ label: "(refresh projects first)", enabled: false }],
    },
    {
      label: "Choose folder…",
      click: () => {
        const c = loadConfig();
        const r = dialog.showOpenDialogSync({
          properties: ["openDirectory"],
          title: "NoCodeGit — project folder",
        });
        if (r?.[0]) {
          c.folderPath = r[0];
          saveConfig(c);
          rebuildMenu(tray);
          notify("NoCodeGit", `Folder: ${r[0]}`);
        }
      },
    },
    {
      label: "Open config…",
      click: () => {
        if (!fs.existsSync(CONFIG_PATH)) saveConfig(loadConfig());
        shell.openPath(CONFIG_PATH);
      },
    },
    {
      label: "Open dashboard",
      click: () =>
        shell.openExternal(loadConfig().apiUrl || "https://nocodegit.tech"),
    },
    { type: "separator" },
    {
      label: `Folder: ${cfg.folderPath ? path.basename(cfg.folderPath) : "(none)"}`,
      enabled: false,
    },
    {
      label: `Project: ${cfg.projectId || "(none)"}`,
      enabled: false,
    },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);
  tray.setContextMenu(menu);
  tray.setToolTip(`NoCodeGit — ${statusLine(cfg)}`);
}

app.whenReady().then(() => {
  const icon = nativeImage.createFromDataURL(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAKElEQVQ4T2NkYGD4z0ABYBzVMKoBBgPDfwYGBoZRM0Y1jGoY1QAAVw0GAf7vQK0AAAAASUVORK5CYII="
  );
  const tray = new Tray(icon);
  tray.setToolTip("NoCodeGit — Save. Ship. Still.");
  rebuildMenu(tray);
  const cfg = loadConfig();
  if (!cfg.token) {
    notify(
      "NoCodeGit Tray",
      "Open config: set apiUrl + token. Create token in web Settings."
    );
  }
});

app.on("window-all-closed", (e) => e.preventDefault());
