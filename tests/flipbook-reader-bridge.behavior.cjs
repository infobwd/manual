// FLIP-05 dynamic bridge behavior: no browser/network required.
// Run: node tests/flipbook-reader-bridge.behavior.cjs
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const app = fs.readFileSync(path.join(__dirname, "..", "assets/app.js"), "utf8");
const start = app.indexOf("  // FLIP-05: the original Reader remains the owner");
const end = app.indexOf("  function openBook(book, opener, requestedPage = null) {", start);
assert(start > 0 && end > start, "isolated bridge block exists in Reader");
const bridgeSource = app.slice(start, end);
const factory = new Function("$", "window", "dialog", "state", "closeMobileToc",
  "closeReaderSubpanels", "jumpTo", bridgeSource +
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
  const win = {
    location: {search, origin:"https://infobwd.github.io"},
    navigator: {onLine: online},
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
  const bridge = factory(id => elements[id], win, dialog, state,
    () => { calls.toc++; },
    () => { calls.panels++; },
    page => { calls.jumps.push(page); state.page=page; });
  return {bridge, elements, win, handlers, state, dialog, book, calls};
}
const pilot = setup();
assert.equal(pilot.bridge.eligibleFlipbook(pilot.book), true, "flag allows this published book");
assert.equal(pilot.bridge.eligibleFlipbook({...pilot.book,id:"other"}), false, "unapproved book blocked");
assert.equal(pilot.bridge.eligibleFlipbook({...pilot.book,status:"planned"}), false, "unpublished book blocked");
pilot.bridge.flipChoice.fire("click");
assert.equal(pilot.bridge.flipDialog.open, true, "flip modal opens");
assert.match(pilot.bridge.flipFrame.src, /corner\.html\?/, "loads isolated same-origin preview");
assert.match(pilot.bridge.flipFrame.src, /start=3/, "starts at existing reader chapter");
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

const noFlag=setup("");
assert.equal(noFlag.bridge.eligibleFlipbook(noFlag.book),false,"default flag stays off");
noFlag.bridge.flipChoice.fire("click");
assert.equal(noFlag.bridge.flipDialog.open,false,"cannot open without flag");

const offline=setup("?flip05=1",false);
assert.equal(offline.bridge.flipChoice.disabled,true,"offline control disabled");
offline.bridge.flipChoice.fire("click");
assert.equal(offline.bridge.flipDialog.open,false,"no offline blank overlay");
offline.win.navigator.onLine=true;
(offline.handlers.online||[]).forEach(fn=>fn());
assert.equal(offline.bridge.flipChoice.disabled,false,"reconnected control is usable");
console.log("FLIP-05 behavior PASS: modal lifecycle, origin/frame/book/chapter rejection, progress/focus, opt-in and offline fallback.");
