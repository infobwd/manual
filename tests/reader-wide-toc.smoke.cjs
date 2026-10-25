// UX-P0D-R3 + UX-DESKTOP-TOC-PIN regression, Node only, no dependencies.
// node tests/reader-wide-toc.smoke.cjs
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const css = read("assets/mobile-reader.css");
const source = read("assets/app.js");
const html = read("index.html");
const layout = css.slice(css.indexOf("/* UX-P0D-R3"));
assert.ok(layout.startsWith("/* UX-P0D-R3"), "Tablet/Desktop layout overrides must exist");
assert.match(layout, /@media screen and \(min-width:851px\) and \(max-width:1100px\)/);
assert.match(layout, /@media screen and \(min-width:1101px\)/);
assert.match(layout, /width:min\(100%,960px\)/);
assert.match(layout, /max-width:960px/);
assert.match(layout, /width:min\(100%,1320px\)/);
assert.match(layout, /max-width:1320px/);
assert.match(layout, /reader-toc\s*\{[^}]*position:sticky;[^}]*overflow-y:auto;[^}]*overscroll-behavior-y:contain/s);
assert.match(layout, /body\.reader-open\s*\{overflow:hidden;overscroll-behavior:none\}/);
assert.match(layout, /#pageLeft:not\(\.blank-page\)\s*>\s*\*\s*\{\s*flex-shrink:0/s);
assert.match(read("assets/toc-p0b.css"), /@media\(max-width:1100px\)/);
assert.match(source, /const isMobile = window\.matchMedia\("\(max-width: 1100px\)"\)/);
assert.match(html, /id="openMobileToc"/);
assert.match(html, /id="readerClose"/);
assert.ok(!read("assets/app-version.js").includes('"1.3.35"'), "PWA CSS must get a fresh cache version");

// Run the actual renderToc body in a minimal DOM to catch scroll reset.
const start = source.indexOf("  function renderToc() {");
const end = source.indexOf("  function renderMobileToc() {", start);
assert.ok(start > 0 && end > start, "TOC renderer must be present");
const section = source.slice(start, end);
const side = {scrollTop:420};
const toc = {
  children:[],
  closest(selector) {return selector === ".reader-toc" ? side : null;},
  replaceChildren(...nodes) {
    this.children = nodes;
    side.scrollTop = 0; // A destructive rerender must not reset reader's TOC.
  }
};
const $ = id => id === "tocItems" ? toc : null;
const state = {
  manual:{pages:Array.from({length:25},(_,i)=>({title:"บท "+(i+1)}))},
  page:16, readingMode:"paged"
};
const isMobile = {matches:false};
const create = (tag, cls, value) => ({
  tag, cls, value, children:[], attrs:{}, handlers:{},
  classList:{toggle(name, active) {this.active=active;}},
  setAttribute(name, val) {this.attrs[name] = val;},
  append(...items) {this.children.push(...items);},
  addEventListener(type, handler) {this.handlers[type]=handler;}
});
const renderToc = new Function("$","state","isMobile","create",section+"return renderToc")($,state,isMobile,create);
renderToc();
assert.equal(toc.children.length,25);
assert.equal(side.scrollTop,420,"TOC must remain at manually scrolled position");
assert.equal(toc.children[16].attrs["aria-current"],"page");
state.page=18;renderToc();
assert.equal(side.scrollTop,420,"Next-page click cannot jump the TOC back to its top");
assert.equal(toc.children[18].attrs["aria-current"],"page");
assert.ok(!source.includes("savedTocScroll = 0"), "TOC state cannot be reset each turn");
console.log("PASS: width overrides, independent sidebar scroll, TOC position after page change");
