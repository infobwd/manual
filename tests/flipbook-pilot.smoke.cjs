// WD Books FLIP-01 static contract smoke. Run: node tests/flipbook-pilot.smoke.cjs
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const html = read("experiments/flipbook-pilot/index.html");
const js = read("experiments/flipbook-pilot/pilot.js");
const css = read("experiments/flipbook-pilot/pilot.css");
const dataJs = read("assets/manuals-data.js");
new vm.Script(js, { filename: "pilot.js" });
const context = { window: {} };
vm.runInNewContext(dataJs, context, { timeout: 3000 });
const books = context.window.WD_LIBRARY_DATA?.manuals;
assert(Array.isArray(books), "public catalog exists");
const selected = books.find(book => book.id === "ai-five-questions-speaker-cheatsheet-25691026");
assert(selected && selected.status === "published" && selected.pages.length === 12, "one published 12-section pilot book");
const allowedKeys = ["title", "kicker", "paragraphs", "bullets", "tip"];
selected.pages.forEach((page, index) => {
  assert(page.title, "source page " + index + " needs a title");
  assert(Object.keys(page).every(key => allowedKeys.includes(key)), "no pilot book fields silently dropped on page " + index);
});
assert(html.includes("../../assets/manuals-data.js"), "real catalog is used from relative path");
assert(html.includes("pilot.js") && html.includes("pilot.css"), "standalone pilot shell");
assert(html.includes('aria-live="polite"'), "page changes announced");
assert(html.includes('id="chapter"') && html.includes('id="fontSize"'), "TOC and font controls available");
assert(js.includes('window.WD_LIBRARY_DATA'), "pilot uses real public data");
assert(js.includes('scrollHeight <= area.clientHeight'), "pagination measures overflow");
assert(js.includes("splitSegments"), "long blocks are split rather than clipped");
assert(js.includes("prefers-reduced-motion"), "motion preference honored");
assert(js.includes("pointerup") && js.includes("ArrowRight"), "swipe and keyboard navigation implemented");
assert(css.includes("@media(max-width:690px)") && css.includes(".turn-sheet"), "single-page and 3D turn styles exist");
for (const dangerous of ["localStorage.setItem", "localStorage.removeItem", "register(", "navigator.serviceWorker.register", "fetch(", "XMLHttpRequest"]) {
  assert(!js.includes(dangerous), "pilot must not write reader storage, register SW or call network: " + dangerous);
}
assert(!/<script[^>]+src=["']https?:/i.test(html), "no runtime CDN");
console.log("FLIP-01 static smoke PASS: 12 public chapters; source fields; parser; no SW/storage writes; responsive/a11y hooks.");
