/* Local-first reading preferences and install affordances.
   No analytics or personal data transmitted. */
(() => {
  "use strict";
  const KEY = "wd-manual.prefs.v1";
  const PROGRESS_KEY = "wd-manual.progress.v1";
  const safeRead = key => {
    try { const value = JSON.parse(localStorage.getItem(key) || "{}"); return value && typeof value === "object" ? value : {}; }
    catch { return {}; }
  };
  const safeWrite = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  };
  const isTheme = v => ["light", "sepia", "dark"].includes(v);
  const clampScale = value => Math.max(.9, Math.min(1.4, Math.round(Number(value || 1)*10)/10));
  const saved = safeRead(KEY);
  const prefs = {
    theme: isTheme(saved.theme) ? saved.theme : "light",
    scale: clampScale(saved.scale)
  };
  const progress = safeRead(PROGRESS_KEY);
  const $ = id => document.getElementById(id);
  const apply = () => {
    document.documentElement.dataset.theme = prefs.theme;
    document.documentElement.style.setProperty("--app-font-scale", String(prefs.scale));
    $("bookSpread")?.style.setProperty("--readerScale", String(prefs.scale));
    document.querySelectorAll("[data-reader-theme]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.readerTheme === prefs.theme));
    });
    const indicator = $("fontSizeLabel");
    if (indicator) indicator.textContent = Math.round(prefs.scale * 100) + "%";
    const decrease = $("settingsFontDecrease"), increase = $("settingsFontIncrease");
    if (decrease) decrease.disabled = prefs.scale <= .9;
    if (increase) increase.disabled = prefs.scale >= 1.4;
    safeWrite(KEY,prefs);
  };
  const api = window.WDReaderPrefs = {
    scale: () => prefs.scale,
    setScale(value) {
      prefs.scale = clampScale(value);
      apply();
      window.dispatchEvent(new CustomEvent("wd:fontchange",{detail:{scale:prefs.scale}}));
    },
    setTheme(value) {
      if (!isTheme(value)) return;
      prefs.theme = value;
      apply();
    },
    lastPage(id) {
      const value=Number(progress[id]);
      return Number.isSafeInteger(value)&&value>=0 ? value : 0;
    },
    saveProgress(id, page) {
      if (!id || !Number.isInteger(page) || page < 0) return;
      progress[id]=page;
      safeWrite(PROGRESS_KEY,progress);
    },
    progressLabel(id) {
      const page=Number(progress[id]);
      return Number.isSafeInteger(page)&&page>0 ? " · อ่านถึงหน้า "+(page+1) : "";
    },
    resetProgress() {
      Object.keys(progress).forEach(key=>delete progress[key]);
      safeWrite(PROGRESS_KEY,progress);
    }
  };
  // Apply preferences before user starts reading. Mark mode controls as pressed.
  apply();
  document.querySelectorAll("[data-reader-theme]").forEach(button => {
    button.addEventListener("click", () => api.setTheme(button.dataset.readerTheme));
  });
  $("settingsFontDecrease")?.addEventListener("click", () => api.setScale(prefs.scale-.1));
  $("settingsFontIncrease")?.addEventListener("click", () => api.setScale(prefs.scale+.1));
  $("resetReading")?.addEventListener("click", () => {
    api.resetProgress();
    $("resetReading").textContent="ล้างประวัติหน้าอ่านแล้ว";
    window.WDManualApp?.refreshCatalog?.();
  });
  const settings = $("settingsDialog");
  const openSettings=() => {
    if (!settings || settings.open) return;
    settings.showModal();
    $("settingsClose")?.focus();
  };
  const closeSettings=()=>settings?.open && settings.close();
  $("settingsClose")?.addEventListener("click",closeSettings);
  document.querySelectorAll("[data-open-settings]").forEach(el=>el.addEventListener("click",openSettings));
  const navButtons=[...document.querySelectorAll("[data-tab-target]")];
  const chooseTab=(selected)=>{
    navButtons.forEach(button=>button.setAttribute("aria-current",button.dataset.tabTarget===selected?"page":"false"));
  };
  navButtons.forEach(button=>button.addEventListener("click",()=>{
    const target=button.dataset.tabTarget;
    if(target==="settings"){openSettings();return;}
    if(target==="home"){chooseTab("home");window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});return;}
    if(target==="library"){
      chooseTab("library");$("library")?.scrollIntoView({behavior:"smooth",block:"start"});return;
    }
    if(target==="search"){
      chooseTab("search");$("library")?.scrollIntoView({behavior:"smooth",block:"start"});
      $("searchInput")?.focus({preventScroll:true});return;
    }
  }));
  $("searchInput")?.addEventListener("focus",()=>chooseTab("search"));
  // Update connection hint; app shell caches offline via service worker.
  const networkIndicator=$("networkIndicator");
  const networkUpdate=()=>{
    const offline=typeof navigator!=="undefined" && !navigator.onLine;
    document.body.classList.toggle("is-offline",offline);
    if(networkIndicator)networkIndicator.textContent=offline?"ออฟไลน์ · เปิดเล่มที่เคยดาวน์โหลดได้":"อ่านได้บนมือถือ";
  };
  window.addEventListener("offline",networkUpdate);
  window.addEventListener("online",networkUpdate);
  networkUpdate();

  let installEvent=null;
  const install=$("installApp");
  const installHint=$("installHint");
  window.addEventListener("beforeinstallprompt",event=>{
    event.preventDefault();
    installEvent=event;
    if(install) install.textContent="ติดตั้งแอปบนอุปกรณ์นี้";
    if(installHint) installHint.textContent="ติดตั้งแล้วเปิดจากหน้าจอหลักได้";
  });
  const isStandalone=()=>window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true;
  if(isStandalone()){
    if(install){install.textContent="ติดตั้งแอปแล้ว";install.disabled=true;}
    if(installHint)installHint.textContent="กำลังใช้งานในโหมดแอป";
  }
  install?.addEventListener("click",async()=>{
    if(installEvent){
      const event=installEvent;installEvent=null;
      try{await event.prompt();await event.userChoice;}catch{}
      if(installHint)installHint.textContent="หากยังไม่ติดตั้ง สามารถใช้เมนูของเบราว์เซอร์เพื่อเพิ่มไปหน้าจอหลัก";
      return;
    }
    if(installHint){
      const isIos=/iPad|iPhone|iPod/i.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
      installHint.textContent=isIos
        ?"บน iPhone/iPad: เปิดเว็บไซต์ด้วย Safari → แตะ Share (แชร์) → เพิ่มไปยังหน้าจอโฮม"
        :"ใน Chrome/Edge: เปิดเมนู ⋮ หรือ ⋯ → ติดตั้งแอป / Add to Home Screen (หากรองรับ)";
    }
  });
})();
