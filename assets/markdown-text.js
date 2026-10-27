/* WD Books: conservative, text-only Markdown emphasis cleanup.
   Keep source unchanged. Never interpret HTML or remove arithmetic operators. */
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
      .replace(/\n{3,}/g, "\n\n");
  }
  window.WD_MARKDOWN_TEXT = Object.freeze({ clean });
})();
