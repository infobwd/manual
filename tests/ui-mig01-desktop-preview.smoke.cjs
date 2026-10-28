// UI-MIG-01R2 static gate — isolated desktop category-first visual prototype.
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const text=fs.readFileSync(path.join(__dirname,"../docs/previews/ui-next/index.html"),"utf8");
const script=/<script>([\s\S]*?)<\/script>/.exec(text)?.[1];
assert(script,"preview inline script is present");
new vm.Script(script);
for (const id of ["home","books","settings","homeGrid","bookGrid","bookSearch",
  "categoryChoices","bookResultsCount","bookEmpty","fontSize"]) {
  assert(text.includes('id="'+id+'"'),id+" preserved");
}
for (const token of ["catalog-layout","catalog-sidebar","grid-template-columns:210px minmax(0,1fr)",
  'data-cat="all"','data-cat="การจัดการเรียนรู้"','data-category="งานบริหาร"',
  "categoryFilter","statusFilter","renderBooks","updateCategory",
  "showView","aria-live=\"polite\"","prefers-reduced-motion"]) {
  assert(text.includes(token),"missing desktop category-first contract: "+token);
}
assert(!/localStorage|serviceWorker|wd-manual-reader-v2|\bfetch\s*\(/.test(script),
  "preview must not access production storage, PWA or network");
assert(!/src="\.\/?\.\/assets\/app\.js"/.test(text),
  "must not mount production Reader");
console.log("UI-MIG-01R2 static PASS: category-first desktop, mobile chips, interactive safe mock, original sections retained.");
