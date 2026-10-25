// App data lives here directly (not in a separate apps.json) so this page
// works when you just double-tap index.html and open it in a browser.
// Browsers block fetch() of local JSON files opened via file://, which would
// break the "all apps missing" case silently. Edit the array below to add
// or change apps.

const allAppsData = [
  {
    id: "sample-app-1",
    name: "Sample App",
    category: "Tools",
    icon: "🧰",
    shortDesc: "A placeholder app so you can see the layout.",
    fullDesc: "Replace this entry with your real app. Put the actual APK file somewhere reachable (see README.md for the tradeoffs), then paste that link into downloadUrl below.",
    version: "1.0",
    size: "5 MB",
    downloadUrl: "REPLACE_WITH_REAL_LINK"
  },
  {
    id: "sample-game-1",
    name: "Sample Game",
    category: "Games",
    icon: "🎮",
    shortDesc: "Another placeholder, different category.",
    fullDesc: "Same deal — swap this out for a real game entry.",
    version: "2.1",
    size: "40 MB",
    downloadUrl: "REPLACE_WITH_REAL_LINK"
  }
];

let allApps = allAppsData;
let activeCategory = "All";

function buildCategoryBar() {
  const bar = document.getElementById("categoryBar");
  const categories = ["All", ...new Set(allApps.map(app => app.category))];
  bar.innerHTML = "";

  categories.forEach(cat => {
    const chip = document.createElement("button");
    chip.className = "categoryChip" + (cat === activeCategory ? " active" : "");
    chip.textContent = cat;
    chip.addEventListener("click", () => {
      activeCategory = cat;
      document.querySelectorAll(".categoryChip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      renderApps();
    });
    bar.appendChild(chip);
  });
}

function renderApps() {
  const grid = document.getElementById("appGrid");
  const query = document.getElementById("searchInput").value.trim().toLowerCase();

  const filtered = allApps.filter(app => {
    const matchesCategory = activeCategory === "All" || app.category === activeCategory;
    const matchesSearch = app.name.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  grid.innerHTML = "";

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="noResults">No apps found.</p>';
    return;
  }

  filtered.forEach(app => {
    const card = document.createElement("div");
    card.className = "appCard";
    card.innerHTML = `
      <span class="appIcon">${app.icon}</span>
      <p class="appName">${app.name}</p>
      <p class="appCategory">${app.category}</p>
    `;
    card.addEventListener("click", () => openModal(app));
    grid.appendChild(card);
  });
}

function openModal(app) {
  document.getElementById("modalIcon").textContent = app.icon;
  document.getElementById("modalName").textContent = app.name;
  document.getElementById("modalCategory").textContent = app.category;
  document.getElementById("modalDesc").textContent = app.fullDesc;
  document.getElementById("modalVersion").textContent = app.version;
  document.getElementById("modalSize").textContent = app.size;
  document.getElementById("modalDownload").setAttribute("href", app.downloadUrl);
  document.getElementById("modalOverlay").classList.add("open");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
}

document.getElementById("closeModal").addEventListener("click", closeModal);

document.getElementById("modalOverlay").addEventListener("click", event => {
  if (event.target.id === "modalOverlay") {
    closeModal();
  }
});

document.getElementById("searchInput").addEventListener("input", renderApps);

buildCategoryBar();
renderApps();
