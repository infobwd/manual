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
console.log("PASS: manuals-data.js syntax and catalog structure");
