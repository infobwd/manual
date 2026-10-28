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
class MockElement {
  constructor(id = "", dataset = {}) {
    this.id = id; this.dataset = dataset; this.attributes = {};
    this.children = []; this.listeners = {}; this.style = {};
    this.hidden = false; this.value = ""; this.textContent = "";
  }
  replaceChildren(...nodes) { this.children = nodes; }
  append(...nodes) { this.children.push(...nodes); }
  setAttribute(key, value) { this.attributes[key] = value; }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  click() { this.listeners.click?.({ target: this }); }
  input() { this.listeners.input?.({ target: this }); }
}
const ids = ["home","books","settings","homeGrid","bookGrid","bookSearch",
  "categoryChoices","bookResultsCount","bookEmpty","fontSize","fontOutput","sampleText"];
const elements = Object.fromEntries(ids.map(id => [id, new MockElement(id)]));
const filters = ["all","favorite","recent"].map(filter => new MockElement("", {filter}));
const categories = ["all","การจัดการเรียนรู้","คู่มือระบบ","งานบริหาร"]
  .map(cat => new MockElement("", {cat}));
const shortcuts = ["การจัดการเรียนรู้","คู่มือระบบ","งานบริหาร"]
  .map(category => new MockElement("", {category}));
const views = ["home","books","settings"].map(view => new MockElement("", {view}));
const themes = ["light","sepia","night"].map(theme => new MockElement("", {theme}));
const groups = {".filter":filters,"[data-cat]":categories,"[data-category]":shortcuts,
  "[data-view]":views,".view":[elements.home,elements.books,elements.settings],".theme":themes};
const document = {
  documentElement:{className:""},
  getElementById:id => elements[id],
  createElement:tag => new MockElement(tag),
  querySelectorAll:selector => groups[selector] || []
};
vm.runInNewContext(script, {document,window:{scrollTo:()=>{}}}, {timeout:2000});
assert.equal(elements.bookGrid.children.length,8,"initial mock catalog shows all 8 titles");
assert.equal(elements.bookResultsCount.textContent,"พบ 8 จาก 8 เล่มตัวอย่าง");
categories[1].click();
assert.equal(elements.bookGrid.children.length,4,"4 sample learning titles in category");
assert.equal(categories[1].attributes["aria-pressed"],"true");
filters[1].click();
assert.equal(elements.bookGrid.children.length,2,"favorite and category filters compose");
elements.bookSearch.value="ไม่ตรง"; elements.bookSearch.input();
assert.equal(elements.bookGrid.children.length,0,"query composes with filters");
assert.equal(elements.bookEmpty.hidden,false,"empty-state shown");
elements.bookSearch.value=""; elements.bookSearch.input();
assert.equal(elements.bookGrid.children.length,2,"clearing query restores results");
shortcuts[2].click();
assert.equal(elements.books.hidden,false,"home category shortcut changes view");
assert.equal(elements.bookGrid.children.length,1,"category shortcut preserves favorite filter");
views[2].click();
assert.equal(elements.settings.hidden,false,"settings view works");
themes[2].click();
assert.equal(document.documentElement.className,"night","night theme works");
elements.fontSize.value="140"; elements.fontSize.input();
assert.equal(elements.fontOutput.textContent,"140%");
assert.equal(elements.sampleText.style.fontSize,"140%");
console.log("UI-MIG-01R2 PASS: static contracts and 13 mock DOM interaction assertions (no browser/device claim).");
