// Akarsh Ki Dukaan — client-side catalogue.
// Replace placeholder URLs only with real, authorized download sources.
// This static website does not provide private storage or secure admin uploads.

const allAppsData = [
  {
    id: "sample-spotify",
    name: "Spotify",
    category: "Music",
    icon: "S",
    iconUrl: "",
    iconBg: "linear-gradient(145deg,#1ed760,#087f3d)",
    shortDesc: "Music for every mood.",
    fullDesc: "Example catalogue listing. Add a verified official download link before publishing. This listing does not provide a Spotify APK.",
    version: "—",
    size: "—",
    downloadUrl: "",
    type: "Official source",
    featured: true
  },
  {
    id: "sample-tool",
    name: "Useful Tools",
    category: "Tools",
    icon: "✳",
    iconUrl: "",
    iconBg: "linear-gradient(145deg,#a78bfa,#6d28d9)",
    shortDesc: "Small tools for everyday tasks.",
    fullDesc: "Demo listing. Replace this example with an app and a download link you are authorized to share.",
    version: "1.0",
    size: "—",
    downloadUrl: "",
    type: "APK",
    featured: false
  },
  {
    id: "sample-game",
    name: "Game Collection",
    category: "Games",
    icon: "G",
    iconUrl: "",
    iconBg: "linear-gradient(145deg,#fb923c,#c2410c)",
    shortDesc: "A place for your favourite games.",
    fullDesc: "Demo listing. Replace this example with a real listing and an authorized download source.",
    version: "—",
    size: "—",
    downloadUrl: "",
    type: "APK",
    featured: false
  },
  {
    id: "sample-media",
    name: "Media Player",
    category: "Entertainment",
    icon: "▶",
    iconUrl: "",
    iconBg: "linear-gradient(145deg,#38bdf8,#1d4ed8)",
    shortDesc: "Your videos, in one place.",
    fullDesc: "Demo listing. Add an official source or an APK you have permission to redistribute.",
    version: "—",
    size: "—",
    downloadUrl: "",
    type: "APK",
    featured: false
  },
  {
    id: "sample-personal",
    name: "Personalisation",
    category: "Tools",
    icon: "✦",
    iconUrl: "",
    iconBg: "linear-gradient(145deg,#f472b6,#9d174d)",
    shortDesc: "Make your phone feel like yours.",
    fullDesc: "Demo listing. Replace with a real app listing before publishing.",
    version: "—",
    size: "—",
    downloadUrl: "",
    type: "APK",
    featured: false
  },
  {
    id: "sample-open",
    name: "Open Source Picks",
    category: "Utilities",
    icon: "⌘",
    iconUrl: "",
    iconBg: "linear-gradient(145deg,#94a3b8,#334155)",
    shortDesc: "Useful open-source projects.",
    fullDesc: "Demo listing. Prefer official release pages for open-source apps and respect each project's licence.",
    version: "—",
    size: "—",
    downloadUrl: "",
    type: "Official source",
    featured: false
  }
];

let activeCategory = "All";
let activeView = "discover";
let toastTimer;

const $ = id => document.getElementById(id);

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function iconMarkup(app, extraClass = "") {
  const style = app.iconBg ? ` style="background:${escapeHtml(app.iconBg)}"` : "";
  if (app.iconUrl) {
    return `<span class="app-icon ${extraClass}"${style}><img src="${escapeHtml(app.iconUrl)}" alt="" loading="lazy" onerror="this.parentElement.textContent='${escapeHtml(app.icon || "A")}'"></span>`;
  }
  return `<span class="app-icon ${extraClass}"${style}>${escapeHtml(app.icon || app.name.slice(0, 1))}</span>`;
}

function getFilteredApps() {
  const query = $("searchInput").value.trim().toLowerCase();
  return allAppsData.filter(app => {
    const categoryMatch = activeCategory === "All" || app.category === activeCategory;
    const searchText = `${app.name} ${app.category} ${app.shortDesc}`.toLowerCase();
    const queryMatch = searchText.includes(query);
    if (activeView === "updates") return categoryMatch && queryMatch && app.hasUpdate === true;
    if (activeView === "library") return categoryMatch && queryMatch && app.installed === true;
    return categoryMatch && queryMatch;
  });
}

function buildCategoryBar() {
  const bar = $("categoryBar");
  const categories = ["All", ...new Set(allAppsData.map(app => app.category))];
  bar.replaceChildren();
  categories.forEach(category => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-chip" + (category === activeCategory ? " active" : "");
    button.textContent = category;
    button.setAttribute("aria-pressed", String(category === activeCategory));
    button.addEventListener("click", () => {
      activeCategory = category;
      activeView = "discover";
      updateNavigation();
      buildCategoryBar();
      renderApps();
    });
    bar.appendChild(button);
  });
}

function appCardMarkup(app) {
  return `
    <article class="app-card" tabindex="0" role="button" aria-label="View ${escapeHtml(app.name)} details" data-app-id="${escapeHtml(app.id)}">
      <div class="app-card-top">
        ${iconMarkup(app)}
        <span class="app-tag">${escapeHtml(app.category)}</span>
      </div>
      <h3 class="app-name">${escapeHtml(app.name)}</h3>
      <p class="app-desc">${escapeHtml(app.shortDesc)}</p>
      <div class="app-card-bottom">
        <span class="app-meta">${escapeHtml(app.size || "APK")}</span>
        <button type="button" class="get-button" data-get-id="${escapeHtml(app.id)}">${app.downloadUrl ? "GET" : "DETAILS"}</button>
      </div>
    </article>`;
}

function renderFeatured() {
  const featured = allAppsData.find(app => app.featured) || allAppsData[0];
  if (!featured) {
    $("featuredSection").classList.add("hidden");
    return;
  }
  $("featuredSection").classList.remove("hidden");
  $("featuredCard").innerHTML = `
    <article class="featured-card" tabindex="0" role="button" aria-label="View ${escapeHtml(featured.name)} details" data-app-id="${escapeHtml(featured.id)}">
      <div class="featured-copy">
        <span class="featured-label">✦ EDITOR'S PICK</span>
        <h3>${escapeHtml(featured.name)}<br>for your everyday.</h3>
        <p>${escapeHtml(featured.shortDesc)}</p>
        <span class="featured-link">View app <span aria-hidden="true">↗</span></span>
      </div>
      <div class="featured-art" aria-hidden="true">${escapeHtml(featured.icon || "A")}</div>
    </article>`;
}

function renderApps() {
  const apps = getFilteredApps();
  const grid = $("appGrid");
  const isSpecialView = activeView === "updates" || activeView === "library";
  $("catalogTitle").textContent = activeView === "updates" ? "Updates" :
    activeView === "library" ? "Your library" :
    activeCategory === "All" ? "Recently added" : activeCategory;
  $("resultCount").textContent = `${apps.length} ${apps.length === 1 ? "app" : "apps"}`;
  grid.innerHTML = apps.map(appCardMarkup).join("");
  $("emptyState").classList.toggle("hidden", apps.length > 0);
  grid.classList.toggle("hidden", apps.length === 0);
  if (isSpecialView && apps.length === 0) {
    $("emptyState").querySelector("h3").textContent = activeView === "updates" ? "You're all caught up" : "Your library is empty";
    $("emptyState").querySelector("p").textContent = activeView === "updates" ? "Updates will appear here when configured." : "Apps you save can appear here in a future version.";
  } else {
    $("emptyState").querySelector("h3").textContent = "No apps found";
    $("emptyState").querySelector("p").textContent = "Try another search or category.";
  }
}

function openModal(app) {
  if (!app) return;
  $("modalIcon").innerHTML = iconMarkup(app, "detail-icon");
  $("modalCategory").textContent = app.category;
  $("modalName").textContent = app.name;
  $("modalShortDesc").textContent = app.shortDesc || "";
  $("modalDesc").textContent = app.fullDesc || app.shortDesc || "No description provided.";
  $("modalVersion").textContent = app.version || "—";
  $("modalSize").textContent = app.size || "—";
  $("modalType").textContent = app.type || "APK";
  const download = $("modalDownload");
  const note = $("downloadNote");
  if (app.downloadUrl && /^https?:\/\//i.test(app.downloadUrl)) {
    download.href = app.downloadUrl;
    download.target = "_blank";
    download.rel = "noopener noreferrer";
    download.textContent = app.type === "Official source" ? "Open download source" : "Download";
    download.classList.remove("disabled");
    download.setAttribute("aria-disabled", "false");
    note.textContent = "Only install files from sources you trust. Android may ask you to allow installs from your browser.";
  } else {
    download.href = "#";
    download.textContent = "Not available yet";
    download.classList.add("disabled");
    download.setAttribute("aria-disabled", "true");
    note.textContent = "This is a demo listing. A real, verified download URL has not been added.";
  }
  $("modalOverlay").classList.add("open");
  $("modalOverlay").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  $("closeModal").focus();
}

function closeModal() {
  $("modalOverlay").classList.remove("open");
  $("modalOverlay").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function updateNavigation() {
  document.querySelectorAll(".nav-item").forEach(button => {
    const active = button.dataset.view === activeView;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  $("featuredSection").classList.toggle("hidden", activeView !== "discover" || $("searchInput").value.trim() !== "" || activeCategory !== "All");
}

function activateView(view) {
  activeView = view;
  if (view === "categories") {
    activeCategory = activeCategory === "All" ? (allAppsData[0]?.category || "All") : activeCategory;
    buildCategoryBar();
    showToast("Choose a category above to filter apps.");
    activeView = "discover";
  } else if (view === "updates") {
    activeCategory = "All";
  } else if (view === "library") {
    activeCategory = "All";
    showToast("Your library feature is a placeholder in this version.");
  }
  updateNavigation();
  buildCategoryBar();
  renderApps();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$("searchInput").addEventListener("input", () => {
  updateNavigation();
  renderApps();
});
$("closeModal").addEventListener("click", closeModal);
$("modalOverlay").addEventListener("click", event => {
  if (event.target === $("modalOverlay")) closeModal();
});
$("modalDownload").addEventListener("click", event => {
  if ($("modalDownload").getAttribute("aria-disabled") === "true") {
    event.preventDefault();
    showToast("This listing has no verified download link yet.");
  }
});
$("clearFilters").addEventListener("click", () => {
  $("searchInput").value = "";
  activeCategory = "All";
  activeView = "discover";
  buildCategoryBar();
  updateNavigation();
  renderApps();
});
$("libraryShortcut").addEventListener("click", () => activateView("library"));
document.querySelectorAll(".nav-item").forEach(button => button.addEventListener("click", () => activateView(button.dataset.view)));
document.addEventListener("click", event => {
  const card = event.target.closest("[data-app-id]");
  const getButton = event.target.closest("[data-get-id]");
  if (getButton) {
    event.stopPropagation();
    openModal(allAppsData.find(app => app.id === getButton.dataset.getId));
  } else if (card) {
    openModal(allAppsData.find(app => app.id === card.dataset.appId));
  }
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
  if (event.key === "/" && document.activeElement !== $("searchInput") && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    $("searchInput").focus();
  }
});

buildCategoryBar();
renderFeatured();
renderApps();
updateNavigation();
