/* WD Books UX-P3A-R4 — in-app Now Playing touch lock.
   OS Power-button lock screens are controlled by the device, not this UI. */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const button = $("wdAudioLock"), dialog = $("wdListeningLock");
  const unlockButton = $("wdLockUnlock"), playButton = $("wdLockPlay");
  if (!button || !dialog || !unlockButton || !playButton) return;
  const HOLD_MS = 1800, RATES = [0.75, 1, 1.25, 1.5];
  const COLORS = new Set(["forest","blue","sage","clay","dark"]);
  const media = () => window.WD_AUDIO_READER;
  const clamp = (value,min,max) => Math.max(min,Math.min(max,Number.isFinite(Number(value)) ? Number(value) : min));
  let holdTimer = null, wakeSentinel = null, requestingWake = false, latest = null;
  function clearHold() {
    if (holdTimer !== null) { window.clearTimeout(holdTimer); holdTimer = null; }
    unlockButton.classList.remove("wd-lock-holding");
  }
  function releaseWakeLock() {
    const sentinel = wakeSentinel;
    wakeSentinel = null;
    try { sentinel?.release?.()?.catch?.(() => {}); } catch {}
  }
  async function requestWakeLock() {
    // Keeps the IN-APP screen visible; does not provide OS background audio.
    if (!dialog.open || document.hidden || wakeSentinel || requestingWake
      || !latest?.playing || latest.paused || !navigator.wakeLock?.request) return;
    requestingWake = true;
    try {
      const sentinel = await navigator.wakeLock.request("screen");
      if (!dialog.open || document.hidden || !latest?.playing || latest.paused) {
        await sentinel.release?.(); return;
      }
      wakeSentinel = sentinel;
      sentinel.addEventListener?.("release", () => { if (wakeSentinel === sentinel) wakeSentinel = null; });
    } catch {
      $("wdLockHint").textContent = "เบราว์เซอร์ไม่สามารถคงหน้าจอเปิดได้ · ยังควบคุมเสียงได้ในแอป แต่ไม่ใช่การล็อกจอของระบบ";
    } finally { requestingWake = false; }
  }
  function unlock() {
    clearHold(); releaseWakeLock();
    if (dialog.open) dialog.close();
    button.focus?.();
  }
  function sync(next) {
    latest = next || media()?.getState?.() || latest;
    if (!dialog.open || !latest) return;
    const state = latest;
    const count = Math.max(1,Math.floor(Number(state.chapterCount) || 1));
    const chapter = Math.max(1,Math.min(count,Math.floor(Number(state.chapter) || 0)+1));
    const title = state.chapterTitle || (typeof state.chapter === "string" ? state.chapter : "ตอนปัจจุบัน");
    const progress = state.progress || {percent:0,seekable:false,approximate:true,label:"ตอน "+chapter+" / "+count};
    const percent = clamp(progress.percent,0,100);
    const seekable = Boolean(progress.seekable) && Number.isFinite(Number(state.duration)) && Number(state.duration) > 0;
    const active = Boolean(state.playing) && !state.paused;
    $("wdLockTitle").textContent = state.title || "หนังสือที่กำลังฟัง";
    $("wdLockChapter").textContent = "ตอน "+chapter+" / "+count+" · "+title;
    $("wdLockCoverTitle").textContent = state.coverTitle || state.title || "WD Books";
    $("wdLockCoverTop").textContent = state.coverTop || "WD / LISTEN";
    $("wdLockCover").dataset.coverColor = COLORS.has(state.coverColor) ? state.coverColor : "forest";
    $("wdLockMode").textContent = state.mode === "asset" ? "เสียงเต็มเล่ม" :
      state.mode === "online" ? "เสียงไทยออนไลน์ · อาจหยุดเมื่อดับจอ" :
      "เสียงในเครื่อง · อาจหยุดเมื่อดับจอ";
    $("wdLockBadge").dataset.state = !state.playing ? "stopped" : state.paused ? "paused" : "playing";
    $("wdLockBadge").textContent = !state.playing ? "หยุดเล่น" : state.paused ? "พักอยู่" : "กำลังฟัง";
    $("wdLockStatus").textContent = !state.playing ? (state.note || "แตะเล่นเพื่อฟังต่อ")
      : state.paused ? "พักการฟังอยู่ · เล่นต่อได้" : (state.note || "กำลังฟัง");
    playButton.setAttribute("aria-label",active ? "พักเสียง" : "เล่นเสียง");
    $("wdLockPlayIcon").textContent = active ? "⏸" : "▶";
    $("wdLockPrev").disabled = chapter === 1;
    $("wdLockNext").disabled = chapter === count;
    $("wdLockSpeed").textContent = (Number(state.rate) || 1)+"×";
    $("wdLockSpeed").setAttribute("aria-label","ความเร็ว "+(Number(state.rate)||1)+" เท่า · แตะเพื่อเปลี่ยน");
    $("wdLockPositionLabel").textContent = progress.label || "ตอน "+chapter+" / "+count;
    $("wdLockPercent").textContent = (progress.approximate ? "≈ " : "")+Math.round(percent)+"%";
    const bar = $("wdLockProgress"), seek = $("wdLockSeek");
    bar.value = percent;
    bar.setAttribute("aria-label",(progress.detail || "ความคืบหน้าการฟัง")+" · "+(progress.label||percent+"%"));
    bar.hidden = seekable;
    seek.hidden = !seekable; seek.disabled = !seekable;
    if (seekable) {
      seek.max = String(state.duration);
      seek.value = String(clamp(state.position,0,Number(state.duration)));
      seek.setAttribute("aria-valuetext",progress.label||"เลื่อนเสียง");
    }
    if (active) void requestWakeLock();
    else releaseWakeLock();
  }
  function lock() {
    const state = media()?.getState?.();
    if (!state?.playing || state.paused || dialog.open) return;
    try { dialog.showModal(); } catch { return; }
    sync(state); unlockButton.focus?.();
  }
  button.addEventListener("click",lock);
  playButton.addEventListener("click",() => media()?.togglePlayback?.());
  $("wdLockPrev").addEventListener("click",() => media()?.previousChapter?.());
  $("wdLockNext").addEventListener("click",() => media()?.nextChapter?.());
  $("wdLockSpeed").addEventListener("click",() => {
    const rate = Number(media()?.getState?.()?.rate)||1;
    media()?.setPlaybackRate?.(RATES[(RATES.indexOf(rate)+1)%RATES.length]);
  });
  $("wdLockSeek").addEventListener("change",event => {
    if (!latest?.progress?.seekable) return;
    media()?.seekTo?.(clamp(event.target.value,0,Number(latest.duration)||0));
  });
  unlockButton.addEventListener("pointerdown",event => {
    if (event.button !== undefined && event.button !== 0) return;
    clearHold();
    unlockButton.classList.add("wd-lock-holding");
    try { unlockButton.setPointerCapture?.(event.pointerId); } catch {}
    holdTimer = window.setTimeout(unlock,HOLD_MS);
  });
  for (const event of ["pointerup","pointercancel","pointerleave","lostpointercapture"]) {
    unlockButton.addEventListener(event,clearHold);
  }
  unlockButton.addEventListener("keydown",event => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); unlock(); }
  });
  dialog.addEventListener("cancel",event => { event.preventDefault(); unlock(); });
  dialog.addEventListener("close",() => { clearHold(); releaseWakeLock(); });
  document.addEventListener("visibilitychange",() => {
    if (document.hidden) releaseWakeLock();
    else if (dialog.open) void requestWakeLock();
  });
  window.WD_LISTENING_LOCK = Object.freeze({sync,unlock,getState:() => ({locked:dialog.open})});
})();
