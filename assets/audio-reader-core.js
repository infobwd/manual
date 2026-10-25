/* WD Books UX-P3A: pure audio reader helpers, public-only and dependency free. */
(() => {
  "use strict";
  const STORAGE_KEY = "wd-books-audio-v1";
  const SPEEDS = [0.75, 1, 1.25, 1.5];
  const limitIndex = (index, count) => Math.max(0, Math.min(Math.max(0, count - 1), Math.floor(Number(index) || 0)));
  const isReadable = book => Boolean(book?.status === "published" && typeof book.id === "string" && Array.isArray(book.pages) && book.pages.length);
  const asText = value => typeof value === "string" ? value.trim() : "";
  function narrationText(page) {
    if (!page) return "";
    const lines = [page.title, ...(page.paragraphs || []), ...(page.bullets || []).map(item => "• " + item), page.tip];
    if (page.insight) lines.push(page.insight.headline, page.insight.primary, page.insight.detail);
    return lines.map(asText).filter(Boolean).join("\n");
  }
  // Web Speech on mobile can stall on a single very long utterance.
  // Use code points and explicit pauses between small chunks, including Thai text without spaces.
  function splitSpeech(text, maxLength = 180) {
    const max = Math.max(40, Math.min(300, Math.floor(Number(maxLength) || 180)));
    const source = Array.from(asText(text));
    const chunks = [];
    while (source.length) {
      if (source.length <= max) { chunks.push(source.join("").trim()); break; }
      let cut = max;
      // Prefer punctuation/whitespace, but never return a zero-length segment.
      for (let i = max; i >= Math.max(25, max - 70); i--) {
        if (/[\sฯ.!?;:，。]/u.test(source[i - 1] || "")) { cut = i; break; }
      }
      const chunk = source.splice(0, cut).join("").trim();
      if (chunk) chunks.push(chunk);
      while (source[0] && /\s/u.test(source[0])) source.shift();
    }
    return chunks.filter(Boolean);
  }
  // WD Growth's existing public Thai MP3 proxy. The user must opt in before
  // any public-book text leaves WD Books. Never accept arbitrary endpoints.
  const SCHOOL_TTS_PROXY = "https://wd.esdc.app/backend-php/api.php";
  const pickThaiVoice = voices => (Array.isArray(voices) ? voices : Array.from(voices || []))
    .find(voice => /^th(?:-|_|$)/i.test(String(voice?.lang || ""))) || null;
  function schoolTtsUrl(text) {
    const source = asText(text);
    if (!source || Array.from(source).length > 180) return null;
    return SCHOOL_TTS_PROXY + "?endpoint=tts&lang=th&q=" + encodeURIComponent(source);
  }
  const safeRate = value => SPEEDS.includes(Number(value)) ? Number(value) : 1;
  const safeTime = seconds => Math.max(0, Math.min(24 * 60 * 60, Number.isFinite(Number(seconds)) ? Number(seconds) : 0));
  // Audio resource must be a same-site, reviewed file. No arbitrary external URLs.
  function audioAsset(book) {
    if (!isReadable(book) || !book.audio || typeof book.audio !== "object") return null;
    const src = book.audio.src;
    if (typeof src !== "string" || !/^\.\/assets\/audio\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)*\.(?:mp3|m4a|ogg)$/i.test(src)) return null;
    // Never expose an asset-backed mode without a reviewed rights statement
    // and a narration/content version so obsolete audio cannot masquerade as current.
    if (!asText(book.audio.license) || !asText(book.audio.narrationVersion)) return null;
    const chapterOffsets = book.audio.chapterOffsets;
    if (!Array.isArray(chapterOffsets) || chapterOffsets.length !== book.pages.length) return null;
    const offsets = chapterOffsets.map(Number);
    if (!offsets.every((n, i) => Number.isFinite(n) && n >= 0 && (i === 0 || n > offsets[i-1])) || offsets[0] !== 0) return null;
    return { src, offsets, narrationVersion:asText(book.audio.narrationVersion), license:asText(book.audio.license) };
  }
  function restore(raw, validIds) {
    let value;
    try { value = typeof raw === "string" ? JSON.parse(raw) : raw; } catch { return {}; }
    if (!value || value.version !== 1 || !value.positions || typeof value.positions !== "object") return {};
    const whitelist = new Set(validIds);
    const output = {};
    for (const [id, entry] of Object.entries(value.positions).slice(0, 100)) {
      if (!whitelist.has(id) || !entry || typeof entry !== "object") continue;
      output[id] = { chapter:Math.max(0,Math.min(999,Math.floor(Number(entry.chapter)||0))), time:safeTime(entry.time), rate:safeRate(entry.rate) };
    }
    return output;
  }
  function chapterForOffset(offsets, time) {
    let index = 0;
    offsets.forEach((offset, i) => { if (time >= offset) index = i; });
    return index;
  }
  const formatTime = value => {
    const s = Math.max(0, Math.floor(Number(value) || 0));
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  };
  // Mode-specific listening progress. For chunked voices the book percentage is
  // an APPROXIMATION of chapter/chunk completion, never invented elapsed time.
  // Only an approved audio file provides a seekable seconds-based timeline.
  function listeningProgress(input = {}) {
    const chapters = Math.max(1, Math.floor(Number(input.chapters) || 1));
    const chapter = Math.max(0, Math.min(chapters - 1, Math.floor(Number(input.chapter) || 0)));
    const mode = input.mode === "asset" ? "asset" : input.mode === "online" ? "online" : "speech";
    const position = Number(input.position);
    const duration = Number(input.duration);
    const validMedia = mode === "asset" && Number.isFinite(duration) && duration > 0;
    const clamp = value => Math.min(1, Math.max(0, value));
    if (validMedia) {
      const time = Number.isFinite(position) ? Math.max(0, Math.min(duration, position)) : 0;
      const percent = Math.round(clamp(time / duration) * 100);
      return {
        percent, seekable:true, approximate:false,
        label:formatTime(time) + " / " + formatTime(duration),
        detail:"ไฟล์เสียงเต็มเล่ม · เวลาจริง",
        chapterLabel:"ตอน " + (chapter + 1) + " / " + chapters
      };
    }
    const parts = Math.max(0, Math.floor(Number(input.parts) || 0));
    const activePart = parts > 0 ? Math.max(0, Math.min(parts - 1, Math.floor(Number(input.partIndex) || 0))) : 0;
    const partFraction = Number.isFinite(position) && Number.isFinite(duration) && duration > 0
      ? clamp(position / duration) : 0;
    const withinChapter = parts > 0 ? (activePart + partFraction) / parts : 0;
    const percent = input.completed ? 100 : Math.round(clamp((chapter + withinChapter) / chapters) * 100);
    const chapterLabel = "ตอน " + (chapter + 1) + " / " + chapters;
    const partLabel = parts > 0 ? " · ท่อน " + (activePart + 1) + " / " + parts : "";
    return {
      percent, seekable:false, approximate:true,
      label:input.completed ? "ฟังจบเล่มแล้ว" : chapterLabel + partLabel,
      detail:(mode === "online" ? "เสียงออนไลน์" : mode === "speech" ? "อ่านออกเสียงในเครื่อง" : "รอเวลาไฟล์เสียง")
        + " · ความคืบหน้าประมาณตามตอน/ท่อน",
      chapterLabel
    };
  }
  window.WD_AUDIO_CORE = Object.freeze({
    STORAGE_KEY, SPEEDS, isReadable, narrationText, splitSpeech,
    safeRate, safeTime, limitIndex, audioAsset, restore, chapterForOffset, formatTime,
    pickThaiVoice, schoolTtsUrl, listeningProgress
  });
})();
