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

const spreadSource = read("experiments/flipbook-pilot/spread-model.js");
const spreadContext = { window: {} };
vm.runInNewContext(spreadSource, spreadContext, { timeout: 3000 });
const spread = spreadContext.window.WD_FLIPBOOK_SPREAD_MODEL;
assert(spread && typeof spread.slots === "function", "spread model must be available");
assert(html.indexOf("./spread-model.js") < html.indexOf("./pilot.js"), "spread model must load before pilot JS");
assert(js.includes("bookNode.classList.toggle(\"cover-closed\""), "closed cover state must be explicit");
assert(js.includes("if (sides.closed) left.replaceChildren()"), "closed cover must have no left sheet");
assert(css.includes(".book.cover-closed .left-slot"), "closed cover has a transparent left side");

// Prove that no page is skipped/repeated for both odd and even content counts.
function verifySpreads(pageCount, single) {
  const visited = [];
  let position = 0, previous = null, safety = 0;
  do {
    assert(safety++ < pageCount + 4, "forward walk must terminate");
    const sides = spread.slots(position, pageCount, single);
    if (position === 0) {
      assert.equal(sides.left, null, "front cover starts on RIGHT only");
      assert.equal(sides.right, 0, "cover is page zero on right");
    } else if (!single && position === 1) {
      assert.equal(sides.left, null, "first inner cover is blank");
      assert.equal(sides.right, 1, "first content page starts on right");
    }
    if (sides.left != null) visited.push(sides.left);
    if (sides.right != null) visited.push(sides.right);
    if (previous != null) {
      assert.equal(spread.adjacent(position, -1, pageCount, single), previous, "backward navigation must invert forward");
    }
    previous = position;
    const next = spread.adjacent(position, 1, pageCount, single);
    if (next == null) break;
    position = next;
  } while (true);
  assert.deepEqual(visited, Array.from({ length: pageCount }, (_, i) => i), "all source pages appear exactly once, in order");
  assert.equal(spread.adjacent(position, 1, pageCount, single), null, "last spread blocks next");
  for (let i = 0; i < pageCount; i++) {
    const at = spread.positionForPage(i, pageCount, single);
    const sides = spread.slots(at, pageCount, single);
    assert(sides.left === i || sides.right === i, "TOC jump must show source page " + i);
  }
  while (position > 0) {
    position = spread.adjacent(position, -1, pageCount, single);
  }
  assert.equal(position, 0, "backward navigation returns to closed cover");
  assert.equal(spread.status(0, pageCount, single).label, "หน้าปก");
}
for (const count of [2, 25, 26, 27, 28, 31]) {
  verifySpreads(count, false);
  verifySpreads(count, true);
}
assert.equal(spread.status(1, 26, false).label, "หน้า 1 / 25", "inside cover + first content is page one");
assert.equal(spread.status(3, 26, false).label, "หน้า 2–3 / 25", "paired pages use natural folios");
assert.equal(spread.slots(27, 27, false).right, null, "even-length content ends with blank right");

console.log("FLIP-01/02 static smoke PASS: 12 public chapters; source fields; parser; no SW/storage writes; responsive/a11y hooks.");
