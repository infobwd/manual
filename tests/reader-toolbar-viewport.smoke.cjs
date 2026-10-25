// Run: node tests/reader-toolbar-viewport.smoke.cjs
// Narrow/wide UI behavior test, no browser/network/user data.
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const code = fs.readFileSync(path.join(root, "assets/app.js"), "utf8");
const start = code.indexOf('  const toolsToggle = $("readerToolsToggle")');
const end = code.indexOf('  const bookmarkToggle = $("readerBookmarkToggle")');
assert.ok(start > 0 && end > start, "Expected Reader toolbar section is present");
const section = code.slice(start, end);
function runToolbar(viewport) {
  let width = viewport;
  const listeners = [];
  const nodes = {};
  const get = (id) => nodes[id] ||= {
    hidden: true,
    attrs: {},
    handlers: {},
    setAttribute(key, value) { this.attrs[key] = value; },
    addEventListener(type, fn) { (this.handlers[type] ||= []).push(fn); },
    click() { this.emit("click", {target:{closest:()=>null}}); },
    focus() {},
    emit(type, event = {}) { for (const fn of this.handlers[type] || []) fn(event); }
  };
  const dialog = get("dialog");
  const window = {
    matchMedia(query) {
      return {
        matches: query.includes("min-width") ? width >= 1101 : width <= 1100,
        addEventListener(type, fn) {
          if (type === "change") listeners.push(fn);
        }
      };
    }
  };
  const context = { $, dialog, window, closeReaderSubpanels() {} };
  function $(id) { return get(id); }
  vm.runInNewContext(section, context, {filename:"assets/app.js toolbar section"});
  const tools = get("readerExtraTools");
  const more = get("readerToolsToggle");
  const toolButton = {target:{closest(selector) {
    return selector === "button" ? {} : null;
  }}};
  return {
    tools, more,
    selectTool() { tools.emit("click", toolButton); },
    changeViewport(newWidth) {
      width = newWidth;
      for (const fn of listeners) fn();
    }
  };
}
const desktop = runToolbar(1366);
assert.equal(desktop.tools.hidden, false, "Desktop toolbar is initially visible");
desktop.selectTool();
assert.equal(desktop.tools.hidden, false, "Desktop toolbar remains visible after focus/Aa/search click");
desktop.selectTool();
assert.equal(desktop.tools.hidden, false, "Repeated desktop tool clicks never strand toolbar");
const tablet = runToolbar(1032);
assert.equal(tablet.tools.hidden, true, "Compact toolbar initially collapsed");
tablet.more.emit("click");
assert.equal(tablet.tools.hidden, false, "Compact overflow menu reopens");
tablet.selectTool();
assert.equal(tablet.tools.hidden, true, "Compact overflow menu closes after choosing a tool");
tablet.more.emit("click");
assert.equal(tablet.tools.hidden, false, "Tools remain accessible on repeated taps");
tablet.changeViewport(1376);
assert.equal(tablet.tools.hidden, false, "Rotating to wide restores persistent toolbar");
tablet.selectTool();
assert.equal(tablet.tools.hidden, false, "Wide toolbar still visible after orientation change");
tablet.changeViewport(1032);
assert.equal(tablet.tools.hidden, true, "Rotating back to portrait collapses compact menu");
const html = fs.readFileSync(path.join(root,"index.html"),"utf8");
assert.ok(html.includes('<span class="tool-label">โหมดอ่าน</span>'), "Focus control must not claim browser fullscreen");
const css = fs.readFileSync(path.join(root,"assets/mobile-reader.css"),"utf8");
assert.ok(css.includes("UX-P0D-R: take advantage"), "Tablet height override must remain");
console.log("PASS: desktop toolbar stays visible, tablet tools reopen, responsive mode switches");
