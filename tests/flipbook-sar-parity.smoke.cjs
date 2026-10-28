// FLIP-14: entire production public catalog available inside iframe;
 // SAR charts + insights must be preserved, never dropped to force eligibility.
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm");
const read = name => fs.readFileSync(path.join(__dirname, "..", name), "utf8");
const shellHtml = read("index.html");
const flipHtml = read("experiments/flipbook-pilot/corner.html");
const flipJs = read("experiments/flipbook-pilot/corner.js");
const flipCss = read("experiments/flipbook-pilot/corner.css");
const gateSource = read("assets/flipbook-capability.js");
const modules = [
  "assets/manuals-data.js",
  "assets/wd-growth-individual-guide.js",
  "assets/wd-growth-plc-information-guide.js",
  "assets/bwd-term2-supervision-readiness-2569.js"
];
new vm.Script(flipJs);
new vm.Script(gateSource);
for (const file of modules) {
  new vm.Script(read(file));
  const relative = "../../" + file;
  assert(flipHtml.includes('src="' + relative + '"'), "iframe missing published module " + file);
  assert(shellHtml.includes('src="./' + file + '"'), "parent missing published module " + file);
  assert(flipHtml.indexOf(relative) < flipHtml.indexOf("flipbook-capability.js"),
    "public guides must load before checking their schema");
}
const scope = { window: {} };
for (const file of modules) vm.runInNewContext(read(file), scope, { timeout: 3000 });
vm.runInNewContext(gateSource, scope);
const books = scope.window.WD_LIBRARY_DATA.manuals;
const publicBooks = books.filter(book => book.status === "published");
const supports = scope.window.WD_FLIP_CAPABILITY.supports;
assert.equal(publicBooks.length, 18, "full public catalog includes module-loaded guides");
assert.equal(publicBooks.filter(supports).length, 18, "all published public schemas supported");
for (const id of ["wd-growth-individual-plan", "wd-growth-plc-information-to-action-2569",
  "bwd-term2-supervision-readiness-2569"]) {
  assert(publicBooks.some(book => book.id === id && supports(book)), id + " must open Flipbook");
}
const sar = publicBooks.filter(book => book.pages.some(page => page.chart || page.insight));
assert.equal(sar.length, 2, "two SAR titles with complex layout");
assert.equal(sar.reduce((sum, book) => sum + book.pages.filter(page => page.chart).length, 0), 4,
  "all four chart page groups are retained");
assert.equal(sar.reduce((sum, book) => sum + book.pages.filter(page => page.insight).length, 0), 5,
  "all five insights are retained");
for (const book of sar) {
  assert(supports(book), "SAR content must qualify only with faithful renderer support");
  assert(!supports({ ...book, pages: [{ title: "unknown", chart: { kind: "other", rows: [] } }] }),
    "unsupported chart kind falls back to normal Reader");
  assert(!supports({ ...book, pages: [{ title: "unknown", insight: { headline: "ok", unknown: "hidden" } }] }),
    "unknown insight fields may not be dropped");
  assert(!supports({ ...book, pages: [{ title: "unknown", chart: {
    kind: "target-result", rows: [{label: "x", target: 101, result: 60}]
  } }] }), "out-of-range percentage fails closed");
  assert(!supports({ ...book, status: "planned" }), "nonpublic book not exposed");
}
assert(flipJs.includes("if (source.chart) appendChart(source.chart)") &&
  flipJs.includes("if (source.insight) appendInsight(source.insight)") &&
  flipJs.includes("appendAtomic(figure)") &&
  flipJs.includes('track.setAttribute("aria-hidden", "true")'), "faithful figures, text values and bounded pagination");
assert(flipCss.includes("FLIP-14: compact") &&
  flipCss.includes('body[data-flip-theme="night"] .page-content .flip-sar-chart') &&
  flipCss.includes('body[data-flip-theme="sepia"] .page-content .flip-sar-chart'),
  "all three paper themes support SAR figures");
/* Regression: measure a heading and its first chart row/insight line as one pair.
   Execute the live helper against a deterministic measured DOM fixture, not
   only a text-pattern check. These cases cover spare room, page breaks and
   an oversized pair fallback without losing the existing source nodes. */
const open = flipJs.indexOf("    function appendPaired(first, second) {");
const end = flipJs.indexOf("\n    function appendChart(", open);
assert(open > 0 && end > open, "keep-with-next paginator helper is present");
const pairedBody = flipJs.slice(open, end);
const buildPair = new Function("controls", `
  let current = controls.initial;
  const section = 2;
  const contentFits = paper =>
    paper.area.children.reduce((sum, node) => sum + node.height, 0) <= paper.limit;
  function freshPage() { current = controls.freshPage(); }
  ${pairedBody}
  return (first, second) => ({ok:appendPaired(first, second), current});
`);
function fakeNode(height) {
  return {height, parent:null, remove() {
    if (!this.parent) return;
    const i = this.parent.children.indexOf(this);
    if (i >= 0) this.parent.children.splice(i, 1);
    this.parent = null;
  }};
}
function fakePage(limit, ...nodes) {
  const area = {children:[],append(...items) {
    for (const item of items) { item.remove(); item.parent=this; this.children.push(item); }
  }};
  const page = {limit,area,querySelector:name=>name===".page-content"?area:null};
  area.append(...nodes);
  return page;
}
{
  const old = fakeNode(30), title=fakeNode(15), chart=fakeNode(35);
  const initial=fakePage(100,old);
  let created=0;
  const outcome=buildPair({initial,freshPage:()=>{created++;return fakePage(100)}})(title,chart);
  assert(outcome.ok && outcome.current === initial && created===0,
    "heading and chart stay on an existing page when both fit");
  assert.deepEqual(initial.area.children.map(n=>n.height),[30,15,35]);
}
{
  const old=fakeNode(75), title=fakeNode(20), chart=fakeNode(35);
  const initial=fakePage(100,old);
  let created=0;
  const outcome=buildPair({initial,freshPage:()=>{created++;return fakePage(100)}})(title,chart);
  assert(outcome.ok && outcome.current!==initial && created===1,
    "keep-with-next moves BOTH nodes to the new page");
  assert.deepEqual(initial.area.children.map(n=>n.height),[75],
    "no orphaned heading on prior page");
  assert.deepEqual(outcome.current.area.children.map(n=>n.height),[20,35]);
}
{
  const title=fakeNode(65), chart=fakeNode(50);
  const initial=fakePage(100);
  let created=0;
  const outcome=buildPair({initial,freshPage:()=>{created++;return fakePage(100)}})(title,chart);
  assert(!outcome.ok && created===0 && initial.area.children.length===0,
    "oversized pair falls back on same blank page without an extra blank sheet");
  assert(!title.parent && !chart.parent, "fallback receives both original nodes detached");
}
{
  const old=fakeNode(40), label=fakeNode(15), headline=fakeNode(20);
  const initial=fakePage(60,old);
  const outcome=buildPair({initial,freshPage:()=>fakePage(60)})(label,headline);
  assert(outcome.ok && outcome.current!==initial &&
    outcome.current.area.children[0]===label &&
    outcome.current.area.children[1]===headline,
    "insight label and headline move as a single readable pair");
}
assert(flipJs.includes("if (!appendPaired(heading, figure))") &&
  flipJs.includes("appendWhole(headingText, \"chart-heading\")") &&
  flipJs.includes("appendAtomic(figure)"),
  "chart headings pair with first figure and retain split-safe fallback");
assert(flipJs.includes("if (!appendPaired(label, headline))") &&
  flipJs.includes('appendWhole("สรุปสารสนเทศ", "insight-label")'),
  "insight heading pairs with its first headline and retains fallback");

assert(!flipJs.includes("localStorage.setItem("), "no duplicated reader storage");
console.log("FLIP-14 PASS: 18/18 manuals, 4 SAR charts, 5 insights, page-fit keep-with-next measured fixtures, strict fallback.");
