/* WD Books: non-destructive recovery for a stalled catalog bootstrap. */
(() => {
  "use strict";
  const grid = document.getElementById("manualGrid");
  const recovery = document.getElementById("homeLoadRecovery");
  const retry = document.getElementById("homeRetry");
  if (!grid || !recovery || !retry) return;
  let timer;
  const showRecovery = () => {
    if (grid.getAttribute("aria-busy") !== "false" && grid.querySelector(".wd-skeleton")) {
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
