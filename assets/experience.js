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
  const defaultPrefs = () => ({ theme: "light", font: 100, recent: null, progress: {} });
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "{}");
      if (!saved || typeof saved !== "object" || Array.isArray(saved)) return defaultPrefs();
      return {
        theme: themes.includes(saved.theme) ? saved.theme : "light",
        font: Number.isFinite(saved.font) ? Math.max(90, Math.min(160, Math.round(saved.font / 10) * 10)) : 100,
        recent: typeof saved.recent === "string" && hasBook(saved.recent) ? saved.recent : null,
        progress: saved.progress && typeof saved.progress === "object" && !Array.isArray(saved.progress) ? saved.progress : {}
      };
    } catch { return defaultPrefs(); }
  }
  let prefs = load();
  let onReaderScale = null;
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
  function setTheme(theme) {
    if (!themes.includes(theme)) return;
    prefs.theme = theme;
    save();
    syncTheme();
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
    save();
    updateContinue();
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
    for (const [id, active] of [["navHome", section === "home"], ["navBooks", section === "books"], ["navSettings", section === "settings"], ["navContinue", section === "continue"]]) {
      const b = $(id); if (!b) continue;
      b.classList.toggle("active", active);
      if (active) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    }
  }
  function initUI() {
    syncTheme();
    syncFont();
    updateContinue();
    for (const id of ["quickEyeMode", "readerEyeMode"]) {
      $(id)?.addEventListener("click", () => setTheme(prefs.theme === "sepia" ? "light" : "sepia"));
    }
    for (const id of ["headerSettings", "navSettings"]) {
      $(id)?.addEventListener("click", () => { openSettings(); updateBottom("settings"); });
    }
    $("closeSettings")?.addEventListener("click", () => $("settingsDialog")?.close());
    $("settingsDialog")?.addEventListener("close", () => updateBottom(location.hash === "#library" ? "books" : "home"));
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
    window.addEventListener("hashchange", () => updateBottom(location.hash === "#library" ? "books" : "home"));
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
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {
      // App remains usable online when offline setup is unavailable.
    });
  }
  window.WD_EXPERIENCE = {
    getScale: () => prefs.font / 100,
    setScale: (scale) => setFont(Math.round(Number(scale) * 100)),
    bindReader: (onScale, onOpen) => { onReaderScale = onScale; continueReader = onOpen; syncFont(); updateContinue(); },
    getProgress,
    recordProgress,
    getTheme: () => prefs.theme,
    setTheme,
    openSettings
  };
  initUI();
})();
