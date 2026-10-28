// FLIP-03 Corner Drag isolated smoke. Run: node tests/flipbook-corner.smoke.cjs
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const prefix = "experiments/flipbook-pilot/";
const html = read(prefix + "corner.html");
const css = read(prefix + "corner.css");
const app = read(prefix + "corner.js");
const modelSource = read(prefix + "corner-model.js");
const positionSource = read(prefix + "position-model.js");
const vendor = read(prefix + "vendor/page-flip.browser.min.js");
const license = read(prefix + "vendor/LICENSE-StPageFlip.txt");
const catalog = read("assets/manuals-data.js");
new vm.Script(app, { filename: "corner.js" });
new vm.Script(vendor, { filename: "page-flip.browser.min.js" });
const scope = { window: {} };
vm.runInNewContext(modelSource, scope, { timeout: 2000 });
const model = scope.window.WD_CORNER_MODEL;
vm.runInNewContext(positionSource, scope, { timeout: 2000 });
const position = scope.window.WD_CORNER_POSITION;
assert(position && typeof position.capture === "function" && typeof position.restore === "function",
  "pure reading-position adapter exists");

assert(model, "physical sheet adapter must load");
const data = { window: {} };
vm.runInNewContext(catalog, data, { timeout: 3000 });
const book = data.window.WD_LIBRARY_DATA.manuals.find(x => x.id === "ai-five-questions-speaker-cheatsheet-25691026");
assert(book && book.status === "published" && book.pages.length === 12, "only public real pilot book");
assert(html.indexOf("assets/manuals-data.js") < html.indexOf("vendor/page-flip.browser.min.js"), "public catalog first");
assert(html.indexOf("page-flip.browser.min.js") < html.indexOf("corner-model.js"), "engine before model");
assert(html.indexOf("corner-model.js") < html.indexOf("corner.js"), "model before adapter");
assert(html.indexOf("corner-model.js") < html.indexOf("position-model.js") && html.indexOf("position-model.js") < html.indexOf("corner.js"), "reading anchor loads before adapter");
assert(!/<script[^>]+src=["']https?:/i.test(html), "no CDN dependencies");
assert(!/<script[^>]+src=["']https?:/i.test(html), "no runtime CDN JavaScript");
const remoteStyles = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="(https?:[^"]+)"/g)].map(x => x[1]);
assert(remoteStyles.length === 1 &&
  remoteStyles[0].startsWith("https://fonts.googleapis.com/css2?family=Sarabun:"),
  "only public Sarabun stylesheet is allowed as a remote CSS dependency");
assert(vendor.includes("St={}") && vendor.includes("PageFlip"), "StPageFlip browser UMD bundle");
assert(license.includes("MIT License") && license.includes("Nodlik/StPageFlip"), "MIT attribution included");
assert(app.includes("new window.St.PageFlip(") && app.includes("loadFromHTML(sheets)"), "real engine initialized with HTML pages");
assert(app.includes("useMouseEvents: !state.motionOff"), "OS/reader motion setting disables gesture animation");
assert(app.includes("flippingTime: state.motionOff ? 1 : 750"), "reduced motion uses instant turns");
assert(app.includes('engine.on("flip"'), "flip end updates navigation UI");
assert(app.includes("chapterSelect.addEventListener") && app.includes("fontSelect.addEventListener"), "TOC and font controls");
assert(app.includes('drawShadow: !state.motionOff'), "shadow tuned to motion setting");
assert(app.includes("splitSegments") && app.includes("scrollHeight <= area.clientHeight"), "Thai text repagination keeps content");
assert(css.includes(".corner-sheet") && css.includes("@media(max-width:690px)"), "responsive paper sizing");
for (const forbidden of ["localStorage.setItem", "localStorage.removeItem", "navigator.serviceWorker", "XMLHttpRequest", "fetch("]) {
  assert(!app.includes(forbidden), "no reader storage, service-worker, or network changes: " + forbidden);
}
for (const single of [false, true]) {
  for (const count of [2, 3, 25, 26, 27, 28, 31]) {
    const pages = model.order(count, single);
    assert.equal(pages[0], 0, "front cover first");
    assert.equal(pages.at(-1), -2, "back cover last");
    const content = pages.filter(i => i > 0);
    assert.deepEqual(content, Array.from({ length: count - 1 }, (_, i) => i + 1), "every source page exactly once");
    if (!single) {
      assert.equal(pages[1], -1, "inside cover blank left");
      assert.equal(pages[2], 1, "first content right");
      assert.equal(pages.length % 2, 0, "hard back cover on right");
      assert.equal(model.status(1, pages, single).label, "หน้า 1 / " + (count - 1), "first page counted correctly");
      if (count > 3) assert.deepEqual(model.visiblePages(3, pages, false), [2, 3], "second spread must be 2–3");
    } else {
      assert.equal(pages[1], 1, "portrait shows text immediately after cover");
    }
    for (let source = 1; source < count; source++) {
      const at = model.sourceToEngine(source, single);
      assert(model.visiblePages(at, pages, single).includes(source), "TOC must locate content page " + source);
    }
    assert.equal(model.status(0, pages, single).label, "หน้าปก", "cover label");
  }
}

/* FLIP-04: never reset a reader to the beginning of a long chapter on font/rotation changes. */
const before = [{ page: 1 }, { page: 5 }, { page: 10 }];
const after = [{ page: 1 }, { page: 8 }, { page: 16 }];
for (const [page, chapter] of [[1, 0], [2, 0], [4, 0], [5, 1], [9, 1], [10, 2], [12, 2]]) {
  const anchor = position.capture(before, 13, page, chapter);
  assert.equal(position.restore(before, 13, anchor), page, "identical layout must preserve page " + page);
  const nextPage = position.restore(after, 20, anchor);
  const chapterStart = after[chapter].page;
  const chapterEnd = (after[chapter + 1]?.page ?? 20) - 1;
  assert(nextPage >= chapterStart && nextPage <= chapterEnd,
    "reflow must keep the reader inside the same chapter");
}
assert.equal(position.restore(after, 20, position.capture(before, 13, 0, -1)), 0,
  "front cover stays front cover");
assert.equal(position.restore(after, 20, position.capture(before, 13, -2, -1)), -2,
  "back cover stays back cover");
assert.equal(position.restore(after, 20, position.capture(before, 13, 4, 0)), 7,
  "last old page in a chapter maps to its new last page");
assert.equal(position.restore(after, 20, position.capture(before, 13, 6, 1)), 10,
  "chapter fraction maps inside enlarged chapter");
assert(app.includes("positionModel.capture(") && app.includes("positionModel.restore("),
  "live pagination uses the tested anchor, not chapter-start reset");
assert(app.includes("state.renderSingle") && app.includes("state.renderSingle = isSingle()"),
  "read page using the last mounted orientation before a responsive resize");
assert(app.includes('engine.on("changeState"') && app.includes('stage.classList.add("has-interacted")'),
  "reader dismisses touch hints on gesture");
assert(css.includes(".book-stage.has-interacted .corner-hint"),
  "gesture labels cannot cover reading area after the first interaction");
assert(css.includes("touch-action:pan-y"), "vertical page scroll remains available on touch screens");
assert(app.includes("finally {") && app.includes("state.rebuilding = false"),
  "failed engine rebuild cannot leave the app in a permanent busy state");

console.log("FLIP-03/04 smoke PASS: browser bundle parses, source public, MIT, real HTML engine, no runtime CDN/SW/storage changes; 14 book layout cases.");
