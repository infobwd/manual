// WD Books term 2 supervision readiness guide — static offline smoke (no network).
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const load = p => fs.readFileSync(path.join(root, p), "utf8");
const ctx = { window: { WD_LIBRARY_DATA: { categories: [{id:"administration"}], manuals: [] } } };
const relative = "assets/bwd-term2-supervision-readiness-2569.js";
const source = load(relative);
new vm.Script(source, { filename: relative }).runInNewContext(ctx);
const manuals = ctx.window.WD_LIBRARY_DATA.manuals;
assert.equal(manuals.length, 1);
const book = manuals[0];
assert.equal(book.id, "bwd-term2-supervision-readiness-2569");
assert.equal(book.category, "administration");
assert.equal(book.status, "published");
assert.equal(book.pages.length, 15);
for(const page of book.pages) {
  assert.ok(page.title && page.kicker);
  assert.ok(Array.isArray(page.paragraphs) && page.paragraphs.length);
  assert.ok(Array.isArray(page.bullets) && page.bullets.length);
}
const combined = JSON.stringify(book.pages);
const ids = ["1.1","1.2","1.3","1.4","1.5","1.6","2.1","2.2","2.3","2.4","2.5","3.1","3.2","3.3","3.4","4.1","4.2","5.1","5.2"];
for (const id of ids) assert.ok(combined.includes(id), "Missing supervision item " + id);
assert.match(combined, /ยังไม่ยืนยัน/);
assert.match(combined, /2 พฤศจิกายน 2569/);
const html=load("index.html");
const sw=load("sw.js");
const version=load("assets/app-version.js");
assert.ok(html.includes('<script defer src="./assets/bwd-term2-supervision-readiness-2569.js"></script>'));
assert.ok(html.indexOf('src="./assets/manuals-data.js"') < html.indexOf('src="./assets/bwd-term2-supervision-readiness-2569.js"'));
assert.ok(html.indexOf('src="./assets/bwd-term2-supervision-readiness-2569.js"') < html.indexOf('src="./assets/app.js"'));
assert.ok(sw.includes('"./assets/bwd-term2-supervision-readiness-2569.js"'));
assert.match(version,/1\\.3\\.61/);
assert.ok(html.includes("1.3.61"));
assert.ok(!/ชื่อ(นักเรียน|เด็กจริง)|เลขประจำตัวนักเรียน|PIN 6/.test(combined));
console.log("PASS WD Books term 2 supervision guide: 15 pages, 17 checklist items, registration, PWA shell.");
