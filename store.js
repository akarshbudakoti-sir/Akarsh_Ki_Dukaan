(() => {
  const cfg = window.AK_CONFIG || {}, status = document.getElementById("status");
  const grid = document.getElementById("apps"), search = document.getElementById("search");
  const cats = document.getElementById("categories"), defaults = ["Games","Music","Learning","Entertainment","Apps"];
  if (!window.supabase || !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) { status.textContent = "Setup needed: check config.js."; return; }
  const db = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  let rows = [], categoryNames = defaults.slice(), selectedCategory = "All Apps";
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function render() {
    const q = search.value.trim().toLowerCase();
    let filtered = rows.filter(a => (selectedCategory==="All Apps" || selectedCategory==="Recently Added" || a.category===selectedCategory) && `${a.name} ${a.category} ${a.description||""}`.toLowerCase().includes(q));
    if (selectedCategory==="Recently Added") filtered=filtered.slice(0,12);
    document.getElementById("sectionTitle").textContent=selectedCategory;
    document.getElementById("count").textContent=`${filtered.length} apps`;
    grid.innerHTML=filtered.map(a=>`<article class="app-card"><div class="app-icon">${a.icon_url?`<img src="${esc(a.icon_url)}" alt="" onerror="this.style.display='none'">`:esc((a.name||"A").slice(0,2).toUpperCase())}</div><span class="tag">${esc(a.category||"Apps")}</span><h3>${esc(a.name)}</h3><p>${esc(a.description||"No description added yet.")}</p><div class="meta">${esc(a.version||"Unknown")} · ${esc(a.size||"Size unknown")}</div><a class="primary download" href="${esc(a.download_url)}" target="_blank" rel="noopener noreferrer">Download</a></article>`).join("")||"<p>No apps found in this section.</p>";
    cats.innerHTML=[{name:"All Apps"},...categoryNames.map(name=>({name})),{name:"Recently Added"}].map(c=>`<button class="chip ${c.name===selectedCategory?"selected":""}" data-cat="${esc(c.name)}">${esc(c.name)}</button>`).join("");
  }
  cats.addEventListener("click",e=>{const b=e.target.closest("[data-cat]");if(b){selectedCategory=b.dataset.cat;render();}});
  search.addEventListener("input",render);
  async function load(){
    status.textContent="Loading apps…";
    const [{data:apps,error:appsError},{data:catsData,error:catsError}]=await Promise.all([
      db.from("apps").select("id,name,category,description,version,size,icon_url,download_url,created_at").order("created_at",{ascending:false}),
      db.from("store_categories").select("name").order("name")
    ]);
    if(appsError){status.textContent="Could not load apps: "+appsError.message;return;}
    rows=apps||[];
    categoryNames=!catsError&&catsData?.length?catsData.map(c=>c.name):[...new Set([...defaults,...rows.map(a=>a.category).filter(Boolean)])];
    if(!["All Apps","Recently Added",...categoryNames].includes(selectedCategory)) selectedCategory="All Apps";
    status.textContent=rows.length?"Catalogue connected.":"Connected — no apps added yet."; render();
  }
  load();
})();