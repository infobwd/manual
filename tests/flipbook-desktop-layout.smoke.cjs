// FLIP-09 desktop layout and mobile return release contract.
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const dialog=read("assets/reader-flip-choice.css");
const css=read("experiments/flipbook-pilot/corner.css");
const page=read("index.html");
const shell=read("sw.js");
const version=read("assets/app-version.js");
const host=read("assets/app.js");
const child=read("experiments/flipbook-pilot/corner.js");
assert(dialog.includes("@media screen and (min-width:1101px)") &&
  dialog.includes("width:min(94vw,1760px)") &&
  dialog.includes("height:min(94dvh,1120px)"),
  "desktop modal must use available monitor space");
assert(css.includes("body.flip-embedded .reading-surface") &&
  css.includes("flex:1 1 auto") &&
  css.includes("body.flip-embedded .book-stage") &&
  css.includes("width:min(100%,calc((100dvh - 146px)*1.54),1380px)"),
  "desktop book must expand within viewport and keep controls outside page area");
assert(css.includes("font-size:calc(18.5px * var(--font-scale))"),
  "desktop measured and rendered Sarabun paper must be readable");
assert(css.includes("body.flip-embedded .navigator"),"desktop nav remains visible");
assert(page.includes('id="wdFlipbookReturnBottom"'),"mobile exit belongs to parent dialog");
assert(dialog.includes(".wd-flip-dialog[open] .wd-flip-return-overlay") &&
  dialog.includes("z-index:10") &&
  dialog.includes("touch-action:manipulation"),
  "parent return overlays the bottom-right navigation cell");
assert(host.includes('window.WD_BOOKS_FLIP_EXIT = closeFlipbook') &&
  host.includes('flipReturnBottom.addEventListener("click", returnFromParentButton)'),
  "synchronous parent-owned return bypasses iframe messaging");
assert(child.includes('window.parent.WD_BOOKS_FLIP_EXIT(window, book.id, chapter)') &&
  child.includes('type: "wd:flip08b:exit"'),
  "child uses direct path, keeps postMessage compatibility fallback");
assert(host.includes('sourceWindow !== flipFrame.contentWindow') &&
  host.includes('bookId !== flipSession.bookId'),"direct return checks frame and book");
assert(page.includes("เวอร์ชัน 1.3.64") &&
  /WD_BOOKS_VERSION = "1\.3\.64"/.test(version) &&
  shell.includes("Update 1.3.64:"),"app/SW/splash release synchronized");
assert(!shell.includes('"./experiments/flipbook-pilot/corner.js"'),
  "heavy preview is not pre-cached for all users");
console.log("FLIP-09 layout PASS: responsive spreads, Sarabun, trusted parent return, version/cache.");
