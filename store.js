(() => {
  const cfg = window.AK_CONFIG || {}, status = document.getElementById("status");
  const grid = document.getElementById("apps"), search = document.getElementById("search");
  const cats = document.getElementById("categories"), defaults = ["Games","Music","Learning","Entertainment","Apps"];
  if (!window.supabase || !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) { status.textContent = "Setup needed: check config.js."; return; }
  const db = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  // Pure black is the immediate fallback on every refresh.
  document.documentElement.style.setProperty("--store-wallpaper-url", "#000");
  async function applySavedWallpaper(){
    try {
      const {data,error}=await db.from("store_settings").select("value").eq("key","wallpaper_url").maybeSingle();
      if(error||!data?.value)return;
      const url=String(data.value).trim();
      if(!/^https?:\\/\\//i.test(url))return;
      document.documentElement.style.setProperty("--store-wallpaper-url", `url("${url.replace(/["\\\\]/g,"\\\\$&")}")`);
      document.body.classList.add("has-custom-wallpaper");
    } catch (_) {
      // Keep the black fallback if Supabase is unavailable.
    }
  }
  applySavedWallpaper();
  let rows = [], categoryNames = defaults.slice(), selectedCategory = "All Apps", categoriesExpanded = false;
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function render() {
    const q = search.value.trim().toLowerCase();
    let filtered = rows.filter(a => (selectedCategory==="All Apps" || selectedCategory==="Recently Added" || a.category===selectedCategory) && `${a.name} ${a.category} ${a.description||""}`.toLowerCase().includes(q));
    if (selectedCategory==="Recently Added") filtered=filtered.slice(0,12);
    document.getElementById("sectionTitle").textContent=selectedCategory;
    document.getElementById("count").textContent=`${filtered.length} apps`;
    grid.innerHTML=filtered.map(a=>`<article class="app-card" role="button" tabindex="0" data-app-id="${esc(a.id)}" aria-label="View details for ${esc(a.name)}"><div class="app-icon">${a.icon_url?`<img src="${esc(a.icon_url)}" alt="" onerror="this.style.display='none'">`:esc((a.name||"A").slice(0,2).toUpperCase())}</div><span class="tag">${esc(a.category||"Apps")}</span><h3>${esc(a.name)}</h3><p>${esc(a.description||"Tap to view app details.")}</p><div class="meta">${esc(a.version||"Unknown")} · ${esc(a.size||"Size unknown")}</div></article>`).join("")||"<p>No apps found in this section.</p>";
    const chipItems=[{name:"All Apps"},...categoryNames.map(name=>({name})),{name:"Recently Added"}];
    cats.classList.toggle("categories-expanded", categoriesExpanded);
    cats.innerHTML=chipItems.map(c=>`<button class="chip ${c.name===selectedCategory?"selected":""}" data-cat="${esc(c.name)}">${esc(c.name)}</button>`).join("")+
      `<button class="chip chip-more" data-more aria-expanded="${categoriesExpanded}">${categoriesExpanded?"Show less":"More"} <span aria-hidden="true">${categoriesExpanded?"⌃":"⌄"}</span></button>`;
    const chips=[...cats.querySelectorAll("[data-cat]")];
    const more=cats.querySelector("[data-more]");
    chips.forEach(chip=>chip.classList.remove("chip-hidden"));
    more.hidden=false;
    if (!categoriesExpanded && chips.length) {
      // Measure the rendered category chips first, then hide everything below row two.
      // Run after layout so mobile browsers have assigned correct offsetTop values.
      requestAnimationFrame(() => {
        if (categoriesExpanded) return;
        const currentChips=[...cats.querySelectorAll("[data-cat]")];
        const currentMore=cats.querySelector("[data-more]");
        if (!currentMore || !currentChips.length) return;
        currentChips.forEach(chip=>chip.classList.remove("chip-hidden"));
        const rowTops=[...new Set(currentChips.map(chip=>chip.offsetTop))].sort((a,b)=>a-b);
        const secondRowTop=rowTops[Math.min(1,rowTops.length-1)];
        let hidden=0;
        currentChips.forEach(chip=>{
          if(chip.offsetTop>secondRowTop){chip.classList.add("chip-hidden");hidden++;}
        });
        currentMore.textContent=`${hidden ? `+${hidden} more` : "More"} `;
        currentMore.insertAdjacentHTML("beforeend", '<span aria-hidden="true">⌄</span>');
        currentMore.hidden=hidden===0;
      });
    } else if (categoriesExpanded) {
      more.textContent="Show less ";
      more.insertAdjacentHTML("beforeend", '<span aria-hidden="true">⌃</span>');
      more.hidden=false;
    } else {
      more.hidden=true;
    }
  }

  function closeAppDetails(){
    const screen=document.getElementById("appDetailsScreen");
    if(screen) screen.remove();
    document.body.style.overflow="";
  }
  function openAppDetails(app){
    closeAppDetails();
    const screen=document.createElement("section");
    screen.id="appDetailsScreen";
    screen.className="app-details-screen";
    const icon=app.icon_url?`<img src="${esc(app.icon_url)}" alt="${esc(app.name)}">`:esc((app.name||"A").slice(0,2).toUpperCase());
    const safeUrl=String(app.download_url||"").trim();
    const downloadLink=/^https?:\/\//i.test(safeUrl)?`<a class="app-details-download" href="${esc(safeUrl)}" target="_blank" rel="noopener noreferrer">Download${app.version?` · v${esc(app.version)}`:""}</a>`:`<p style="color:#aaa;margin-top:16px">Download link not available yet.</p>`;
    screen.innerHTML=`<header class="app-details-top"><button type="button" class="app-details-back" data-close-details>‹ Back to Home</button><strong>App Details</strong></header><div class="app-details-content"><div class="app-details-hero"><div class="app-details-icon">${icon}</div><div><h1>${esc(app.name)}</h1><div class="app-details-sub">${esc(app.category||"Apps")}</div><div class="app-details-stats"><span class="app-details-stat">Version ${esc(app.version||"Unknown")}</span><span class="app-details-stat">Size ${esc(app.size||"Unknown")}</span></div></div></div><section class="app-details-section"><h2>About</h2><p>${esc(app.description||"No description provided yet.")}</p></section><section class="app-details-section"><h2>App information</h2><p>Category: ${esc(app.category||"Apps")}\nVersion: ${esc(app.version||"Unknown")}\nSize: ${esc(app.size||"Unknown")}</p></section>${downloadLink}</div>`;
    document.body.appendChild(screen);
    document.body.style.overflow="hidden";
    screen.querySelector("[data-close-details]").addEventListener("click",closeAppDetails);
    screen.addEventListener("keydown",e=>{if(e.key==="Escape")closeAppDetails();});
  }
  grid.addEventListener("click",e=>{
    if(e.target.closest("a")) return;
    const card=e.target.closest("[data-app-id]");
    if(card){const app=rows.find(a=>String(a.id)===card.dataset.appId);if(app)openAppDetails(app);}
  });
  grid.addEventListener("keydown",e=>{
    if(e.key!=="Enter"&&e.key!==" ")return;
    const card=e.target.closest("[data-app-id]");
    if(card){e.preventDefault();const app=rows.find(a=>String(a.id)===card.dataset.appId);if(app)openAppDetails(app);}
  });
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeAppDetails();});
  cats.addEventListener("click",e=>{
    const more=e.target.closest("[data-more]");
    if(more){categoriesExpanded=!categoriesExpanded;render();return;}
    const b=e.target.closest("[data-cat]");
    if(b){selectedCategory=b.dataset.cat;render();}
  });
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