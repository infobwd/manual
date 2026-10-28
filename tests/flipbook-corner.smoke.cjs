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
const vendor = read(prefix + "vendor/page-flip.browser.min.js");
const license = read(prefix + "vendor/LICENSE-StPageFlip.txt");
const catalog = read("assets/manuals-data.js");
new vm.Script(app, { filename: "corner.js" });
new vm.Script(vendor, { filename: "page-flip.browser.min.js" });
const scope = { window: {} };
vm.runInNewContext(modelSource, scope, { timeout: 2000 });
const model = scope.window.WD_CORNER_MODEL;
assert(model, "physical sheet adapter must load");
const data = { window: {} };
vm.runInNewContext(catalog, data, { timeout: 3000 });
const book = data.window.WD_LIBRARY_DATA.manuals.find(x => x.id === "ai-five-questions-speaker-cheatsheet-25691026");
assert(book && book.status === "published" && book.pages.length === 12, "only public real pilot book");
assert(html.indexOf("assets/manuals-data.js") < html.indexOf("vendor/page-flip.browser.min.js"), "public catalog first");
assert(html.indexOf("page-flip.browser.min.js") < html.indexOf("corner-model.js"), "engine before model");
assert(html.indexOf("corner-model.js") < html.indexOf("corner.js"), "model before adapter");
assert(!/<script[^>]+src=["']https?:/i.test(html), "no CDN dependencies");
assert(!/<link[^>]+href=["']https?:/i.test(html), "no runtime CDN CSS");
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
      assert.deepEqual(model.visiblePages(3, pages, false), [2, 3].filter(i => i < count), "second spread must be 2-3 when available");
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
console.log("FLIP-03 smoke PASS: browser bundle parses, source public, MIT, real HTML engine, no runtime CDN/SW/storage changes; 14 book layout cases.");
