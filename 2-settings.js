/* ModStore Settings (demo): gear in topbar, settings overlay with
   Admin, Downloads, Appearances, Request an App Update, About.
   Themes and wallpapers are downloaded onto the device before use:
   their actual bytes are stored in the browser's durable Cache Storage,
   and an item counts as downloaded only after its bytes verify there. */
(() => {
  const LS_SETTINGS = "modstore-settings";
  const LS_DOWNLOADS = "modstore-download-clicks";
  const LS_OWNED = "modstore-downloaded";
  const WHATSAPP_URL = "https://wa.me/919457114580?text=" +
    encodeURIComponent("Please Update ModStore!\nApp Name - ");
  const DEFAULTS = { mode: "system", theme: "default", glass: false, background: "plain" };

  /* Which file each downloadable item saves on the device.
     Downloads go into the browser-managed durable Cache Storage
     (cache "modstore-assets"); ownership is granted only after the
     stored bytes verify, and a startup audit drops ownership of any
     item whose stored bytes have gone missing. */
  const THEME_ASSETS = { cream: "wallpaper.css", glass: "app.css", "default": null };
  const BG_ASSETS = { car: "wallpaper.jpg", gradient: null };
  const CACHE_NAME = "modstore-assets";
  const GRADIENT_PKG_URL = new URL("modstore-packages/sunset-gradient.css", location.href).href;
  const CUSTOM_BG_URL = new URL("modstore-packages/custom-wallpaper", location.href).href;
  /* The Sunset gradient ships as a real downloadable package: its actual
     CSS definition, stored on the device like any other asset. */
  const GRADIENT_CSS =
    "/* ModStore Sunset gradient wallpaper package (stored on device) */\n" +
    'html[data-bg="gradient"] body::before{' +
    "display:block!important;content:\"\"!important;position:fixed;inset:0;z-index:-1;" +
    "background:linear-gradient(165deg,#f6d8a8 0%,#e8a25e 45%,#7a4e2a 100%);transform:translateZ(0)}\n";

  function assetUrlFor(kind, id) {
    if (kind === "theme") return THEME_ASSETS[id] ? new URL(THEME_ASSETS[id], location.href).href : null;
    if (id === "gradient") return GRADIENT_PKG_URL;
    if (id === "custom") return CUSTOM_BG_URL;
    return BG_ASSETS[id] ? new URL(BG_ASSETS[id], location.href).href : null;
  }
  function openStore() {
    if (!("caches" in window)) return Promise.reject(new Error("cache storage unavailable"));
    return caches.open(CACHE_NAME);
  }
  /* Resolves true only when the item's bytes are verifiably on the device. */
  function isStored(kind, id) {
    const url = assetUrlFor(kind, id);
    if (!url) return Promise.resolve(true); // built-in items need no stored copy
    return openStore().then(c => c.match(url)).then(r => !!r).catch(() => false);
  }
  /* Tracks items whose last download attempt failed, for the Retry state. */
  const failed = new Set();
  /* Download icon, from his reference: arrow down into a tray. */
  const DL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 3.5v10.5"/><path d="m6.8 9.8 5.2 5.2 5.2-5.2"/>' +
    '<path d="M4.8 14.5v3.2a2.8 2.8 0 0 0 2.8 2.8h8.8a2.8 2.8 0 0 0 2.8-2.8v-3.2"/></svg>';

  /* ---------- preferences ---------- */
  function loadPrefs() {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_SETTINGS) || "{}");
      return Object.assign({}, DEFAULTS, saved);
    } catch (_) { return Object.assign({}, DEFAULTS); }
  }
  function savePrefs(p) {
    try { localStorage.setItem(LS_SETTINGS, JSON.stringify(p)); } catch (_) {}
  }
  let prefs = loadPrefs();

  /* ---------- downloaded (on-device) themes and wallpapers ---------- */
  function loadOwned() {
    try {
      const d = JSON.parse(localStorage.getItem(LS_OWNED) || "{}");
      return { themes: d.themes || ["default"], wallpapers: d.wallpapers || [] };
    } catch (_) { return { themes: ["default"], wallpapers: [] }; }
  }
  function saveOwned(d) {
    try { localStorage.setItem(LS_OWNED, JSON.stringify(d)); } catch (_) {}
  }
  let owned = loadOwned();

  /* Anything not on the device falls back to the built-in Default theme */
  if (!owned.themes.includes(prefs.theme)) prefs.theme = "default";
  if (prefs.background !== "plain" && !owned.wallpapers.includes(prefs.background)) prefs.background = "plain";
  savePrefs(prefs);

  /* Downloads the real asset into durable storage. Calls done(true) only
     after the stored bytes verify on the device; done(false) on any
     failure, leaving ownership untouched so the UI can offer Retry. */
  function downloadItem(kind, id, done) {
    const url = assetUrlFor(kind, id);
    if (!url) { // built-in item: nothing to store
      const list = kind === "theme" ? owned.themes : owned.wallpapers;
      if (!list.includes(id)) list.push(id);
      saveOwned(owned);
      done(true);
      return;
    }
    /* The Glass theme brings its own wallpaper: the car photo is stored
       with the theme download and counts as on-device wallpaper too. */
    const jobs = [];
    if (id === "gradient") {
      jobs.push(c => c.put(url, new Response(GRADIENT_CSS, { headers: { "Content-Type": "text/css" } })));
    } else {
      jobs.push(c => fetch(url, { cache: "no-cache" }).then(r => {
        if (!r.ok) throw new Error("fetch failed: " + r.status);
        return c.put(url, r);
      }));
    }
    let carUrl = null;
    if (kind === "theme" && id === "glass") {
      carUrl = new URL("wallpaper.jpg", location.href).href;
      jobs.push(c => fetch(carUrl, { cache: "no-cache" }).then(r => {
        if (!r.ok) throw new Error("fetch failed: " + r.status);
        return c.put(carUrl, r);
      }));
    }
    const verifyUrls = carUrl ? [url, carUrl] : [url];
    openStore().then(cache => Promise.all(jobs.map(j => j(cache))))
      .then(() => openStore())
      .then(c => Promise.all(verifyUrls.map(u => c.match(u))))
      .then(matches => {
        if (matches.some(m => !m)) throw new Error("stored copy failed to verify");
        const list = kind === "theme" ? owned.themes : owned.wallpapers;
        if (!list.includes(id)) list.push(id);
        if (kind === "theme" && id === "glass" && !owned.wallpapers.includes("car")) {
          owned.wallpapers.push("car");
        }
        saveOwned(owned);
        done(true);
      }).catch(() => done(false));
  }

  /* Applies the current wallpaper from its stored on-device copy. */
  function applyStoredWallpaper(id) {
    const url = assetUrlFor("bg", id);
    if (!url) return;
    openStore().then(c => c.match(url)).then(r => {
      if (!r) return null;
      let style = document.getElementById("modstore-wallpaper-live");
      if (!style) {
        style = document.createElement("style");
        style.id = "modstore-wallpaper-live";
        document.head.appendChild(style);
      }
      if (id === "gradient") {
        return r.text().then(t => { style.textContent = t; });
      }
      return r.blob().then(b => {
        const u = URL.createObjectURL(b);
        style.textContent = 'html[data-bg="' + id + '"] body::before{background-image:url("' + u + '")!important}';
      });
    }).catch(() => {});
  }

  const darkQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function resolvedMode() {
    if (prefs.mode === "system") return darkQuery && darkQuery.matches ? "dark" : "light";
    return prefs.mode;
  }
  function applyPrefs() {
    const root = document.documentElement;
    const wallpaper = document.querySelector('link[href^="wallpaper.css"]');
    if (wallpaper) wallpaper.disabled = prefs.theme !== "cream";
    root.dataset.theme = prefs.theme;
    /* Cream stays light cream every time; the mode choice applies to the Default theme only (Akarsh, 2026-11-28). */
    root.dataset.mode = prefs.theme === "default" ? resolvedMode() : (prefs.theme === "cream" ? "light" : "dark");
    root.dataset.glass = prefs.glass ? "on" : "off";
    root.dataset.bg = prefs.theme === "glass" ? "car" : prefs.background;
    if (prefs.theme === "glass") {
      if (owned.wallpapers.includes("car")) applyStoredWallpaper("car");
    } else if (prefs.background !== "plain" && owned.wallpapers.includes(prefs.background)) {
      applyStoredWallpaper(prefs.background);
    }
  }
  if (darkQuery && darkQuery.addEventListener) {
    darkQuery.addEventListener("change", () => { if (prefs.mode === "system") applyPrefs(); });
  }
  applyPrefs();

  /* Startup audit: an owned item whose stored bytes are gone from the
     device drops back to "not downloaded", and prefs referencing it fall
     back to the built-in Default theme / plain wallpaper. */
  function auditOwned() {
    const checks = [];
    owned.themes.forEach(id => checks.push(isStored("theme", id).then(ok => ({ kind: "theme", id, ok }))));
    owned.wallpapers.forEach(id => checks.push(isStored("bg", id).then(ok => ({ kind: "bg", id, ok }))));
    Promise.all(checks).then(results => {
      let changed = false;
      results.forEach(r => {
        if (r.ok) return;
        const list = r.kind === "theme" ? owned.themes : owned.wallpapers;
        const i = list.indexOf(r.id);
        if (i >= 0) { list.splice(i, 1); changed = true; }
      });
      if (!owned.themes.includes("default")) { owned.themes.push("default"); changed = true; }
      if (!owned.themes.includes(prefs.theme)) { prefs.theme = "default"; changed = true; }
      if (prefs.background !== "plain" && !owned.wallpapers.includes(prefs.background)) {
        prefs.background = "plain"; changed = true;
      }
      if (changed) {
        saveOwned(owned); savePrefs(prefs); applyPrefs();
        if (screen && view === "appear") renderView();
      }
    });
  }
  auditOwned();

  /* ---------- download click tracking ---------- */
  function loadDownloads() {
    try { return JSON.parse(localStorage.getItem(LS_DOWNLOADS) || "[]"); } catch (_) { return []; }
  }
  document.addEventListener("click", (e) => {
    const link = e.target.closest && e.target.closest("a.app-details-download");
    if (!link) return;
    const screen = link.closest(".app-details-screen");
    const name = (screen && screen.querySelector("h1") ? screen.querySelector("h1").textContent : "App").trim();
    const list = loadDownloads();
    list.unshift({ name: name, label: link.textContent.trim(), ts: Date.now() });
    try { localStorage.setItem(LS_DOWNLOADS, JSON.stringify(list.slice(0, 30))); } catch (_) {}
  }, true);

  function timeAgo(ts) {
    const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return s + "s ago";
    const m = Math.floor(s / 60); if (m < 60) return m + "m ago";
    const h = Math.floor(m / 60); if (h < 24) return h + "h ago";
    return Math.floor(h / 24) + "d ago";
  }

  /* ---------- overlay scaffolding ---------- */
  let screen = null;
  let view = "root";
  const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g,
    c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function ensureScreen() {
    if (screen) return screen;
    screen = document.createElement("section");
    screen.className = "settings-screen";
    screen.id = "settingsScreen";
    document.body.appendChild(screen);
    return screen;
  }
  function hasSettingsState() { return !!(history.state && history.state.k === "settings"); }
  function openSettings() {
    ensureScreen();
    view = "root";
    renderView();
    document.body.style.overflow = "hidden";
    if (!hasSettingsState()) {
      try { history.pushState({ k: "settings" }, "", window.location.href); } catch (_) {}
    }
  }
  function closeSettings(skipHistory) {
    if (screen) screen.remove();
    screen = null;
    document.body.style.overflow = "";
    if (!skipHistory && hasSettingsState()) history.back();
  }
  window.addEventListener("popstate", (e) => {
    if (screen && !(e.state && e.state.k === "settings")) closeSettings(true);
  });

  /* ---------- views ---------- */
  const ROWS = [
    { id: "admin",    icon: '<span class="set-icon-admin"></span>', label: "Admin",            sub: "Manage apps and categories" },
    { id: "downloads",icon: DL_ICON, label: "Downloads",     sub: "Apps you tapped Download on" },
    { id: "appear",   icon: '<span class="set-icon-appear" style="font-size:20px">🎨</span>',  label: "Appearances",      sub: "Mode, theme, glass, wallpaper" },
    { id: "update",   icon: '<span class="set-icon-wa"></span>',  label: "Request an App Update",sub: "Message Akarsh on WhatsApp" },
    { id: "about",    icon: '<span class="set-icon-about"></span>', label: "About",            sub: "Version and developer" },
  ];

  function topbar(title, backLabel) {
    return '<header class="settings-top">' +
      '<button type="button" class="settings-back" data-back>' + esc(backLabel) + '</button>' +
      '<strong>' + esc(title) + '</strong>' +
      '<span style="width:64px"></span></header>';
  }

  function renderView() {
    const el = ensureScreen();
    if (view === "root") {
      el.innerHTML = topbar("Settings", "‹ Done") +
        '<div class="settings-content">' +
        ROWS.map(r =>
          '<button type="button" class="set-row" data-row="' + r.id + '">' +
          '<span class="set-icon">' + r.icon + '</span>' +
          '<span class="set-label">' + esc(r.label) + '<small>' + esc(r.sub) + '</small></span>' +
          '<span class="set-chevron">›</span></button>').join("") +
        '<p class="settings-note">Admin lives here now. More settings coming soon.</p>' +
        '</div>';
      el.querySelector("[data-back]").addEventListener("click", () => closeSettings());
      el.querySelectorAll("[data-row]").forEach(b => b.addEventListener("click", () => {
        const id = b.dataset.row;
        if (id === "admin") { window.location.href = "admin.html"; return; }
        if (id === "update") { window.open(WHATSAPP_URL, "_blank", "noopener"); return; }
        view = id;
        renderView();
      }));
      return;
    }

    if (view === "downloads") {
      const list = loadDownloads();
      el.innerHTML = topbar("Downloads", "‹ Settings") +
        '<div class="settings-content"><div class="set-card"><h3>Recent downloads</h3>' +
        (list.length ? list.map(d =>
          '<div class="dl-row"><span class="dl-icon">' + esc((d.name || "A").slice(0, 1).toUpperCase()) + '</span>' +
          '<span class="dl-name">' + esc(d.name) + '<small>' + esc(d.label || "Download") + ' · ' + esc(timeAgo(d.ts)) + '</small></span>' +
          '</div>').join("")
          : '<p class="settings-note" style="margin:6px 2px">No downloads yet. Apps you tap Download on will show up here.</p>') +
        '</div>' +
        (list.length ? '<button type="button" class="dl-clear" data-clear>Clear history</button>' : '') +
        '<p class="settings-note">This lists recent download taps on this device, not confirmed completed downloads.</p>' +
        '</div>';
      el.querySelector("[data-back]").addEventListener("click", () => { view = "root"; renderView(); });
      const clear = el.querySelector("[data-clear]");
      if (clear) clear.addEventListener("click", () => {
        try { localStorage.removeItem(LS_DOWNLOADS); } catch (_) {}
        renderView();
      });
      return;
    }

    if (view === "appear") {
      const modes = [["light", "Light"], ["dark", "Dark"], ["system", "System"]];
      const themes = [
        ["default", "Default", "Store look · from your photo"],
        ["cream", "Cream", "Soft raised look"],
        ["glass", "Glass", "Frosted look · last theme"],
      ];
      /* Preset wallpaper rows removed at his request - the section is
         just Add, plus "My wallpaper" once a photo is on the device. */
      const bgs = [];
      if (owned.wallpapers.includes("custom")) bgs.push(["custom", "My wallpaper"]);

      const themeRow = t => {
        const isOwned = owned.themes.includes(t[0]);
        const sel = prefs.theme === t[0];
        const isFailed = failed.has("theme:" + t[0]);
        return '<button type="button" class="set-choice' + (sel ? " selected" : "") + '" data-theme-choice="' + t[0] + '">' +
          (isOwned ? '<span class="dot"></span>'
            : '<span class="set-dl set-dl-icon' + (isFailed ? " retry" : "") + '" data-dl title="Download to this device">' +
              (isFailed ? "↻" : DL_ICON) + '</span>') +
          '<span class="set-label">' + esc(t[1]) + '<small>' + esc(t[2]) +
          (isOwned ? " · on device" : isFailed ? " · download failed - tap Retry" : " · download to this device") + '</small></span></button>';
      };
      const bgRow = b => {
        const isOwned = b[0] === "plain" || owned.wallpapers.includes(b[0]);
        const sel = prefs.background === b[0];
        const isFailed = failed.has("bg:" + b[0]);
        return '<button type="button" class="set-choice' + (sel ? " selected" : "") + '" data-bg-choice="' + b[0] + '">' +
          (isOwned ? '<span class="dot"></span>'
            : '<span class="set-dl set-dl-icon' + (isFailed ? " retry" : "") + '" data-dl title="Download to this device">' +
              (isFailed ? "↻" : DL_ICON) + '</span>') +
          '<span class="set-label">' + esc(b[1]) +
          (isOwned ? "" : isFailed ? '<small>download failed - tap Retry</small>' : '<small>download to this device</small>') + '</span></button>';
      };

      el.innerHTML = topbar("Appearances", "‹ Settings") +
        '<div class="settings-content">' +
        '<div class="set-card"><h3>Mode</h3><div class="set-seg" data-seg="mode">' +
        modes.map(m => '<button type="button" data-value="' + m[0] + '"' +
          (prefs.mode === m[0] ? ' class="selected"' : '') + '>' + m[1] + '</button>').join("") +
        '</div><p class="settings-note" style="margin:8px 2px 0">Mode applies to the Default theme. Cream always stays light cream.</p></div>' +
        '<div class="set-card"><h3>Theme</h3>' +
        themes.map(themeRow).join("") +
        '<p class="settings-note" style="margin:8px 2px 0">Themes download to this device and bring their own wallpaper - picking one replaces the current wallpaper.</p></div>' +
        '<div class="set-card"><h3>Liquid glass</h3>' +
        '<div class="set-toggle-row"><span class="set-label">Liquid glass<small>Clear glossy cards</small></span>' +
        '<button type="button" class="set-switch' + (prefs.glass ? " on" : "") + '" data-glass-toggle aria-label="Toggle liquid glass"></button></div></div>' +
        '<div class="set-card"><h3>Wallpaper</h3>' +
        bgs.map(bgRow).join("") +
        ((owned.wallpapers.includes("custom") && prefs.background === "custom") ?
          '<div class="set-bg-actions">' +
          '<button type="button" class="set-bg-action" data-bg-change>Change</button>' +
          '<button type="button" class="set-bg-action danger" data-bg-remove>Remove</button>' +
          '</div>' : '') +
        ((owned.wallpapers.includes("custom") && prefs.background === "custom") ? '' :
        '<button type="button" class="set-choice set-add" data-bg-add>' +
        '<span class="set-add-plus">' + (failed.has("bg:add") ? "!" : "+") + '</span>' +
        '<span class="set-label">Add<small>' +
        (failed.has("bg:add") ? "couldn't add that photo - tap to retry" : "your own photo from this device") +
        '</small></span></button>') +
        '<input type="file" accept="image/*" style="display:none" data-bg-file>' +
        '<p class="settings-note" style="margin:8px 2px 0">Your photo saves on this device, and picking a theme replaces it with the theme\'s own wallpaper.</p></div>' +
        '</div>';
      el.querySelector("[data-back]").addEventListener("click", () => { view = "root"; renderView(); });

      el.querySelectorAll('[data-seg="mode"] button').forEach(b => b.addEventListener("click", () => {
        prefs.mode = b.dataset.value; savePrefs(prefs); applyPrefs(); renderView();
      }));

      el.querySelectorAll("[data-theme-choice]").forEach(b => b.addEventListener("click", () => {
        const id = b.dataset.themeChoice;
        const key = "theme:" + id;
        /* Picking a theme removes the chosen wallpaper and applies the
           theme's own: Default and Cream are plain, Glass brings the
           bundled car photo. */
        const apply = () => {
          prefs.theme = id;
          prefs.background = id === "glass" ? "car" : "plain";
          savePrefs(prefs); applyPrefs(); renderView();
        };
        if (!owned.themes.includes(id)) {
          const pill = b.querySelector("[data-dl]");
          if (pill) pill.innerHTML = '<span class="set-spin" aria-label="Downloading"></span>';
          b.disabled = true;
          downloadItem("theme", id, ok => {
            if (ok) { failed.delete(key); apply(); }
            else { failed.add(key); renderView(); }
          });
          return;
        }
        apply();
      }));

      el.querySelectorAll("[data-bg-choice]").forEach(b => b.addEventListener("click", () => {
        const id = b.dataset.bgChoice;
        const key = "bg:" + id;
        const apply = () => {
          prefs.background = id;
          if (id !== "plain") prefs.theme = "default";
          savePrefs(prefs); applyPrefs(); renderView();
        };
        if (id !== "plain" && !owned.wallpapers.includes(id)) {
          const pill = b.querySelector("[data-dl]");
          if (pill) pill.innerHTML = '<span class="set-spin" aria-label="Downloading"></span>';
          b.disabled = true;
          downloadItem("bg", id, ok => {
            if (ok) { failed.delete(key); apply(); }
            else { failed.add(key); renderView(); }
          });
          return;
        }
        apply();
      }));

      const addBtn = el.querySelector("[data-bg-add]");
      const fileInput = el.querySelector("[data-bg-file]");
      if (addBtn && fileInput) {
        addBtn.addEventListener("click", () => fileInput.click());
        fileInput.addEventListener("change", () => {
          const f = fileInput.files && fileInput.files[0];
          if (!f) return;
          if (!f.type || f.type.indexOf("image/") !== 0) { failed.add("bg:add"); renderView(); return; }
          failed.delete("bg:add");
          addBtn.disabled = true;
          const plus = addBtn.querySelector(".set-add-plus"); if (plus) plus.textContent = "…";
          openStore().then(c => c.put(CUSTOM_BG_URL, new Response(f, { headers: { "Content-Type": f.type } })))
            .then(() => openStore()).then(c => c.match(CUSTOM_BG_URL)).then(stored => {
              if (!stored) throw new Error("stored copy failed to verify");
              if (!owned.wallpapers.includes("custom")) owned.wallpapers.push("custom");
              saveOwned(owned);
              prefs.background = "custom"; prefs.theme = "default";
              savePrefs(prefs); applyPrefs(); renderView();
            }).catch(() => { failed.add("bg:add"); renderView(); });
        });
      }

      const changeBtn = el.querySelector("[data-bg-change]");
      if (changeBtn && fileInput) changeBtn.addEventListener("click", () => fileInput.click());
      const removeBtn = el.querySelector("[data-bg-remove]");
      if (removeBtn) removeBtn.addEventListener("click", () => {
        removeBtn.disabled = true;
        openStore().then(c => c.delete(CUSTOM_BG_URL)).catch(() => {}).then(() => {
          const i = owned.wallpapers.indexOf("custom");
          if (i >= 0) owned.wallpapers.splice(i, 1);
          saveOwned(owned);
          if (prefs.background === "custom") prefs.background = "plain";
          savePrefs(prefs); applyPrefs(); renderView();
        });
      });

      const toggle = el.querySelector("[data-glass-toggle]");
      if (toggle) toggle.addEventListener("click", () => {
        prefs.glass = !prefs.glass; savePrefs(prefs); applyPrefs(); renderView();
      });
      return;
    }

    if (view === "about") {
      el.innerHTML = topbar("About", "‹ Settings") +
        '<div class="settings-content"><div class="set-card">' +
        '<div class="about-mark">A</div>' +
        '<p class="about-name">Akarsh ModStore</p>' +
        '<p class="about-tag">Mods ki dukaan, lelo apna samaan</p>' +
        '<div class="about-kv"><span>Developer</span><span>Akarsh Budakoti</span></div>' +
        '<div class="about-kv"><span>Version</span><span data-version>2.0.0</span></div>' +
        '<div class="about-kv"><span>Website</span><span><a href="https://akarshbudakoti-sir.github.io/Akarsh_Ki_Dukaan/" target="_blank" rel="noopener">akarshbudakoti-sir.github.io</a></span></div>' +
        '<div class="about-kv"><span>Credit</span><span>Akarsh Budakoti</span></div>' +
        '</div>' +
        '<p class="settings-note">Made with ❤ by Akarsh. Request updates any time from Settings.</p>' +
        '</div>';
      el.querySelector("[data-back]").addEventListener("click", () => { view = "root"; renderView(); });
      fetch("version.json").then(r => r.ok ? r.json() : null).then(j => {
        const v = j && (j.latestVersion || j.latest);
        const slot = screen && screen.querySelector("[data-version]");
        if (v && slot) slot.textContent = String(v);
      }).catch(() => {});
      return;
    }
  }

  /* ---------- gear button ---------- */
  function wireButton() {
    const btn = document.getElementById("settingsButton");
    if (btn) btn.addEventListener("click", openSettings);
  }
  /* Reopen Settings when arriving from a "‹ Settings" link (admin) or when
     the history entry belonged to an open Settings screen (Back from admin). */
  function openFromNav() {
    let want = false;
    try { if (location.hash === "#settings") want = true; } catch (_) {}
    try { if (history.state && history.state.k === "settings") want = true; } catch (_) {}
    if (!want) return;
    try { history.replaceState({ k: "home" }, "", location.pathname + location.search); } catch (_) {}
    openSettings();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { wireButton(); openFromNav(); });
  } else { wireButton(); openFromNav(); }
})();

