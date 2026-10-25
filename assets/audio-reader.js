/* WD Books UX-P3A — published books: foreground Thai speech + approved audio assets.
   No API keys, no third-party network TTS, no autoplay, no unsafe HTML. */
(() => {
  "use strict";
  const core = window.WD_AUDIO_CORE;
  if (!core) return;
  const $ = id => document.getElementById(id);
  const audio = $("wdNarrationMedia");
  const remoteAudio = $("wdOnlineTtsMedia");
  const reader = $("readerDialog");
  const panel = $("wdAudioPanel");
  const toggle = $("readerAudioToggle");
  const mini = $("wdAudioMini");
  if (!audio || !remoteAudio || !reader || !panel || !toggle || !mini) return;
  const speech = window.speechSynthesis || null;
  const Utterance = window.SpeechSynthesisUtterance || null;
  const mediaSession = navigator.mediaSession || null;
  const STORE = core.STORAGE_KEY;
  const publicBooks = window.WD_LIBRARY_DATA?.manuals?.filter(core.isReadable) || [];
  const knownIds = publicBooks.map(book => book.id);
  const positions = (() => {
    try { return core.restore(localStorage.getItem(STORE), knownIds); } catch { return {}; }
  })();
  let book = null;
  let asset = null;
  let onlineEnabled = false;
  let remoteSegments = [];
  let remoteIndex = 0;
  let remoteGeneration = 0;
  let chapter = 0;
  let speed = 1;
  let playing = false;
  let paused = false;
  let visibleSession = false;
  let speechGeneration = 0;
  let note = "";
  let lastSaved = 0;
  let audioSeekingOnLoad = null;
  const mode = () => asset ? "asset" : onlineEnabled ? "online" : "speech";
  const currentTitle = () => book?.pages?.[chapter]?.title || "เลือกตอน";
  const formatTime = core.formatTime;
  function writePosition(force = false) {
    if (!book) return;
    const now = Date.now();
    if (!force && now - lastSaved < 3500) return;
    lastSaved = now;
    positions[book.id] = {
      chapter, time:asset ? core.safeTime(audio.currentTime) : 0,
      rate:speed
    };
    try { localStorage.setItem(STORE,JSON.stringify({version:1,positions})); } catch {
      // Private/low-storage browsing can disable localStorage; audio remains usable.
    }
  }
  function announce(message) { note = message; syncUI(); }
  let cachedVoices = [];
  const refreshVoices = () => {
    try {
      const voices = speech?.getVoices?.() || [];
      if (voices.length) cachedVoices = [...voices];
    } catch {}
    if (book && !asset && !onlineEnabled && !playing && cachedVoices.length) {
      if (core.pickThaiVoice(cachedVoices)) {
        note = "พบเสียงภาษาไทยแล้ว กดเล่นเพื่อฟัง";
        syncUI();
      }
    }
  };
  try { speech?.addEventListener?.("voiceschanged", refreshVoices); } catch {}
  refreshVoices();
  const thVoice = () => core.pickThaiVoice(cachedVoices);
  function resetMediaSession() {
    if (!mediaSession) return;
    try {
      mediaSession.playbackState = "none";
      for (const action of ["play","pause","stop","nexttrack","previoustrack","seekforward","seekbackward","seekto"]) {
        try { mediaSession.setActionHandler(action, null); } catch {}
      }
    } catch {}
  }
  function reportPosition() {
    if (!mediaSession?.setPositionState || !asset || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    try {
      mediaSession.setPositionState({
        duration:audio.duration,
        playbackRate:audio.playbackRate,
        position:Math.min(audio.duration,Math.max(0,audio.currentTime))
      });
    } catch {}
  }
  function setupMediaSession() {
    if (!mediaSession || !asset || !book) return;
    try {
      if (typeof window.MediaMetadata === "function") {
        mediaSession.metadata = new window.MediaMetadata({
          title:book.title,
          artist:"WD Books · โรงเรียนบ้านวังด้ง",
          album:book.edition || "Public Edition",
          artwork:[{src:"./icons/icon-192.png",sizes:"192x192",type:"image/png"}]
        });
      }
      const handlers = {
        play:() => { void play(); },
        pause:() => pause(),
        stop:() => stop(),
        previoustrack:() => jump(-1),
        nexttrack:() => jump(1),
        seekbackward:event => seek(audio.currentTime - (event?.seekOffset || 15)),
        seekforward:event => seek(audio.currentTime + (event?.seekOffset || 15)),
        seekto:event => seek(event?.seekTime)
      };
      Object.entries(handlers).forEach(([action,fn]) => {
        try { mediaSession.setActionHandler(action,fn); } catch {}
      });
      mediaSession.playbackState = playing && !paused ? "playing" : "paused";
      reportPosition();
    } catch {}
  }
  function syncUI() {
    const selected = Boolean(book);
    toggle.disabled = !selected;
    toggle.setAttribute("aria-expanded",String(!panel.hidden));
    const showMini = visibleSession && selected && !reader.open;
    mini.hidden = !showMini;
    $("wdAudioBookTitle").textContent = book?.title || "ยังไม่ได้เลือกหนังสือ";
    $("wdAudioChapterTitle").textContent = currentTitle();
    $("wdAudioMiniTitle").textContent = book?.title || "";
    $("wdAudioMiniChapter").textContent = currentTitle();
    const modeLabel = asset
      ? "เสียงบรรยายไฟล์ · รองรับการทดสอบล็อกจอจริง"
      : onlineEnabled
        ? "เสียงไทยออนไลน์ผ่าน WD Growth · ต้องเปิดจอเพื่อฟังต่อเนื่อง"
        : "อ่านออกเสียงในเครื่อง · อาจหยุดเมื่อพักแอปหรือล็อกหน้าจอ";
    $("wdAudioMode").textContent = modeLabel;
    const text = note || (playing ? (paused ? "พักการฟังอยู่" : "กำลังฟัง") : "แตะเล่นเพื่อเริ่มฟัง");
    $("wdAudioStatus").textContent = text;
    $("wdAudioOnline").hidden = !selected || Boolean(asset) || onlineEnabled;
    $("wdAudioOnlineDisclosure").hidden = !selected || Boolean(asset) || onlineEnabled;
    $("wdAudioLock").disabled = !playing || paused;
    window.WD_LISTENING_LOCK?.sync?.({title:book?.title || "", chapter:currentTitle(), playing, paused, note:text});
    const playText = playing && !paused ? "พัก" : "เล่น";
    $("wdAudioPlay").textContent = playText;
    $("wdAudioMiniPlay").textContent = playText;
    $("wdAudioPlay").setAttribute("aria-label",playText + "เสียงบรรยาย");
    $("wdAudioMiniPlay").setAttribute("aria-label",playText + "เสียงบรรยาย");
    $("wdAudioSpeed").value = String(speed);
    $("wdAudioPrev").disabled = !selected || chapter <= 0;
    $("wdAudioNext").disabled = !selected || chapter >= (book?.pages?.length || 1) - 1;
    const seekInput = $("wdAudioSeek");
    seekInput.disabled = !asset || !Number.isFinite(audio.duration) || audio.duration <= 0;
    seekInput.max = String(Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 100);
    seekInput.value = String(seekInput.disabled ? 0 : Math.min(audio.duration,audio.currentTime));
    $("wdAudioTime").textContent = asset
      ? formatTime(audio.currentTime) + " / " + (Number.isFinite(audio.duration) ? formatTime(audio.duration) : "--:--")
      : "ตอน " + (chapter + 1) + " / " + (book?.pages?.length || 0);
    if (mediaSession && asset && visibleSession) {
      try { mediaSession.playbackState = !playing ? "paused" : paused ? "paused" : "playing"; } catch {}
    }
  }
  function prepareAsset() {
    if (!asset) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      return;
    }
    const file = asset.src;
    if (audio.getAttribute("src") !== file) {
      audio.pause();
      audio.src = file;
      audio.load();
    }
    audio.playbackRate = speed;
  }
  function selectBook(nextBook, readerPage = 0) {
    if (!core.isReadable(nextBook)) return;
    const changed = book?.id !== nextBook.id;
    if (changed) {
      stop();
      onlineEnabled = false; // Consent is per selected public book, never implicit.
    }
    book = nextBook;
    asset = core.audioAsset(nextBook);
    const saved = positions[book.id];
    chapter = core.limitIndex(saved?.chapter ?? readerPage,book.pages.length);
    speed = core.safeRate(saved?.rate ?? speed);
    note = "";
    if (changed) {
      audioSeekingOnLoad = asset && Number(saved?.time) > 0 ? core.safeTime(saved.time) : null;
      prepareAsset();
      visibleSession = false;
    }
    syncUI();
  }
  function syncPage(bookId, page) {
    if (!book || book.id !== bookId || playing || !panel.hidden) return;
    // Audio files resume by recorded seconds, not the visual reader page.
    // Foreground speech can start from the currently visible reading page.
    if (asset) return;
    chapter = core.limitIndex(page,book.pages.length);
    syncUI();
  }
  function cancelSpeech() {
    speechGeneration++;
    try { speech?.cancel(); } catch {}
  }
  function stopRemote() {
    remoteGeneration++;
    remoteSegments = [];
    remoteIndex = 0;
    try {
      remoteAudio.pause();
      remoteAudio.removeAttribute("src");
      remoteAudio.load();
    } catch {}
  }
  function pumpRemoteSegment() {
    if (!book || !onlineEnabled || !playing || paused) return;
    if (remoteIndex >= remoteSegments.length) {
      if (chapter + 1 >= book.pages.length) {
        playing = false; paused = false;
        note = "ฟังจบเล่มแล้ว"; writePosition(true); syncUI();
      } else beginRemoteSpeech(chapter + 1);
      return;
    }
    const url = core.schoolTtsUrl(remoteSegments[remoteIndex++]);
    if (!url) { playing = false; paused = false; announce("ข้อความเสียงออนไลน์ไม่ถูกต้อง"); return; }
    const token = remoteGeneration;
    remoteAudio.src = url;
    remoteAudio.playbackRate = speed;
    remoteAudio.play().catch(() => {
      if (token !== remoteGeneration) return;
      playing = false; paused = false;
      announce("เชื่อมต่อเสียงออนไลน์ของโรงเรียนไม่ได้ กรุณาตรวจอินเทอร์เน็ตหรือใช้เสียงในเครื่อง");
    });
  }
  function beginRemoteSpeech(index) {
    if (!book || asset || !onlineEnabled) return;
    cancelSpeech();
    stopRemote();
    chapter = core.limitIndex(index,book.pages.length);
    remoteSegments = core.splitSpeech(core.narrationText(book.pages[chapter]),175);
    if (!remoteSegments.length) remoteSegments = [book.pages[chapter].title || "ตอนนี้ไม่มีข้อความ"];
    playing = true; paused = false; visibleSession = true;
    note = "กำลังฟังเสียงไทยออนไลน์ (หนังสือสาธารณะ)";
    writePosition(true); syncUI();
    pumpRemoteSegment();
  }
  function stop() {
    cancelSpeech();
    stopRemote();
    if (audio) { audio.pause(); }
    playing = false;
    paused = false;
    visibleSession = false;
    note = "หยุดฟังแล้ว";
    writePosition(true);
    resetMediaSession();
    syncUI();
  }
  function selectThaiVoice() {
    refreshVoices(); // Chromium loads voice lists asynchronously.
    if (!cachedVoices.length) {
      announce("Chrome ยังโหลดรายการเสียงไม่เสร็จ โปรดลองอีกครั้ง หรือเลือกเสียงไทยออนไลน์ของโรงเรียน");
      return {unavailable:true, voice:null};
    }
    const voice = thVoice();
    if (!voice) {
      announce("ไม่พบเสียงภาษาไทยในอุปกรณ์นี้ เลือก “ใช้เสียงไทยออนไลน์ของโรงเรียน” ด้านล่างได้");
      return {unavailable:true, voice:null};
    }
    return {unavailable:false, voice};
  }
  function beginSpeech(index) {
    if (!speech || !Utterance) {
      announce("เบราว์เซอร์นี้ไม่รองรับเสียงสังเคราะห์ กรุณาใช้เบราว์เซอร์ที่รองรับ");
      return;
    }
    const voiceChoice = selectThaiVoice();
    if (voiceChoice.unavailable) return;
    cancelSpeech();
    chapter = core.limitIndex(index,book.pages.length);
    writePosition(true);
    let parts = core.splitSpeech(core.narrationText(book.pages[chapter]),180);
    if (!parts.length) parts = [book.pages[chapter].title || "ไม่มีข้อความในตอนนี้"];
    const token = speechGeneration;
    let nextPart = 0;
    playing = true;
    paused = false;
    visibleSession = true;
    note = "กำลังอ่านออกเสียงภาษาไทย";
    syncUI();
    const pump = () => {
      if (token !== speechGeneration || !playing || paused) return;
      if (nextPart >= parts.length) {
        if (chapter + 1 >= book.pages.length) {
          playing = false; paused = false;
          note = "ฟังจบเล่มแล้ว";
          writePosition(true); syncUI();
          return;
        }
        beginSpeech(chapter + 1);
        return;
      }
      const sentence = new Utterance(parts[nextPart++]);
      sentence.lang = "th-TH";
      sentence.rate = speed;
      if (voiceChoice.voice) sentence.voice = voiceChoice.voice;
      sentence.onend = () => { if (token === speechGeneration) pump(); };
      sentence.onerror = event => {
        if (token !== speechGeneration || event?.error === "interrupted" || event?.error === "canceled") return;
        playing = false; paused = false;
        announce("ไม่สามารถอ่านเสียงได้ กรุณาตรวจการตั้งค่าเสียงภาษาไทยแล้วลองใหม่");
      };
      try { speech.speak(sentence); } catch {
        playing = false; paused = false;
        announce("เริ่มอ่านออกเสียงไม่ได้ โปรดลองอีกครั้ง");
      }
    };
    pump();
  }
  function seek(seconds) {
    if (!asset || !Number.isFinite(Number(seconds))) return;
    const upper = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : core.safeTime(seconds);
    audio.currentTime = Math.max(0,Math.min(Number(seconds),upper));
    chapter = core.chapterForOffset(asset.offsets,audio.currentTime);
    writePosition(true);syncUI();reportPosition();
  }
  function jump(step) {
    if (!book) return;
    const index = core.limitIndex(chapter + step,book.pages.length);
    if (index === chapter) return;
    chapter = index;
    writePosition(true);
    if (asset) {
      seek(asset.offsets[chapter]);
      if (playing && !paused) void play();
    } else if (onlineEnabled && playing && !paused) {
      beginRemoteSpeech(index);
    } else if (onlineEnabled) {
      stopRemote(); playing = false; paused = false; syncUI();
    } else if (playing) {
      beginSpeech(index);
    } else {
      syncUI();
    }
  }
  async function play() {
    if (!book) return;
    visibleSession = true;
    if (onlineEnabled && !asset) {
      if (playing && paused) {
        try {
          await remoteAudio.play();
          paused = false;
          announce("กำลังฟังเสียงไทยออนไลน์");
        } catch { announce("เล่นเสียงออนไลน์ต่อไม่ได้ กรุณาตรวจอินเทอร์เน็ต"); }
      } else if (!playing) beginRemoteSpeech(chapter);
      return;
    }
    if (asset) {
      cancelSpeech();
      note = "กำลังเปิดเสียงบรรยาย…";
      syncUI();
      setupMediaSession();
      try {
        audio.playbackRate = speed;
        await audio.play(); // Called directly from a user gesture for iOS permissions.
        playing = true; paused = false; note = "กำลังฟังเสียงบรรยาย";
        writePosition(true);syncUI();reportPosition();
      } catch {
        playing = false; paused = false;
        announce("เปิดไฟล์เสียงไม่ได้ กรุณาตรวจเครือข่ายหรือไฟล์บรรยาย");
      }
      return;
    }
    if (playing && paused) {
      try { speech.resume(); paused = false; announce("กำลังอ่านออกเสียงภาษาไทย"); } catch { beginSpeech(chapter); }
      return;
    }
    if (!playing) beginSpeech(chapter);
  }
  function pause() {
    if (!playing || paused) return;
    if (asset) audio.pause();
    else if (onlineEnabled) remoteAudio.pause();
    else {
      try { speech?.pause(); } catch {}
    }
    paused = true;
    note = "พักการฟังอยู่";
    writePosition(true);syncUI();
  }
  function togglePlayback() {
    if (playing && !paused) pause();
    else void play();
  }
  function changeSpeed(value) {
    speed = core.safeRate(value);
    if (asset) { audio.playbackRate = speed;reportPosition(); }
    else if (onlineEnabled) remoteAudio.playbackRate = speed;
    else if (playing) beginSpeech(chapter); // Web Speech cannot mutate rate mid-utterance.
    writePosition(true);syncUI();
  }
  function openPanel() {
    if (!book) return;
    panel.hidden = false;
    toggle.setAttribute("aria-expanded","true");
    $("wdAudioPlay").focus();
    syncUI();
  }
  function closePanel() {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded","false");
    toggle.focus();
    syncUI();
  }
  toggle.addEventListener("click",() => panel.hidden ? openPanel() : closePanel());
  $("wdAudioOnline").addEventListener("click", () => {
    if (!core.isReadable(book) || asset || onlineEnabled) return;
    stop();
    onlineEnabled = true; // Explicit per-book consent before sending public text.
    visibleSession = false;
    note = "เลือกเสียงออนไลน์แล้ว กดเล่นเพื่อส่งเฉพาะข้อความหนังสือสาธารณะ";
    syncUI();
  });
  $("wdAudioClosePanel").addEventListener("click",closePanel);
  $("wdAudioPlay").addEventListener("click",togglePlayback);
  $("wdAudioMiniPlay").addEventListener("click",togglePlayback);
  $("wdAudioStop").addEventListener("click",stop);
  $("wdAudioMiniStop").addEventListener("click",stop);
  $("wdAudioPrev").addEventListener("click",() => jump(-1));
  $("wdAudioNext").addEventListener("click",() => jump(1));
  $("wdAudioSpeed").addEventListener("change",event => changeSpeed(event.target.value));
  $("wdAudioSeek").addEventListener("change",event => seek(Number(event.target.value)));
  reader.addEventListener("close",() => { panel.hidden = true;syncUI(); });
  audio.addEventListener("loadedmetadata",() => {
    if (audioSeekingOnLoad !== null) {
      seek(audioSeekingOnLoad);
      audioSeekingOnLoad = null;
    }
    syncUI();reportPosition();
  });
  audio.addEventListener("play",() => { if (asset) {playing=true;paused=false;syncUI();} });
  audio.addEventListener("pause",() => { if (asset && playing) {paused=true;syncUI();} });
  audio.addEventListener("timeupdate",() => {
    if (!asset || !book) return;
    const nextChapter=core.chapterForOffset(asset.offsets,audio.currentTime);
    if (nextChapter!==chapter) chapter=nextChapter;
    writePosition();syncUI();reportPosition();
  });
  audio.addEventListener("ended",() => {
    playing=false;paused=false;note="ฟังจบเล่มแล้ว";writePosition(true);syncUI();resetMediaSession();
  });
  remoteAudio.addEventListener("ended", () => {
    if (onlineEnabled && playing && !paused) pumpRemoteSegment();
  });
  remoteAudio.addEventListener("error", () => {
    if (!onlineEnabled || !playing) return;
    playing = false; paused = false;
    announce("โหลดเสียงไทยออนไลน์ไม่ได้ โปรดลองใหม่หรือตรวจเซิร์ฟเวอร์เสียงของโรงเรียน");
  });
  audio.addEventListener("error",() => { if (asset) {playing=false;paused=false;announce("ไม่สามารถโหลดไฟล์เสียงบรรยายได้");} });
  document.addEventListener("visibilitychange",() => {
    if (!document.hidden) syncUI();
    // Do not restart speech after screen lock: it may not be supported.
  });
  syncUI();
  window.WD_AUDIO_READER = Object.freeze({
    selectBook, syncPage, openPanel,
    getState:() => ({bookId:book?.id || null,chapter,mode:mode(),playing,paused,visibleSession})
  });
})();
