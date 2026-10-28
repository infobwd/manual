// FLIP-05 — reader-choice integration static gates. Run: node tests/flipbook-reader-choice.smoke.cjs
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const html = read("index.html");
const app = read("assets/app.js");
const experience = read("assets/experience.js");
const sw = read("sw.js");
const version = read("assets/app-version.js");
const style = read("assets/reader-flip-choice.css");
const corner = read("experiments/flipbook-pilot/corner.js");
const preview = read("experiments/flipbook-pilot/corner.html");
const catalog = read("assets/manuals-data.js");
new vm.Script(app, {filename:"assets/app.js"});
new vm.Script(corner, {filename:"corner.js"});
const context = { window: {} };
vm.runInNewContext(catalog, context, {timeout: 4000});
const books = context.window.WD_LIBRARY_DATA.manuals;
const pilotId = "ai-five-questions-speaker-cheatsheet-25691026";
const eligible = books.filter(x => x.id === pilotId && x.status === "published" && x.pages?.length);
assert.equal(eligible.length, 1, "test book exists as published, public-only");
assert.equal(eligible[0].pages.length, 12, "12 source chapters retained");
assert(app.includes('const flip05Enabled = new URLSearchParams(window.location.search).get("flip05") === "1"'),
  "Reader choice is opt-in, OFF by default");
assert(app.includes('book?.id === FLIP05_BOOK') && app.includes('book.status === "published"'),
  "only the tested published book is eligible");
assert(app.includes('flipChoice.hidden = !eligibleFlipbook(book)'), "hidden for other books");
assert(html.includes('id="readerFlipbookChoice"') && html.includes('id="wdFlipbookDialog"') &&
  html.includes('id="wdFlipbookFrame"') && html.includes('id="wdFlipbookClose"'), "isolated controls exist");
assert(html.includes('src="about:blank"'), "iframe unloaded by default");
assert(app.includes('flipFrame.src = "about:blank"'), "iframe cleared on close");
assert(app.includes('event.source !== flipFrame.contentWindow') &&
  app.includes('event.origin !== window.location.origin'), "postMessage must be same origin and iframe");
assert(app.includes('data.bookId !== flipSession.bookId') &&
  app.includes('Number.isInteger(data.chapter)'), "message scoped to book and valid chapter");
assert(app.includes('jumpTo(pending.lastChapter)') && app.includes('flipChoice.focus()'),
  "return to Reader and restore focus and chapter");
assert(app.includes('dialog.addEventListener("close", () => {\n    if (flipDialog.open) flipDialog.close();'),
  "close nested modal if original Reader closes");
assert(!app.includes('state.readingMode = "flipbook"') && experience.includes('readingMode: "paged"'),
  "never change legacy persisted reading mode schema");
assert(!app.includes("localStorage.setItem("), "no new direct Reader storage writes");
assert(corner.includes('requestedId === PILOT_ID') && corner.includes('item.status === "published"'),
  "preview enforces server-independent public-only book gate");
assert(corner.includes('state.initialChapter') && corner.includes('query.get("start")'),
  "preview can start at current source chapter");
assert(corner.includes('type: "wd:flip05:chapter"') &&
  corner.includes('window.parent.postMessage('), "preview sends chapter to parent");
assert(corner.includes('document.body.classList.add("flip-embedded")') &&
  style.includes("wd-flip-dialog") && html.includes('reader-flip-choice.css'),
  "scoped embedded layout is present");
assert(sw.includes('reader-flip-choice.css') && /WD_BOOKS_VERSION = "1\.3\.56"/.test(version) &&
  html.includes("เวอร์ชัน 1.3.56"), "PWA version and app-shell cache updated together");
assert(!sw.includes('corner.js') && !sw.includes("page-flip.browser.min.js"),
  "heavy preview not precached for all app installs");
assert(!/<script[^>]+src=["']https?:/i.test(preview), "preview no runtime CDN");
console.log("FLIP-05 static PASS: opt-in, public-only, modal lifecycle, safe bridge, schema parity and PWA cache/version.");
