// CAT-01A read-only catalog and published-content contract gate.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const window = {};
const load = name => vm.runInNewContext(fs.readFileSync(path.join(root, name), "utf8"), {window});
load("assets/manuals-data.js");
assert.ok(window.WD_LIBRARY_DATA && Array.isArray(window.WD_LIBRARY_DATA.manuals));
load("assets/wd-growth-individual-guide.js");
const {manuals,categories} = window.WD_LIBRARY_DATA;
assert.ok(Array.isArray(categories) && categories.length);
const ids = new Set(), categoryIds = new Set(categories.map(c=>c.id));
for (const book of manuals) {
  assert.equal(typeof book.id,"string"); assert.ok(book.id.trim(),"Book ID required");
  assert.ok(!ids.has(book.id),"Duplicate book ID: "+book.id); ids.add(book.id);
  assert.ok(categoryIds.has(book.category),"Unknown category: "+book.id);
  assert.ok(["published","planned","review"].includes(book.status),"Unknown status: "+book.id);
  assert.ok(typeof book.title==="string" && book.title.trim(),"Missing title: "+book.id);
  assert.ok(Array.isArray(book.pages),"Missing pages: "+book.id);
  if (book.status==="published") {
    assert.ok(book.pages.length>0,"Published book has no pages: "+book.id);
    for (const page of book.pages) assert.ok(typeof page.title==="string" && page.title.trim(),"Untitled page: "+book.id);
  } else assert.equal(book.pages.length,0,"Unpublished page content present: "+book.id);
}
assert.ok(ids.has("wd-growth-individual-plan"),"Missing stable WD Growth book ID");
assert.equal(manuals.find(b=>b.id==="wd-growth-individual-plan").status,"published");
const before = JSON.stringify(manuals);
load("assets/wd-growth-individual-guide.js");
assert.equal(JSON.stringify(manuals),before,"Guide enrichment must be idempotent");
console.log("PASS CAT-01A "+manuals.length+" manuals, "+categories.length+" categories; published/unpublished and stable IDs");
