/* FLIP-04: a best-effort page anchor that survives responsive re-pagination.
 * Pure helper, no user tracking, storage writes, or network calls. */
(function(scope) {
  "use strict";
  function clamp(value, lower, upper) { return Math.min(upper, Math.max(lower, value)); }
  function capture(chapters, pageCount, sourceIndex, chapterIndex) {
    if (sourceIndex === -2) return { kind: "back" };
    if (!Number.isInteger(sourceIndex) || sourceIndex <= 0 || chapterIndex < 0)
      return { kind: "cover" };
    const chapter = chapters[chapterIndex];
    if (!chapter) return { kind: "cover" };
    const start = chapter.page;
    const end = chapters[chapterIndex + 1]?.page ?? pageCount;
    const span = Math.max(1, end - start - 1);
    return { kind: "content", chapter: chapterIndex,
      fraction: clamp((sourceIndex - start) / span, 0, 1) };
  }
  function restore(chapters, pageCount, anchor) {
    if (anchor?.kind === "back") return -2;
    if (anchor?.kind !== "content") return 0;
    const chapter = chapters[anchor.chapter];
    if (!chapter) return 0;
    const start = chapter.page, end = chapters[anchor.chapter + 1]?.page ?? pageCount;
    const last = Math.max(start, end - 1);
    return clamp(start + Math.round((last - start) * clamp(Number(anchor.fraction) || 0, 0, 1)), start, last);
  }
  scope.WD_CORNER_POSITION = Object.freeze({ capture, restore });
})(window);
