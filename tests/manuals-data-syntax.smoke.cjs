// Run: node tests/manuals-data-syntax.smoke.cjs
// No network, user data, or browser required.
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../assets/manuals-data.js"), "utf8");
const context = vm.createContext({ window: {} });
new vm.Script(source, { filename: "assets/manuals-data.js" }).runInContext(context);
const data = context.window.WD_LIBRARY_DATA;
assert.ok(data && Array.isArray(data.categories) && Array.isArray(data.manuals), "Catalog must initialize");
assert.ok(data.manuals.length > 0, "Catalog must contain books");
const ids = data.manuals.map(book => book.id);
assert.equal(new Set(ids).size, ids.length, "Book IDs must be unique");
for (const book of data.manuals) {
  assert.ok(book.id && book.title && book.category, "Every book needs metadata");
  assert.ok(Array.isArray(book.pages), "Every book must have pages array");
}
const ai = data.manuals.find(book => book.id === "ai-school-today-teacher-guide");
assert.ok(ai && ai.status === "published", "AI & School Today must be published");
assert.equal(ai.pages.length, 13, "AI & School Today must have 13 pages");
for (const book of data.manuals.filter(b => b.status === "published")) {
  assert.ok(book.pages.length > 0, "Published book needs readable pages");
  for (const page of book.pages) {
    assert.ok(typeof page.title === "string" && page.title.trim(), "Book page needs title");
    assert.ok(Array.isArray(page.paragraphs) && page.paragraphs.every(v => typeof v === "string" && v.trim()), "Book page paragraphs must be nonempty text");
  }
}
const essay = data.manuals.find(book => book.id === "homework-in-ai-age-primary-leadership");
assert.ok(essay && essay.category === "academic" && essay.status === "published", "Homework and AI essay must be published in academic category");
assert.ok(essay.pages.length >= 20, "Essay must be a substantial reading edition");
assert.ok(essay.pages.some(page => page.title.includes("สัปดาห์")), "Essay must include proposed school trial");
assert.ok(essay.pages.some(page => page.title.includes("เอกสารอ้างอิง")), "Essay must cite sources");
// Cover title fields must contain real line breaks, not literal backslash+n text.
for (const book of data.manuals) {
  if (typeof book.coverTitle !== "string") continue;
  assert.ok(!book.coverTitle.includes("\\n"), "Literal backslash-n in cover title: " + book.id);
}
for (const [id, expected] of [
  ["ai-school-today-teacher-guide", "AI & School\nToday"],
  ["principal-expert-m1-evidence-review", "M1\nตรวจหลักฐาน"],
  ["principal-expert-m0-review", "วิทยฐานะ\nเชี่ยวชาญ"],
  ["sar-2568-basic-education", "SAR 2568\nสารสนเทศสถานศึกษา"]
]) {
  const book = data.manuals.find(item => item.id === id);
  assert.ok(book, "Expected book is missing: " + id);
  assert.equal(book.coverTitle, expected, "Cover should break into two lines: " + id);
}
console.log("PASS: manuals-data.js syntax and catalog structure");
