// FLIP-10: native-style phone/iPad reader controls + PWA guard.
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8");
const html=read("index.html"), host=read("assets/app.js");
const childHtml=read("experiments/flipbook-pilot/corner.html");
const childJs=read("experiments/flipbook-pilot/corner.js");
const parentCss=read("assets/reader-flip-choice.css");
const childCss=read("experiments/flipbook-pilot/corner.css");
const version=read("assets/app-version.js");
const sw=read("sw.js");
new vm.Script(host);
new vm.Script(childJs);
const release=/WD_BOOKS_VERSION = "([^"]+)"/.exec(version)?.[1];
assert.equal(release,"1.3.65");
assert(html.includes("เวอร์ชัน "+release)&&sw.includes("Update "+release+":"),
  "shell, splash and Service Worker share release");
for (const id of ["wdFlipbookTocTrigger","wdFlipbookToolsTrigger","wdFlipbookAudioTrigger",
  "wdFlipbookMobileTitle","wdFlipbookReturnBottom"]) {
  assert(html.includes('id="'+id+'"'),"Reader host has "+id);
}
for (const id of ["flipTocSheet","flipTocClose","flipTocItems","flipToolsDismiss",
  "returnToReader","progress","prev","next","chapter","fontSize","themeButton","motionButton"]) {
  assert(childHtml.includes('id="'+id+'"'),"embedded Flipbook has "+id);
}
assert(html.includes('id="openMobileToc"')&&html.includes('id="readerAudioToggle"')&&
  html.includes('id="readerToolsToggle"')&&html.includes('id="readerClose"'),
  "original Reader controls remain intact");
assert(parentCss.includes("@media screen and (max-width:1100px)")&&
  parentCss.includes(".wd-flip-mobile-controls")&&
  parentCss.includes(".wd-flip-dialog[open] .wd-flip-return-overlay"),
  "host mobile/tablet top and bottom controls are visible");
assert(childCss.includes("grid-template-columns:minmax(80px,1.08fr)")&&
  childCss.includes("body.flip-embedded .flip-reader-sheet:not([hidden])")&&
  childCss.includes("body.flip-embedded.flip-tools-open .toolbar"),
  "phone/tablet has a four-control navigation row, TOC and real tools");
assert(childCss.includes("@media screen and (min-width:691px) and (max-width:1100px)"),
  "iPad breakpoint is included");
assert(host.includes('flipTocTrigger.addEventListener("click"')&&
  host.includes('flipToolsTrigger.addEventListener("click"')&&
  host.includes('flipAudioTrigger.addEventListener("click"'),
  "Reader-like toolbar actions perform real work");
assert(host.includes('$("readerAudioToggle")?.click()')&&
  host.includes("flipAudioRequested"),
  "audio returns to legacy Reader and opens its existing panel without autoplay");
assert(host.includes('event.source !== flipFrame.contentWindow')&&
  host.includes('event.origin !== window.location.origin')&&
  host.includes('data.bookId !== flipSession.bookId'),
  "embedded sheet notifications must pass existing origin, frame and book checks");
assert(childJs.includes("WD_BOOKS_FLIP_CONTROLS = Object.freeze")&&
  childJs.includes("navigateToChapter(index)")&&
  childJs.includes('el("flipTocItems").querySelectorAll'),
  "chapter list is interactive and tracks currently visible chapter");
assert(!host.includes('state.readingMode = "flipbook"')&&
  !childJs.includes("localStorage.setItem"),
  "existing Reader mode and stored progress are not replaced");
assert(childHtml.includes("corner.css?v="+release)&&
  childHtml.includes("corner.js?v="+release),
  "embedded flipbook assets are refreshed by version");
console.log("FLIP-10 static PASS: normal-like Reader buttons on iPhone/iPad, native audio handoff, same-origin sheets, no new storage schema.");
