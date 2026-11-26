(() => {
  const cfg=window.AK_CONFIG||{}, status=document.getElementById("status");
  const grid=document.getElementById("apps"), search=document.getElementById("search"), cats=document.getElementById("categories");
  const legacyCategories=["Games","Music","Learning","Entertainment","Apps"];
  const notSpecified="Not Specified";
  if(!window.supabase||!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY){status.textContent="Setup needed: check config.js.";return;}
  const db=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
  document.documentElement.style.setProperty("--store-wallpaper-url","#000");
  let rows=[],categoryNames=[],selectedCategory="All Apps",categoriesExpanded=false,loadedLimit=20;
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function formatSize(value){const text=String(value??"").trim();const match=text.match(/^(\d+(?:\.\d+)?|\.\d+)\s*(?:MB)?$/i);return match?match[1]+" MB":text;}
  function formatVersion(value){const text=String(value??"").trim();if(!text||text.toLowerCase()==="unknown")return text||"Unknown";return "v"+text.replace(/^[vV]\s*/,"");}
const shownCategory=value=>!value?notSpecified:value;
  function render(){
    const q=search.value.trim().toLowerCase();
    let filtered=rows.filter(a=>(selectedCategory==="All Apps"||selectedCategory==="Recently Added"||shownCategory(a.category)===selectedCategory)&&`${a.name} ${shownCategory(a.category)} ${a.description||""}`.toLowerCase().includes(q));
    if(selectedCategory==="Recently Added")filtered=filtered.slice(0,12);
    if(document.body.classList.contains("search-mode")){const qi=document.getElementById("searchInfo");if(qi)qi.textContent=q?filtered.length+" result"+(filtered.length===1?"":"s"):"Type to search the store.";document.body.classList.toggle("has-query",!!q);}
    const total=filtered.length, shown=selectedCategory==="Recently Added"?filtered:filtered.slice(0,loadedLimit);
    document.getElementById("sectionTitle").textContent=selectedCategory;
    const catTotal=rows.filter(a=>selectedCategory==="All Apps"||selectedCategory==="Recently Added"||shownCategory(a.category)===selectedCategory).length;
    const catShown=selectedCategory==="Recently Added"?Math.min(12,catTotal):catTotal;
    document.getElementById("count").textContent=catShown+(catShown===1?" app":" apps");

    grid.innerHTML=shown.map(a=>`<article class="app-card" role="button" tabindex="0" data-app-id="${esc(a.id)}" aria-label="View details for ${esc(a.name)}"><div class="app-icon">${a.icon_url?`<img src="${esc(a.icon_url)}" alt="" onerror="this.style.display='none'">`:esc((a.name||"A").slice(0,2).toUpperCase())}</div><span class="tag">${esc(shownCategory(a.category))}</span><h3>${esc(a.name)}</h3><p>${esc(a.description||"Tap to view app details.")}</p><div class="meta">${esc(formatVersion(a.version))} · ${esc(formatSize(a.size)||"Size unknown")}</div></article>`).join("")||"<p>No apps found in this section.</p>";
    let pager=document.getElementById("loadMoreApps");
    if(!pager){pager=document.createElement("div");pager.id="loadMoreApps";pager.className="load-more-row";grid.insertAdjacentElement("afterend",pager);}
    pager.innerHTML=`<span class="load-count">${shown.length} of ${total} apps loaded</span>${selectedCategory!=="Recently Added"&&shown.length<total?'<button type="button" class="chip" id="loadMoreButton">Load more</button>':""}`;
    const loadBtn=document.getElementById("loadMoreButton");
    if(loadBtn)loadBtn.addEventListener("click",()=>{loadedLimit+=20;render();});
    grid.querySelectorAll("[data-app-id]").forEach(card=>{
      const open=()=>{const app=rows.find(a=>String(a.id)===card.dataset.appId);if(app)openAppDetails(app);};
      card.addEventListener("click",open);
      card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});
    });
    const chipItems=[{name:"All Apps"},...categoryNames.map(name=>({name})),{name:"Recently Added"}];
    cats.classList.toggle("categories-expanded",categoriesExpanded);
    cats.innerHTML=chipItems.map(c=>`<button class="chip ${c.name===selectedCategory?"selected":""}" data-cat="${esc(c.name)}">${esc(c.name)}</button>`).join("")+
      `<button class="chip chip-more" data-more aria-expanded="${categoriesExpanded}">${categoriesExpanded?"Show less":"More"} <span aria-hidden="true">${categoriesExpanded?"⌃":"⌄"}</span></button>`;
    const more=cats.querySelector("[data-more]");
    const arrangeCategories=()=>{
      const chips=[...cats.querySelectorAll("[data-cat]")];
      chips.forEach(chip=>{chip.hidden=false;});
      more.hidden=false;
      more.textContent="More ⌄";
      if(categoriesExpanded){more.textContent="Show less ⌃";return;}
      const rowTops=()=>[...new Set(chips.filter(chip=>!chip.hidden).map(chip=>chip.offsetTop))].sort((a,b)=>a-b);
      let tops=rowTops();
      if(tops.length<=2){more.hidden=true;return;}
      const secondRowTop=tops[1];
      chips.forEach(chip=>{if(chip.offsetTop>secondRowTop)chip.hidden=true;});
      let visible=chips.filter(chip=>!chip.hidden);
      while(more.offsetTop>secondRowTop && visible.length){
        const last=visible.pop();
        last.hidden=true;
        tops=rowTops();
      }
      const hiddenCount=chips.filter(chip=>chip.hidden).length;
      more.hidden=hiddenCount===0;
      more.textContent=`+${hiddenCount} more ⌄`;
    };
    requestAnimationFrame(arrangeCategories);
  }
  function removeDetails(){const screen=document.getElementById("appDetailsScreen");if(screen)screen.remove();document.body.style.overflow="";}
  const hasDetailsState=()=>!!(history.state&&history.state.k==="details");
  function closeDetails(){if(hasDetailsState())history.back();else removeDetails();}
  window.addEventListener("popstate",e=>{if(document.getElementById("appDetailsScreen")&&!(e.state&&e.state.k==="details"))removeDetails();});
  try{history.replaceState({k:"home"},"",window.location.href);}catch(_){}
  function openAppDetails(app){
    if(document.getElementById("appDetailsScreen"))removeDetails();
    if(!hasDetailsState())history.pushState({k:"details"},"",window.location.href);
    const screen=document.createElement("section");screen.id="appDetailsScreen";screen.className="app-details-screen";
    const icon=app.icon_url?`<img src="${esc(app.icon_url)}" alt="${esc(app.name)}">`:esc((app.name||"A").slice(0,2).toUpperCase());
    const url=String(app.download_url||"").trim();const customName1=String(app.download_name||"").trim();const customName2=String(app.download_name2||"").trim();
    const download=/^https?:\/\//i.test(url)?`<a class="app-details-download" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${customName1?esc(customName1):`Download${app.version?` · ${esc(formatVersion(app.version))}`:""}`}</a>`:"<p class=\"app-details-sub\">Download link not available yet.</p>";
    const url2=String(app.download_url2||"").trim();
    const download2=/^https?:\/\//i.test(url2)?`<a class="app-details-download" href="${esc(url2)}" target="_blank" rel="noopener noreferrer">${customName2?esc(customName2):"Download 2 (mirror)"}</a>`:"";
    screen.innerHTML=`<header class="app-details-top"><button type="button" class="app-details-back" data-close>‹ Back to Home</button><strong>App Details</strong></header><div class="app-details-content"><div class="app-details-hero"><div class="app-details-icon">${icon}</div><div><h1>${esc(app.name)}</h1><div class="app-details-sub">${esc(shownCategory(app.category))}</div><div class="app-details-stats"><span class="app-details-stat">Version ${esc(formatVersion(app.version))}</span><span class="app-details-stat">Size ${esc(formatSize(app.size)||"Unknown")}</span></div></div></div><section class="app-details-section"><h2>About</h2><p>${esc(app.description||"No description provided yet.")}</p></section><section class="app-details-section"><h2>App information</h2><p>Category: ${esc(shownCategory(app.category))}\nVersion: ${esc(app.version||"Unknown")}\nSize: ${esc(formatSize(app.size)||"Unknown")}</p></section>${download}${download2}</div>`;
    document.body.appendChild(screen);document.body.style.overflow="hidden";
    screen.querySelector("[data-close]").addEventListener("click",closeDetails);
  }
  cats.addEventListener("click",e=>{
    const more=e.target.closest("[data-more]");
    if(more){categoriesExpanded=!categoriesExpanded;render();return;}
    const b=e.target.closest("[data-cat]");
    if(b){selectedCategory=b.dataset.cat;loadedLimit=20;render();}
  });
  search.addEventListener("input",()=>{loadedLimit=20;render();});
  search.setAttribute("type","search");search.setAttribute("enterkeyhint","search");search.setAttribute("autocomplete","off");
  document.querySelector("label.search").insertAdjacentHTML("afterend",'<p id="searchInfo" class="search-info"></p>');
  let prevCategory="All Apps",searchHistoryOpen=false;
  const restoreBrowsing=()=>{document.body.classList.remove("search-mode","has-query");selectedCategory=prevCategory;loadedLimit=20;render();};
  const enterSearch=()=>{if(document.body.classList.contains("search-mode"))return;prevCategory=selectedCategory;selectedCategory="All Apps";loadedLimit=20;document.body.classList.add("search-mode");window.scrollTo(0,0);render();};
  const exitSearch=()=>{if(search.value.trim()||!document.body.classList.contains("search-mode"))return;restoreBrowsing();};
  search.addEventListener("focus",enterSearch);
  search.addEventListener("blur",exitSearch);
  search.addEventListener("input",()=>{if(!search.value.trim()&&document.activeElement!==search)exitSearch();});
  search.addEventListener("keydown",e=>{if(e.key==="Enter"||e.keyCode===13){e.preventDefault();search.blur();}});
  search.addEventListener("search",()=>{if(document.activeElement===search&&search.value.trim())search.blur();});
  window.addEventListener("resize",()=>{if(!categoriesExpanded)requestAnimationFrame(()=>{const more=cats.querySelector("[data-more]");if(more)more.click();if(more)more.click();});});
  async function load(){
    status.textContent="Loading apps…";
    const [{data:apps,error:appsError},{data:catData,error:catError}]=await Promise.all([
      db.from("apps").select("id,name,category,description,version,size,icon_url,download_url,download_url2,download_name,download_name2,created_at").order("created_at",{ascending:false}),
      db.from("store_categories").select("name").order("name")
    ]);
    if(appsError){status.textContent="Could not load apps: "+appsError.message;return;}
    rows=apps||[];
    const storedNames=!catError&&catData?catData.map(c=>c.name):[];
    categoryNames=[...new Set(storedNames.filter(name=>name&&name.toLowerCase()!==notSpecified.toLowerCase()))].sort((a,b)=>a.localeCompare(b));
    if(!["All Apps","Recently Added",...categoryNames].includes(selectedCategory))selectedCategory="All Apps";
    if(rows.length){status.innerHTML='<span class="status-icon" aria-hidden="true">\u2713</span><span class="status-text"><strong>Catalogue Connected</strong><small>Synced \u2022 '+rows.length+' app'+(rows.length===1?'':'s')+' available</small></span>';status.classList.add("status-ok");}else{status.textContent="Connected — no apps added yet.";}render();
  }
  load().catch(error=>{status.textContent="Catalogue error: "+(error?.message||"Could not connect.");console.error(error);});
})();
