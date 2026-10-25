(() => {
 const cfg=window.AK_CONFIG||{}, status=document.getElementById("status"), grid=document.getElementById("apps"), search=document.getElementById("search"), cats=document.getElementById("categories");
 if(!window.supabase||!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY||cfg.SUPABASE_ANON_KEY.includes("PASTE_")){status.textContent="Setup needed: add your Supabase publishable key in config.js.";return;}
 const db=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY); let rows=[],cat="All";
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 function render(){
  const q=search.value.trim().toLowerCase(), filtered=rows.filter(a=>(cat==="All"||a.category===cat)&&`${a.name} ${a.category} ${a.description}`.toLowerCase().includes(q));
  document.getElementById("count").textContent=`${filtered.length} apps`;
  grid.innerHTML=filtered.map(a=>`<article class="app-card"><div class="app-icon">${a.icon_url?`<img src="${esc(a.icon_url)}" alt="" onerror="this.style.display='none'">`:`${esc(a.name.slice(0,2).toUpperCase())}`}</div><span class="tag">${esc(a.category)}</span><h3>${esc(a.name)}</h3><p>${esc(a.description||"No description added yet.")}</p><div class="meta">${esc(a.version||"Unknown")} · ${esc(a.size||"Size unknown")}</div><a class="primary download" href="${esc(a.download_url)}" target="_blank" rel="noopener noreferrer">Download</a></article>`).join("");
  cats.innerHTML=["All",...new Set(rows.map(a=>a.category).filter(Boolean))].map(c=>`<button class="chip ${c===cat?"selected":""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
 }
 cats.addEventListener("click",e=>{const b=e.target.closest("[data-cat]");if(b){cat=b.dataset.cat;render();}});
 search.addEventListener("input",render);
 async function load(){status.textContent="Loading apps…";const {data,error}=await db.from("apps").select("id,name,category,description,version,size,icon_url,download_url,created_at").order("created_at",{ascending:false});if(error){status.textContent="Could not load apps: "+error.message;return;}rows=data||[];status.textContent=rows.length?"Catalogue connected.":"Connected — no apps added yet.";render();}
 load();
})();