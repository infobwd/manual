// WD Books FLIP-11 — default realistic book for compatible public content.
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const catalogSource=read("assets/manuals-data.js");
const gate=read("assets/flipbook-capability.js");
const host=read("assets/app.js");
const child=read("experiments/flipbook-pilot/corner.js");
const html=read("index.html"), preview=read("experiments/flipbook-pilot/corner.html");
const css=read("experiments/flipbook-pilot/corner.css");
const sw=read("sw.js"), version=read("assets/app-version.js");
new vm.Script(gate);new vm.Script(host);new vm.Script(child);
const context={window:{}};
vm.runInNewContext(catalogSource,context);
vm.runInNewContext(gate,context);
const supported=context.window.WD_FLIP_CAPABILITY.supports;
const publicBooks=context.window.WD_LIBRARY_DATA.manuals.filter(b=>b.status==="published");
const yes=publicBooks.filter(supported);
const no=publicBooks.filter(b=>!supported(b));
assert.equal(publicBooks.length,15,"published public catalog count");
assert.equal(yes.length,15,"all 15 catalog public books should qualify after SAR parity");
assert.equal(no.length,0,"all present catalog published schemas are supported");
assert.equal(publicBooks.filter(b=>b.pages.some(p=>p.chart||p.insight)).length,2,"both SAR chart books must remain present");
assert(yes.some(b=>b.id==="ai-five-questions-speaking-handbook-25691026"),
  "speaking handbook now qualifies");
assert(supported({...yes[0],status:"planned"})===false,"unpublished blocked");
assert(supported({...yes[0],pages:[{title:"x",chart:{}}]})===false,"unsupported content blocked");
assert(supported({...yes[0],pages:[{title:"x",paragraphs:["ok",null]}]})===false,
  "unsafe paragraph types blocked");
assert(host.includes("window.WD_FLIP_CAPABILITY?.supports?.(book) === true"),
  "Reader uses shared strict gate");
assert(child.includes("window.WD_FLIP_CAPABILITY?.supports?.(requestedBook)"),
  "renderer independently checks the exact same gate");
assert(html.indexOf("flipbook-capability.js") < html.indexOf('src="./assets/app.js"'),
  "gate loads before main Reader");
assert(preview.indexOf("flipbook-capability.js") < preview.indexOf('src="./corner.js'),
  "gate loads before renderer");
assert(sw.includes('"./assets/flipbook-capability.js"'),"new gate cached for offline legacy app");
assert(host.includes("if (!options.legacy && eligibleFlipbook(book) && isFlipOnline())") &&
  host.includes("flipChoice.click()"),"ordinary shelf/open reading defaults to Flipbook");
assert(host.includes('openBook(target, document.getElementById("wdAudioMini"), chapter, {legacy:true})'),
  "audio deep link bypasses book animation");
assert(host.includes('if (data.type === "wd:flip11:unavailable")') &&
  child.includes('type:"wd:flip11:unavailable"'),
  "renderer failure must return to legacy Reader");
assert(host.includes('flipDialog.addEventListener("close"') &&
  host.includes('jumpTo(pending.lastChapter)'),
  "leaving default book resumes in conventional Reader");
assert(css.includes(".corner-frame::before") &&
  css.includes("repeating-linear-gradient") &&
  css.includes("body[data-flip-theme=\"night\"] .corner-frame::before") &&
  css.includes("pointer-events:none") &&
  css.includes(".corner-sheet .paper:not(.cover):not(.blank)"),
  "page thickness, paper surface and dark mode must be present");
assert(!css.includes("url("),"no external image texture to slow page turns");
assert(!host.includes('state.readingMode = "flipbook"'),"original stored Reader schema preserved");
assert(!child.includes("localStorage.setItem("),"no parallel reading-progress database");
assert(/WD_BOOKS_VERSION = "1\.3\.68"/.test(version) &&
  html.includes("เวอร์ชัน 1.3.68") && sw.includes("Update 1.3.68:"),
  "PWA version, splash, and Service Worker synchronized");
console.log("FLIP-11/14 PASS: 15/15 default physical books, SAR data-safe rendering, audio/offline preservation, paper material, release 1.3.68.");
