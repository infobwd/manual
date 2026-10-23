// Run locally: node tests/catalog-core.smoke.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const window = {};
vm.runInNewContext(fs.readFileSync(path.join(root,"assets/catalog-core.js"),"utf8"),{window,Intl,Map,Number});
const manuals = [
  {id:"a",title:"ข คู่มือ",status:"planned",category:"general",tags:["แผน"]},
  {id:"b",title:"ก คู่มือ",status:"published",pages:[{}],category:"teacher",tags:["ครู"]},
  {id:"c",title:"ค คู่มือ",status:"published",pages:[{}],category:"general",tags:["ครู"]}
];
const core = window.WD_CATALOG_CORE.createCatalogCore({manuals,categories:[{id:"general",label:"ทั่วไป"},{id:"teacher",label:"ครู"}]});
const ids = (options, history=[]) => Array.from(core.select(options,history), b=>b.id).join(",");
assert.equal(ids({}),"b,c,a");
assert.equal(ids({sort:"title"}),"b,a,c");
assert.equal(ids({sort:"recent"},["c","b"]),"c,b,a");
assert.equal(ids({availability:"ready"}),"b,c");
assert.equal(ids({availability:"upcoming"}),"a");
assert.equal(ids({category:"teacher",query:"ครู"}),"b");
assert.equal(ids({query:"ไม่มี"}),"");
assert.equal(ids({query:"ครู",availability:"upcoming"}),"");
console.log("PASS catalog core filters, Thai sorting, recent history and empty states");
