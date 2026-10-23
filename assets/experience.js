/* WD School Manual Library — local-only reading preferences + install experience.
   Does not collect analytics, upload history, or reveal private content. */
(() => {
  "use strict";
  const key = "wd-manual-reader-v2";
  const themes = ["light", "sepia", "night"];
  const $ = (id) => document.getElementById(id);
  const hasBook = (id) => window.WD_LIBRARY_DATA?.manuals?.some(
    (book) => book.id === id && book.status === "published" && book.pages?.length
  );
  const validBookIds = (items) => [...new Set(
    (Array.isArray(items) ? items : []).filter((id) => typeof id === "string" && hasBook(id))
  )].slice(0,30);
  const defaultPrefs = () => ({ theme: "light", font: 100, recent: null, progress: {}, favorites: [], history: [], bookmarks: {}, readingMode: "paged", typography: { family: "system", line: "normal", margin: "normal" } });
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "{}");
      if (!saved || typeof saved !== "object" || Array.isArray(saved)) return defaultPrefs();
      return {
        theme: themes.includes(saved.theme) ? saved.theme : "light",
        font: Number.isFinite(saved.font) ? Math.max(90, Math.min(160, Math.round(saved.font / 10) * 10)) : 100,
        recent: typeof saved.recent === "string" && hasBook(saved.recent) ? saved.recent : null,
        progress: saved.progress && typeof saved.progress === "object" && !Array.isArray(saved.progress) ? saved.progress : {},
        favorites: validBookIds(saved.favorites),
        history: validBookIds([saved.recent, ...(Array.isArray(saved.history) ? saved.history : [])]),
        bookmarks: Object.fromEntries(Object.entries(saved.bookmarks && typeof saved.bookmarks === "object" && !Array.isArray(saved.bookmarks) ? saved.bookmarks : {}).filter(([id]) => hasBook(id)).map(([id, indices]) => {
          const book = window.WD_LIBRARY_DATA.manuals.find(b => b.id === id);
          return [id, [...new Set((Array.isArray(indices) ? indices : []).filter(n => Number.isInteger(n) && n >= 0 && n < book.pages.length))].slice(0,40)];
        })),
        readingMode: saved.readingMode === "continuous" ? "continuous" : "paged",
        typography: {
          family: ["system","serif","sans"].includes(saved.typography?.family) ? saved.typography.family : "system",
          line: ["normal","relaxed","wide"].includes(saved.typography?.line) ? saved.typography.line : "normal",
          margin: ["normal","compact","wide"].includes(saved.typography?.margin) ? saved.typography.margin : "normal"
        }
      };
    } catch { return defaultPrefs(); }
  }
  let prefs = load();
  let onReaderScale = null;
  let onBooksChanged = null;
  let deferredInstall = null;
  function save() {
    try { localStorage.setItem(key, JSON.stringify(prefs)); } catch { /* storage may be blocked; current session still works */ }
  }
  function announce(message) {
    const node = $("pwaStatus");
    if (!node) return;
    node.textContent = message;
    node.hidden = false;
    window.clearTimeout?.(announce.timer);
    announce.timer = window.setTimeout(() => { node.hidden = true; }, 4500);
  }
  function syncTheme() {
    document.body.dataset.theme = prefs.theme;
    document.documentElement.style.colorScheme = prefs.theme === "night" ? "dark" : "light";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = prefs.theme === "night" ? "#14221c" : prefs.theme === "sepia" ? "#eee5d4" : "#174f47";
    document.querySelectorAll('input[name="readerTheme"]').forEach((radio) => {
      radio.checked = radio.value === prefs.theme;
    });
    for (const id of ["quickEyeMode", "readerEyeMode"]) {
      const b = $(id); if (!b) continue;
      b.setAttribute("aria-pressed", String(prefs.theme === "sepia"));
      b.title = prefs.theme === "sepia" ? "ปิดโหมดถนอมสายตา" : "เปิดโหมดถนอมสายตา";
    }
  }
  // Cover shortcuts share the same saved reading preference.
  function syncCoverThemes() {
    document.querySelectorAll(".cover-eye-mode").forEach(button => {
      button.setAttribute("aria-pressed", String(prefs.theme === "sepia"));
    });
  }
  function setTheme(theme) {
    if (!themes.includes(theme)) return;
    prefs.theme = theme;
    save();
    syncTheme();
    syncCoverThemes();
  }
  function syncFont() {
    const input = $("globalFontSize"), label = $("globalFontLabel");
    if (input) input.value = String(prefs.font);
    if (label) label.textContent = prefs.font + "%";
    const spread = $("bookSpread");
    if (spread) spread.style.setProperty("--readerScale", String(prefs.font / 100));
    if (onReaderScale) onReaderScale(prefs.font / 100);
  }
  function setFont(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return;
    prefs.font = Math.max(90, Math.min(160, Math.round(n / 10) * 10));
    save();
    syncFont();
  }
  function syncTypography() {
    const spread = $("bookSpread");
    if (spread) {
      spread.dataset.fontFamily = prefs.typography.family;
      spread.dataset.lineSpacing = prefs.typography.line;
      spread.dataset.pageMargin = prefs.typography.margin;
    }
    for (const [id, value] of [["readerFontFamily", prefs.typography.family], ["readerLineSpacing", prefs.typography.line], ["readerPageMargin", prefs.typography.margin]]) {
      const input = $(id);
      if (input) input.value = value;
    }
  }
  function setTypography(field, value) {
    const allowed = { family:["system","serif","sans"], line:["normal","relaxed","wide"], margin:["normal","compact","wide"] };
    if (!allowed[field]?.includes(value)) return;
    prefs.typography[field] = value;
    save();
    syncTypography();
  }
  function getProgress(bookId) {
    if (!hasBook(bookId)) return 0;
    const book = window.WD_LIBRARY_DATA.manuals.find((b) => b.id === bookId);
    const n = Number(prefs.progress[bookId]);
    return Number.isInteger(n) ? Math.max(0, Math.min(book.pages.length - 1, n)) : 0;
  }
  function recordProgress(bookId, pageIndex) {
    if (!hasBook(bookId)) return;
    const book = window.WD_LIBRARY_DATA.manuals.find((b) => b.id === bookId);
    const index = Number(pageIndex);
    prefs.progress[bookId] = Number.isInteger(index) ? Math.max(0, Math.min(book.pages.length - 1, index)) : 0;
    prefs.recent = bookId;
    prefs.history = validBookIds([bookId, ...prefs.history]).slice(0,20);
    save();
    updateContinue();
    onBooksChanged?.();
  }
  function getBookmarks(bookId) {
    if (!hasBook(bookId)) return [];
    return [...(prefs.bookmarks[bookId] || [])].sort((a,b) => a-b);
  }
  function isBookmarked(bookId, index) { return getBookmarks(bookId).includes(index); }
  function toggleBookmark(bookId, index) {
    if (!hasBook(bookId)) return false;
    const book = window.WD_LIBRARY_DATA.manuals.find(b => b.id === bookId);
    if (!Number.isInteger(index) || index < 0 || index >= book.pages.length) return false;
    const saved = getBookmarks(bookId);
    prefs.bookmarks[bookId] = saved.includes(index) ? saved.filter(n => n !== index) : [...saved,index].sort((a,b)=>a-b).slice(0,40);
    save();
    return prefs.bookmarks[bookId].includes(index);
  }
  function isFavorite(bookId) { return prefs.favorites.includes(bookId); }
  function getFavorites() { return [...prefs.favorites]; }
  function getHistory() { return [...prefs.history]; }
  function toggleFavorite(bookId) {
    if (!hasBook(bookId)) return false;
    prefs.favorites = isFavorite(bookId)
      ? prefs.favorites.filter(id => id !== bookId)
      : validBookIds([...prefs.favorites, bookId]);
    save();
    onBooksChanged?.();
    return isFavorite(bookId);
  }
  let continueReader = null;
  function updateContinue() {
    const btn = $("navContinue");
    if (btn) {
      btn.disabled = !hasBook(prefs.recent);
      btn.title = btn.disabled ? "ยังไม่มีเล่มที่อ่านค้างไว้" : "อ่านเล่มล่าสุดต่อ";
    }
  }
  function openSettings() {
    const dlg = $("settingsDialog");
    if (dlg && !dlg.open) dlg.showModal();
  }
  function updateBottom(section) {
    for (const [id, active] of [["navHome", section === "home"], ["navBooks", section === "books"], ["navMyBooks", section === "mybooks"], ["navSettings", section === "settings"], ["navContinue", section === "continue"]]) {
      const b = $(id); if (!b) continue;
      b.classList.toggle("active", active);
      if (active) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    }
  }
  function sectionFromHash() {
    return location.hash === "#myBooks" ? "mybooks" : location.hash === "#library" ? "books" : "home";
  }
  function initSplash() {
    const splash = $("appSplash");
    const version = String(window.WD_BOOKS_VERSION || "1.2.0");
    const versionLabel = $("splashVersion");
    if (versionLabel) versionLabel.textContent = "เวอร์ชัน " + version;
    if (!splash) return;
    let shown = false;
    try { shown = sessionStorage.getItem("wd-manual-splash-shown") === version; sessionStorage.setItem("wd-manual-splash-shown", version); } catch {}
    const hide = () => {
      splash.classList.add("splash-done");
      splash.setAttribute("aria-hidden", "true");
      window.setTimeout(() => { splash.hidden = true; }, 400);
    };
    if (shown || window.matchMedia("(prefers-reduced-motion: reduce)").matches) hide();
    else window.setTimeout(hide, 630);
  }
  function initPullRefresh() {
    const indicator = $("pullRefresh"), caption = $("pullRefreshText");
    if (!indicator || !caption) return;
    let startY = null, startX = 0, distance = 0, refreshing = false;
    const canStart = (target) => window.matchMedia("(max-width: 1000px)").matches &&
      !refreshing && window.scrollY <= 1 &&
      !$("readerDialog")?.open && !$("settingsDialog")?.open &&
      !target?.closest?.("input,textarea,select,[contenteditable],.reader-dialog,.settings-dialog");
    const reset = () => {
      startY = null;
      distance = 0;
      indicator.classList.remove("is-pulling", "is-ready");
      indicator.setAttribute("aria-hidden", "true");
    };
    document.addEventListener("touchstart", (event) => {
      if (event.touches.length !== 1 || !canStart(event.target)) { reset(); return; }
      startY = event.touches[0].clientY;
      startX = event.touches[0].clientX;
      distance = 0;
    }, { passive: true });
    document.addEventListener("touchmove", (event) => {
      if (startY === null || event.touches.length !== 1 || !canStart(event.target)) { reset(); return; }
      const dy = event.touches[0].clientY - startY;
      const dx = Math.abs(event.touches[0].clientX - startX);
      if (dy < 12 || dy <= dx * 1.2) return;
      // Prevent the browser's native pull refresh only after identifying this gesture.
      if (event.cancelable) event.preventDefault();
      distance = Math.min(150, dy);
      indicator.classList.add("is-pulling");
      indicator.classList.toggle("is-ready", distance >= 95);
      indicator.setAttribute("aria-hidden", "false");
      caption.textContent = distance >= 95 ? "ปล่อยเพื่อรีเฟรช" : "ดึงลงเพื่อรีเฟรช";
    }, { passive: false });
    document.addEventListener("touchend", () => {
      if (startY === null) return;
      const reload = distance >= 95;
      reset();
      if (reload) {
        refreshing = true;
        indicator.classList.add("is-pulling", "is-refreshing");
        indicator.setAttribute("aria-hidden", "false");
        caption.textContent = "กำลังอัปเดตชั้นหนังสือ…";
        window.location.reload();
      }
    }, { passive: true });
    document.addEventListener("touchcancel", reset, { passive: true });
  }
  function initUI() {
    initSplash();
    initPullRefresh();
    syncTheme();
    syncFont();
    updateContinue();
    for (const id of ["readerEyeMode"]) {
      $(id)?.addEventListener("click", () => setTheme(prefs.theme === "sepia" ? "light" : "sepia"));
    }
    for (const id of ["headerSettings", "navSettings"]) {
      $(id)?.addEventListener("click", () => { openSettings(); updateBottom("settings"); });
    }
    $("closeSettings")?.addEventListener("click", () => $("settingsDialog")?.close());
    $("settingsDialog")?.addEventListener("close", () => updateBottom(sectionFromHash()));
    document.querySelectorAll('input[name="readerTheme"]').forEach((radio) => {
      radio.addEventListener("change", () => { if (radio.checked) setTheme(radio.value); });
    });
    $("globalFontSize")?.addEventListener("input", (event) => setFont(event.target.value));
    $("resetReading")?.addEventListener("click", () => { setTheme("light"); setFont(100); announce("คืนค่าหน้าจอและตัวอักษรแล้ว"); });
    $("navContinue")?.addEventListener("click", () => {
      const book = window.WD_LIBRARY_DATA?.manuals?.find((b) => b.id === prefs.recent);
      if (book && continueReader) { continueReader(book, $("navContinue")); updateBottom("continue"); }
    });
    $("navHome")?.addEventListener("click", () => updateBottom("home"));
    $("navBooks")?.addEventListener("click", () => updateBottom("books"));
    $("navMyBooks")?.addEventListener("click", () => updateBottom("mybooks"));
    window.addEventListener("hashchange", () => updateBottom(sectionFromHash()));
    updateBottom(sectionFromHash());
    installUI();
    registerWorker();
  }
  function installUI() {
    const button = $("installApp");
    if (!button) return;
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstall = event;
      button.hidden = false;
      $("installHelp").textContent = "อุปกรณ์นี้รองรับการติดตั้งแอปจากเบราว์เซอร์";
    });
    button.addEventListener("click", async () => {
      if (!deferredInstall) return;
      const prompt = deferredInstall;
      deferredInstall = null;
      button.hidden = true;
      try { await prompt.prompt(); await prompt.userChoice; } catch { announce("ติดตั้งไม่สำเร็จ สามารถลองจากเมนูเบราว์เซอร์"); }
    });
    window.addEventListener("appinstalled", () => {
      button.hidden = true;
      announce("ติดตั้ง WD Books แล้ว");
    });
    const standalone = window.matchMedia?.("(display-mode: standalone)")?.matches ||
      window.navigator?.standalone === true;
    if (standalone) $("installHelp").textContent = "กำลังใช้งานในโหมดแอปจากหน้าจอโฮม";
  }
  function registerWorker() {
    if (!("serviceWorker" in navigator)) return;
    const isSecure = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
    if (!isSecure) return;
    const notice = $("appUpdateNotice"), apply = $("applyAppUpdate"), later = $("laterAppUpdate");
    let waiting = null, refreshing = false, dismissed = null;
    const show = worker => {
      if (!worker || !navigator.serviceWorker.controller) return;
      waiting = worker;
      if (dismissed === worker) return;
      if (notice) notice.hidden = false;
    };
    apply?.addEventListener("click", () => {
      if (!waiting) return;
      apply.disabled = true;
      apply.textContent = "กำลังอัปเดต…";
      // Existing localStorage preferences, bookshelf and progress are untouched.
      waiting.postMessage({ type: "SKIP_WAITING" });
    });
    later?.addEventListener("click", () => {
      dismissed = waiting;
      if (notice) notice.hidden = true;
    });
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).then(registration => {
      if (registration.waiting) show(registration.waiting);
      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed") show(registration.waiting || installing);
        });
      });
      // Check when users return to the app; no aggressive background polling.
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) registration.update().catch(() => {});
      });
    }).catch(() => {
      // Online reading remains available if the worker cannot be registered.
    });
  }
  window.WD_EXPERIENCE = {
    getScale: () => prefs.font / 100,
    setScale: (scale) => setFont(Math.round(Number(scale) * 100)),
    bindReader: (onScale, onOpen) => { onReaderScale = onScale; continueReader = onOpen; syncFont(); updateContinue(); },
    getProgress,
    recordProgress,
    getFavorites,
    getBookmarks,
    isBookmarked,
    toggleBookmark,
    getHistory,
    isFavorite,
    toggleFavorite,
    subscribeBooks: (callback) => { onBooksChanged = callback; },
    getReadingMode: () => prefs.readingMode,
    setReadingMode: (mode) => { if (!["paged","continuous"].includes(mode)) return; prefs.readingMode = mode; save(); },
    getTypography: () => ({...prefs.typography}),
    setTypography,
    getTheme: () => prefs.theme,
    setTheme,
    openSettings
  };
  initUI();
  syncTypography();
})();
