const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const window = {};
vm.runInNewContext(fs.readFileSync("assets/catalog-metadata.js","utf8"),{window,Map,Object,Array});
const books = [
 {id:"ready",category:"teachers",status:"published",title:"คู่มือครู",tags:["ครู"],pages:[{title:"หน้า 1"}]},
 {id:"planned",status:"planned",title:"ร่าง",pages:[]}
];
const view=window.WD_CATALOG_METADATA.createMetadataView(books);
assert.equal(view.books.length,2);
assert.equal(view.getById("ready").pageCount,1);
assert.equal(view.getById("ready").readable,true);
assert.equal(view.getById("planned").readable,false);
assert.equal(view.getById("missing"),null);
assert.equal(Object.hasOwn(view.books[0],"pages"),false);
assert.equal(Object.isFrozen(view.books[0]),true);
assert.equal(Object.isFrozen(view.books[0].tags),true);
books[0].title="เปลี่ยน";
books[0].tags.push("ใหม่");
assert.equal(view.getById("ready").title,"คู่มือครู");
assert.equal(view.getById("ready").tags.length,1);
assert.equal(window.WD_CATALOG_METADATA.createMetadataView([]).books.length,0);
console.log("PASS CAT-01B metadata isolation, immutable snapshot, empty input and stable IDs");
