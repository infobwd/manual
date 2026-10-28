// FLIP-12: single closed back cover + sidebar category result focus.
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const vm=require("node:vm");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const html=read("experiments/flipbook-pilot/corner.html");
const css=read("experiments/flipbook-pilot/corner.css");
const js=read("experiments/flipbook-pilot/corner.js");
const modelSrc=read("experiments/flipbook-pilot/corner-model.js");
const app=read("assets/app.js");
const styles=read("assets/styles.css");
const version=read("assets/app-version.js");
const shell=read("sw.js");
const main=read("index.html");
new vm.Script(js);
new vm.Script(app);
new vm.Script(modelSrc);
const ctx={window:{}};
vm.runInNewContext(modelSrc,ctx);
const model=ctx.window.WD_CORNER_MODEL;
assert(model);
for (const single of [false,true]){
  for(const count of [2,3,25,26,27,28,31,45]){
    const ordered=model.order(count,single);
    assert.equal(ordered[0],0,"cover first");
    assert.equal(ordered.at(-1),-2,"back cover last");
    assert.equal(model.status(0,ordered,single).label,"หน้าปก");
    assert.equal(model.status(ordered.length-1,ordered,single).label,"ปกหลัง",
      "last state is closed book, not a content spread");
    assert(model.adjacent(ordered.length-1,-1,ordered.length,single)!==null,
      "back cover can reopen to content");
    assert.equal(model.adjacent(ordered.length-1,1,ordered.length,single),null,
      "cannot go beyond back cover");
  }
}
assert(html.includes('id="closedBackCover"') && html.includes('id="reopenBackCover"'),
  "single closed book and reopen control present");
assert(js.includes('const closedBack = info.label === "ปกหลัง"') &&
  js.includes('stage.dataset.closedBack = String(closedBack)') &&
  js.includes('el("closedBackCover").hidden = !closedBack') &&
  js.includes('el("reopenBackCover").addEventListener("click", () => move(-1))'),
  "closed back toggles only on last page and previous restores navigation");
assert(css.includes('.closed-back-cover[hidden]{display:none!important}') &&
  css.includes('.book-stage[data-closed-back="true"] .corner-frame') &&
  css.includes('visibility:hidden') &&
  css.includes('width:min(44%,650px)') &&
  css.includes('pointer-events:none'),
  "only one centered cover, engine retained for iOS re-entry");
assert(!css.includes("background-image:url("),"book cover has no bitmap CDN dependency");
assert(app.includes('function selectCategory(id, origin = "chips")') &&
  app.includes('button.addEventListener("click", () => selectCategory(cat.id, kind))') &&
  app.includes('if (origin === "nav" && window.matchMedia("(min-width:1001px)").matches)') &&
  app.includes('library?.scrollIntoView({'),
  "desktop sidebar auto-displays filtered library");
assert(app.includes('prefers-reduced-motion: reduce') &&
  styles.includes('#library{scroll-margin-top:90px}'),
  "reduced-motion safe and header offset");
assert(/WD_BOOKS_VERSION = "1\.3\.67"/.test(version) &&
  main.includes("เวอร์ชัน 1.3.67") && shell.includes("Update 1.3.67:") &&
  html.includes("corner.js?v=1.3.67"),
  "PWA version/splash/iframe assets synchronized");
console.log("FLIP-12 PASS: 16 page-parity cases, true closed back cover, safe reopen, desktop category navigation, version parity.");
