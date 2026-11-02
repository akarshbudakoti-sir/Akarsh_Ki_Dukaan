(()=>{
  // Optional/mandatory APK update gate. Browser visitors are unaffected.
  const VERSION_FILE="version.json";

  function compareVersions(a,b){
    const left=String(a||"0").trim().replace(/^v/i,"").split(".").map(n=>parseInt(n,10)||0);
    const right=String(b||"0").trim().replace(/^v/i,"").split(".").map(n=>parseInt(n,10)||0);
    for(let i=0;i<Math.max(left.length,right.length);i++){
      const x=left[i]||0, y=right[i]||0;
      if(x!==y) return x<y?-1:1;
    }
    return 0;
  }

  function appVersion(){
    try{
      const api=window.WebToApk||window.webToApk;
      if(api&&typeof api.getAppVersion==="function") return String(api.getAppVersion());
      const info=api&&typeof api.getDeviceInfo==="function"?api.getDeviceInfo():null;
      return String(info&&info.app&&(info.app.versionName||info.app.version)||"");
    }catch(_){return "";}
  }

  const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,c=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));

  function showUpdate(data,installed,isMandatory){
    const overlay=document.createElement("div");
    overlay.className="mandatory-update-overlay";
    overlay.setAttribute("role","dialog");
    overlay.setAttribute("aria-modal","true");
    overlay.setAttribute("aria-labelledby","mandatoryUpdateTitle");

    const safeUrl=String(data.downloadUrl).replace(/&/g,"&amp;").replace(/"/g,"&quot;");
    overlay.innerHTML=
      '<div class="mandatory-update-card">'+
        '<div class="mandatory-update-mark">A</div>'+
        '<p class="mandatory-update-kicker">'+(isMandatory?"UPDATE REQUIRED":"UPDATE AVAILABLE")+'</p>'+
        '<h2 id="mandatoryUpdateTitle">Update Akarsh ModStore</h2>'+
        '<p class="mandatory-update-copy">Your app version <strong>'+escapeHtml(installed)+'</strong> is outdated. Version <strong>'+escapeHtml(data.latestVersion)+'</strong> is available.</p>'+
        (data.releaseNotes?'<p class="mandatory-update-notes">'+escapeHtml(data.releaseNotes)+'</p>':"")+
        '<a class="mandatory-update-button" href="'+safeUrl+'" target="_blank" rel="noopener">Update Now</a>'+
        (isMandatory
          ?'<p class="mandatory-update-foot">This update is required. Install the downloaded APK, then reopen ModStore.</p>'
          :'<button type="button" class="mandatory-update-later">Later</button><p class="mandatory-update-foot">You can keep using this version. This reminder will appear again next time you open ModStore.</p>')+
      '</div>';

    document.body.appendChild(overlay);
    document.body.style.overflow="hidden";

    if(!isMandatory){
      // Later dismisses only this opening. No timer or stored dismissal:
      // the optional reminder appears again on every fresh app launch.
      overlay.querySelector(".mandatory-update-later").addEventListener("click",()=>{
        overlay.remove();
        document.body.style.overflow="";
      });
      return;
    }

    // Mandatory updates cannot be dismissed with the Back button.
    try{
      history.pushState({mandatoryUpdate:true},"",location.href);
      window.addEventListener("popstate",()=>{
        if(document.body.contains(overlay)) history.pushState({mandatoryUpdate:true},"",location.href);
      });
    }catch(_){}
  }

  async function checkForUpdate(){
    const installed=appVersion();
    if(!installed) return; // Normal browser visitors are not blocked.

    try{
      const response=await fetch(VERSION_FILE+"?t="+Date.now(),{cache:"no-store"});
      if(!response.ok) return;
      const data=await response.json();
      if(!data.latestVersion||!data.minimumVersion||!data.downloadUrl) return;

      if(compareVersions(installed,data.latestVersion)>=0) return;

      const isMandatory=compareVersions(installed,data.minimumVersion)<0;
      showUpdate(data,installed,isMandatory);
    }catch(error){
      console.warn("Could not check ModStore update:",error);
    }
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",checkForUpdate,{once:true});
  }else{
    checkForUpdate();
  }
})();
