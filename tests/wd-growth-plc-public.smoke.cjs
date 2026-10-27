// Standalone offline QA for the public WD Growth PLC reader guide.
// Run from repo root: node tests/wd-growth-plc-public.smoke.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

const window = {};
const ctx = vm.createContext({window});
for (const file of ["assets/manuals-data.js", "assets/wd-growth-individual-guide.js",
                    "assets/wd-growth-plc-information-guide.js"]) {
  vm.runInContext(read(file), ctx, { filename: file, timeout: 10000 });
}
const catalog = window.WD_LIBRARY_DATA;
const id = "wd-growth-plc-information-to-action-2569";
const matches = catalog.manuals.filter(book => book.id === id);
assert.equal(matches.length, 1, "one new stable book ID");
const book = matches[0];
assert.equal(book.category, "teachers");
assert.equal(book.status, "published");
assert.equal(book.pages.length, 16);
assert.ok(book.pages.every(p => p.title && p.kicker && Array.isArray(p.paragraphs) && Array.isArray(p.bullets)));
assert.ok(book.pages.some(p => p.title.includes("สัปดาห์ 1")));
assert.ok(book.pages.some(p => p.title.includes("สารสนเทศคะแนนเฉลี่ย")));
assert.ok(book.pages.some(p => p.title.includes("สัปดาห์ 4")));
const serialized = JSON.stringify(book);
for (const forbidden of [
  "LINE_NOTE_", "baseline_A1_draft.json", "private-baseline", "WD_GROWTH_P4_BASELINE_A1_2569_PARTIAL_REVIEW",
  "96/120", "84/120", "20/80", "4/12", "1/24", "0/24", "13/16", "27 ต.ค. 2569 (รอครู",
]) {
  assert.ok(!serialized.includes(forbidden), "Potentially private material in public book: " + forbidden);
}
assert.ok(serialized.includes("สมมติ"), "Book must mark pedagogical examples as synthetic");
const originalLength = catalog.manuals.length;
vm.runInContext(read("assets/wd-growth-plc-information-guide.js"), ctx,
                { filename: "assets/wd-growth-plc-information-guide.js", timeout: 10000 });
assert.equal(catalog.manuals.length, originalLength, "idempotent module");

const html = read("index.html"), sw = read("sw.js"), version = read("assets/app-version.js");
const script = '<script defer src="./assets/wd-growth-plc-information-guide.js"></script>';
assert.ok(html.includes(script), "new guide must load");
assert.ok(html.indexOf("wd-growth-individual-guide.js") < html.indexOf("wd-growth-plc-information-guide.js"));
assert.ok(html.indexOf("wd-growth-plc-information-guide.js") < html.indexOf("experience.js"));
assert.ok(sw.includes('"./assets/wd-growth-plc-information-guide.js"'), "PWA must precache guide");
assert.ok(version.includes('self.WD_BOOKS_VERSION = "1.3.54"'), "PWA version must be bumped");
assert.ok(html.includes("เวอร์ชัน 1.3.53"), "Splash must match release");
console.log("PASS WD Growth PLC public guide: 16 pages, aggregate-only public section, catalog/idempotency, script order and PWA shell");
