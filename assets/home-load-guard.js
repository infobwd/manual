/* WD Books: non-destructive recovery for a stalled catalog bootstrap. */
(() => {
  "use strict";
  const grid = document.getElementById("manualGrid");
  const recovery = document.getElementById("homeLoadRecovery");
  const retry = document.getElementById("homeRetry");
  if (!grid || !recovery || !retry) return;
  let timer;
  const observe = new MutationObserver(() => {
    if (grid.getAttribute("aria-busy") === "false" || !grid.querySelector(".wd-skeleton")) {
      recovery.hidden = true;
      clearTimeout(timer);
      observe.disconnect();
    }
  });
  observe.observe(grid, {attributes:true,childList:true,subtree:true});
  timer = setTimeout(() => {
    if (grid.getAttribute("aria-busy") === "true" && grid.querySelector(".wd-skeleton")) recovery.hidden = false;
  }, 6500);
  retry.addEventListener("click", () => {
    const url = new URL(window.location.href);
    url.searchParams.set("wd-retry", String(Date.now()));
    // Reload the document, not the user's local storage or saved library.
    window.location.replace(url.href);
  });
})();
