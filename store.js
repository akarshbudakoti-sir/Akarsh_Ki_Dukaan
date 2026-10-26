(() => {
  const cfg = window.AK_CONFIG || {}, status = document.getElementById("status");
  const grid = document.getElementById("apps"), search = document.getElementById("search");
  const cats = document.getElementById("categories"), defaults = ["Games","Music","Learning","Entertainment","Apps"];
  if (!window.supabase || !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) { status.textContent = "Setup needed: check config.js."; return; }
  const db = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  let rows = [], categoryNames = defaults.slice(), selectedCategory = "All Apps", categoriesExpanded = false;
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function render() {
    const q = search.value.trim().toLowerCase();
    let filtered = rows.filter(a => (selectedCategory==="All Apps" || selectedCategory==="Recently Added" || a.category===selectedCategory) && `${a.name} ${a.category} ${a.description||""}`.toLowerCase().includes(q));
    if (selectedCategory==="Recently Added") filtered=filtered.slice(0,12);
    document.getElementById("sectionTitle").textContent=selectedCategory;
    document.getElementById("count").textContent=`${filtered.length} apps`;
    grid.innerHTML=filtered.map(a=>`<article class="app-card"><div class="app-icon">${a.icon_url?`<img src="${esc(a.icon_url)}" alt="" onerror="this.style.display='none'">`:esc((a.name||"A").slice(0,2).toUpperCase())}</div><span class="tag">${esc(a.category||"Apps")}</span><h3>${esc(a.name)}</h3><p>${esc(a.description||"No description added yet.")}</p><div class="meta">${esc(a.version||"Unknown")} · ${esc(a.size||"Size unknown")}</div><a class="primary download" href="${esc(a.download_url)}" target="_blank" rel="noopener noreferrer">Download</a></article>`).join("")||"<p>No apps found in this section.</p>";
    const chipItems=[{name:"All Apps"},...categoryNames.map(name=>({name})),{name:"Recently Added"}];
    cats.classList.toggle("categories-expanded", categoriesExpanded);
    cats.innerHTML=chipItems.map(c=>`<button class="chip ${c.name===selectedCategory?"selected":""}" data-cat="${esc(c.name)}">${esc(c.name)}</button>`).join("")+
      `<button class="chip chip-more" data-more aria-expanded="${categoriesExpanded}">${categoriesExpanded?"Show less":"More"} <span aria-hidden="true">${categoriesExpanded?"⌃":"⌄"}</span></button>`;
    // On small screens, keep the first two visual rows visible and tuck the rest under More.
    const chips=[...cats.querySelectorAll("[data-cat]")];
    const more=cats.querySelector("[data-more]");
    chips.forEach(chip=>chip.classList.remove("chip-hidden"));
    if(!categoriesExpanded && chips.length){
      const tops=[...new Set(chips.map(chip=>chip.offsetTop))].sort((a,b)=>a-b);
      const secondRowTop=tops[Math.min(1,tops.length-1)];
      let hidden=0;
      chips.forEach(chip=>{
        if(chip.offsetTop>secondRowTop){chip.classList.add("chip-hidden");hidden++;}
      });
      more.innerHTML=`+${hidden} more <span aria-hidden="true">⌄</span>`;
      more.hidden=hidden===0;
    } else {
      more.hidden=true;
    }
  }
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