// Local-only synthetic tests: node tests/mybooks-selectors.smoke.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const window = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../assets/mybooks-selectors.js"), "utf8"), {window,Map,Number,Array});
const manuals = [
  {id:"ready1",title:"ก",status:"published",pages:[{title:"หนึ่ง"},{title:"สอง"}]},
  {id:"ready2",title:"ข",status:"published",pages:[{title:"หนึ่ง"}]},
  {id:"draft",title:"ค",status:"planned",pages:[{title:"หนึ่ง"}]}
];
const select = window.WD_MYBOOKS_SELECTORS.createMyBooksSelectors(manuals);
const ids = books => Array.from(books, b => b.id).join(",");
assert.equal(ids(select.recent(["ready2","draft","ready1"])),"ready2,ready1");
assert.equal(ids(select.favorites(["draft","ready1"])),"ready1");
assert.equal(select.resume(["draft","ready1"]),null);
assert.equal(select.resume(["ready2"]).id,"ready2");
const groups = select.bookmarks(id => id==="ready1" ? [0,1,9,-1] : id==="ready2" ? [0] : [], ["ready2","ready1"]);
assert.equal(Array.from(groups, g=>g.book.id).join(","),"ready2,ready1");
assert.equal(Array.from(groups[1].indices).join(","),"0,1");
console.log("PASS My Books selectors (recent, favorites, resume, bookmarks, unpublished exclusion)");
