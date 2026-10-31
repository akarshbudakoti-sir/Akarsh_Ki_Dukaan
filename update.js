(()=>{
  // Mandatory APK update gate. Browser visitors are unaffected.
  const VERSION_FILE="version.json";
  const compare=(a,b)=>{
    const x=String(a||"0").replace(/^v/i,"").split(".").map(n=>parseInt(n,10)||0);
    const y=String(b||"0").replace(/^v/i,"").split(".").map(n=>parseInt(n,10)||0);
    for(let i=0;i<Math.max(x.length,y.length);i++){const p=x[i]||0,q=y[i]||0;if(p!==q)return p<q?-1:1;}
    return 0;
  };
  const getBridge=()=>window.WebToApk||window.webToApk||null;
  const readVersion=()=>{try{const api=getBridge();if(api&&typeof api.getAppVersion==="function")return String(api.getAppVersion());const info=api&&typeof api.getDeviceInfo==="function"?api.getDeviceInfo():null;return String(info&&info.app&&(info.app.versionName||info.app.version)||"");}catch(_){return "";}};
  function showGate(data,installed){
    const overlay=document.createElement("div");overlay.className="mandatory-update-overlay";overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");overlay.setAttribute("aria-labelledby","mandatoryUpdateTitle");
    const safeNotes=String(data.releaseNotes||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    const safeUrl=String(data.downloadUrl).replace(/&/g,"&amp;").replace(/"/g,"&quot;");
    overlay.innerHTML='<div class="mandatory-update-card"><div class="mandatory-update-mark">A</div><p class="mandatory-update-kicker">UPDATE REQUIRED</p><h2 id="mandatoryUpdateTitle">Update Akarsh ModStore</h2><p class="mandatory-update-copy">Your app version <strong>'+installed+'</strong> is outdated. Install version <strong>'+data.latestVersion+'</strong> to continue using the store.</p>'+(safeNotes?'<p class="mandatory-update-notes">'+safeNotes+'</p>':'')+'<a class="mandatory-update-button" href="'+safeUrl+'" target="_blank" rel="noopener">Update Now</a><p class="mandatory-update-foot">Install the downloaded APK, then reopen ModStore.</p></div>';
    document.body.appendChild(overlay);document.body.style.overflow="hidden";
    try{history.pushState({mandatoryUpdate:true},"",location.href);window.addEventListener("popstate",()=>{history.pushState({mandatoryUpdate:true},"",location.href);});}catch(_){}
  }
  async function check(){
    const installed=readVersion();
    if(!installed)return; // Not running inside the AppMint APK.
    try{
      const response=await fetch(VERSION_FILE+"?t="+Date.now(),{cache:"no-store"});
      if(!response.ok)return;
      const data=await response.json();
      if(!data.latestVersion||!data.minimumVersion||!data.downloadUrl)return;
      if(compare(installed,data.minimumVersion)<0)showGate(data,installed);
    }catch(error){console.warn("Could not check ModStore update:",error);}
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",check,{once:true});else check();
})();
