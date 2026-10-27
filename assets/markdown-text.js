/* WD Books: text-only Markdown normalization for reading and speech.
   Source book data is never modified; preserve literal arithmetic operators. */
(() => {
  "use strict";
  function clean(value) {
    if (typeof value !== "string") return value;
    return value
      .replace(/(\*\*|__)([\s\S]*?)\1/g, (_, marker, body) => body.trim() ? body : marker)
      .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, "$1")
      .replace(/(?<!_)_([^_\n]+?)_(?!_)/g, "$1")
      .replace(/^[ \t]*\*{1,2}[ \t]*$/gm, "")
      .replace(/^[ \t]*#{1,6}[ \t]+/gm, "")
      .replace(/^[ \t]*>[ \t]?/gm, "")
      .replace(/^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/gm, "")
      .replace(/^\s*\|(.+)\|\s*$/gm, (_, cells) => cells.split("|").map(cell => cell.trim()).filter(Boolean).join(" — "))
      .replace(/\n{3,}/g, "\n\n");
  }
  window.WD_MARKDOWN_TEXT = Object.freeze({ clean });
})();
