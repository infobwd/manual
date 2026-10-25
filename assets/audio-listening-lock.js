/* WD Books UX-P3A: TDRS-inspired IN-APP touch lock during listening.
   This cannot lock the operating system or guarantee background playback. */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const button = $("wdAudioLock");
  const dialog = $("wdListeningLock");
  const unlockButton = $("wdLockUnlock");
  if (!button || !dialog || !unlockButton) return;
  const HOLD_MS = 1800;
  let holdTimer = null;
  let wakeSentinel = null;
  let requestingWake = false;
  const media = () => window.WD_AUDIO_READER;
  const clearHold = () => {
    if (holdTimer !== null) {
      window.clearTimeout(holdTimer);
      holdTimer = null;
    }
    unlockButton.classList.remove("wd-lock-holding");
  };
  async function requestWakeLock() {
    // Keep an in-app listening screen lit like TDRS. Pressing the hardware
    // lock button is a different OS-level operation and not controlled here.
    if (!dialog.open || wakeSentinel || requestingWake || !navigator.wakeLock?.request) return;
    requestingWake = true;
    try {
      const sentinel = await navigator.wakeLock.request("screen");
      if (!dialog.open) { await sentinel.release?.(); return; }
      wakeSentinel = sentinel;
      sentinel.addEventListener?.("release", () => { if (wakeSentinel === sentinel) wakeSentinel = null; });
    } catch {
      // Denied/unsupported wake lock must never interrupt listening.
      $("wdLockHint").textContent =
        "เบราว์เซอร์ไม่สามารถคงหน้าจอเปิดได้ · นี่เป็นการล็อกการสัมผัส ไม่ใช่การล็อกหน้าจอจริง";
    } finally { requestingWake = false; }
  }
  function releaseWakeLock() {
    const sentinel = wakeSentinel;
    wakeSentinel = null;
    try { sentinel?.release?.()?.catch?.(() => {}); } catch {}
  }
  function unlock() {
    clearHold();
    releaseWakeLock();
    if (dialog.open) dialog.close();
    button.focus?.();
  }
  function sync(next) {
    if (!dialog.open) return;
    if (!next?.playing) { unlock(); return; }
    $("wdLockTitle").textContent = next.title || "กำลังฟังหนังสือ";
    $("wdLockChapter").textContent = next.chapter || "ตอนปัจจุบัน";
    $("wdLockStatus").textContent = next.paused ? "พักเสียงอยู่ · กดค้างเพื่อปลดล็อก"
      : (next.note || "กำลังฟัง · ล็อกการสัมผัสอยู่");
  }
  function lock() {
    const current = media()?.getState?.();
    if (!current?.playing || current.paused || dialog.open) return;
    try { dialog.showModal(); } catch { return; }
    sync({
      title:$("wdAudioBookTitle")?.textContent,
      chapter:$("wdAudioChapterTitle")?.textContent,
      playing:current.playing, paused:current.paused, note:"กำลังฟัง · ล็อกการสัมผัสอยู่"
    });
    unlockButton.focus?.();
    void requestWakeLock();
  }
  button.addEventListener("click", lock);
  unlockButton.addEventListener("pointerdown", event => {
    if (event.button !== undefined && event.button !== 0) return;
    clearHold();
    unlockButton.classList.add("wd-lock-holding");
    try { unlockButton.setPointerCapture?.(event.pointerId); } catch {}
    holdTimer = window.setTimeout(unlock, HOLD_MS);
  });
  for (const name of ["pointerup","pointercancel","pointerleave","lostpointercapture"]) {
    unlockButton.addEventListener(name, clearHold);
  }
  unlockButton.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      unlock(); // intentional keyboard activation; no inaccessible long hold
    }
  });
  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    unlock(); // Escape is always an accessible alternative
  });
  dialog.addEventListener("close", () => { clearHold(); releaseWakeLock(); });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && dialog.open) void requestWakeLock();
  });
  window.WD_LISTENING_LOCK = Object.freeze({ sync, unlock, getState:() => ({locked:dialog.open}) });
})();
