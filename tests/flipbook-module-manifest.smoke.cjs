// FLIP-14+: child/parent book-source parity gate. Protect future public book modules.
// Run: node tests/flipbook-module-manifest.smoke.cjs
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname,"..");
const read = rel => fs.readFileSync(path.join(root,rel),"utf8");
const parent=read("index.html");
const child=read("experiments/flipbook-pilot/corner.html");
const sw=read("sw.js");
const mainScripts=[...parent.matchAll(/<script\s+defer\s+src="\.\/assets\/([\w-]+\.js)"\s*><\/script>/g)]
  .map(match=>match[1]);
const start=mainScripts.indexOf("manuals-data.js");
const end=mainScripts.indexOf("experience.js");
assert(start>=0 && end>start,"known public catalog module boundary");
const bookSources=mainScripts.slice(start,end).filter(name=>name!=="flipbook-capability.js");
assert.deepEqual(bookSources.slice(0,1),["manuals-data.js"],"catalog must be loaded first");
assert.equal(new Set(bookSources).size,bookSources.length,"no duplicate book source scripts");
const childSources=[...child.matchAll(/<script\s+defer\s+src="\.\.\/\.\.\/assets\/([\w-]+\.js)"\s*><\/script>/g)]
  .map(match=>match[1]).filter(name=>name!=="flipbook-capability.js");
assert.deepEqual(childSources,bookSources,
  "Flipbook iframe must load exact same public book sources as shelf in matching order");
assert(child.indexOf("flipbook-capability.js")>child.indexOf("manuals-data.js"),
  "capability must be loaded before renderer");
assert(child.indexOf("flipbook-capability.js")<child.indexOf('src="./corner.js'),
  "capability must be loaded before Flipbook runtime");
for(const source of bookSources){
  assert(sw.includes('"./assets/'+source+'"'),"PWA shell must cache every public source: "+source);
  assert(fs.existsSync(path.join(root,"assets",source)),"missing module "+source);
}
const scope={window:{}};
for(const file of bookSources)vm.runInNewContext(read("assets/"+file),scope,{timeout:3000});
vm.runInNewContext(read("assets/flipbook-capability.js"),scope,{timeout:3000});
const books=scope.window.WD_LIBRARY_DATA?.manuals||[];
const published=books.filter(book=>book.status==="published");
assert.equal(new Set(books.map(book=>book.id)).size,books.length,"public catalog must have unique IDs");
assert.equal(published.length,18,"current published catalog must include all enrichments");
assert.equal(published.filter(book=>scope.window.WD_FLIP_CAPABILITY.supports(book)).length,18,
 "all current published books have data-safe Flipbook support");
console.log("FLIP-14 modules PASS: parent/iframe/SW share "+bookSources.length+
 " ordered book sources; "+books.length+" titles, "+published.length+" published, all eligible.");
