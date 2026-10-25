/* WD Books: non-destructive recovery for a stalled catalog bootstrap. */
(() => {
  "use strict";
  const grid = document.getElementById("manualGrid");
  const recovery = document.getElementById("homeLoadRecovery");
  const retry = document.getElementById("homeRetry");
  if (!grid || !recovery || !retry) return;
  let timer;
  const required = [
    ["data", () => !!window.WD_LIBRARY_DATA?.manuals?.length],
    ["catalog-core", () => !!window.WD_CATALOG_CORE],
    ["catalog-ui", () => !!window.WD_CATALOG_UI],
    ["mybooks", () => !!window.WD_MYBOOKS_SELECTORS],
    ["reader", () => !!window.WD_READER_COORDINATOR]
  ];
  let bootstrapError = "";
  window.addEventListener("error", event => {
    if (grid.getAttribute("aria-busy") !== "false") {
      bootstrapError = event.target instanceof HTMLScriptElement ? "script-load" : "runtime";
    }
  }, true);
  window.addEventListener("unhandledrejection", () => {
    if (grid.getAttribute("aria-busy") !== "false") bootstrapError = "async-runtime";
  });
  const diagnose = () => {
    const missing = required.filter(([, ready]) => !ready()).map(([name]) => name);
    return missing.length ? "MISSING: " + missing.join(", ") : bootstrapError || "BOOTSTRAP";
  };
  const detail = document.createElement("p");
  detail.id = "homeRecoveryDiagnostic";
  detail.setAttribute("role", "status");
  detail.style.fontSize = ".8rem";
  detail.style.overflowWrap = "anywhere";
  recovery.append(detail);
  const showRecovery = () => {
    if (grid.getAttribute("aria-busy") !== "false" && grid.querySelector(".wd-skeleton")) {
      detail.textContent = "รหัสตรวจสอบ: " + diagnose() + " · รุ่น " + (window.WD_BOOKS_VERSION || "unknown");
      recovery.hidden = false;
      recovery.removeAttribute("aria-hidden");
    }
  };
  const observe = new MutationObserver(() => {
    if (grid.getAttribute("aria-busy") === "false" || !grid.querySelector(".wd-skeleton")) {
      recovery.hidden = true;
      clearTimeout(timer);
      observe.disconnect();
    }
  });
  observe.observe(grid, {attributes:true,childList:true,subtree:true});
  timer = setTimeout(showRecovery, 6500);
  // iOS can suspend timers while an installed PWA is backgrounded.
  // Re-check on return without clearing saved reading preferences.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) showRecovery();
  });
  retry.addEventListener("click", () => {
    const url = new URL(window.location.href);
    url.searchParams.set("wd-retry", String(Date.now()));
    // Reload the document, not the user's local storage or saved library.
    window.location.replace(url.href);
  });
})();
