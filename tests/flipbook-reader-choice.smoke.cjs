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
assert(!app.includes("flip05Enabled") && !app.includes('get("flip05")'),
  "Home Screen PWA must not require a URL query flag");
assert(html.indexOf('id="readerFlipbookChoice"') > html.indexOf('id="readerExtraTools"') &&
  html.indexOf('id="readerFlipbookChoice"') < html.indexOf('id="readerFocusToggle"'),
  "Flipbook first in tools menu");
assert(app.includes('window.WD_FLIP_CAPABILITY?.supports?.(book) === true') &&
  html.includes('src="./assets/flipbook-capability.js"'),
  "shared public content gate replaces single-book pilot check");
assert(app.includes('flipChoice.hidden = !eligibleFlipbook(book)'), "hidden for other books");
assert(app.includes('flipChoice.disabled = disabled') && app.includes('window.addEventListener("offline", syncFlipConnectivity)'),
  "online-only preview must be disabled while offline, legacy Reader unaffected");
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
assert(corner.includes('window.WD_FLIP_CAPABILITY?.supports?.(requestedBook)') &&
  preview.includes('src="../../assets/flipbook-capability.js"'),
  "Flipbook enforces same schema/content gate as Reader");
assert(corner.includes('state.initialChapter') && corner.includes('query.get("start")'),
  "preview can start at current source chapter");
assert(corner.includes('type: "wd:flip05:chapter"') &&
  corner.includes('window.parent.postMessage('), "preview sends chapter to parent");
assert(corner.includes('document.body.classList.add("flip-embedded")') &&
  style.includes("wd-flip-dialog") && html.includes('reader-flip-choice.css'),
  "scoped embedded layout is present");
const release = /WD_BOOKS_VERSION = "([^"]+)"/.exec(version)?.[1];
assert(release && sw.includes('reader-flip-choice.css') &&
  sw.includes('importScripts("./assets/app-version.js")') &&
  html.includes("เวอร์ชัน " + release),
  "PWA splash, service worker, and central version agree");
assert(!sw.includes('corner.js') && !sw.includes("page-flip.browser.min.js"),
  "heavy preview not precached for all app installs");
assert(!/<script[^>]+src=["']https?:/i.test(preview), "preview no runtime CDN");
console.log("FLIP-07/08 static PASS: visible PWA choice, public book gate, safe bridge and release " + release + ".");
