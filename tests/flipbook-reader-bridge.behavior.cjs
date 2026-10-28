// FLIP-05 dynamic bridge behavior: no browser/network required.
// Run: node tests/flipbook-reader-bridge.behavior.cjs
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const {URLSearchParams} = require("node:url");
const app = fs.readFileSync(path.join(__dirname, "..", "assets/app.js"), "utf8");
const version = fs.readFileSync(path.join(__dirname, "..", "assets/app-version.js"), "utf8").match(/WD_BOOKS_VERSION = "([^"]+)"/)?.[1];
assert(version, "central PWA version exists");
const start = app.indexOf("  // FLIP-06: PWA launches do not preserve");
const end = app.indexOf("  function openBook(book, opener, requestedPage = null) {", start);
assert(start > 0 && end > start, "isolated bridge block exists in Reader");
const bridgeSource = app.slice(start, end);
const factory = new Function("$", "window", "document", "dialog", "state", "closeMobileToc",
  "closeReaderSubpanels", "jumpTo", "URLSearchParams", bridgeSource +
    "\nreturn { eligibleFlipbook, flipChoice, flipDialog, flipFrame, getSession: () => flipSession };\n");
function node() {
  return {
    hidden: true, disabled: false, open: false, title: "", focused: false,
    handlers: {},
    contentWindow: {},
    addEventListener(type, callback) { (this.handlers[type] ||= []).push(callback); },
    fire(type, event = {}) { (this.handlers[type] || []).forEach(callback => callback(event)); },
    showModal() { this.open = true; },
    close() { this.open = false; this.fire("close"); },
    focus() { this.focused = true; }
  };
}
function setup(search = "?flip05=1", online = true) {
  const ids = ["readerFlipbookChoice", "wdFlipbookDialog", "wdFlipbookFrame", "wdFlipbookClose"];
  const elements = Object.fromEntries(ids.map(id => [id, node()]));
  elements.wdFlipbookFrame.src = "about:blank";
  const handlers = {};
  const themeChanges = [];
  const win = {
    WD_EXPERIENCE: {setTheme(theme) { themeChanges.push(theme); }},
    location: {search, origin:"https://infobwd.github.io"},
    navigator: {onLine: online},
    WD_BOOKS_VERSION: version,
    matchMedia: () => ({matches:false}),
    addEventListener(type, cb) { (handlers[type] ||= []).push(cb); }
  };
  const book = {
    id:"ai-five-questions-speaker-cheatsheet-25691026",
    status:"published", pages:Array.from({length:12}, (_, i) => ({title:"Chapter " + i}))
  };
  const state = { manual: book, page: 3 };
  const dialog = node();
  dialog.open = true;
  const calls = {toc:0,panels:0,jumps:[]};
  const doc = {documentElement:{classList:{contains:()=>false}},body:{dataset:{theme:"night"}}};
  const bridge = factory(id => elements[id], win, doc, dialog, state,
    () => { calls.toc++; },
    () => { calls.panels++; },
    page => { calls.jumps.push(page); state.page=page; }, URLSearchParams);
  return {bridge, elements, win, handlers, state, dialog, book, calls, themeChanges};
}
const pilot = setup();
assert.equal(pilot.bridge.eligibleFlipbook(pilot.book), true, "published book is eligible");
assert.equal(pilot.bridge.eligibleFlipbook({...pilot.book,id:"other"}), false, "unapproved book blocked");
assert.equal(pilot.bridge.eligibleFlipbook({...pilot.book,status:"planned"}), false, "unpublished book blocked");
pilot.bridge.flipChoice.fire("click");
assert.equal(pilot.bridge.flipDialog.open, true, "flip modal opens");
assert.match(pilot.bridge.flipFrame.src, /corner\.html\?/, "loads isolated same-origin preview");
assert.match(pilot.bridge.flipFrame.src, /start=3/, "starts at existing reader chapter");
assert.equal(new URLSearchParams(pilot.bridge.flipFrame.src.split("?")[1]).get("v"),version,
  "iframe receives current PWA release for cache busting");
assert.equal(new URLSearchParams(pilot.bridge.flipFrame.src.split("?")[1]).get("theme"),"night",
  "iframe inherits existing Reader night theme");
assert.equal(pilot.calls.toc, 1);
assert.equal(pilot.calls.panels, 1);
const winFrame = pilot.bridge.flipFrame.contentWindow;
const send = (chapter, origin = pilot.win.location.origin, source = winFrame, bookId = pilot.book.id) =>
  (pilot.handlers.message || []).forEach(fn => fn({
    origin,source,data:{type:"wd:flip05:chapter",bookId,chapter}
  }));
send(7,"https://attacker.example");
assert.equal(pilot.bridge.getSession().lastChapter,null,"cross-origin message rejected");
send(7,pilot.win.location.origin,{});
assert.equal(pilot.bridge.getSession().lastChapter,null,"other iframe rejected");
send(7,pilot.win.location.origin,winFrame,"another-book");
assert.equal(pilot.bridge.getSession().lastChapter,null,"other book rejected");
send(12);
assert.equal(pilot.bridge.getSession().lastChapter,null,"out-of-range chapter rejected");
send("7");
assert.equal(pilot.bridge.getSession().lastChapter,null,"non-numeric chapter rejected");
send(7);
assert.equal(pilot.bridge.getSession().lastChapter,7,"valid iframe chapter accepted");
const sendTheme = (theme, origin = pilot.win.location.origin, source = winFrame, bookId = pilot.book.id) =>
  (pilot.handlers.message || []).forEach(fn => fn({
    origin,source,data:{type:"wd:flip08a:theme",bookId,theme}
  }));
sendTheme("night","https://attacker.example");
sendTheme("night",pilot.win.location.origin,{});
sendTheme("night",pilot.win.location.origin,winFrame,"another-book");
sendTheme("invalid");
sendTheme("sepia"); // Flip toggle is intentionally light/night only.
assert.deepEqual(pilot.themeChanges,[],"invalid or unrelated theme messages are rejected");
sendTheme("light");
sendTheme("night");
assert.deepEqual(pilot.themeChanges,["light","night"],
  "valid same-origin same-book theme goes through WD_EXPERIENCE");
assert.equal(pilot.bridge.getSession().lastChapter,7,"theme updates do not change chapter");
pilot.elements.wdFlipbookClose.fire("click");
assert.equal(pilot.bridge.flipDialog.open,false);
assert.deepEqual(pilot.calls.jumps,[7],"return syncs legacy Reader once");
assert.equal(pilot.state.page,7,"Reader chapter updated");
assert.equal(pilot.bridge.flipFrame.src,"about:blank","hidden iframe destroyed");
assert.equal(pilot.bridge.flipChoice.focused,true,"focus returns to Reader button");

pilot.bridge.flipChoice.fire("click");
pilot.dialog.close();
assert.equal(pilot.bridge.flipDialog.open,false,"nested modal closes with parent");
assert.equal(pilot.bridge.flipFrame.src,"about:blank","frame cleared on parent close");

// FLIP-08B: iframe exit shares the same trusted origin/source/book gate and
// restores current reading chapter before releasing the iframe.
const inline=setup("");
inline.bridge.flipChoice.fire("click");
const trustedFrame=inline.elements.wdFlipbookFrame.contentWindow;
function postExit(chapter, origin=inline.win.location.origin, source=trustedFrame, bookId=inline.book.id) {
  (inline.handlers.message||[]).forEach(fn=>fn({
    origin, source, data:{type:"wd:flip08b:exit",bookId,chapter}
  }));
}
postExit(5,"https://attacker.example");
postExit(5,inline.win.location.origin,{});
postExit(5,inline.win.location.origin,trustedFrame,"another-book");
assert.equal(inline.bridge.flipDialog.open,true,"untrusted exit cannot close dialog");
postExit(5);
assert.equal(inline.bridge.flipDialog.open,false,"trusted inline exit closes flipbook");
assert.deepEqual(inline.calls.jumps,[5],"inline exit restores last chapter");
assert.equal(inline.elements.wdFlipbookFrame.src,"about:blank","inline exit unloads iframe");
assert.equal(inline.bridge.flipChoice.focused,true,"inline exit restores Reader focus");
const badChapter=setup("");
badChapter.bridge.flipChoice.fire("click");
const badSource=badChapter.elements.wdFlipbookFrame.contentWindow;
(badChapter.handlers.message||[]).forEach(fn=>fn({
  origin:badChapter.win.location.origin,source:badSource,
  data:{type:"wd:flip08b:exit",bookId:badChapter.book.id,chapter:999}
}));
assert.equal(badChapter.bridge.flipDialog.open,false,"valid exit with invalid chapter still returns");
assert.deepEqual(badChapter.calls.jumps,[],"invalid exit chapter cannot alter Reader position");

const homeScreen=setup("");
assert.equal(homeScreen.bridge.eligibleFlipbook(homeScreen.book),true,
  "Home Screen PWA must show the tested book without query params");
homeScreen.bridge.flipChoice.fire("click");
assert.equal(homeScreen.bridge.flipDialog.open,true,
  "PWA without query params opens the approved public book");
homeScreen.bridge.flipDialog.close();
const notApproved=setup("");
notApproved.state.manual={...notApproved.book,id:"another-book"};
notApproved.bridge.flipChoice.fire("click");
assert.equal(notApproved.bridge.flipDialog.open,false,
  "Another book remains blocked");

const offline=setup("?flip05=1",false);
assert.equal(offline.bridge.flipChoice.disabled,true,"offline control disabled");
offline.bridge.flipChoice.fire("click");
assert.equal(offline.bridge.flipDialog.open,false,"no offline blank overlay");
offline.win.navigator.onLine=true;
(offline.handlers.online||[]).forEach(fn=>fn());
assert.equal(offline.bridge.flipChoice.disabled,false,"reconnected control is usable");
console.log("FLIP-06 behavior PASS: PWA access, book-only gate, modal, origin and offline fallback.");
