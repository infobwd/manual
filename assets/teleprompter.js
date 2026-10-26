/* WD Books — on-device teleprompter for the five-question AI speaking book.
   No external service or microphone access. Does not change Reader progress. */
(() => {
  "use strict";
  const core = window.WD_TELEPROMPTER_CORE;
  const dialog = document.getElementById("wdTeleprompterDialog");
  const openButton = document.getElementById("readerTeleprompterOpen");
  if (!core || !dialog || !openButton) return;
  const $ = id => document.getElementById(id);
  const viewport = $("wdPrompterViewport");
  const script = $("wdPrompterScript");
  const play = $("wdPrompterPlay");
  const speed = $("wdPrompterSpeed");
  const font = $("wdPrompterFont");
  let chapters = [], chapterIndex = 0, playing = false, frameId = null, lastFrame = 0;
  let returnFocus = null;

  function status(message) { $("wdPrompterStatus").textContent = message; }
  function syncPlay() {
    play.textContent = playing ? "⏸ หยุดเลื่อน" : "▶ " + (viewport.scrollTop > 0 ? "เลื่อนต่อ" : "เริ่มเลื่อน");
    play.setAttribute("aria-pressed", String(playing));
    play.setAttribute("aria-label", playing ? "หยุดการเลื่อนข้อความ" : "เริ่มหรือเล่นต่อการเลื่อนข้อความ");
  }
  function pause(message) {
    playing = false;
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null; lastFrame = 0;
    syncPlay();
    if (message) status(message);
  }
  function frame(timestamp) {
    if (!playing || !dialog.open) return;
    const elapsed = lastFrame ? timestamp - lastFrame : 0;
    lastFrame = timestamp;
    const end = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
    viewport.scrollTop = core.advancePosition(viewport.scrollTop, end, Number(speed.value), elapsed);
    if (end <= 0 || viewport.scrollTop >= end - 1) {
      pause("จบบทแล้ว · กดเริ่มใหม่หรือเลือกบทถัดไป");
      return;
    }
    frameId = requestAnimationFrame(frame);
  }
  function togglePlay() {
    if (playing) { pause("หยุดเลื่อนแล้ว · กดเล่นต่อได้"); return; }
    if (!dialog.open) return;
    if (viewport.scrollTop >= viewport.scrollHeight - viewport.clientHeight - 1) viewport.scrollTop = 0;
    playing = true; lastFrame = 0;
    syncPlay();
    status("กำลังเลื่อนข้อความ · กดหยุดได้ทุกเมื่อ");
    frameId = requestAnimationFrame(frame);
  }
  function renderChapter(nextIndex) {
    if (!chapters.length) return;
    pause();
    chapterIndex = Math.max(0, Math.min(chapters.length - 1, nextIndex));
    const chapter = chapters[chapterIndex];
    $("wdPrompterTitle").textContent = chapter.title;
    $("wdPrompterChapter").value = String(chapterIndex);
    $("wdPrompterPrev").disabled = chapterIndex === 0;
    $("wdPrompterNext").disabled = chapterIndex === chapters.length - 1;
    script.replaceChildren(...chapter.paragraphs.map(line => {
      const paragraph = document.createElement("p");
      paragraph.textContent = line;
      return paragraph;
    }));
    viewport.scrollTop = 0;
    syncPlay();
    status("พร้อมฝึกพูด · เลือกความเร็ว แล้วกดเริ่มเลื่อน");
  }
  function open(book, pageIndex = 1) {
    chapters = core.getChapters(book);
    if (!chapters.length) return;
    pause();
    returnFocus = document.activeElement;
    const selection = $("wdPrompterChapter");
    selection.replaceChildren(...chapters.map((chapter, i) => {
      const option = document.createElement("option");
      option.value = String(i);
      option.textContent = "ข้อ " + (i + 1) + " · " + chapter.title.replace(/^ข้อ\s*\d+\s*[—–-]\s*/u, "");
      return option;
    }));
    const match = chapters.findIndex(ch => ch.pageIndex === pageIndex);
    renderChapter(match >= 0 ? match : 0);
    if (!dialog.open) dialog.showModal();
    play.focus();
  }
  function close() { pause(); if (dialog.open) dialog.close(); }
  $("wdPrompterClose").addEventListener("click", close);
  play.addEventListener("click", togglePlay);
  $("wdPrompterRestart").addEventListener("click", () => {
    pause("กลับสู่ต้นบทแล้ว · พร้อมเลื่อนใหม่");
    viewport.scrollTop = 0;
    syncPlay();
  });
  $("wdPrompterPrev").addEventListener("click", () => renderChapter(chapterIndex - 1));
  $("wdPrompterNext").addEventListener("click", () => renderChapter(chapterIndex + 1));
  $("wdPrompterChapter").addEventListener("change", event => renderChapter(Number(event.target.value)));
  speed.addEventListener("input", () => { $("wdPrompterSpeedValue").textContent = speed.value + " px/วินาที"; });
  font.addEventListener("input", () => {
    const px = Number(font.value);
    viewport.style.setProperty("--wd-prompter-font", px + "px");
    $("wdPrompterFontValue").textContent = px + " px";
  });
  dialog.addEventListener("cancel", () => pause());
  dialog.addEventListener("close", () => {
    pause();
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  });
  dialog.addEventListener("keydown", event => {
    const target = event.target;
    if (event.key === " " && !target.closest("button,input,select,textarea")) {
      event.preventDefault(); togglePlay();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && playing) pause("หยุดเลื่อนอัตโนมัติเมื่อออกจากแอป");
  });
  window.addEventListener("pagehide", () => pause());
  window.addEventListener("blur", () => {
    if (playing) pause("หยุดเลื่อนอัตโนมัติเมื่อเปลี่ยนหน้าต่าง");
  });
  $("wdPrompterSpeedValue").textContent = speed.value + " px/วินาที";
  $("wdPrompterFontValue").textContent = font.value + " px";
  viewport.style.setProperty("--wd-prompter-font", font.value + "px");
  window.WD_TELEPROMPTER = Object.freeze({ open, close });
})();
