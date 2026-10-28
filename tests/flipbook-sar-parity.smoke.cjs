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
assert(!flipJs.includes("localStorage.setItem("), "no duplicated reader storage");
console.log("FLIP-14 PASS: 18/18 published manuals incl. 3 module-loaded, 4 SAR charts and 5 insights; strict fallback preserved.");
