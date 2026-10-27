/* WD Books — dependency-free script selection for the presenter screen.
   The original book remains unchanged; this extracts only the spoken script
   between the greeting and thanks, excluding coaching notes. */
(function (root) {
  "use strict";
  const BOOK_ID = "ai-five-questions-speaking-handbook-25691026";
  function getChapters(book) {
    if (!book || book.id !== BOOK_ID || !Array.isArray(book.pages)) return [];
    return book.pages.flatMap((page, pageIndex) => {
      if (!/^ข้อ\s*[1-7]\s*[—–-]/u.test(page.title || "") || !String(page.kicker || "").startsWith("บทพูด")) return [];
      const paragraphs = [];
      let recording = false;
      let finished = false;
      for (const paragraph of (page.paragraphs || [])) {
        for (const rawLine of String(paragraph).split("\n")) {
          const line = rawLine.replace(/\*\*/g, "").trim();
          if (!recording && line !== "สวัสดีครับ") continue;
          recording = true;
          if (line) paragraphs.push(line);
          if (line === "ขอบคุณครับ") { finished = true; break; }
        }
        if (finished) break;
      }
      if (!recording || !finished) return [];
      return [{ title: page.title, pageIndex, paragraphs }];
    });
  }
  function advancePosition(position, max, speed, elapsedMs) {
    const safeMax = Math.max(0, Number(max) || 0);
    const previous = Math.min(safeMax, Math.max(0, Number(position) || 0));
    // Limit frames after returning from a background tab to prevent a jump.
    const delta = Math.min(64, Math.max(0, Number(elapsedMs) || 0));
    return Math.min(safeMax, previous + Math.max(0, Number(speed) || 0) * delta / 1000);
  }
  const api = Object.freeze({ BOOK_ID, getChapters, advancePosition });
  root.WD_TELEPROMPTER_CORE = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
